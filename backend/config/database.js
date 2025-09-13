const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const MockDatabase = require('./mock-database');
const DatabaseWrapper = require('../utils/database-wrapper');
require('dotenv').config();

// Check if we should use mock database
const useMockDb = process.env.USE_MOCK_DB === 'true';

let db;

if (useMockDb) {
  console.log('🔧 Using Mock Database');
  db = new MockDatabase();
} else {
  console.log('💾 Using SQLite Database');
  const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'database', 'store_rating.db');
  
  const sqliteDb = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening SQLite database:', err.message);
      process.exit(-1);
    }
    console.log('Connected to SQLite database');
  });

  // Enable foreign key constraints
  sqliteDb.run('PRAGMA foreign_keys = ON');
  
  // Wrap the SQLite database with our compatibility layer
  db = new DatabaseWrapper(sqliteDb);
}

module.exports = db;
