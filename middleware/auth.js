const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secure_jwt_secret_here';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

// Rate limiting for authentication
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Generate JWT tokens
const generateTokens = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role || 'user',
    plan: user.plan || 'free'
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { 
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'contentflow-ai',
    audience: 'contentflow-users'
  });

  const refreshToken = jwt.sign(
    { id: user.id, type: 'refresh' }, 
    JWT_SECRET, 
    { 
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
      issuer: 'contentflow-ai',
      audience: 'contentflow-refresh'
    }
  );

  return { accessToken, refreshToken };
};

// Verify JWT token
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Access token required',
        code: 'MISSING_TOKEN'
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'contentflow-ai',
      audience: 'contentflow-users'
    });

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }

    return res.status(401).json({ 
      error: 'Authentication failed',
      code: 'AUTH_FAILED'
    });
  }
};

// Check user permissions
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    next();
  };
};

// Check subscription plan
const requirePlan = (requiredPlan) => {
  const planHierarchy = {
    'free': 0,
    'basic': 1,
    'pro': 2,
    'enterprise': 3
  };

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const userPlanLevel = planHierarchy[req.user.plan] || 0;
    const requiredPlanLevel = planHierarchy[requiredPlan] || 0;

    if (userPlanLevel < requiredPlanLevel) {
      return res.status(403).json({ 
        error: 'Upgrade required',
        code: 'UPGRADE_REQUIRED',
        requiredPlan
      });
    }

    next();
  };
};

// Refresh token endpoint
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ 
        error: 'Refresh token required',
        code: 'MISSING_REFRESH_TOKEN'
      });
    }

    const decoded = jwt.verify(refreshToken, JWT_SECRET, {
      issuer: 'contentflow-ai',
      audience: 'contentflow-refresh'
    });

    if (decoded.type !== 'refresh') {
      return res.status(401).json({ 
        error: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }

    // Get user from database
    const user = await getUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Generate new tokens
    const tokens = generateTokens(user);

    res.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: JWT_EXPIRES_IN
    });

  } catch (error) {
    return res.status(401).json({ 
      error: 'Invalid refresh token',
      code: 'INVALID_REFRESH_TOKEN'
    });
  }
};

// Logout (blacklist token)
const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.substring(7);
    
    if (token) {
      // Add token to blacklist (implement with Redis)
      await blacklistToken(token);
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ 
      error: 'Logout failed',
      code: 'LOGOUT_FAILED'
    });
  }
};

module.exports = {
  authLimiter,
  generateTokens,
  verifyToken,
  requireRole,
  requirePlan,
  refreshToken,
  logout
};

// Verificação de acesso premium temporário
const checkPremiumAccess = (req, res, next) => {
    const premiumConfig = require('../premium-config.json');
    
    if (premiumConfig.enabled && new Date() < new Date(premiumConfig.expiresAt)) {
        // Aplicar permissões premium temporárias
        if (req.user) {
            req.user.plan = 'enterprise';
            req.user.premiumAccess = true;
            req.user.features = premiumConfig.features;
        }
    }
    
    next();
};

module.exports.checkPremiumAccess = checkPremiumAccess;
