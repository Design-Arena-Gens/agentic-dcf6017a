import OpenAI from 'openai';
import { NewsArticle, YouTubeVideo, InstagramPost } from './dataFetchers';
import { getPastStrategies } from './memoryStore';

const getOpenAIClient = () => {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
  });
};

export interface AnalysisResult {
  summary: string;
  patterns: string[];
  strategies: string[];
}

export async function analyzeWithAI(
  news: NewsArticle[],
  youtube: YouTubeVideo[],
  instagram: InstagramPost[]
): Promise<AnalysisResult> {
  console.log('Starting AI analysis...');

  // Get past strategies to avoid duplicates
  const pastStrategies = await getPastStrategies();

  // Prepare data summary for AI
  const newsContent = news.map(article =>
    `- ${article.title} (${article.source}, ${article.publishedAt}): ${article.description}`
  ).join('\n');

  const youtubeContent = youtube.map(video =>
    `- ${video.title} (${video.channelTitle}, ${video.publishedAt}): ${video.description}`
  ).join('\n');

  const instagramContent = instagram.map(post =>
    `- ${post.caption.substring(0, 200)}... (${post.timestamp})`
  ).join('\n');

  const pastStrategiesText = pastStrategies.length > 0
    ? `\n\nPREVIOUSLY GENERATED STRATEGIES (DO NOT REPEAT):\n${pastStrategies.map((s, i) => `${i + 1}. ${s}`).join('\n')}`
    : '';

  const prompt = `You are an expert real estate marketing analyst specializing in the Pune & PCMC (Pimpri-Chinchwad) market in India.

Analyze the following data from multiple sources and provide insights:

NEWS ARTICLES:
${newsContent}

YOUTUBE VIDEOS:
${youtubeContent}

INSTAGRAM POSTS:
${instagramContent}
${pastStrategiesText}

Please provide:

1. SUMMARY: A comprehensive 3-4 paragraph summary of the current trends in Pune & PCMC real estate market. Focus on:
   - Major project launches and developments
   - Infrastructure improvements (metro, roads, connectivity)
   - Market sentiment and buyer preferences
   - Key developers and their activities
   - Price trends and investment hotspots

2. PATTERNS: Identify 5-7 key patterns or trends you observe across all data sources. Be specific and data-driven.

3. MARKETING STRATEGIES: Generate 5-8 FRESH, CREATIVE marketing strategy ideas based on these trends. These strategies should:
   - Be actionable and specific to Pune/PCMC market
   - Leverage the identified trends
   - Be innovative and not generic
   - NOT duplicate any of the previously generated strategies listed above
   - Focus on content marketing, social media, events, partnerships, or digital campaigns

Format your response as JSON:
{
  "summary": "Your detailed summary here",
  "patterns": ["Pattern 1", "Pattern 2", ...],
  "strategies": ["Strategy 1", "Strategy 2", ...]
}`;

  try {
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert real estate marketing analyst. Always respond with valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 2500,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    const result = JSON.parse(content);

    console.log('AI analysis complete');

    return {
      summary: result.summary || 'No summary generated',
      patterns: result.patterns || [],
      strategies: result.strategies || [],
    };
  } catch (error) {
    console.error('Error in AI analysis:', error);

    // Fallback analysis
    return {
      summary: 'Analysis could not be completed due to an error. Please check your OpenAI API configuration.',
      patterns: [
        'Unable to analyze patterns',
      ],
      strategies: [
        'Unable to generate strategies',
      ],
    };
  }
}
