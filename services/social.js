const axios = require('axios');
const { TwitterApi } = require('twitter-api-v2');
const { FacebookApi } = require('facebook-nodejs-business-sdk');
const { LinkedInApi } = require('linkedin-api-v2');

class SocialMediaService {
  constructor() {
    this.platforms = {
      twitter: this.initTwitter(),
      facebook: this.initFacebook(),
      instagram: this.initInstagram(),
      linkedin: this.initLinkedIn()
    };
  }

  // Initialize Twitter API
  initTwitter() {
    return new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_SECRET,
    });
  }

  // Initialize Facebook API
  initFacebook() {
    const { FacebookAdsApi } = require('facebook-nodejs-business-sdk');
    FacebookAdsApi.init(process.env.FACEBOOK_APP_ID);
    return FacebookAdsApi;
  }

  // Initialize Instagram API
  initInstagram() {
    // Instagram uses Facebook Graph API
    return this.initFacebook();
  }

  // Initialize LinkedIn API
  initLinkedIn() {
    return new LinkedInApi({
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      redirectUri: process.env.LINKEDIN_REDIRECT_URI
    });
  }

  // Post to Twitter
  async postToTwitter(content, options = {}) {
    try {
      const {
        media = null,
        replyTo = null,
        thread = false
      } = options;

      const tweetData = {
        text: content
      };

      if (media) {
        tweetData.media = { media_ids: [media] };
      }

      if (replyTo) {
        tweetData.reply = { in_reply_to_tweet_id: replyTo };
      }

      const tweet = await this.platforms.twitter.v2.tweet(tweetData);
      
      return {
        success: true,
        platform: 'twitter',
        postId: tweet.data.id,
        url: `https://twitter.com/user/status/${tweet.data.id}`,
        metrics: await this.getTwitterMetrics(tweet.data.id)
      };

    } catch (error) {
      console.error('Twitter posting error:', error);
      return {
        success: false,
        platform: 'twitter',
        error: error.message
      };
    }
  }

  // Post to Facebook
  async postToFacebook(content, options = {}) {
    try {
      const {
        pageId = process.env.FACEBOOK_PAGE_ID,
        media = null,
        scheduledTime = null
      } = options;

      const postData = {
        message: content,
        access_token: process.env.FACEBOOK_PAGE_ACCESS_TOKEN
      };

      if (media) {
        postData.attached_media = [{ media_fbid: media }];
      }

      if (scheduledTime) {
        postData.scheduled_publish_time = Math.floor(scheduledTime.getTime() / 1000);
        postData.published = false;
      }

      const response = await axios.post(
        `https://graph.facebook.com/v18.0/${pageId}/feed`,
        postData
      );

      return {
        success: true,
        platform: 'facebook',
        postId: response.data.id,
        url: `https://facebook.com/${pageId}/posts/${response.data.id}`,
        metrics: await this.getFacebookMetrics(response.data.id)
      };

    } catch (error) {
      console.error('Facebook posting error:', error);
      return {
        success: false,
        platform: 'facebook',
        error: error.message
      };
    }
  }

  // Post to Instagram
  async postToInstagram(content, options = {}) {
    try {
      const {
        mediaUrl,
        caption = content,
        hashtags = []
      } = options;

      // Create media container
      const mediaResponse = await axios.post(
        `https://graph.facebook.com/v18.0/${process.env.INSTAGRAM_ACCOUNT_ID}/media`,
        {
          image_url: mediaUrl,
          caption: `${caption}\n\n${hashtags.join(' ')}`,
          access_token: process.env.INSTAGRAM_ACCESS_TOKEN
        }
      );

      // Publish the media
      const publishResponse = await axios.post(
        `https://graph.facebook.com/v18.0/${process.env.INSTAGRAM_ACCOUNT_ID}/media_publish`,
        {
          creation_id: mediaResponse.data.id,
          access_token: process.env.INSTAGRAM_ACCESS_TOKEN
        }
      );

      return {
        success: true,
        platform: 'instagram',
        postId: publishResponse.data.id,
        url: `https://instagram.com/p/${publishResponse.data.id}`,
        metrics: await this.getInstagramMetrics(publishResponse.data.id)
      };

    } catch (error) {
      console.error('Instagram posting error:', error);
      return {
        success: false,
        platform: 'instagram',
        error: error.message
      };
    }
  }

  // Post to LinkedIn
  async postToLinkedIn(content, options = {}) {
    try {
      const {
        media = null,
        visibility = 'PUBLIC'
      } = options;

      const postData = {
        author: `urn:li:person:${process.env.LINKEDIN_PERSON_URN}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: content
            },
            shareMediaCategory: media ? 'IMAGE' : 'NONE'
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': visibility
        }
      };

      if (media) {
        postData.specificContent['com.linkedin.ugc.ShareContent'].media = [{
          status: 'READY',
          description: {
            text: content
          },
          media: media,
          title: {
            text: 'ContentFlow AI Post'
          }
        }];
      }

      const response = await axios.post(
        'https://api.linkedin.com/v2/ugcPosts',
        postData,
        {
          headers: {
            'Authorization': `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0'
          }
        }
      );

      return {
        success: true,
        platform: 'linkedin',
        postId: response.data.id,
        url: `https://linkedin.com/feed/update/${response.data.id}`,
        metrics: await this.getLinkedInMetrics(response.data.id)
      };

    } catch (error) {
      console.error('LinkedIn posting error:', error);
      return {
        success: false,
        platform: 'linkedin',
        error: error.message
      };
    }
  }

  // Schedule post across platforms
  async schedulePost(content, platforms, options = {}) {
    const results = [];
    const { scheduledTime, media } = options;

    for (const platform of platforms) {
      try {
        let result;

        switch (platform) {
          case 'twitter':
            result = await this.postToTwitter(content, { media, scheduledTime });
            break;
          case 'facebook':
            result = await this.postToFacebook(content, { media, scheduledTime });
            break;
          case 'instagram':
            result = await this.postToInstagram(content, { mediaUrl: media });
            break;
          case 'linkedin':
            result = await this.postToLinkedIn(content, { media });
            break;
          default:
            result = { success: false, platform, error: 'Unsupported platform' };
        }

        results.push(result);

      } catch (error) {
        results.push({
          success: false,
          platform,
          error: error.message
        });
      }
    }

    return {
      success: results.some(r => r.success),
      results,
      scheduledTime
    };
  }

  // Get metrics for each platform
  async getTwitterMetrics(postId) {
    try {
      const metrics = await this.platforms.twitter.v2.tweet(postId, {
        'tweet.fields': 'public_metrics'
      });
      
      return {
        views: metrics.data.public_metrics?.impression_count || 0,
        likes: metrics.data.public_metrics?.like_count || 0,
        retweets: metrics.data.public_metrics?.retweet_count || 0,
        replies: metrics.data.public_metrics?.reply_count || 0
      };
    } catch (error) {
      console.error('Error getting Twitter metrics:', error);
      return { views: 0, likes: 0, retweets: 0, replies: 0 };
    }
  }

  async getFacebookMetrics(postId) {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/v18.0/${postId}/insights`,
        {
          params: {
            metric: 'post_impressions,post_engaged_users,post_reactions_by_type_total',
            access_token: process.env.FACEBOOK_PAGE_ACCESS_TOKEN
          }
        }
      );

      const insights = response.data.data;
      const metrics = { views: 0, likes: 0, shares: 0, comments: 0 };

      insights.forEach(insight => {
        switch (insight.name) {
          case 'post_impressions':
            metrics.views = insight.values[0]?.value || 0;
            break;
          case 'post_engaged_users':
            metrics.engagement = insight.values[0]?.value || 0;
            break;
          case 'post_reactions_by_type_total':
            const reactions = insight.values[0]?.value || {};
            metrics.likes = Object.values(reactions).reduce((sum, count) => sum + count, 0);
            break;
        }
      });

      return metrics;
    } catch (error) {
      console.error('Error getting Facebook metrics:', error);
      return { views: 0, likes: 0, shares: 0, comments: 0 };
    }
  }

  async getInstagramMetrics(postId) {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/v18.0/${postId}/insights`,
        {
          params: {
            metric: 'impressions,reach,likes,comments,shares',
            access_token: process.env.INSTAGRAM_ACCESS_TOKEN
          }
        }
      );

      const insights = response.data.data;
      const metrics = { views: 0, likes: 0, shares: 0, comments: 0 };

      insights.forEach(insight => {
        switch (insight.name) {
          case 'impressions':
            metrics.views = insight.values[0]?.value || 0;
            break;
          case 'likes':
            metrics.likes = insight.values[0]?.value || 0;
            break;
          case 'comments':
            metrics.comments = insight.values[0]?.value || 0;
            break;
          case 'shares':
            metrics.shares = insight.values[0]?.value || 0;
            break;
        }
      });

      return metrics;
    } catch (error) {
      console.error('Error getting Instagram metrics:', error);
      return { views: 0, likes: 0, shares: 0, comments: 0 };
    }
  }

  async getLinkedInMetrics(postId) {
    try {
      const response = await axios.get(
        `https://api.linkedin.com/v2/socialActions/${postId}/statistics`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`
          }
        }
      );

      return {
        views: response.data.numViews || 0,
        likes: response.data.numLikes || 0,
        shares: response.data.numShares || 0,
        comments: response.data.numComments || 0
      };
    } catch (error) {
      console.error('Error getting LinkedIn metrics:', error);
      return { views: 0, likes: 0, shares: 0, comments: 0 };
    }
  }

  // Bulk metrics update
  async updateAllMetrics(posts) {
    const results = [];

    for (const post of posts) {
      try {
        const metrics = await this.getMetricsForPost(post);
        results.push({ postId: post.id, metrics });
      } catch (error) {
        console.error(`Error updating metrics for post ${post.id}:`, error);
        results.push({ postId: post.id, error: error.message });
      }
    }

    return results;
  }

  async getMetricsForPost(post) {
    const metrics = { views: 0, likes: 0, shares: 0, comments: 0 };

    if (post.platforms) {
      const platforms = Array.isArray(post.platforms) ? post.platforms : [post.platforms];
      
      for (const platform of platforms) {
        try {
          let platformMetrics;
          
          switch (platform) {
            case 'twitter':
              platformMetrics = await this.getTwitterMetrics(post.social_post_id);
              break;
            case 'facebook':
              platformMetrics = await this.getFacebookMetrics(post.social_post_id);
              break;
            case 'instagram':
              platformMetrics = await this.getInstagramMetrics(post.social_post_id);
              break;
            case 'linkedin':
              platformMetrics = await this.getLinkedInMetrics(post.social_post_id);
              break;
          }

          if (platformMetrics) {
            metrics.views += platformMetrics.views || 0;
            metrics.likes += platformMetrics.likes || 0;
            metrics.shares += platformMetrics.shares || 0;
            metrics.comments += platformMetrics.comments || 0;
          }
        } catch (error) {
          console.error(`Error getting metrics for ${platform}:`, error);
        }
      }
    }

    return metrics;
  }
}

module.exports = new SocialMediaService();
