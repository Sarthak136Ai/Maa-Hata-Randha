import fs from 'fs';
import path from 'path';

// In-memory persistent database cache across serverless function invocations
let memoryDb = null;
let dbVersion = 1;
let lastUpdatedAt = Date.now();

function getInitialData() {
  try {
    const dataPath = path.resolve(process.cwd(), 'data.json');
    if (fs.existsSync(dataPath)) {
      const fileContent = fs.readFileSync(dataPath, 'utf-8');
      return JSON.parse(fileContent);
    }
  } catch (err) {
    console.error('Error reading data.json:', err);
  }

  // Fallback seed data if file read fails
  return {
    users: [
      { id: "U001", name: "Restaurant Admin", email: "admin@restaurant.com", password: "admin123", role: "admin" },
      { id: "U002", name: "Floor Host Staff", email: "staff@restaurant.com", password: "staff123", role: "staff" },
      { id: "U003", name: "Valued Customer", email: "customer@restaurant.com", password: "customer123", role: "customer" },
      { id: "U004", name: "Alice Chef", email: "chef@restaurant.com", password: "staff123", role: "staff", staffRole: "Chef" },
      { id: "U005", name: "Bob Waiter", email: "waiter@restaurant.com", password: "staff123", role: "staff", staffRole: "Waiter" }
    ],
    tables: [
      { id: "T1", number: "T1", capacity: 2, section: "Window Area", shape: "square", status: "Available", x: 100, y: 100 },
      { id: "T2", number: "T2", capacity: 2, section: "Window Area", shape: "round", status: "Available", x: 250, y: 100 },
      { id: "T3", number: "T3", capacity: 4, section: "Main Dining Area", shape: "square", status: "Available", x: 80, y: 220 },
      { id: "T4", number: "T4", capacity: 4, section: "Main Dining Area", shape: "square", status: "Available", x: 240, y: 220 },
      { id: "T5", number: "T5", capacity: 6, section: "Main Dining Area", shape: "rectangle", status: "Available", x: 400, y: 220 },
      { id: "T6", number: "T6", capacity: 8, section: "Main Dining Area", shape: "rectangle", status: "Available", x: 550, y: 220 },
      { id: "T7", number: "T7", capacity: 2, section: "Outdoor Seating", shape: "round", status: "Available", x: 100, y: 380 },
      { id: "T8", number: "T8", capacity: 4, section: "Outdoor Seating", shape: "square", status: "Available", x: 250, y: 380 },
      { id: "T9", number: "T9", capacity: 4, section: "VIP Section", shape: "square", status: "Available", x: 450, y: 100 },
      { id: "T10", number: "T10", capacity: 6, section: "VIP Section", shape: "rectangle", status: "Available", x: 600, y: 100 }
    ],
    menuItems: [],
    reservations: [],
    orders: [],
    serviceRequests: [],
    version: 1,
    updatedAt: Date.now()
  };
}

function getDatabase() {
  if (!memoryDb) {
    memoryDb = getInitialData();
    dbVersion = memoryDb.version || 1;
    lastUpdatedAt = memoryDb.updatedAt || Date.now();
  }
  return memoryDb;
}

export default async function handler(req, res) {
  // Set universal CORS and cache-busting headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const db = getDatabase();

  if (req.method === 'GET') {
    return res.status(200).json({
      ...db,
      version: dbVersion,
      updatedAt: lastUpdatedAt
    });
  }

  if (req.method === 'POST') {
    try {
      let body = req.body;
      if (typeof body === 'string') {
        body = JSON.parse(body);
      }

      if (!body) {
        return res.status(400).json({ error: 'Invalid request body' });
      }

      const validKeys = ['users', 'tables', 'menuItems', 'reservations', 'orders', 'serviceRequests'];

      // Case 1: Partial update { key: "orders", value: [...] }
      if (body.key && validKeys.includes(body.key)) {
        db[body.key] = body.value;
        dbVersion += 1;
        lastUpdatedAt = Date.now();
        db.version = dbVersion;
        db.updatedAt = lastUpdatedAt;
        return res.status(200).json({ success: true, key: body.key, version: dbVersion, updatedAt: lastUpdatedAt });
      }

      // Case 2: Full or multi-key update { users: [...], orders: [...] }
      let updated = false;
      for (const k of validKeys) {
        if (body[k] !== undefined) {
          db[k] = body[k];
          updated = true;
        }
      }

      if (updated) {
        dbVersion += 1;
        lastUpdatedAt = Date.now();
        db.version = dbVersion;
        db.updatedAt = lastUpdatedAt;
        return res.status(200).json({ success: true, version: dbVersion, updatedAt: lastUpdatedAt });
      }

      return res.status(400).json({ error: 'No valid database keys provided' });
    } catch (err) {
      console.error('API /api/data POST error:', err);
      return res.status(500).json({ error: 'Internal server error processing database update' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
