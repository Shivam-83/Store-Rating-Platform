const express = require('express');
const db = require('../config/database');
const { authenticateToken, requireAdmin, requireStoreOwner } = require('../middleware/auth');

const router = express.Router();

// Admin dashboard - Get statistics (Admin only)
router.get('/admin', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Get total users count
    const usersResult = await db.query('SELECT COUNT(*) as total_users FROM Users');
    const totalUsers = parseInt(usersResult.rows[0].total_users);

    // Get total stores count
    const storesResult = await db.query('SELECT COUNT(*) as total_stores FROM Stores');
    const totalStores = parseInt(storesResult.rows[0].total_stores);

    // Get total ratings count
    const ratingsResult = await db.query('SELECT COUNT(*) as total_ratings FROM Ratings');
    const totalRatings = parseInt(ratingsResult.rows[0].total_ratings);

    // Get user distribution by role
    const userRolesResult = await db.query(`
      SELECT role, COUNT(*) as count 
      FROM Users 
      GROUP BY role 
      ORDER BY role
    `);

    // Get recent activity (last 10 ratings)
    const recentRatingsResult = await db.query(`
      SELECT 
        r.rating_id,
        r.rating_value,
        r.created_at,
        u.name as user_name,
        s.name as store_name
      FROM Ratings r
      JOIN Users u ON r.user_id = u.user_id
      JOIN Stores s ON r.store_id = s.store_id
      ORDER BY r.created_at DESC
      LIMIT 10
    `);

    // Get top rated stores
    const topStoresResult = await db.query(`
      SELECT 
        s.store_id,
        s.name,
        s.address,
        AVG(r.rating_value) as average_rating,
        COUNT(r.rating_id) as total_ratings
      FROM Stores s
      LEFT JOIN Ratings r ON s.store_id = r.store_id
      GROUP BY s.store_id, s.name, s.address
      HAVING COUNT(r.rating_id) > 0
      ORDER BY AVG(r.rating_value) DESC, COUNT(r.rating_id) DESC
      LIMIT 5
    `);

    res.json({
      statistics: {
        totalUsers,
        totalStores,
        totalRatings
      },
      userDistribution: userRolesResult.rows.map(row => ({
        role: row.role,
        count: parseInt(row.count)
      })),
      recentActivity: recentRatingsResult.rows.map(rating => ({
        id: rating.rating_id,
        ratingValue: rating.rating_value,
        userName: rating.user_name,
        storeName: rating.store_name,
        createdAt: rating.created_at
      })),
      topRatedStores: topStoresResult.rows.map(store => ({
        id: store.store_id,
        name: store.name,
        address: store.address,
        averageRating: parseFloat(store.average_rating).toFixed(1),
        totalRatings: parseInt(store.total_ratings)
      }))
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ error: 'Internal server error while fetching admin dashboard data' });
  }
});

// Store owner dashboard - Get store statistics (Store Owner only)
router.get('/owner', authenticateToken, requireStoreOwner, async (req, res) => {
  try {
    const ownerId = req.user.user_id;

    // Get owner's store
    const storeResult = await db.query(
      'SELECT store_id, name, address, created_at FROM Stores WHERE owner_id = $1',
      [ownerId]
    );

    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'No store found for this owner' });
    }

    const store = storeResult.rows[0];
    const storeId = store.store_id;

    // Get average rating for the store
    const ratingResult = await db.query(`
      SELECT 
        AVG(rating_value) as average_rating,
        COUNT(rating_id) as total_ratings
      FROM Ratings 
      WHERE store_id = $1
    `, [storeId]);

    const averageRating = ratingResult.rows[0].average_rating 
      ? parseFloat(ratingResult.rows[0].average_rating).toFixed(1) 
      : '0.0';
    const totalRatings = parseInt(ratingResult.rows[0].total_ratings);

    // Get list of users who have rated the store
    const ratersResult = await db.query(`
      SELECT 
        u.user_id,
        u.name,
        u.email,
        r.rating_value,
        r.created_at,
        r.updated_at
      FROM Ratings r
      JOIN Users u ON r.user_id = u.user_id
      WHERE r.store_id = $1
      ORDER BY r.created_at DESC
    `, [storeId]);

    // Get rating distribution
    const distributionResult = await db.query(`
      SELECT 
        rating_value,
        COUNT(*) as count
      FROM Ratings 
      WHERE store_id = $1
      GROUP BY rating_value
      ORDER BY rating_value DESC
    `, [storeId]);

    res.json({
      store: {
        id: store.store_id,
        name: store.name,
        address: store.address,
        createdAt: store.created_at
      },
      statistics: {
        averageRating,
        totalRatings
      },
      ratingDistribution: distributionResult.rows.map(row => ({
        rating: row.rating_value,
        count: parseInt(row.count)
      })),
      raters: ratersResult.rows.map(rater => ({
        userId: rater.user_id,
        name: rater.name,
        email: rater.email,
        ratingValue: rater.rating_value,
        ratedAt: rater.created_at,
        updatedAt: rater.updated_at
      }))
    });
  } catch (error) {
    console.error('Owner dashboard error:', error);
    res.status(500).json({ error: 'Internal server error while fetching owner dashboard data' });
  }
});

module.exports = router;
