// Authentication Controller
// Handles user registration, login, and token generation

import User from '../models/User.js';
import jwt from 'jsonwebtoken';

/**
 * generateToken - Creates JWT token for authenticated users
 * @param {string} userId - MongoDB user ID
 * @param {string} role - User role (customer, employee, admin)
 * @param {string} email - User email
 * @returns {string} JWT token
 */
const generateToken = (userId, role, email) => {
  return jwt.sign(
    { id: userId, role, email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

/**
 * registerUser - Creates a new user account
 * POST /api/auth/register
 * Body: { name, email, phone, password, address }
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, address } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email is already registered. Please login instead.',
      });
    }

    // Create new user
    const newUser = new User({
      name,
      email,
      phone,
      password,
      address: address || '',
      role: 'customer', // New users are always customers by default
    });

    // Save user (password hashing happens automatically in pre-save hook)
    await newUser.save();

    // Generate JWT token
    const token = generateToken(newUser._id, newUser.role, newUser.email);

    // Return success response with user data (excluding password)
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error during registration',
    });
  }
};

/**
 * loginUser - Authenticates user and returns JWT token
 * POST /api/auth/login
 * Body: { email, password }
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Find user by email and explicitly select password field
    // (password is normally hidden due to select: false in schema)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    // Compare provided password with hashed password in database
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate JWT token
    const token = generateToken(user._id, user.role, user.email);

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        department: user.department || null,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
    });
  }
};

/**
 * logoutUser - Invalidates user session
 * POST /api/auth/logout
 * Note: JWT logout is typically handled on frontend by deleting token
 * This endpoint exists for consistency and can be used for token blacklisting later
 */
export const logoutUser = (req, res) => {
  try {
    // In a real app, you might:
    // 1. Add token to a blacklist (Redis, MongoDB)
    // 2. Clear cookies
    // 3. Invalidate server-side sessions
    
    // For now, we just return success
    // Frontend removes token from localStorage
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error during logout',
    });
  }
};

/**
 * getCurrentUser - Returns authenticated user details
 * GET /api/auth/me
 * Requires: Valid JWT token in Authorization header
 */
export const getCurrentUser = async (req, res) => {
  try {
    // req.user is populated by authMiddleware
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        department: user.department || null,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user details',
    });
  }
};
