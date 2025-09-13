const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class DatabaseWrapper {
  constructor(db) {
    this.db = db;
    this.isSQLite = db instanceof sqlite3.Database;
  }

  // Convert PostgreSQL-style parameterized queries to SQLite format
  convertQuery(query, params) {
    if (!this.isSQLite) {
      return { query, params };
    }

    // Convert $1, $2, etc. to ? placeholders for SQLite
    let convertedQuery = query;
    let paramIndex = 1;
    
    while (convertedQuery.includes(`$${paramIndex}`)) {
      convertedQuery = convertedQuery.replace(new RegExp(`\\$${paramIndex}`, 'g'), '?');
      paramIndex++;
    }

    // Convert PostgreSQL-specific functions to SQLite equivalents
    convertedQuery = convertedQuery.replace(/ILIKE/gi, 'LIKE');
    convertedQuery = convertedQuery.replace(/NOW\(\)/gi, 'CURRENT_TIMESTAMP');
    
    // Handle LIMIT and OFFSET parameter references
    convertedQuery = convertedQuery.replace(/LIMIT \$(\d+) OFFSET \$(\d+)/gi, 'LIMIT ? OFFSET ?');

    return { query: convertedQuery, params };
  }

  // Wrapper for query execution
  async query(queryText, params = []) {
    const { query, params: convertedParams } = this.convertQuery(queryText, params);

    if (this.isSQLite) {
      return new Promise((resolve, reject) => {
        // Handle different types of queries
        if (query.trim().toUpperCase().startsWith('SELECT') || query.trim().toUpperCase().startsWith('WITH')) {
          this.db.all(query, convertedParams, (err, rows) => {
            if (err) {
              reject(err);
            } else {
              resolve({ rows: rows || [] });
            }
          });
        } else if (query.trim().toUpperCase().includes('RETURNING')) {
          // Handle INSERT/UPDATE with RETURNING clause
          const baseQuery = query.split('RETURNING')[0].trim();
          const returningFields = query.split('RETURNING')[1].trim();
          
          const db = this.db; // Capture db reference
          db.run(baseQuery, convertedParams, function(err) {
            if (err) {
              reject(err);
            } else {
              // For INSERT operations, get the inserted row
              if (baseQuery.toUpperCase().includes('INSERT')) {
                const tableName = baseQuery.match(/INSERT INTO (\w+)/i)[1];
                const selectQuery = `SELECT ${returningFields} FROM ${tableName} WHERE rowid = ?`;
                
                db.all(selectQuery, [this.lastID], (err, rows) => {
                  if (err) {
                    reject(err);
                  } else {
                    resolve({ rows: rows || [] });
                  }
                });
              } else {
                // For UPDATE operations, we need to select the updated row
                resolve({ rows: [], rowCount: this.changes });
              }
            }
          });
        } else {
          // Handle INSERT, UPDATE, DELETE without RETURNING
          this.db.run(query, convertedParams, function(err) {
            if (err) {
              reject(err);
            } else {
              resolve({ 
                rows: [], 
                rowCount: this.changes,
                insertId: this.lastID 
              });
            }
          });
        }
      });
    } else {
      // For PostgreSQL or mock database, use original query method
      return this.db.query(queryText, params);
    }
  }

  // Close database connection
  async close() {
    if (this.isSQLite) {
      return new Promise((resolve, reject) => {
        this.db.close((err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }
  }
}

module.exports = DatabaseWrapper;
