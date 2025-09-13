const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function setupDatabase() {
  const dbPath = process.env.DB_PATH || path.join(__dirname, 'database', 'store_rating.db');
  const dbDir = path.dirname(dbPath);
  
  // Ensure database directory exists
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log('✅ Database directory created');
  }

  // Create SQLite database
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('❌ Error creating SQLite database:', err.message);
      process.exit(1);
    }
    console.log('✅ Connected to SQLite database');
  });

  // Enable foreign key constraints
  db.run('PRAGMA foreign_keys = ON');

  try {
    // Execute schema using sqlite3's exec method for better handling of multi-line statements
    const schemaPath = path.join(__dirname, 'database', 'schema-sqlite.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await new Promise((resolve, reject) => {
      db.exec(schema, (err) => {
        if (err) {
          console.error('Error executing schema:', err.message);
          reject(err);
        } else {
          resolve();
        }
      });
    });
    
    console.log('✅ Database schema created successfully');

    // Create default admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    await new Promise((resolve, reject) => {
      db.run(`
        INSERT OR IGNORE INTO Users (name, email, password_hash, address, role) 
        VALUES (?, ?, ?, ?, ?)
      `, [
        'System Administrator User',
        'admin@example.com',
        hashedPassword,
        '123 Admin Street, Admin City',
        'System Administrator'
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          if (this.changes > 0) {
            console.log('✅ Default admin user created');
          } else {
            console.log('✅ Default admin user already exists');
          }
          console.log('   Email: admin@example.com');
          console.log('   Password: admin123');
          resolve();
        }
      });
    });

  } catch (error) {
    console.error('❌ Error setting up database schema:', error.message);
    process.exit(1);
  } finally {
    db.close((err) => {
      if (err) {
        console.error('❌ Error closing database:', err.message);
      } else {
        console.log('✅ Database connection closed');
      }
    });
  }

  console.log('\n🎉 SQLite database setup completed successfully!');
}

setupDatabase().catch(console.error);
