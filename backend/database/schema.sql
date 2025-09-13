-- Store Rating Platform Database Schema

-- Create user role enum
CREATE TYPE user_role AS ENUM ('System Administrator', 'Normal User', 'Store Owner');

-- Users table
CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(60) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    address VARCHAR(400),
    role user_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stores table
CREATE TABLE Stores (
    store_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(400),
    -- A store might not have an owner initially if created by an admin
    owner_id INTEGER REFERENCES Users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ratings table
CREATE TABLE Ratings (
    rating_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
    store_id INTEGER NOT NULL REFERENCES Stores(store_id) ON DELETE CASCADE,
    rating_value INTEGER NOT NULL CHECK (rating_value >= 1 AND rating_value <= 5),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Ensures a user can rate a specific store only once
    UNIQUE (user_id, store_id)
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON Users(email);
CREATE INDEX idx_users_role ON Users(role);
CREATE INDEX idx_stores_owner_id ON Stores(owner_id);
CREATE INDEX idx_ratings_user_id ON Ratings(user_id);
CREATE INDEX idx_ratings_store_id ON Ratings(store_id);
CREATE INDEX idx_ratings_user_store ON Ratings(user_id, store_id);

-- Create a view for store ratings summary
CREATE VIEW store_ratings_summary AS
SELECT 
    s.store_id,
    s.name,
    s.address,
    s.owner_id,
    COALESCE(AVG(r.rating_value), 0) as average_rating,
    COUNT(r.rating_id) as total_ratings
FROM Stores s
LEFT JOIN Ratings r ON s.store_id = r.store_id
GROUP BY s.store_id, s.name, s.address, s.owner_id;
