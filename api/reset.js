import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const dataPath = path.resolve(process.cwd(), 'data.json');
    let seedData = {};
    if (fs.existsSync(dataPath)) {
      seedData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    }
    return res.status(200).json({ success: true, message: 'Database reset to default seed', data: seedData });
  } catch (err) {
    console.error('Reset API error:', err);
    return res.status(500).json({ error: 'Failed to reset database' });
  }
}
