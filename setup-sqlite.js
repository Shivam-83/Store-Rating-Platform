const sqlite3 = require('./backend/node_modules/sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const bcrypt = require('./backend/node_modules/bcrypt');

async function setupDatabase() {
  console.log('🚀 Setting up SQLite database...');
  
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
    console.log('✅ Database schema created successfully');

    // Create default users
    const hashedAdminPassword = await bcrypt.hash('admin123', 12);
    const hashedUserPassword = await bcrypt.hash('User123!', 12);
    const hashedOwnerPassword = await bcrypt.hash('Owner123!', 12);
    
    const users = [
      {
        name: 'System Administrator',
        email: 'admin@example.com',
        password: hashedAdminPassword,
        address: '123 Admin Street, Admin City',
        role: 'System Administrator'
      },
      {
        name: 'John Doe',
        email: 'user@example.com',
        password: hashedUserPassword,
        address: '456 User Avenue, User Town',
        role: 'Normal User'
      },
      {
        name: 'Store Owner',
        email: 'owner@example.com',
        password: hashedOwnerPassword,
        address: '789 Owner Boulevard, Owner City',
        role: 'Store Owner'
      }
    ];

    for (const user of users) {
      await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO Users (name, email, password_hash, address, role) 
          VALUES (?, ?, ?, ?, ?)
        `, [user.name, user.email, user.password, user.address, user.role], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        });
      });
    }
    console.log('✅ Default users created');

    // Create sample stores (owner_id = 3 is the Store Owner user)
    const stores = [
      {
        name: 'Tech Electronics Store',
        address: '123 Tech Street, Silicon Valley',
        ownerId: 3
      },
      {
        name: 'Fashion Boutique',
        address: '456 Fashion Ave, Style City',
        ownerId: 3
      },
      {
        name: 'Grocery Mart',
        address: '789 Market Road, Food Town',
        ownerId: 3
      }
    ];

    for (const store of stores) {
      await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO Stores (name, address, owner_id) 
          VALUES (?, ?, ?)
        `, [store.name, store.address, store.ownerId], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        });
      });
    }
    console.log('✅ Sample stores created');

    // Create sample ratings (using user_id instead of user_email)
    const ratings = [
      { storeId: 1, userId: 2, rating: 5 }, // User rates Tech Electronics
      { storeId: 1, userId: 1, rating: 4 }, // Admin rates Tech Electronics
      { storeId: 2, userId: 2, rating: 4 }, // User rates Fashion Boutique
      { storeId: 3, userId: 2, rating: 3 }  // User rates Grocery Mart
    ];

    for (const rating of ratings) {
      await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO Ratings (store_id, user_id, rating_value) 
          VALUES (?, ?, ?)
        `, [rating.storeId, rating.userId, rating.rating], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        });
      });
    }
    console.log('✅ Sample ratings created');

  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    process.exit(1);
  } finally {
    db.close();
  }

  console.log('\n🎉 SQLite database setup completed successfully!');
  console.log('\n📋 Test Credentials:');
  console.log('👤 Admin: admin@example.com / admin123');
  console.log('👤 User: user@example.com / User123!');
  console.log('👤 Store Owner: owner@example.com / Owner123!');
  console.log('\n🚀 Next steps:');
  console.log('1. Start backend: cd backend && npm start');
  console.log('2. Start frontend: cd frontend && npm start');
  console.log('3. Open http://localhost:3000 in your browser');
}

setupDatabase().catch(console.error);
