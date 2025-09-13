const express = require('express');
const db = require('../config/database');
const { authenticateToken, requireNormalUser } = require('../middleware/auth');
const { validateRatingSubmission } = require('../middleware/validation');

const router = express.Router();

// Submit new rating for a store (Normal User only)
router.post('/:storeId', authenticateToken, requireNormalUser, validateRatingSubmission, async (req, res) => {
  try {
    const storeId = parseInt(req.params.storeId);
    const userId = req.user.user_id;
    const { rating_value } = req.body;

    if (isNaN(storeId)) {
      return res.status(400).json({ error: 'Invalid store ID' });
    }

    // Check if store exists
    const storeResult = await db.query('SELECT store_id FROM Stores WHERE store_id = $1', [storeId]);
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Check if user has already rated this store
    const existingRating = await db.query(
      'SELECT rating_id FROM Ratings WHERE user_id = $1 AND store_id = $2',
      [userId, storeId]
    );

    if (existingRating.rows.length > 0) {
      return res.status(409).json({ error: 'You have already rated this store. Use PUT to update your rating.' });
    }

    // Insert new rating
    const result = await db.query(
      'INSERT INTO Ratings (user_id, store_id, rating_value) VALUES ($1, $2, $3) RETURNING rating_id, rating_value, created_at',
      [userId, storeId, rating_value]
    );

    const newRating = result.rows[0];

    res.status(201).json({
      message: 'Rating submitted successfully',
      rating: {
        id: newRating.rating_id,
        userId,
        storeId,
        ratingValue: newRating.rating_value,
        createdAt: newRating.created_at
      }
    });
  } catch (error) {
    console.error('Rating submission error:', error);
    res.status(500).json({ error: 'Internal server error during rating submission' });
  }
});

// Update existing rating for a store (Normal User only)
router.put('/:storeId', authenticateToken, requireNormalUser, validateRatingSubmission, async (req, res) => {
  try {
    const storeId = parseInt(req.params.storeId);
    const userId = req.user.user_id;
    const { rating_value } = req.body;

    if (isNaN(storeId)) {
      return res.status(400).json({ error: 'Invalid store ID' });
    }

    // Check if store exists
    const storeResult = await db.query('SELECT store_id FROM Stores WHERE store_id = $1', [storeId]);
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Check if user has rated this store
    const existingRating = await db.query(
      'SELECT rating_id, rating_value FROM Ratings WHERE user_id = $1 AND store_id = $2',
      [userId, storeId]
    );

    if (existingRating.rows.length === 0) {
      return res.status(404).json({ error: 'You have not rated this store yet. Use POST to submit a new rating.' });
    }

    // Update existing rating
    const result = await db.query(
      'UPDATE Ratings SET rating_value = $1, updated_at = NOW() WHERE user_id = $2 AND store_id = $3 RETURNING rating_id, rating_value, updated_at',
      [rating_value, userId, storeId]
    );

    const updatedRating = result.rows[0];

    res.json({
      message: 'Rating updated successfully',
      rating: {
        id: updatedRating.rating_id,
        userId,
        storeId,
        ratingValue: updatedRating.rating_value,
        updatedAt: updatedRating.updated_at
      }
    });
  } catch (error) {
    console.error('Rating update error:', error);
    res.status(500).json({ error: 'Internal server error during rating update' });
  }
});

// Get user's rating for a specific store (Normal User only)
router.get('/:storeId', authenticateToken, requireNormalUser, async (req, res) => {
  try {
    const storeId = parseInt(req.params.storeId);
    const userId = req.user.user_id;

    if (isNaN(storeId)) {
      return res.status(400).json({ error: 'Invalid store ID' });
    }

    // Get user's rating for the store
    const result = await db.query(
      'SELECT rating_id, rating_value, created_at, updated_at FROM Ratings WHERE user_id = $1 AND store_id = $2',
      [userId, storeId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'You have not rated this store yet' });
    }

    const rating = result.rows[0];

    res.json({
      rating: {
        id: rating.rating_id,
        userId,
        storeId,
        ratingValue: rating.rating_value,
        createdAt: rating.created_at,
        updatedAt: rating.updated_at
      }
    });
  } catch (error) {
    console.error('Get rating error:', error);
    res.status(500).json({ error: 'Internal server error while fetching rating' });
  }
});

// Delete user's rating for a specific store (Normal User only)
router.delete('/:storeId', authenticateToken, requireNormalUser, async (req, res) => {
  try {
    const storeId = parseInt(req.params.storeId);
    const userId = req.user.user_id;

    if (isNaN(storeId)) {
      return res.status(400).json({ error: 'Invalid store ID' });
    }

    // Check if user has rated this store
    const existingRating = await db.query(
      'SELECT rating_id FROM Ratings WHERE user_id = $1 AND store_id = $2',
      [userId, storeId]
    );

    if (existingRating.rows.length === 0) {
      return res.status(404).json({ error: 'You have not rated this store yet' });
    }

    // Delete the rating
    await db.query(
      'DELETE FROM Ratings WHERE user_id = $1 AND store_id = $2',
      [userId, storeId]
    );

    res.json({ message: 'Rating deleted successfully' });
  } catch (error) {
    console.error('Rating deletion error:', error);
    res.status(500).json({ error: 'Internal server error during rating deletion' });
  }
});

module.exports = router;
