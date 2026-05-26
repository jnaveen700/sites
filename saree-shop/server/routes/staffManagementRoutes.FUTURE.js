// ⚠️ FUTURE FEATURE - PHASE 3: Staff Management Routes
// API endpoints for employee/staff management and admin controls
// Status: DISABLED (awaiting Phase 3 implementation)
// To enable: Rename to staffManagementRoutes.js and uncomment in server.js
// Base path will be: /api/staff

// Employee Routes
// Defines endpoints for employee management and dashboard

import express from 'express';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getDashboardStats,
} from '../controllers/employeeController.js';

const router = express.Router();

/**
 * GET /api/employees
 * Retrieve all employees (admin only)
 */
router.get('/', getEmployees);

/**
 * GET /api/employees/:id
 * Retrieve single employee details
 */
router.get('/:id', getEmployeeById);

/**
 * POST /api/employees
 * Create new employee (admin only)
 * Body: { user, employeeId, department }
 */
router.post('/', createEmployee);

/**
 * PUT /api/employees/:id
 * Update employee information (admin only)
 * Body: { department, isActive }
 */
router.put('/:id', updateEmployee);

/**
 * DELETE /api/employees/:id
 * Delete/deactivate employee (admin only)
 */
router.delete('/:id', deleteEmployee);

/**
 * GET /api/employees/dashboard/stats
 * Get dashboard statistics
 * Returns: { totalBookings, pendingBookings, completedBookings, etc. }
 */
router.get('/dashboard/stats', getDashboardStats);

export default router;
