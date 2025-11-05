import { google } from 'googleapis';
import { AnalysisResult } from './aiAnalyzer';

export async function logToGoogleSheets(
  timestamp: string,
  analysis: AnalysisResult,
  sourceCounts: { news: number; youtube: number; instagram: number }
): Promise<void> {
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

  if (!privateKey || !clientEmail || !spreadsheetId) {
    console.warn('Google Sheets credentials not configured. Skipping logging.');
    return;
  }

  try {
    // Format the private key (handle escaped newlines)
    const formattedKey = privateKey.replace(/\\n/g, '\n');

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: formattedKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Prepare row data
    const row = [
      timestamp,
      sourceCounts.news,
      sourceCounts.youtube,
      sourceCounts.instagram,
      analysis.summary,
      analysis.patterns.join(' | '),
      analysis.strategies.join(' | '),
    ];

    // Check if sheet exists and has headers
    try {
      const getResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Trends!A1:G1',
      });

      // If no headers, add them
      if (!getResponse.data.values || getResponse.data.values.length === 0) {
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: 'Trends!A1:G1',
          valueInputOption: 'RAW',
          requestBody: {
            values: [[
              'Timestamp',
              'News Count',
              'YouTube Count',
              'Instagram Count',
              'Summary',
              'Patterns',
              'Marketing Strategies',
            ]],
          },
        });
      }
    } catch (error) {
      // Sheet might not exist, create headers
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Trends!A1:G1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [[
            'Timestamp',
            'News Count',
            'YouTube Count',
            'Instagram Count',
            'Summary',
            'Patterns',
            'Marketing Strategies',
          ]],
        },
      });
    }

    // Append the data
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Trends!A:G',
      valueInputOption: 'RAW',
      requestBody: {
        values: [row],
      },
    });

    console.log('Successfully logged to Google Sheets');
  } catch (error) {
    console.error('Error logging to Google Sheets:', error);
    throw error;
  }
}
