import axios from 'axios';

export interface NewsArticle {
  title: string;
  url: string;
  description: string;
  publishedAt: string;
  source: string;
}

export interface YouTubeVideo {
  title: string;
  url: string;
  description: string;
  publishedAt: string;
  channelTitle: string;
}

export interface InstagramPost {
  caption: string;
  url: string;
  timestamp: string;
}

const EXCLUDED_DOMAINS = ['youtube.com', 'quora.com', 'reddit.com'];

export async function fetchNewsData(): Promise<NewsArticle[]> {
  const apiKey = process.env.NEWSAPI_KEY;

  if (!apiKey) {
    console.warn('NewsAPI key not configured');
    return [];
  }

  const keywords = [
    'Pune real estate',
    'PCMC property',
    'Pune metro',
    'Pune infrastructure',
    'Godrej Properties Pune',
    'Lodha Pune',
    'Kolte Patil Pune',
    'VTP Realty Pune',
    'Pune housing',
    'Pune commercial property'
  ];

  const query = keywords.join(' OR ');

  try {
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: query,
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 50,
        apiKey,
      },
      timeout: 10000,
    });

    const articles = response.data.articles || [];

    // Filter out excluded domains and duplicates
    const filtered = articles.filter((article: any) => {
      const domain = new URL(article.url).hostname;
      return !EXCLUDED_DOMAINS.some(excluded => domain.includes(excluded));
    });

    // Remove duplicates by title
    const unique = filtered.reduce((acc: any[], article: any) => {
      if (!acc.find(a => a.title === article.title)) {
        acc.push(article);
      }
      return acc;
    }, []);

    return unique.map((article: any) => ({
      title: article.title,
      url: article.url,
      description: article.description || '',
      publishedAt: article.publishedAt,
      source: article.source.name,
    })).slice(0, 20);
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}

export async function fetchYouTubeData(): Promise<YouTubeVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    console.warn('YouTube API key not configured');
    return [];
  }

  const queries = [
    'Godrej Properties Pune launch',
    'Lodha Pune project',
    'Kolte Patil Pune property',
    'VTP Realty Pune',
    'Pune metro real estate',
    'Pune infrastructure development',
    'Pune PCMC property market',
    'Pune real estate 2025',
    'Pune property investment',
  ];

  const allVideos: YouTubeVideo[] = [];

  try {
    for (const query of queries) {
      const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          q: query,
          type: 'video',
          maxResults: 5,
          order: 'date',
          key: apiKey,
        },
        timeout: 10000,
      });

      const items = response.data.items || [];

      const videos = items.map((item: any) => ({
        title: item.snippet.title,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        description: item.snippet.description,
        publishedAt: item.snippet.publishedAt,
        channelTitle: item.snippet.channelTitle,
      }));

      allVideos.push(...videos);
    }

    // Remove duplicates by URL
    const unique = allVideos.reduce((acc: YouTubeVideo[], video) => {
      if (!acc.find(v => v.url === video.url)) {
        acc.push(video);
      }
      return acc;
    }, []);

    return unique.slice(0, 25);
  } catch (error) {
    console.error('Error fetching YouTube data:', error);
    return [];
  }
}

export async function fetchInstagramData(): Promise<InstagramPost[]> {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!accessToken) {
    console.warn('Instagram access token not configured');
    return [];
  }

  try {
    // Instagram Graph API - requires business account
    const response = await axios.get(
      `https://graph.instagram.com/me/media`,
      {
        params: {
          fields: 'id,caption,media_url,permalink,timestamp',
          access_token: accessToken,
        },
        timeout: 10000,
      }
    );

    const posts = response.data.data || [];

    // Filter for Pune/PCMC real estate related posts
    const filtered = posts.filter((post: any) => {
      const caption = post.caption?.toLowerCase() || '';
      return caption.includes('pune') ||
             caption.includes('pcmc') ||
             caption.includes('real estate') ||
             caption.includes('property');
    });

    return filtered.map((post: any) => ({
      caption: post.caption || '',
      url: post.permalink,
      timestamp: post.timestamp,
    })).slice(0, 15);
  } catch (error) {
    console.error('Error fetching Instagram data:', error);
    return [];
  }
}

export async function fetchAllData() {
  console.log('Fetching data from all sources...');

  const [news, youtube, instagram] = await Promise.all([
    fetchNewsData(),
    fetchYouTubeData(),
    fetchInstagramData(),
  ]);

  console.log(`Fetched: ${news.length} news, ${youtube.length} videos, ${instagram.length} posts`);

  return {
    news,
    youtube,
    instagram,
    totalItems: news.length + youtube.length + instagram.length,
  };
}
