// Saree Routes
// Defines endpoints for saree product management with role-based access control

import express from 'express';
import {
  getSarees,
  getSareeById,
  createSaree,
  updateSaree,
  deleteSaree,
} from '../controllers/propertyController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import uploadMiddleware from '../middleware/uploadMiddleware.js';

const router = express.Router();

/**
 * POST /api/sarees
 * Create new saree listing WITH images (ADMIN ONLY)
 * 
 * Middleware Chain:
 * 1. authMiddleware - Checks if user is logged in
 * 2. authorizeRoles('admin') - Checks if user is admin
 * 3. uploadMiddleware.array('images', 10) - Handles file uploads to Cloudinary
 * 4. createSaree - Creates the saree and stores image URLs
 * 
 * REQUEST FORMAT (multipart/form-data):
 * - Field: images (file upload) - MAX 10 FILES
 * - Field: designName (text)
 * - Field: description (text)
 * - Field: retailPrice (number)
 * - Field: wholesalePrice (number)
 * - Field: color (text)
 * - Field: material (text)
 * - Field: pattern (text)
 * - Field: stock (number)
 * - Field: minOrderQuantity (number, optional)
 * - Field: season (text, optional)
 */
router.post(
  '/',
  authMiddleware,
  authorizeRoles('admin'),
  uploadMiddleware.array('images', 10),
  createSaree
);

/**
 * PUT /api/sarees/:id
 * Update saree (ADMIN ONLY)
 * Can also add more images or remove existing ones
 * 
 * Middleware Chain:
 * 1. authMiddleware - Checks if logged in
 * 2. authorizeRoles('admin') - Checks if admin
 * 3. uploadMiddleware.array('images', 10) - Optional: upload new images
 * 4. updateSaree - Updates saree and manages images
 * 
 * REQUEST FORMAT:
 * - Optional Fields: designName, description, retailPrice, wholesalePrice, stock, status
 * - Optional Files: images (add more images)
 * - Optional Field: deleteImages (array of public_ids to remove)
 */
router.put(
  '/:id',
  authMiddleware,
  authorizeRoles('admin'),
  uploadMiddleware.array('images', 10),
  updateSaree
);

/**
 * GET /api/sarees
 * Retrieve all sarees (PUBLIC - no authentication required)
 * Query params: ?material=silk&pattern=embroidered&status=in-stock&page=1&limit=10&search=wedding
 */
router.get('/', getSarees);

/**
 * GET /api/sarees/:id
 * Retrieve single saree details (PUBLIC - no authentication required)
 * Includes all image URLs from Cloudinary
 */
router.get('/:id', getSareeById);

/**
 * DELETE /api/sarees/:id
 * Delete saree (ADMIN ONLY)
 * Automatically deletes ALL associated images from Cloudinary
 */
router.delete('/:id', authMiddleware, authorizeRoles('admin'), deleteSaree);

export default router;
