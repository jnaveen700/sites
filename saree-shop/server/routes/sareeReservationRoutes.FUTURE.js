// ⚠️ FUTURE FEATURE - PHASE 2: Saree Reservation Routes
// API endpoints for customer saree reservations/bookings
// Status: DISABLED (awaiting Phase 2 implementation)
// To enable: Rename to sareeReservationRoutes.js and uncomment in server.js
// Base path will be: /api/reservations

// Order Routes
// Defines endpoints for wholesale saree orders with role-based access control

import express from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
} from '../controllers/bookingController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

/**
 * Route Protection Strategy:
 * 
 * All order routes require authentication (authMiddleware)
 * because orders are personal user data with sensitive information
 * 
 * Additional role checks are applied based on the operation:
 * - Create: Any authenticated user (typically wholesale customers)
 * - View Own: Any authenticated user (filtered in controller)
 * - View All: Employee or Admin (authorizeRoles)
 * - Update Status: Employee or Admin (authorizeRoles)
 * - Cancel: Any authenticated user (controller validates ownership)
 */

/**
 * GET /api/orders
 * Retrieve orders (AUTHENTICATED USERS ONLY)
 * 
 * Access Control (done in controller):
 * - Customers see only their own orders
 * - Employees/Admins see all orders
 * 
 * Middleware: authMiddleware
 * 
 * Query params: ?status=confirmed&paymentStatus=paid&page=1&limit=10
 */
router.get('/', authMiddleware, getOrders);

/**
 * GET /api/orders/:id
 * Retrieve single order details (AUTHENTICATED USERS ONLY)
 * 
 * Access Control (verified in controller):
 * - Customers can only view their own orders
 * - Employees/Admins can view any order
 * 
 * Middleware: authMiddleware
 */
router.get('/:id', authMiddleware, getOrderById);

/**
 * POST /api/orders
 * Create new order (AUTHENTICATED USERS - Wholesale Customers)
 * 
 * Typically used by wholesale customers to place bulk orders.
 * 
 * Middleware Chain:
 * authMiddleware → createOrder
 * 
 * Body: {
 *   items: [{saree: id, quantity: number}, ...],
 *   shippingAddress: string,
 *   paymentMethod: 'credit-card' | 'bank-transfer' | 'cheque' | 'cash',
 *   discount: number (optional),
 *   notes: string (optional)
 * }
 */
router.post('/', authMiddleware, createOrder);

/**
 * PUT /api/orders/:id/status
 * Update order status (EMPLOYEE OR ADMIN ONLY)
 * 
 * Only employees and admins can update order status and payment information.
 * 
 * Middleware Chain:
 * 1. authMiddleware - Checks if logged in
 * 2. authorizeRoles('employee', 'admin') - Checks if employee or admin
 * 3. updateOrderStatus - Updates the order
 * 
 * Body: {
 *   status: 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
 *   paymentStatus: 'pending' | 'partial' | 'paid' | 'overdue',
 *   deliveryDate: date (optional),
 *   assignedEmployee: id (optional)
 * }
 */
router.put('/:id/status', authMiddleware, authorizeRoles('employee', 'admin'), updateOrderStatus);

/**
 * DELETE /api/orders/:id
 * Cancel/delete an order (AUTHENTICATED USERS)
 * 
 * Restores stock for all items when order is cancelled.
 * 
 * Access Control (verified in controller):
 * - Customers can only cancel their own pending/confirmed orders
 * - Employees/Admins can cancel orders (with restrictions for shipped/delivered)
 * 
 * Middleware: authMiddleware
 */
router.delete('/:id', authMiddleware, cancelOrder);

export default router;
