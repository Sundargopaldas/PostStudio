const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');

// Initialize AI services
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// AI Content Generation Service
class AIContentService {
  constructor() {
    this.providers = {
      openai: openai,
      anthropic: anthropic
    };
  }

  // Generate social media post
  async generatePost(prompt, options = {}) {
    const {
      platform = 'general',
      tone = 'professional',
      length = 'medium',
      provider = 'openai'
    } = options;

    const systemPrompt = this.buildSystemPrompt(platform, tone, length);
    
    try {
      if (provider === 'openai') {
        return await this.generateWithOpenAI(systemPrompt, prompt);
      } else if (provider === 'anthropic') {
        return await this.generateWithAnthropic(systemPrompt, prompt);
      }
    } catch (error) {
      console.error('AI generation error:', error);
      throw new Error('Failed to generate content');
    }
  }

  // Generate with OpenAI
  async generateWithOpenAI(systemPrompt, userPrompt) {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      presence_penalty: 0.6,
      frequency_penalty: 0.3
    });

    return {
      content: completion.choices[0].message.content,
      provider: 'openai',
      model: 'gpt-4-turbo-preview',
      usage: completion.usage
    };
  }

  // Generate with Anthropic
  async generateWithAnthropic(systemPrompt, userPrompt) {
    const message = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1000,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        { role: "user", content: userPrompt }
      ]
    });

    return {
      content: message.content[0].text,
      provider: 'anthropic',
      model: 'claude-3-sonnet-20240229',
      usage: message.usage
    };
  }

  // Build system prompt based on parameters
  buildSystemPrompt(platform, tone, length) {
    const platformGuidelines = {
      twitter: "Create engaging Twitter posts with hashtags. Keep it concise and use trending topics when relevant.",
      instagram: "Create Instagram posts with emojis and hashtags. Make it visually appealing and engaging.",
      facebook: "Create Facebook posts that encourage engagement and discussion. Use a conversational tone.",
      linkedin: "Create professional LinkedIn posts. Focus on industry insights and professional development.",
      general: "Create engaging social media content that works across platforms."
    };

    const toneGuidelines = {
      professional: "Use a professional, authoritative tone. Focus on industry expertise and credibility.",
      casual: "Use a friendly, approachable tone. Be conversational and relatable.",
      humorous: "Use humor and wit. Make it entertaining while staying relevant.",
      inspirational: "Use an uplifting, motivational tone. Focus on positive outcomes and success.",
      educational: "Use an informative, educational tone. Focus on teaching and providing value."
    };

    const lengthGuidelines = {
      short: "Keep it under 100 characters. Be concise and impactful.",
      medium: "Aim for 100-280 characters. Provide enough detail to be engaging.",
      long: "Use 280+ characters. Provide comprehensive information and context."
    };

    return `You are an expert social media content creator. ${platformGuidelines[platform]} ${toneGuidelines[tone]} ${lengthGuidelines[length]}

Requirements:
- Use relevant hashtags (3-5 per post)
- Include emojis when appropriate
- Make it engaging and shareable
- Follow platform best practices
- Ensure content is original and creative
- Include a call-to-action when relevant

Format the response as JSON with the following structure:
{
  "title": "Post title",
  "content": "Main post content",
  "hashtags": ["#hashtag1", "#hashtag2"],
  "callToAction": "Optional CTA",
  "suggestedImage": "Description of suggested image"
}`;
  }

  // Generate multiple post variations
  async generateVariations(prompt, count = 3, options = {}) {
    const variations = [];
    
    for (let i = 0; i < count; i++) {
      const variationPrompt = `${prompt}\n\nCreate variation ${i + 1} with a different approach or angle.`;
      const result = await this.generatePost(variationPrompt, options);
      variations.push(result);
    }

    return variations;
  }

  // Generate content for specific templates
  async generateForTemplate(template, variables = {}) {
    const templatePrompts = {
      'motivacional': `Create a motivational post about: ${variables.topic || 'success and achievement'}. Include inspiring quotes and actionable advice.`,
      'negocios': `Create a business tip post about: ${variables.topic || 'entrepreneurship'}. Share practical insights and industry knowledge.`,
      'engajamento': `Create an engaging question post about: ${variables.topic || 'your audience's interests'}. Encourage discussion and interaction.`,
      'promocao': `Create a promotional post for: ${variables.product || 'a product/service'}. Highlight benefits and create urgency.`,
      'tecnico': `Create a technical tip post about: ${variables.topic || 'technology'}. Share useful information and best practices.`,
      'pessoal': `Create a personal story post about: ${variables.topic || 'your experience'}. Be authentic and relatable.`
    };

    const prompt = templatePrompts[template] || templatePrompts['pessoal'];
    return await this.generatePost(prompt, { tone: 'professional' });
  }

  // Analyze content performance
  async analyzeContent(content) {
    const analysisPrompt = `Analyze this social media content and provide insights:

Content: "${content}"

Provide analysis in JSON format:
{
  "engagementScore": 0-100,
  "sentiment": "positive|negative|neutral",
  "readabilityScore": 0-100,
  "hashtagEffectiveness": 0-100,
  "suggestions": ["suggestion1", "suggestion2"],
  "predictedPerformance": "high|medium|low"
}`;

    try {
      const result = await this.generateWithOpenAI(analysisPrompt, content);
      return JSON.parse(result.content);
    } catch (error) {
      console.error('Content analysis error:', error);
      return {
        engagementScore: 50,
        sentiment: 'neutral',
        readabilityScore: 50,
        hashtagEffectiveness: 50,
        suggestions: ['Review content for better engagement'],
        predictedPerformance: 'medium'
      };
    }
  }

  // Generate image descriptions for AI-generated images
  async generateImageDescription(content, style = 'modern') {
    const prompt = `Create a detailed image description for a social media post with this content: "${content}"

Style: ${style}
Requirements:
- Describe visual elements that would make the post engaging
- Include color schemes and mood
- Suggest layout and typography
- Make it suitable for AI image generation

Return only the image description, no additional text.`;

    try {
      const result = await this.generateWithOpenAI(prompt, '');
      return result.content;
    } catch (error) {
      console.error('Image description generation error:', error);
      return 'A modern, engaging social media post image with vibrant colors and professional design';
    }
  }
}

// Export singleton instance
const aiService = new AIContentService();

module.exports = {
  AIContentService,
  aiService
};
