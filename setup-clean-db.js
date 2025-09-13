const sqlite3 = require('./backend/node_modules/sqlite3').verbose();
const fs = require('fs');
const path = require('path');

async function setupCleanDatabase() {
  console.log('🧹 Setting up clean SQLite database...');
  
  // Ensure database directory exists
  const dbDir = path.join(__dirname, 'backend', 'database');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log('✅ Created database directory');
  }

  const dbPath = path.join(dbDir, 'store_rating.db');
  
  // Remove existing database to start fresh
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('✅ Removed existing database');
  }

  const db = new sqlite3.Database(dbPath);

  try {
    // Read and execute SQLite schema
    const schemaPath = path.join(__dirname, 'backend', 'database', 'schema-sqlite.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute schema
    await new Promise((resolve, reject) => {
      db.exec(schema, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
    console.log('✅ Clean database schema created successfully');
    console.log('📊 Database is ready for new users and data');

  } catch (error) {
    console.error('❌ Error setting up clean database:', error.message);
    process.exit(1);
  } finally {
    db.close();
  }

  console.log('\n🎉 Clean SQLite database setup completed successfully!');
  console.log('\n📋 Database Status:');
  console.log('✨ Empty database with schema only');
  console.log('👤 No default users - ready for fresh registrations');
  console.log('🏪 No sample stores - ready for new store data');
  console.log('⭐ No sample ratings - ready for authentic user ratings');
  console.log('\n🚀 Next steps:');
  console.log('1. Start backend: cd backend && npm start');
  console.log('2. Start frontend: cd frontend && npm start');
  console.log('3. Register new users at http://localhost:3000/signup');
  console.log('4. Create stores and ratings with fresh data');
}

setupCleanDatabase().catch(console.error);
