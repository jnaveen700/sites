// Role-Based Authorization Middleware
// ============================================================================
// AUTHORIZATION MIDDLEWARE:
//
// This middleware enforces AUTHORIZATION (permissions).
// It checks if the authenticated user has the required role to access a resource.
//
// Usage:
// - authorizeRoles('admin') - Only admins allowed
// - authorizeRoles('admin', 'employee') - Admins or employees allowed
// - Public routes don't need this middleware at all
//
// Status Codes:
// - 401 Unauthorized = Not logged in (handled by authMiddleware)
// - 403 Forbidden = Logged in but doesn't have permission (this middleware)
// ============================================================================

/**
 * authorizeRoles - Factory function to create role-based authorization middleware
 * Returns a middleware function that checks user role
 * 
 * Factory Pattern Explanation:
 * This function RETURNS another function (middleware).
 * This allows us to pass parameters while keeping Express middleware signature.
 * 
 * @param {...string} allowedRoles - User roles that are allowed (e.g., 'admin', 'employee')
 * @returns {function} Middleware function that checks user role
 *
 * Examples:
 * router.post('/', authMiddleware, authorizeRoles('admin'), createProperty);
 * router.get('/', authorizeRoles('employee', 'admin'), getBookings);
 * router.delete('/:id', authMiddleware, authorizeRoles('admin'), deleteProperty);
 */
export const authorizeRoles = (...allowedRoles) => {
  // This is the actual middleware function that Express will execute
  return (req, res, next) => {
    // Check if user is attached to request
    // Should be present if authMiddleware ran before this
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated. Please login.',
      });
    }

    // Check if user's role is in the allowed roles list
    // allowedRoles is an array from the function parameters
    if (!allowedRoles.includes(req.user.role)) {
      // Return 403 Forbidden if user doesn't have required role
      return res.status(403).json({
        success: false,
        message: `Access denied. This resource is only available to: ${allowedRoles.join(', ')}`,
        userRole: req.user.role,
      });
    }

    // User has required role, proceed to next middleware/controller
    next();
  };
};

/**
 * Middleware Chaining Example:
 * 
 * When Express sees this route:
 * router.post('/', authMiddleware, authorizeRoles('admin'), createProperty)
 *
 * It executes:
 * 1. authMiddleware(req, res, next1) - Checks if logged in
 * 2. authorizeRoles('admin')(req, res, next2) - Checks if admin
 * 3. createProperty(req, res) - Controller function
 * 
 * Each middleware must call next() to continue the chain.
 * If any middleware sends a response, the chain stops.
 * 
 * Execution Flow:
 * Request → authMiddleware → authorizeRoles → Controller → Response
 * 
 * If auth fails: Response returned immediately (chain stops)
 * If auth passes but role fails: Response returned (chain stops)
 * If both pass: Controller runs and returns response
 */

export default authorizeRoles;
