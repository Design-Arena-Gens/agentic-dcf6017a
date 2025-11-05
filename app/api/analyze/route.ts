import { NextResponse } from 'next/server';
import { fetchAllData } from '@/lib/dataFetchers';
import { analyzeWithAI } from '@/lib/aiAnalyzer';
import { logToGoogleSheets } from '@/lib/sheetsLogger';

export const maxDuration = 60; // Set max duration to 60 seconds for Vercel

export async function POST() {
  try {
    console.log('Starting trend analysis...');

    // Step 1: Fetch data from all sources
    const data = await fetchAllData();

    // Step 2: Analyze with AI
    const analysis = await analyzeWithAI(
      data.news,
      data.youtube,
      data.instagram
    );

    // Step 3: Log to Google Sheets
    const timestamp = new Date().toISOString();

    try {
      await logToGoogleSheets(timestamp, analysis, {
        news: data.news.length,
        youtube: data.youtube.length,
        instagram: data.instagram.length,
      });
    } catch (sheetsError) {
      console.error('Failed to log to Google Sheets:', sheetsError);
      // Continue even if logging fails
    }

    // Step 4: Return results
    return NextResponse.json({
      timestamp,
      summary: analysis.summary,
      patterns: analysis.patterns,
      strategies: analysis.strategies,
      sources: {
        news: data.news.length,
        youtube: data.youtube.length,
        instagram: data.instagram.length,
      },
    });
  } catch (error) {
    console.error('Error in analysis:', error);
    return NextResponse.json(
      {
        error: 'Analysis failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    message: 'Pune Real Estate Trend Intelligence Agent API',
  });
}
