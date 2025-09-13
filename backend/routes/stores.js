const express = require('express');
const db = require('../config/database');
const { authenticateToken, requireAdmin, requireUserOrAdmin } = require('../middleware/auth');
const { validateStoreCreation } = require('../middleware/validation');

const router = express.Router();

// Create new store (Admin only)
router.post('/', authenticateToken, requireAdmin, validateStoreCreation, async (req, res) => {
  try {
    const { name, address, owner_id } = req.body;

    // If owner_id is provided, verify it exists and is a Store Owner
    if (owner_id) {
      const ownerResult = await db.query(
        'SELECT user_id, role FROM Users WHERE user_id = $1',
        [owner_id]
      );

      if (ownerResult.rows.length === 0) {
        return res.status(404).json({ error: 'Owner not found' });
      }

      if (ownerResult.rows[0].role !== 'Store Owner') {
        return res.status(400).json({ error: 'Specified user is not a Store Owner' });
      }
    }

    // Insert new store
    const result = await db.query(
      'INSERT INTO Stores (name, address, owner_id) VALUES ($1, $2, $3) RETURNING store_id, name, address, owner_id, created_at',
      [name, address, owner_id || null]
    );

    const newStore = result.rows[0];

    res.status(201).json({
      message: 'Store created successfully',
      store: {
        id: newStore.store_id,
        name: newStore.name,
        address: newStore.address,
        ownerId: newStore.owner_id,
        createdAt: newStore.created_at
      }
    });
  } catch (error) {
    console.error('Store creation error:', error);
    res.status(500).json({ error: 'Internal server error during store creation' });
  }
});

// Get all stores with filtering, sorting, and pagination
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, name, address, sortBy = 'name', sortOrder = 'ASC' } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Simplified query for SQLite compatibility
    let baseQuery = `
      SELECT 
        s.store_id,
        s.name,
        s.address,
        s.owner_id,
        s.created_at,
        u.email as owner_email
      FROM Stores s
      LEFT JOIN Users u ON s.owner_id = u.user_id
    `;

    let whereConditions = [];
    let queryParams = [];

    // Add filtering conditions
    if (name) {
      whereConditions.push('s.name LIKE ?');
      queryParams.push(`%${name}%`);
    }

    if (address) {
      whereConditions.push('s.address LIKE ?');
      queryParams.push(`%${address}%`);
    }

    if (whereConditions.length > 0) {
      baseQuery += ' WHERE ' + whereConditions.join(' AND ');
    }

    // Add ordering
    const validSortFields = ['name', 'address', 'created_at'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
    const sortDirection = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';
    
    baseQuery += ` ORDER BY s.${sortField} ${sortDirection}`;

    // Add pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    baseQuery += ` LIMIT ? OFFSET ?`;
    queryParams.push(parseInt(limit), offset);

    // Execute query
    const result = await db.query(baseQuery, queryParams);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as count FROM Stores s';
    let countParams = [];
    
    if (whereConditions.length > 0) {
      countQuery += ' WHERE ' + whereConditions.join(' AND ');
      countParams = queryParams.slice(0, -2); // Remove LIMIT and OFFSET params
    }

    const countResult = await db.query(countQuery, countParams);
    const totalStores = countResult.rows[0].count || 0;

    // Calculate ratings for each store separately
    const storesWithRatings = await Promise.all(result.rows.map(async (store) => {
      const ratingQuery = `
        SELECT 
          COALESCE(AVG(CAST(rating_value AS REAL)), 0) as average_rating,
          COUNT(*) as total_ratings
        FROM Ratings 
        WHERE store_id = ?
      `;
      
      const ratingResult = await db.query(ratingQuery, [store.store_id]);
      const ratings = ratingResult.rows[0] || { average_rating: 0, total_ratings: 0 };
      
      return {
        id: store.store_id,
        name: store.name,
        address: store.address,
        ownerId: store.owner_id,
        ownerEmail: store.owner_email || 'N/A',
        averageRating: parseFloat(ratings.average_rating || 0).toFixed(1),
        totalRatings: parseInt(ratings.total_ratings || 0),
        createdAt: store.created_at,
        userRating: userRole === 'Normal User' ? null : undefined
      };
    }));

    res.json({
      stores: storesWithRatings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalStores / parseInt(limit)),
        totalStores,
        hasNext: parseInt(page) < Math.ceil(totalStores / parseInt(limit)),
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Store listing error:', error);
    res.status(500).json({ error: 'Internal server error while fetching stores' });
  }
});

// Get single store by ID (Authenticated users)
router.get('/:id', authenticateToken, requireUserOrAdmin, async (req, res) => {
  try {
    const storeId = parseInt(req.params.id);
    const userId = req.user.user_id;
    const userRole = req.user.role;

    if (isNaN(storeId)) {
      return res.status(400).json({ error: 'Invalid store ID' });
    }

    let query = `
      SELECT 
        s.store_id,
        s.name,
        s.address,
        s.owner_id,
        s.created_at,
        s.updated_at,
        COALESCE(AVG(r.rating_value), 0) as average_rating,
        COUNT(r.rating_id) as total_ratings
    `;

    let queryParams = [storeId];

    // For Normal Users, also get their personal rating
    if (userRole === 'Normal User') {
      query += `,
        ur.rating_value as user_rating
      FROM Stores s
      LEFT JOIN Ratings r ON s.store_id = r.store_id
      LEFT JOIN Ratings ur ON s.store_id = ur.store_id AND ur.user_id = $2
      WHERE s.store_id = $1
      GROUP BY s.store_id, s.name, s.address, s.owner_id, s.created_at, s.updated_at, ur.rating_value
      `;
      queryParams.push(userId);
    } else {
      query += `
      FROM Stores s
      LEFT JOIN Ratings r ON s.store_id = r.store_id
      WHERE s.store_id = $1
      GROUP BY s.store_id, s.name, s.address, s.owner_id, s.created_at, s.updated_at
      `;
    }

    const result = await db.query(query, queryParams);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const store = result.rows[0];

    const storeData = {
      id: store.store_id,
      name: store.name,
      address: store.address,
      ownerId: store.owner_id,
      averageRating: parseFloat(store.average_rating).toFixed(1),
      totalRatings: parseInt(store.total_ratings),
      createdAt: store.created_at,
      updatedAt: store.updated_at
    };

    // Add user's personal rating for Normal Users
    if (userRole === 'Normal User') {
      storeData.userRating = store.user_rating;
    }

    res.json({ store: storeData });
  } catch (error) {
    console.error('Get store error:', error);
    res.status(500).json({ error: 'Internal server error while fetching store' });
  }
});

module.exports = router;
