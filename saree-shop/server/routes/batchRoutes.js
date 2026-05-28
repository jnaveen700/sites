import express from 'express';
import {
  createBatch,
  getBatches,
  getBatchById,
  updateBatch,
  deleteBatch,
  archiveBatch,
} from '../controllers/batchController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import uploadMiddleware from '../middleware/uploadMiddleware.js';

const router = express.Router();

// ========================================================================
// POST /api/batches
// Create a new saree batch with multiple images
// Middleware chain: auth → role check → image upload (Cloudinary)
// ========================================================================
router.post(
  '/',
  authMiddleware,
  authorizeRoles('admin'),
  uploadMiddleware.array('images', 50), // Max 50 images per batch
  createBatch
);

// ========================================================================
// GET /api/batches
// Get all active batches (public endpoint)
// Query params:
//   - page: pagination page (default: 1)
//   - limit: items per page (default: 20)
//   - status: filter by status (default: 'active')
//   - category: filter by category (Wedding, Casual, Budget, Other)
//   - sortBy: sort order (newest, oldest, price-low, price-high)
// ========================================================================
router.get('/', getBatches);

// ========================================================================
// GET /api/batches/:id
// Get single batch by ID with all images
// ========================================================================
router.get('/:id', getBatchById);

// ========================================================================
// PUT /api/batches/:id
// Update batch metadata (title, category, description, price, status)
// Does NOT handle image updates (admin only)
// ========================================================================
router.put(
  '/:id',
  authMiddleware,
  authorizeRoles('admin'),
  uploadMiddleware.array('images', 50),
  updateBatch
);

// ========================================================================
// DELETE /api/batches/:id
// Delete batch and cleanup Cloudinary images (admin only)
// ========================================================================
router.delete(
  '/:id',
  authMiddleware,
  authorizeRoles('admin'),
  deleteBatch
);

// ========================================================================
// PATCH /api/batches/:id/archive
// Archive batch without deleting Cloudinary images (soft delete)
// ========================================================================
router.patch(
  '/:id/archive',
  authMiddleware,
  authorizeRoles('admin'),
  archiveBatch
);

export default router;
