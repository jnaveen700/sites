// Authentication Routes
// Defines endpoints for user login, registration, and authentication

import express from 'express';
import { body, validationResult } from 'express-validator';
import { registerUser, loginUser, logoutUser, getCurrentUser } from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Validation middleware - runs before controller
 * Returns 400 error if validation fails
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

/**
 * POST /api/auth/register
 * Register a new user account
 * Body: { name, email, phone, password, address }
 */
router.post(
  '/register',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 2 })
      .withMessage('Name must be at least 2 characters'),
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('phone')
      .trim()
      .notEmpty()
      .withMessage('Phone number is required')
      .isLength({ min: 10 })
      .withMessage('Phone number must be at least 10 digits'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
      .matches(/[A-Z]/)
      .withMessage('Password must contain at least one uppercase letter')
      .matches(/[0-9]/)
      .withMessage('Password must contain at least one number'),
    body('address')
      .optional()
      .trim(),
  ],
  handleValidationErrors,
  registerUser
);

/**
 * POST /api/auth/login
 * Login user and return JWT token
 * Body: { email, password }
 * Returns: { token, user }
 */
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],
  handleValidationErrors,
  loginUser
);

/**
 * POST /api/auth/logout
 * Logout user (frontend should delete token from localStorage)
 */
router.post('/logout', logoutUser);

/**
 * GET /api/auth/me
 * Get current authenticated user details
 * Requires: Valid JWT token in Authorization header
 */
router.get('/me', authMiddleware, getCurrentUser);

export default router;
