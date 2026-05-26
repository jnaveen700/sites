// Inquiry Routes
// Endpoints for "Interested" inquiry management
// Public: submit inquiry (no auth required)
// Admin: view, update, delete inquiries

import express from 'express';
import {
  submitInquiry,
  getInquiries,
  getInquiryById,
  updateInquiry,
  deleteInquiry,
  getInquiryStats,
} from '../controllers/inquiryController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

/**
 * POST /api/inquiries
 * Submit "Interested" inquiry - PUBLIC endpoint
 * No authentication required
 * 
 * Body: {
 *   name: string (required),
 *   phone: string (required),
 *   email: string (optional),
 *   message: string (optional),
 *   productType: "saree" | "batch",
 *   productId: ObjectId (optional),
 *   source: "website" | "whatsapp" | "direct"
 * }
 * 
 * Returns: { success: true, inquiryId: ... }
 */
router.post('/', submitInquiry);

/**
 * GET /api/inquiries
 * View all inquiries - ADMIN ONLY
 * Query: ?status=new&page=1&limit=20&search=name
 */
router.get(
  '/',
  authMiddleware,
  authorizeRoles('admin'),
  getInquiries
);

/**
 * GET /api/inquiries/stats/dashboard
 * Get inquiry analytics/stats - ADMIN ONLY
 * Returns: total count, by status breakdown, conversion rate
 * 
 * NOTE: Must come BEFORE /:id route to avoid conflict
 */
router.get(
  '/stats/dashboard',
  authMiddleware,
  authorizeRoles('admin'),
  getInquiryStats
);

/**
 * GET /api/inquiries/:id
 * View single inquiry - ADMIN ONLY
 */
router.get(
  '/:id',
  authMiddleware,
  authorizeRoles('admin'),
  getInquiryById
);

/**
 * PUT /api/inquiries/:id
 * Update inquiry (status, notes, etc) - ADMIN ONLY
 * 
 * Body: {
 *   status: "new" | "contacted" | "interested" | "converted" | "archived",
 *   notes: string,
 *   contactedAt: Date (optional),
 *   convertedAt: Date (optional)
 * }
 */
router.put(
  '/:id',
  authMiddleware,
  authorizeRoles('admin'),
  updateInquiry
);

/**
 * DELETE /api/inquiries/:id
 * Delete inquiry - ADMIN ONLY
 */
router.delete(
  '/:id',
  authMiddleware,
  authorizeRoles('admin'),
  deleteInquiry
);

export default router;
