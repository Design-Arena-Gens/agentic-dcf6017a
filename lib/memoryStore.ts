import { google } from 'googleapis';

/**
 * Memory store that learns from past strategies to avoid duplicates
 * Reads from Google Sheets to maintain history
 */

export async function getPastStrategies(): Promise<string[]> {
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

  if (!privateKey || !clientEmail || !spreadsheetId) {
    console.warn('Google Sheets credentials not configured. Memory disabled.');
    return [];
  }

  try {
    const formattedKey = privateKey.replace(/\\n/g, '\n');

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: formattedKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Get all past strategies from column G (Marketing Strategies)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Trends!G2:G', // Skip header row
    });

    const values = response.data.values;

    if (!values || values.length === 0) {
      return [];
    }

    // Extract all strategies (they are pipe-separated in the cell)
    const allStrategies: string[] = [];

    values.forEach(row => {
      if (row[0]) {
        const strategies = row[0].split('|').map((s: string) => s.trim());
        allStrategies.push(...strategies);
      }
    });

    console.log(`Loaded ${allStrategies.length} past strategies from memory`);

    return allStrategies;
  } catch (error) {
    console.error('Error fetching past strategies:', error);
    return [];
  }
}

export async function addStrategyToMemory(strategy: string): Promise<void> {
  // Strategies are automatically added when logged to Google Sheets
  // This function is a placeholder for future enhancements
  console.log('Strategy will be added to memory via Google Sheets');
}
