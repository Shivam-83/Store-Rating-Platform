const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateUserCreationByAdmin, validatePasswordUpdate } = require('../middleware/validation');

const router = express.Router();

// Create new user (Admin only)
router.post('/', authenticateToken, requireAdmin, validateUserCreationByAdmin, async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    // Check if user already exists
    const existingUser = await db.query('SELECT email FROM Users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const result = await db.query(
      'INSERT INTO Users (name, email, password_hash, address, role) VALUES ($1, $2, $3, $4, $5) RETURNING user_id, name, email, address, role, created_at',
      [name, email, passwordHash, address, role]
    );

    const newUser = result.rows[0];

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser.user_id,
        name: newUser.name,
        email: newUser.email,
        address: newUser.address,
        role: newUser.role,
        createdAt: newUser.created_at
      }
    });
  } catch (error) {
    console.error('User creation error:', error);
    res.status(500).json({ error: 'Internal server error during user creation' });
  }
});

// Get all users (Admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, email, address, role, sortBy = 'created_at', sortOrder = 'DESC', page = 1, limit = 10 } = req.query;

    // Build WHERE clause for filtering
    let whereConditions = [];
    let queryParams = [];
    let paramCount = 0;

    if (name) {
      paramCount++;
      whereConditions.push(`name ILIKE $${paramCount}`);
      queryParams.push(`%${name}%`);
    }

    if (email) {
      paramCount++;
      whereConditions.push(`email ILIKE $${paramCount}`);
      queryParams.push(`%${email}%`);
    }

    if (address) {
      paramCount++;
      whereConditions.push(`address ILIKE $${paramCount}`);
      queryParams.push(`%${address}%`);
    }

    if (role) {
      paramCount++;
      whereConditions.push(`role = $${paramCount}`);
      queryParams.push(role);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Validate sort parameters
    const validSortFields = ['name', 'email', 'address', 'role', 'created_at'];
    const validSortOrders = ['ASC', 'DESC'];
    
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortDirection = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    // Calculate pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Add pagination parameters
    paramCount++;
    queryParams.push(parseInt(limit));
    paramCount++;
    queryParams.push(offset);

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM Users ${whereClause}`;
    const countResult = await db.query(countQuery, queryParams.slice(0, -2));
    const totalUsers = parseInt(countResult.rows[0].count);

    // Get users with pagination
    const query = `
      SELECT user_id, name, email, address, role, created_at, updated_at 
      FROM Users 
      ${whereClause}
      ORDER BY ${sortField} ${sortDirection}
      LIMIT $${paramCount - 1} OFFSET $${paramCount}
    `;

    const result = await db.query(query, queryParams);

    res.json({
      users: result.rows.map(user => ({
        id: user.user_id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalUsers / parseInt(limit)),
        totalUsers,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error while fetching users' });
  }
});

// Get single user by ID (Admin only)
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const result = await db.query(
      'SELECT user_id, name, email, address, role, created_at, updated_at FROM Users WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    let storeRating = null;

    // If user is a Store Owner, get their store's average rating
    if (user.role === 'Store Owner') {
      const storeRatingResult = await db.query(`
        SELECT 
          s.store_id,
          s.name as store_name,
          COALESCE(AVG(r.rating_value), 0) as average_rating,
          COUNT(r.rating_id) as total_ratings
        FROM Stores s
        LEFT JOIN Ratings r ON s.store_id = r.store_id
        WHERE s.owner_id = $1
        GROUP BY s.store_id, s.name
      `, [userId]);

      if (storeRatingResult.rows.length > 0) {
        const store = storeRatingResult.rows[0];
        storeRating = {
          storeId: store.store_id,
          storeName: store.store_name,
          averageRating: parseFloat(store.average_rating).toFixed(1),
          totalRatings: parseInt(store.total_ratings)
        };
      }
    }

    res.json({
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        ...(storeRating && { storeRating })
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error while fetching user' });
  }
});

// Update password (Authenticated users - Normal Users and Store Owners only)
router.put('/password', authenticateToken, validatePasswordUpdate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.user_id;

    // Only Normal Users and Store Owners can update their password
    if (!['Normal User', 'Store Owner'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Only Normal Users and Store Owners can update their password' });
    }

    // Get current password hash
    const userResult = await db.query(
      'SELECT password_hash FROM Users WHERE user_id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await db.query(
      'UPDATE Users SET password_hash = $1, updated_at = NOW() WHERE user_id = $2',
      [newPasswordHash, userId]
    );

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password update error:', error);
    res.status(500).json({ error: 'Internal server error during password update' });
  }
});

module.exports = router;
