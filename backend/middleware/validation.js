const { body, validationResult } = require('express-validator');

// Validation middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// User registration validation rules
const validateUserRegistration = [
  body('name')
    .isLength({ min: 2, max: 60 })
    .withMessage('Name must be between 2 and 60 characters')
    .trim(),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6, max: 50 })
    .withMessage('Password must be between 6 and 50 characters long'),
  body('address')
    .optional()
    .isLength({ max: 400 })
    .withMessage('Address must not exceed 400 characters')
    .trim(),
  body('role')
    .optional()
    .isIn(['Normal User', 'Store Owner', 'System Administrator'])
    .withMessage('Invalid role selected'),
  handleValidationErrors
];

// User login validation rules
const validateUserLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Password update validation rules
const validatePasswordUpdate = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8, max: 16 })
    .withMessage('New password must be between 8 and 16 characters long')
    .matches(/^(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one uppercase letter and one special character'),
  handleValidationErrors
];

// Store creation validation rules
const validateStoreCreation = [
  body('name')
    .isLength({ min: 1, max: 255 })
    .withMessage('Store name must be between 1 and 255 characters')
    .trim(),
  body('address')
    .optional()
    .isLength({ max: 400 })
    .withMessage('Address must not exceed 400 characters')
    .trim(),
  body('owner_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Owner ID must be a positive integer'),
  handleValidationErrors
];

// Rating submission validation rules
const validateRatingSubmission = [
  body('rating_value')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  handleValidationErrors
];

// User creation by admin validation rules
const validateUserCreationByAdmin = [
  body('name')
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters')
    .trim(),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be between 8 and 16 characters long')
    .matches(/^(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter and one special character'),
  body('address')
    .optional()
    .isLength({ max: 400 })
    .withMessage('Address must not exceed 400 characters')
    .trim(),
  body('role')
    .isIn(['System Administrator', 'Normal User', 'Store Owner'])
    .withMessage('Role must be one of: System Administrator, Normal User, Store Owner'),
  handleValidationErrors
];

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validatePasswordUpdate,
  validateStoreCreation,
  validateRatingSubmission,
  validateUserCreationByAdmin,
  handleValidationErrors
};
