// Mock database setup for development without PostgreSQL
const fs = require('fs');
const path = require('path');

// Create a simple JSON-based mock database
const mockData = {
  users: [
    {
      user_id: 1,
      name: "System Administrator User",
      email: "admin@example.com",
      password_hash: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.Txjb02", // admin123
      address: "123 Admin Street, Admin City",
      role: "System Administrator",
      created_at: new Date().toISOString()
    },
    {
      user_id: 2,
      name: "Normal User Test Account",
      email: "user@example.com", 
      password_hash: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.Txjb02", // user123
      address: "456 User Street, User City",
      role: "Normal User",
      created_at: new Date().toISOString()
    },
    {
      user_id: 3,
      name: "Store Owner Test Account",
      email: "owner@example.com",
      password_hash: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.Txjb02", // owner123
      address: "789 Owner Street, Owner City", 
      role: "Store Owner",
      created_at: new Date().toISOString()
    }
  ],
  stores: [
    {
      store_id: 1,
      name: "Test Electronics Store",
      address: "123 Electronics Ave, Tech City",
      owner_id: 3,
      created_at: new Date().toISOString()
    },
    {
      store_id: 2,
      name: "Sample Grocery Store",
      address: "456 Grocery Lane, Food Town",
      owner_id: 3,
      created_at: new Date().toISOString()
    }
  ],
  ratings: [
    {
      rating_id: 1,
      user_id: 2,
      store_id: 1,
      rating_value: 4,
      created_at: new Date().toISOString()
    },
    {
      rating_id: 2,
      user_id: 2,
      store_id: 2,
      rating_value: 5,
      created_at: new Date().toISOString()
    }
  ]
};

// Create mock database directory
const mockDbDir = path.join(__dirname, 'mock-db');
if (!fs.existsSync(mockDbDir)) {
  fs.mkdirSync(mockDbDir);
}

// Write mock data to JSON files
fs.writeFileSync(path.join(mockDbDir, 'users.json'), JSON.stringify(mockData.users, null, 2));
fs.writeFileSync(path.join(mockDbDir, 'stores.json'), JSON.stringify(mockData.stores, null, 2));
fs.writeFileSync(path.join(mockDbDir, 'ratings.json'), JSON.stringify(mockData.ratings, null, 2));

console.log('✅ Mock database created successfully!');
console.log('📁 Location: backend/mock-db/');
console.log('\n🔑 Test Accounts:');
console.log('Admin: admin@example.com / admin123');
console.log('User: user@example.com / user123');
console.log('Owner: owner@example.com / owner123');
console.log('\n🚀 You can now test the application without PostgreSQL!');
