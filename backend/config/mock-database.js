const fs = require('fs');
const path = require('path');

class MockDatabase {
  constructor() {
    this.dbPath = path.join(__dirname, '..', 'mock-db');
    this.ensureDbExists();
  }

  ensureDbExists() {
    if (!fs.existsSync(this.dbPath)) {
      fs.mkdirSync(this.dbPath, { recursive: true });
    }
  }

  readTable(tableName) {
    const filePath = path.join(this.dbPath, `${tableName}.json`);
    if (!fs.existsSync(filePath)) {
      return [];
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }

  writeTable(tableName, data) {
    const filePath = path.join(this.dbPath, `${tableName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }

  query(sql, params = []) {
    return new Promise((resolve) => {
      // Mock query implementation for basic operations
      const sqlLower = sql.toLowerCase().trim();
      
      if (sqlLower.includes('select') && sqlLower.includes('from users')) {
        const users = this.readTable('users');
        
        if (sqlLower.includes('where email = $1')) {
          const user = users.find(u => u.email === params[0]);
          resolve({ rows: user ? [user] : [] });
        } else if (sqlLower.includes('where user_id = $1')) {
          const user = users.find(u => u.user_id === parseInt(params[0]));
          resolve({ rows: user ? [user] : [] });
        } else {
          resolve({ rows: users });
        }
      } else if (sqlLower.includes('select') && sqlLower.includes('from stores')) {
        const stores = this.readTable('stores');
        resolve({ rows: stores });
      } else if (sqlLower.includes('select') && sqlLower.includes('from ratings')) {
        const ratings = this.readTable('ratings');
        resolve({ rows: ratings });
      } else if (sqlLower.includes('insert into users')) {
        const users = this.readTable('users');
        const newId = Math.max(...users.map(u => u.user_id), 0) + 1;
        const newUser = {
          user_id: newId,
          name: params[0],
          email: params[1],
          password_hash: params[2],
          address: params[3],
          role: params[4],
          created_at: new Date().toISOString()
        };
        users.push(newUser);
        this.writeTable('users', users);
        resolve({ rows: [newUser] });
      } else if (sqlLower.includes('insert into stores')) {
        const stores = this.readTable('stores');
        const newId = Math.max(...stores.map(s => s.store_id), 0) + 1;
        const newStore = {
          store_id: newId,
          name: params[0],
          address: params[1],
          owner_id: params[2],
          created_at: new Date().toISOString()
        };
        stores.push(newStore);
        this.writeTable('stores', stores);
        resolve({ rows: [newStore] });
      } else if (sqlLower.includes('insert into ratings')) {
        const ratings = this.readTable('ratings');
        const newId = Math.max(...ratings.map(r => r.rating_id), 0) + 1;
        const newRating = {
          rating_id: newId,
          user_id: params[0],
          store_id: params[1],
          rating_value: params[2],
          created_at: new Date().toISOString()
        };
        ratings.push(newRating);
        this.writeTable('ratings', ratings);
        resolve({ rows: [newRating] });
      } else {
        // Default response for unsupported queries
        resolve({ rows: [] });
      }
    });
  }

  connect() {
    return Promise.resolve();
  }

  end() {
    return Promise.resolve();
  }
}

module.exports = MockDatabase;
