// Authentication Middleware
// ============================================================================
// AUTHENTICATION vs AUTHORIZATION:
// 
// Authentication = Who are you?
//   - Verifies identity by checking JWT token
//   - Confirms user has valid credentials
//   - Attaches user data to request
//
// Authorization = What are you allowed to do?
//   - Checks if authenticated user has permission for action
//   - Enforced by roleMiddleware (separate file)
//   - Based on user role (admin, employee, customer)
//
// This middleware handles AUTHENTICATION only.
// ============================================================================

import jwt from 'jsonwebtoken';

/**
 * authMiddleware - Verifies JWT token from request headers
 * Extracts user info from token and attaches to req.user
 * 
 * Middleware Chain Concept:
 * When Express processes a route, it runs middleware in sequence:
 * 
 * Route: router.post('/', authMiddleware, authorizeRoles('admin'), createProperty)
 *                       ↓                  ↓                      ↓
 *                    Step 1            Step 2                   Step 3
 * 
 * Step 1: authMiddleware - Checks if user is logged in
 * Step 2: authorizeRoles('admin') - Checks if user is admin
 * Step 3: createProperty - Controller function runs if all checks pass
 * 
 * If any middleware calls res.json() or next() is not called, chain stops.
 * 
 * Allows access only to authenticated users
 */
const authMiddleware = (req, res, next) => {
  try {
    // Extract token from Authorization header (format: "Bearer token")
    const token = req.headers.authorization?.split(' ')[1];

    // If no token provided, return 401 (unauthenticated)
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Please login first.',
      });
    }

    // Verify token using JWT_SECRET from environment
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded user data to request object
    // req.user will be available in controller and subsequent middleware
    req.user = {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email, // Include email for logging/auditing
    };

    // Pass control to next middleware/route handler
    next();
  } catch (error) {
    // Don't expose raw JWT error details to client in production
    // Possible errors: jwt expired, jwt malformed, invalid signature
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please login again.',
    });
  }
};

export default authMiddleware;
