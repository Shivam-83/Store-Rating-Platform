CREATE TABLE IF NOT EXISTS Users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(60) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    address VARCHAR(400),
    role TEXT NOT NULL CHECK (role IN ('System Administrator', 'Normal User', 'Store Owner')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Stores (
    store_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(400),
    owner_id INTEGER REFERENCES Users(user_id) ON DELETE SET NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Ratings (
    rating_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
    store_id INTEGER NOT NULL REFERENCES Stores(store_id) ON DELETE CASCADE,
    rating_value INTEGER NOT NULL CHECK (rating_value >= 1 AND rating_value <= 5),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, store_id)
);

CREATE INDEX IF NOT EXISTS idx_users_email ON Users(email);

CREATE INDEX IF NOT EXISTS idx_users_role ON Users(role);

CREATE INDEX IF NOT EXISTS idx_stores_owner_id ON Stores(owner_id);

CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON Ratings(user_id);

CREATE INDEX IF NOT EXISTS idx_ratings_store_id ON Ratings(store_id);

CREATE INDEX IF NOT EXISTS idx_ratings_user_store ON Ratings(user_id, store_id);

CREATE VIEW IF NOT EXISTS store_ratings_summary AS
SELECT 
    s.store_id,
    s.name,
    s.address,
    s.owner_id,
    COALESCE(AVG(CAST(r.rating_value AS REAL)), 0) as average_rating,
    COUNT(r.rating_id) as total_ratings
FROM Stores s
LEFT JOIN Ratings r ON s.store_id = r.store_id
GROUP BY s.store_id, s.name, s.address, s.owner_id;

CREATE TRIGGER IF NOT EXISTS update_users_timestamp 
    AFTER UPDATE ON Users
BEGIN
    UPDATE Users SET updated_at = CURRENT_TIMESTAMP WHERE user_id = NEW.user_id;
END;

CREATE TRIGGER IF NOT EXISTS update_stores_timestamp 
    AFTER UPDATE ON Stores
BEGIN
    UPDATE Stores SET updated_at = CURRENT_TIMESTAMP WHERE store_id = NEW.store_id;
END;

CREATE TRIGGER IF NOT EXISTS update_ratings_timestamp 
    AFTER UPDATE ON Ratings
BEGIN
    UPDATE Ratings SET updated_at = CURRENT_TIMESTAMP WHERE rating_id = NEW.rating_id;
END;
