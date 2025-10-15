// Sistema de Acesso Temporário Premium - PostStudio I.A
// Este script libera todas as funcionalidades premium para testes

const fs = require('fs');
const path = require('path');

console.log('🚀 LIBERANDO ACESSO PREMIUM TEMPORÁRIO');
console.log('📅 Data:', new Date().toLocaleString('pt-BR'));
console.log('⏰ Duração: 7 dias (até ' + new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleString('pt-BR') + ')');
console.log('');

// Configurações de acesso premium temporário
const PREMIUM_ACCESS = {
    enabled: true,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
    features: {
        // Text-to-Speech (ElevenLabs)
        textToSpeech: {
            enabled: true,
            voices: 20,
            characters: 10000, // 10k caracteres para teste
            apiKey: '7bddbf397d93ddfe06bcc5fa428d9cd418b046978ce65b7334b2313c9112e338'
        },
        
        // AI Content Generation
        aiGeneration: {
            enabled: true,
            models: ['gpt-4', 'claude-3', 'gemini-pro'],
            requests: 100, // 100 requisições para teste
            languages: ['pt-BR', 'en-US', 'es-ES']
        },
        
        // Advanced Analytics
        analytics: {
            enabled: true,
            realTime: true,
            customReports: true,
            exportData: true,
            retention: 90 // 90 dias de dados
        },
        
        // Social Media Integration
        socialMedia: {
            enabled: true,
            platforms: ['twitter', 'facebook', 'instagram', 'linkedin'],
            autoPosting: true,
            scheduling: true,
            hashtagSuggestions: true
        },
        
        // Team Collaboration
        collaboration: {
            enabled: true,
            teamMembers: 10,
            workspaces: 5,
            approvalWorkflow: true,
            comments: true
        },
        
        // API Access
        apiAccess: {
            enabled: true,
            endpoints: 'all',
            rateLimit: 1000, // 1000 requests/hour
            documentation: true
        },
        
        // Custom Branding
        branding: {
            enabled: true,
            customLogo: true,
            customColors: true,
            whiteLabel: true
        }
    }
};

// Usuários de teste com acesso premium
const TEST_USERS = [
    {
        id: 'test-admin-001',
        name: 'Admin Teste',
        email: 'admin@teste.com',
        password: '$2a$10$test.hash.for.admin',
        role: 'admin',
        plan: 'enterprise',
        permissions: ['all'],
        features: PREMIUM_ACCESS.features
    },
    {
        id: 'test-user-001',
        name: 'Usuário Premium',
        email: 'premium@teste.com',
        password: '$2a$10$test.hash.for.premium',
        role: 'user',
        plan: 'pro',
        permissions: ['content', 'analytics', 'social'],
        features: PREMIUM_ACCESS.features
    },
    {
        id: 'test-team-001',
        name: 'Equipe Colaboração',
        email: 'team@teste.com',
        password: '$2a$10$test.hash.for.team',
        role: 'user',
        plan: 'pro',
        permissions: ['content', 'collaboration'],
        features: PREMIUM_ACCESS.features
    }
];

// Função para aplicar acesso premium
function applyPremiumAccess() {
    console.log('🔧 Aplicando configurações premium...');
    
    // 1. Atualizar middleware de autenticação
    updateAuthMiddleware();
    
    // 2. Criar usuários de teste
    createTestUsers();
    
    // 3. Atualizar configurações do servidor
    updateServerConfig();
    
    // 4. Criar arquivo de configuração premium
    createPremiumConfig();
    
    console.log('✅ Acesso premium aplicado com sucesso!');
}

// Atualizar middleware de autenticação para permitir acesso premium
function updateAuthMiddleware() {
    console.log('📝 Atualizando middleware de autenticação...');
    
    const authFile = path.join(__dirname, 'middleware', 'auth.js');
    
    // Backup do arquivo original
    if (fs.existsSync(authFile)) {
        fs.copyFileSync(authFile, authFile + '.backup');
    }
    
    // Adicionar função de verificação premium temporária
    const premiumCheck = `
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
`;
    
    // Adicionar ao final do arquivo
    fs.appendFileSync(authFile, premiumCheck);
}

// Criar usuários de teste
function createTestUsers() {
    console.log('👥 Criando usuários de teste...');
    
    const usersFile = path.join(__dirname, 'test-users.json');
    fs.writeFileSync(usersFile, JSON.stringify(TEST_USERS, null, 2));
    
    console.log('✅ Usuários de teste criados:');
    TEST_USERS.forEach(user => {
        console.log(`   - ${user.name} (${user.email}) - Plano: ${user.plan}`);
    });
}

// Atualizar configurações do servidor
function updateServerConfig() {
    console.log('⚙️ Atualizando configurações do servidor...');
    
    const serverFile = path.join(__dirname, 'server.js');
    
    // Adicionar middleware premium ao servidor
    const premiumMiddleware = `
// Middleware de acesso premium temporário
app.use((req, res, next) => {
    const premiumConfig = require('./premium-config.json');
    
    if (premiumConfig.enabled && new Date() < new Date(premiumConfig.expiresAt)) {
        // Aplicar permissões premium
        if (req.session && req.session.userId) {
            req.session.premiumAccess = true;
            req.session.features = premiumConfig.features;
        }
    }
    
    next();
});
`;
    
    // Ler arquivo atual
    let serverContent = fs.readFileSync(serverFile, 'utf8');
    
    // Adicionar middleware premium após as configurações básicas
    const insertPoint = serverContent.indexOf('// Middleware básico');
    if (insertPoint !== -1) {
        serverContent = serverContent.slice(0, insertPoint) + premiumMiddleware + '\n' + serverContent.slice(insertPoint);
    } else {
        // Se não encontrar o ponto de inserção, adicionar no início
        serverContent = premiumMiddleware + '\n' + serverContent;
    }
    
    // Backup e salvar
    fs.copyFileSync(serverFile, serverFile + '.backup');
    fs.writeFileSync(serverFile, serverContent);
}

// Criar arquivo de configuração premium
function createPremiumConfig() {
    console.log('📋 Criando configuração premium...');
    
    const configFile = path.join(__dirname, 'premium-config.json');
    fs.writeFileSync(configFile, JSON.stringify(PREMIUM_ACCESS, null, 2));
    
    console.log('✅ Configuração premium salva em: premium-config.json');
}

// Função para desativar acesso premium
function disablePremiumAccess() {
    console.log('🔒 Desativando acesso premium...');
    
    const configFile = path.join(__dirname, 'premium-config.json');
    if (fs.existsSync(configFile)) {
        const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
        config.enabled = false;
        config.disabledAt = new Date().toISOString();
        fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
    }
    
    console.log('✅ Acesso premium desativado');
}

// Função para verificar status
function checkStatus() {
    console.log('📊 Verificando status do acesso premium...');
    
    const configFile = path.join(__dirname, 'premium-config.json');
    if (fs.existsSync(configFile)) {
        const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
        
        console.log('Status:', config.enabled ? '✅ ATIVO' : '❌ INATIVO');
        console.log('Expira em:', new Date(config.expiresAt).toLocaleString('pt-BR'));
        
        if (config.enabled) {
            console.log('Funcionalidades disponíveis:');
            Object.keys(config.features).forEach(feature => {
                console.log(`   - ${feature}: ${config.features[feature].enabled ? '✅' : '❌'}`);
            });
        }
    } else {
        console.log('❌ Configuração premium não encontrada');
    }
}

// Executar baseado no argumento da linha de comando
const action = process.argv[2];

switch (action) {
    case 'enable':
        applyPremiumAccess();
        break;
    case 'disable':
        disablePremiumAccess();
        break;
    case 'status':
        checkStatus();
        break;
    default:
        console.log('🚀 Sistema de Acesso Premium Temporário - PostStudio I.A');
        console.log('');
        console.log('Comandos disponíveis:');
        console.log('  node premium-access-temp.js enable   - Ativar acesso premium');
        console.log('  node premium-access-temp.js disable  - Desativar acesso premium');
        console.log('  node premium-access-temp.js status   - Verificar status');
        console.log('');
        console.log('Funcionalidades premium disponíveis:');
        Object.keys(PREMIUM_ACCESS.features).forEach(feature => {
            console.log(`  ✅ ${feature}`);
        });
}
