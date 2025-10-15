const { Pool } = require('pg');
const Redis = require('redis');

class AnalyticsService {
  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    
    this.redis = Redis.createClient({
      url: process.env.REDIS_URL
    });
  }

  // Track post performance
  async trackPostMetrics(postId, metrics) {
    try {
      const {
        views = 0,
        likes = 0,
        shares = 0,
        comments = 0,
        clicks = 0,
        platform = 'unknown'
      } = metrics;

      // Store in database
      await this.pool.query(`
        INSERT INTO post_metrics (post_id, platform, views, likes, shares, comments, clicks, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        ON CONFLICT (post_id, platform, DATE(created_at))
        DO UPDATE SET
          views = post_metrics.views + $3,
          likes = post_metrics.likes + $4,
          shares = post_metrics.shares + $5,
          comments = post_metrics.comments + $6,
          clicks = post_metrics.clicks + $7,
          updated_at = NOW()
      `, [postId, platform, views, likes, shares, comments, clicks]);

      // Update Redis cache
      await this.redis.hincrby(`post:${postId}:metrics`, 'views', views);
      await this.redis.hincrby(`post:${postId}:metrics`, 'likes', likes);
      await this.redis.hincrby(`post:${postId}:metrics`, 'shares', shares);
      await this.redis.hincrby(`post:${postId}:metrics`, 'comments', comments);
      await this.redis.hincrby(`post:${postId}:metrics`, 'clicks', clicks);

    } catch (error) {
      console.error('Error tracking post metrics:', error);
    }
  }

  // Get user analytics dashboard
  async getUserAnalytics(userId, period = '30d') {
    try {
      const dateFilter = this.getDateFilter(period);
      
      const analytics = await this.pool.query(`
        SELECT 
          COUNT(DISTINCT p.id) as total_posts,
          COUNT(DISTINCT pm.post_id) as posts_with_metrics,
          COALESCE(SUM(pm.views), 0) as total_views,
          COALESCE(SUM(pm.likes), 0) as total_likes,
          COALESCE(SUM(pm.shares), 0) as total_shares,
          COALESCE(SUM(pm.comments), 0) as total_comments,
          COALESCE(SUM(pm.clicks), 0) as total_clicks,
          COALESCE(AVG(pm.views), 0) as avg_views_per_post,
          COALESCE(AVG(pm.likes), 0) as avg_likes_per_post,
          COALESCE(AVG(pm.shares), 0) as avg_shares_per_post
        FROM posts p
        LEFT JOIN post_metrics pm ON p.id = pm.post_id
        WHERE p.user_id = $1 
        AND p.created_at >= $2
      `, [userId, dateFilter]);

      const topPosts = await this.pool.query(`
        SELECT 
          p.id,
          p.title,
          p.content,
          p.template,
          COALESCE(SUM(pm.views), 0) as views,
          COALESCE(SUM(pm.likes), 0) as likes,
          COALESCE(SUM(pm.shares), 0) as shares,
          COALESCE(SUM(pm.comments), 0) as comments,
          COALESCE(SUM(pm.clicks), 0) as clicks,
          (COALESCE(SUM(pm.likes), 0) + COALESCE(SUM(pm.shares), 0) + COALESCE(SUM(pm.comments), 0)) as engagement_score
        FROM posts p
        LEFT JOIN post_metrics pm ON p.id = pm.post_id
        WHERE p.user_id = $1 
        AND p.created_at >= $2
        GROUP BY p.id, p.title, p.content, p.template
        ORDER BY engagement_score DESC
        LIMIT 10
      `, [userId, dateFilter]);

      const platformBreakdown = await this.pool.query(`
        SELECT 
          pm.platform,
          COUNT(DISTINCT pm.post_id) as posts_count,
          COALESCE(SUM(pm.views), 0) as total_views,
          COALESCE(SUM(pm.likes), 0) as total_likes,
          COALESCE(SUM(pm.shares), 0) as total_shares,
          COALESCE(SUM(pm.comments), 0) as total_comments,
          COALESCE(AVG(pm.views), 0) as avg_views
        FROM post_metrics pm
        JOIN posts p ON pm.post_id = p.id
        WHERE p.user_id = $1 
        AND pm.created_at >= $2
        GROUP BY pm.platform
        ORDER BY total_views DESC
      `, [userId, dateFilter]);

      const dailyMetrics = await this.pool.query(`
        SELECT 
          DATE(pm.created_at) as date,
          SUM(pm.views) as views,
          SUM(pm.likes) as likes,
          SUM(pm.shares) as shares,
          SUM(pm.comments) as comments,
          SUM(pm.clicks) as clicks
        FROM post_metrics pm
        JOIN posts p ON pm.post_id = p.id
        WHERE p.user_id = $1 
        AND pm.created_at >= $2
        GROUP BY DATE(pm.created_at)
        ORDER BY date DESC
        LIMIT 30
      `, [userId, dateFilter]);

      return {
        overview: analytics.rows[0],
        topPosts: topPosts.rows,
        platformBreakdown: platformBreakdown.rows,
        dailyMetrics: dailyMetrics.rows,
        period: period
      };

    } catch (error) {
      console.error('Error getting user analytics:', error);
      throw new Error('Failed to get analytics');
    }
  }

  // Get content performance insights
  async getContentInsights(userId, period = '30d') {
    try {
      const dateFilter = this.getDateFilter(period);
      
      const insights = await this.pool.query(`
        SELECT 
          p.template,
          COUNT(*) as usage_count,
          COALESCE(AVG(pm.views), 0) as avg_views,
          COALESCE(AVG(pm.likes), 0) as avg_likes,
          COALESCE(AVG(pm.shares), 0) as avg_shares,
          COALESCE(AVG(pm.comments), 0) as avg_comments,
          COALESCE(AVG(pm.clicks), 0) as avg_clicks,
          COALESCE(AVG(
            (COALESCE(pm.likes, 0) + COALESCE(pm.shares, 0) + COALESCE(pm.comments, 0)) / 
            NULLIF(COALESCE(pm.views, 1), 0)
          ), 0) as avg_engagement_rate
        FROM posts p
        LEFT JOIN post_metrics pm ON p.id = pm.post_id
        WHERE p.user_id = $1 
        AND p.created_at >= $2
        GROUP BY p.template
        ORDER BY avg_engagement_rate DESC
      `, [userId, dateFilter]);

      const bestPerformingTimes = await this.pool.query(`
        SELECT 
          EXTRACT(HOUR FROM p.created_at) as hour,
          COUNT(*) as posts_count,
          COALESCE(AVG(pm.views), 0) as avg_views,
          COALESCE(AVG(pm.likes), 0) as avg_likes,
          COALESCE(AVG(pm.shares), 0) as avg_shares
        FROM posts p
        LEFT JOIN post_metrics pm ON p.id = pm.post_id
        WHERE p.user_id = $1 
        AND p.created_at >= $2
        GROUP BY EXTRACT(HOUR FROM p.created_at)
        ORDER BY avg_views DESC
        LIMIT 5
      `, [userId, dateFilter]);

      const hashtagPerformance = await this.pool.query(`
        SELECT 
          unnest(string_to_array(p.hashtags, ' ')) as hashtag,
          COUNT(*) as usage_count,
          COALESCE(AVG(pm.views), 0) as avg_views,
          COALESCE(AVG(pm.likes), 0) as avg_likes,
          COALESCE(AVG(pm.shares), 0) as avg_shares
        FROM posts p
        LEFT JOIN post_metrics pm ON p.id = pm.post_id
        WHERE p.user_id = $1 
        AND p.created_at >= $2
        AND p.hashtags IS NOT NULL
        AND p.hashtags != ''
        GROUP BY unnest(string_to_array(p.hashtags, ' '))
        HAVING COUNT(*) > 1
        ORDER BY avg_views DESC
        LIMIT 20
      `, [userId, dateFilter]);

      return {
        templatePerformance: insights.rows,
        bestPerformingTimes: bestPerformingTimes.rows,
        hashtagPerformance: hashtagPerformance.rows
      };

    } catch (error) {
      console.error('Error getting content insights:', error);
      throw new Error('Failed to get content insights');
    }
  }

  // Get real-time metrics
  async getRealtimeMetrics(userId) {
    try {
      const metrics = await this.redis.hgetall(`user:${userId}:realtime`);
      
      return {
        activePosts: parseInt(metrics.activePosts || 0),
        todayViews: parseInt(metrics.todayViews || 0),
        todayLikes: parseInt(metrics.todayLikes || 0),
        todayShares: parseInt(metrics.todayShares || 0),
        todayComments: parseInt(metrics.todayComments || 0),
        lastUpdated: metrics.lastUpdated || new Date().toISOString()
      };

    } catch (error) {
      console.error('Error getting realtime metrics:', error);
      return {
        activePosts: 0,
        todayViews: 0,
        todayLikes: 0,
        todayShares: 0,
        todayComments: 0,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  // Update real-time metrics
  async updateRealtimeMetrics(userId, metrics) {
    try {
      const pipeline = this.redis.multi();
      
      Object.entries(metrics).forEach(([key, value]) => {
        pipeline.hincrby(`user:${userId}:realtime`, key, value);
      });
      
      pipeline.hset(`user:${userId}:realtime`, 'lastUpdated', new Date().toISOString());
      pipeline.expire(`user:${userId}:realtime`, 86400); // 24 hours
      
      await pipeline.exec();

    } catch (error) {
      console.error('Error updating realtime metrics:', error);
    }
  }

  // Generate analytics report
  async generateReport(userId, period = '30d') {
    try {
      const analytics = await this.getUserAnalytics(userId, period);
      const insights = await this.getContentInsights(userId, period);
      const realtime = await this.getRealtimeMetrics(userId);

      return {
        summary: {
          totalPosts: analytics.overview.total_posts,
          totalViews: analytics.overview.total_views,
          totalEngagement: analytics.overview.total_likes + analytics.overview.total_shares + analytics.overview.total_comments,
          avgEngagementRate: analytics.overview.total_views > 0 ? 
            ((analytics.overview.total_likes + analytics.overview.total_shares + analytics.overview.total_comments) / analytics.overview.total_views) * 100 : 0,
          topPerformingPost: analytics.topPosts[0] || null
        },
        insights: insights,
        realtime: realtime,
        recommendations: this.generateRecommendations(analytics, insights),
        period: period,
        generatedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error generating report:', error);
      throw new Error('Failed to generate report');
    }
  }

  // Generate recommendations based on analytics
  generateRecommendations(analytics, insights) {
    const recommendations = [];

    // Engagement rate recommendations
    if (analytics.overview.avg_engagement_rate < 2) {
      recommendations.push({
        type: 'engagement',
        priority: 'high',
        title: 'Improve Engagement Rate',
        description: 'Your engagement rate is below average. Try using more interactive content and calls-to-action.',
        action: 'Focus on creating content that encourages comments and shares'
      });
    }

    // Template performance recommendations
    if (insights.templatePerformance.length > 0) {
      const bestTemplate = insights.templatePerformance[0];
      const worstTemplate = insights.templatePerformance[insights.templatePerformance.length - 1];
      
      if (bestTemplate && worstTemplate) {
        recommendations.push({
          type: 'content',
          priority: 'medium',
          title: 'Optimize Template Usage',
          description: `Your "${bestTemplate.template}" template performs ${Math.round(bestTemplate.avg_engagement_rate * 100)}% better than "${worstTemplate.template}".`,
          action: 'Use your best-performing template more often'
        });
      }
    }

    // Posting time recommendations
    if (insights.bestPerformingTimes.length > 0) {
      const bestTime = insights.bestPerformingTimes[0];
      recommendations.push({
        type: 'timing',
        priority: 'medium',
        title: 'Optimize Posting Time',
        description: `Your posts perform best at ${bestTime.hour}:00. Consider scheduling more content during this time.`,
        action: 'Schedule posts during your peak performance hours'
      });
    }

    return recommendations;
  }

  // Helper function to get date filter
  getDateFilter(period) {
    const now = new Date();
    switch (period) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case '1y':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }
}

module.exports = new AnalyticsService();
