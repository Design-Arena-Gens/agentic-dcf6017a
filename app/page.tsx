'use client';

import { useState } from 'react';
import { format } from 'date-fns';

interface TrendResult {
  timestamp: string;
  summary: string;
  patterns: string[];
  strategies: string[];
  sources: {
    news: number;
    youtube: number;
    instagram: number;
  };
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrendResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Pune Real Estate Trend Intelligence Agent
          </h1>
          <p className="text-gray-600">
            AI-powered trend analysis and content strategy for Pune & PCMC real estate market
          </p>
        </header>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">Run Analysis</h2>
            <button
              onClick={runAnalysis}
              disabled={loading}
              className={`px-6 py-3 rounded-lg font-medium text-white transition-colors ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Analyzing...' : 'Start Analysis'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-1">Data Sources</h3>
              <p className="text-sm text-blue-700">NewsAPI, YouTube API, Instagram</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-1">AI Analysis</h3>
              <p className="text-sm text-green-700">OpenAI GPT-4 powered insights</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-1">Auto-Logging</h3>
              <p className="text-sm text-purple-700">Google Sheets integration</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-medium">Error: {error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">Analysis Results</h2>
                <span className="text-sm text-gray-500">
                  {format(new Date(result.timestamp), 'PPpp')}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-3xl font-bold text-blue-600">{result.sources.news}</p>
                  <p className="text-sm text-gray-600">News Articles</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-3xl font-bold text-red-600">{result.sources.youtube}</p>
                  <p className="text-sm text-gray-600">YouTube Videos</p>
                </div>
                <div className="text-center p-4 bg-pink-50 rounded-lg">
                  <p className="text-3xl font-bold text-pink-600">{result.sources.instagram}</p>
                  <p className="text-sm text-gray-600">Instagram Posts</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Summary</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{result.summary}</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Key Patterns Detected</h3>
                <div className="space-y-2">
                  {result.patterns.map((pattern, index) => (
                    <div key={index} className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                      <p className="text-gray-800">{pattern}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Marketing Strategies</h3>
                <div className="space-y-2">
                  {result.strategies.map((strategy, index) => (
                    <div key={index} className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                      <p className="text-gray-800">{strategy}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium">
                ✓ Results have been automatically logged to Google Sheets
              </p>
            </div>
          </div>
        )}

        {loading && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Fetching data and analyzing trends...</p>
            <p className="text-sm text-gray-500 mt-2">This may take 30-60 seconds</p>
          </div>
        )}
      </div>
    </div>
  );
}
