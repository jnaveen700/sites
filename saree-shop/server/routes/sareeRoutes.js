// Saree Routes
// Defines endpoints for saree product management with role-based access control

import express from 'express';
import {
  getSarees,
  getSareeById,
  createSaree,
  updateSaree,
  deleteSaree,
} from '../controllers/sareeController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import uploadMiddleware from '../middleware/uploadMiddleware.js';

const router = express.Router();

/**
 * ============================================================================
 * POST /api/sarees
 * Create new saree listing WITH images (ADMIN ONLY)
 * ============================================================================
 * 
 * COMPLETE UPLOAD FLOW CHAIN:
 * 
 * 1. ADMIN CLIENT → sends POST request
 *    Endpoint: http://localhost:5000/api/sarees
 *    Content-Type: multipart/form-data
 *    Body:
 *    - images: [multiple files selected from phone]
 *    - designName: "Red Silk Saree"
 *    - description: "Beautiful handmade saree"
 *    - retailPrice: 2500
 *    - wholesalePrice: 1800
 *    - material: "silk"
 *    - pattern: "embroidered"
 *    - color: "Red"
 *    - stock: 50
 * 
 * 2. authMiddleware
 *    - Checks: Is user logged in?
 *    - Reads JWT token from request headers
 *    - Verifies signature using JWT_SECRET
 *    - Attaches req.user = { id, email, role, ... }
 *    - If not logged in: returns 401 Unauthorized
 * 
 * 3. authorizeRoles('admin')
 *    - Checks: Is req.user.role === 'admin'?
 *    - If not admin: returns 403 Forbidden
 *    - If admin: passes to next middleware
 * 
 * 4. uploadMiddleware.array('images', 10)
 *    CRITICAL: Image upload & optimization happens here!
 *    
 *    a) Parses multipart/form-data request
 *       - Finds 'images' field with attached files
 *       - Extracts file streams from browser upload
 *    
 *    b) Validates each file:
 *       - File type: MIME type must be image/jpeg, image/png, image/webp
 *       - File size: Max 5MB per file
 *       - If invalid: fileFilter rejects, returns 400 error
 *    
 *    c) Streams to Cloudinary:
 *       - Uploads file bytes to Cloudinary API
 *       - Cloudinary folder: saree-products
 *       - Applied transformations automatically:
 *         * width: 1200 (resize if wider, but don't enlarge)
 *         * quality: auto (optimizes for 80% visual quality)
 *         * fetch_format: auto (WebP if browser supports, else JPEG)
 *       - Result: 8MB original → ~1.2MB optimized
 *    
 *    d) Returns file metadata:
 *       req.files = [
 *         {
 *           filename: 'saree-products/abc123xyz', // public_id
 *           path: 'https://res.cloudinary.com/.../saree-products/abc123xyz.jpg', // URL
 *           mimetype: 'image/jpeg',
 *           size: 1200000
 *         },
 *         ...more files
 *       ]
 * 
 * 5. createSaree controller
 *    a) Extracts form fields from req.body
 *    b) Extracts file metadata from req.files
 *    c) Maps files to images array:
 *       images = [
 *         { url: 'https://...', public_id: 'saree-products/abc123xyz' },
 *         ...
 *       ]
 *    d) Validates:
 *       - All required fields present
 *       - Prices > 0
 *       - Wholesale ≤ Retail
 *       - Images ≤ 10
 *    e) Creates MongoDB document:
 *       new Saree({ designName, description, images, ..., createdBy })
 *    f) Saves to database:
 *       await newSaree.save()
 *    g) Returns 201 with created saree object
 * 
 * 6. ERROR HANDLING
 *    If any step fails after Cloudinary upload:
 *    - Catch block runs
 *    - Loops through req.files
 *    - Calls deleteImageFromCloudinary(public_id) for each
 *    - Cloudinary removes images from saree-products folder
 *    - Returns 500 error to client
 *    - Admin can retry (no duplicate images)
 * 
 * ============================================================================
 * CLOUDINARY API CREDENTIALS (from .env):
 * ============================================================================
 * 
 * CLOUDINARY_CLOUD_NAME = "your_account_id"
 * CLOUDINARY_API_KEY = "api_key"
 * CLOUDINARY_API_SECRET = "api_secret" (server-side only!)
 * 
 * These are configured in config/cloudinary.js and used by multer-storage-cloudinary
 * 
 * ============================================================================
 * RESULT IN DATABASE:
 * ============================================================================
 * 
 * Saree document in MongoDB:
 * {
 *   _id: ObjectId(...),
 *   designName: "Red Silk Saree",
 *   description: "Beautiful handmade saree",
 *   retailPrice: 2500,
 *   wholesalePrice: 1800,
 *   material: "silk",
 *   pattern: "embroidered",
 *   color: "Red",
 *   stock: 50,
 *   images: [
 *     {
 *       url: "https://res.cloudinary.com/xyz/image/upload/w_1200,q_auto,f_auto/saree-products/abc123.jpg",
 *       public_id: "saree-products/abc123"
 *     },
 *     // ... more images
 *   ],
 *   createdBy: ObjectId(admin_user_id),
 *   createdAt: ISODate("2024-05-23T10:30:00.000Z"),
 *   updatedAt: ISODate("2024-05-23T10:30:00.000Z")
 * }
 * 
 * ============================================================================
 * REQUEST FORMAT (multipart/form-data):
 * ============================================================================
 * 
 * From admin dashboard AddSaree.jsx:
 * 
 * const formData = new FormData();
 * formData.append('images', imageFile1);
 * formData.append('images', imageFile2);
 * formData.append('images', imageFile3);
 * formData.append('designName', 'Red Silk Saree');
 * formData.append('description', 'Beautiful saree');
 * formData.append('retailPrice', '2500');
 * formData.append('wholesalePrice', '1800');
 * formData.append('material', 'silk');
 * formData.append('pattern', 'embroidered');
 * formData.append('color', 'Red');
 * formData.append('stock', '50');
 * 
 * fetch('http://localhost:5000/api/sarees', {
 *   method: 'POST',
 *   headers: {
 *     'Authorization': 'Bearer ' + token
 *   },
 *   body: formData  // multipart/form-data
 * })
 * 
 * ============================================================================
 * MOBILE-FRIENDLY BENEFITS:
 * ============================================================================
 * 
 * - Admin takes photo on iPhone/Android
 * - Photo is 12MP, ~8MB (high quality)
 * - Upload to server: 5MB limit acceptable
 * - Cloudinary optimization:
 *   • Resizes to 1200px width
 *   • Converts to WebP (smaller format)
 *   • Quality auto-optimized
 *   • Result: 1.2MB (85% smaller!)
 * - Stored on global CDN
 * - Customers download optimized version
 * - Fast delivery even on 4G networks
 * - Lower bandwidth costs for business
 * 
 * ============================================================================
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
