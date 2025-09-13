const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch user details from database
    const userResult = await db.query(
      'SELECT user_id, name, email, role FROM Users WHERE user_id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = userResult.rows[0];
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Middleware to check user roles
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Middleware specifically for admin access
const requireAdmin = authorizeRoles('System Administrator');

// Middleware specifically for normal user access
const requireNormalUser = authorizeRoles('Normal User');

// Middleware specifically for store owner access
const requireStoreOwner = authorizeRoles('Store Owner');

// Middleware for normal users and admins
const requireUserOrAdmin = authorizeRoles('Normal User', 'System Administrator');

module.exports = {
  authenticateToken,
  authorizeRoles,
  requireAdmin,
  requireNormalUser,
  requireStoreOwner,
  requireUserOrAdmin
};
