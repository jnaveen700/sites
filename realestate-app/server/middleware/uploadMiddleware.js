// Upload Middleware with Multer and Cloudinary
// ============================================================================
// HOW MULTER WORKS:
//
// Multer is middleware for handling file uploads in Express.
// It processes multipart/form-data (the format browsers use for file uploads).
//
// Multer Storage Options:
// 1. disk storage - Files saved to server's filesystem (not scalable)
// 2. memory storage - Files kept in RAM (limited by memory)
// 3. Custom storage - Upload to cloud (Cloudinary) (BEST OPTION)
//
// UPLOAD FLOW:
// Client sends multipart request with files
//   ↓
// Multer intercepts the request
//   ↓
// Validates file size, type, count
//   ↓
// Streams file to Cloudinary storage
//   ↓
// Cloudinary returns public URL
//   ↓
// Multer attaches file info to req.files
//   ↓
// Controller receives file data with URLs
//   ↓
// Controller saves URLs to MongoDB
//
// WHY CLOUDINARY STORAGE OVER DISK:
// - Disk storage = files stay on one server (what if server crashes?)
// - Cloudinary = files on distributed global CDN (fast, reliable, scalable)
// - Cloudinary auto-optimizes images (resize, compress, format conversion)
// - Can access images from any server (stateless architecture)
// ============================================================================

import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

// ============================================================================
// CLOUDINARY STORAGE CONFIGURATION WITH AUTOMATIC IMAGE OPTIMIZATION
// ============================================================================
//
// IMAGE OPTIMIZATION SETTINGS:
// - width: 1200 - Maximum width for responsive images
// - crop: "limit" - Scales down but doesn't enlarge
// - quality: "auto" - Automatically optimized JPEG/WebP quality
// - fetch_format: "auto" - Serves WebP to browsers that support it, PNG/JPEG fallback
//
// BENEFITS:
// - Smaller file sizes (50-70% reduction)
// - Faster delivery on mobile networks (4G)
// - Automatic format selection (WebP vs JPEG)
// - Better user experience
// - Lower bandwidth costs
// ============================================================================

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: 'saree-products', // Folder in Cloudinary dashboard - organized by product type
    resource_type: 'auto', // Auto-detect file type (image, video, etc.)
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], // Allowed image formats
    // OPTIMIZATION TRANSFORMATIONS
    // Applied automatically to every upload
    width: 1200, // Max width for responsive images
    crop: 'limit', // Scale down but don't enlarge
    quality: 'auto', // Cloudinary auto-optimizes quality (usually 80%)
    fetch_format: 'auto', // Serve WebP if browser supports it, else PNG/JPEG
  },
});

// ============================================================================
// MULTER CONFIGURATION WITH ENHANCED ERROR HANDLING
// ============================================================================
//
// FILE VALIDATION:
// - Max file size: 5MB (prevents accidental large uploads)
// - Allowed types: JPEG, PNG, WebP only
// - Validates MIME type (prevents file spoofing)
// - Cloudinary streams directly from browser
//
// ERROR HANDLING:
// - Invalid file type → Returns 400 with error message
// - File too large → Returns 413 with size error
// - Cloudinary failure → Controller catches and cleans up
//
// MOBILE OPTIMIZATION:
// - 5MB limit suitable for 4G networks
// - Cloudinary CDN ensures fast delivery globally
// - Auto-compression on upload
// ============================================================================

const uploadMiddleware = multer({
  storage: cloudinaryStorage,
  
  // File size validation - 5MB max per file (mobile-friendly)
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB in bytes
  },

  // File type validation - only accept images
  fileFilter: (req, file, cb) => {
    // Allowed MIME types
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      // File rejected - invalid type
      const error = new Error(
        `Invalid file type: ${file.mimetype}. Only JPEG, PNG, and WebP are allowed.`
      );
      error.code = 'INVALID_FILE_TYPE';
      cb(error);
    }
  },
});

/**
 * ============================================================================
 * USAGE EXAMPLES & COMPLETE UPLOAD FLOW
 * ============================================================================
 * 
 * SINGLE FILE UPLOAD:
 * router.post('/upload', uploadMiddleware.single('image'), controller)
 * Expects: form-data with key 'image'
 * Result: req.file contains { 
 *   filename: 'public_id',  // Used to delete from Cloudinary later
 *   path: 'https://res.cloudinary.com/...', // Full Cloudinary URL
 *   size, mimetype, etc.
 * }
 * 
 * MULTIPLE FILES (max 10):
 * router.post('/upload', uploadMiddleware.array('images', 10), controller)
 * Expects: form-data with key 'images' (multiple file inputs)
 * Result: req.files is array of file objects
 * Usage: req.files.map(f => ({ url: f.path, public_id: f.filename }))
 * 
 * MIXED FIELDS (multiple + single):
 * const uploadMiddleware.fields([
 *   { name: 'images', maxCount: 10 },
 *   { name: 'thumbnail', maxCount: 1 }
 * ])
 * Access: req.files.images[0].path, req.files.thumbnail[0].path
 * 
 * ============================================================================
 * COMPLETE UPLOAD FLOW EXPLAINED
 * ============================================================================
 * 
 * MOBILE PHONE UPLOAD SCENARIO:
 * 
 * 1. USER SELECTS IMAGES (on phone)
 *    - Clicks file input
 *    - Selects 3 JPEG images (high quality)
 *    - Images are ~8MB each (total 24MB)
 * 
 * 2. FRONTEND VALIDATION
 *    - Checks file type (must be image/jpeg, image/png, or image/webp)
 *    - Checks file size (max 5MB per file)
 *    - If invalid: shows error message, doesn't upload
 *    - If valid: shows preview thumbnails
 *    - Creates FormData with {images: [3 files], ...otherFields}
 *    - POSTs to /api/sarees with multipart/form-data content-type
 * 
 * 3. BACKEND RECEIVES REQUEST
 *    - uploadMiddleware.array('images', 10) intercepts
 *    - fileFilter checks: MIME type, size
 *    - If invalid: multer returns 400 error
 *    - If valid: streams to Cloudinary
 * 
 * 4. CLOUDINARY PROCESSING
 *    - Receives image stream from browser
 *    - Applies optimization:
 *      • Width: 1200px (resize if wider)
 *      • Quality: auto (usually 80% JPEG/WebP)
 *      • Format: auto (WebP if modern browser, else JPEG)
 *      • Compression: applies lossless+lossy
 *    - Result: 8MB JPEG → ~1.2MB WebP (85% smaller!)
 *    - Stores in folder: saree-products
 *    - Returns: 
 *      • url: 'https://res.cloudinary.com/...' (optimized image)
 *      • public_id: 'saree-products/abc123' (for future deletion)
 * 
 * 5. BACKEND SAVES TO DATABASE
 *    - Controller receives req.files with Cloudinary URLs
 *    - Creates image objects: { url: f.path, public_id: f.filename }
 *    - Saves to MongoDB: db.sarees.images = [{ url, public_id }, ...]
 *    - If save fails: cleanup handler deletes from Cloudinary
 * 
 * 6. FRONTEND RECEIVES RESPONSE
 *    - Success: Shows "Added to Cart!" message
 *    - Error: Shows error message with details
 *    - Returns to manage page or home
 * 
 * 7. LATER - USER EDITS/DELETES PRODUCT
 *    - Admin clicks delete on an image
 *    - public_id is sent to DELETE /api/sarees/:id
 *    - Controller calls deleteImageFromCloudinary(public_id)
 *    - Cloudinary removes image from saree-products folder
 *    - MongoDB removes from images array
 * 
 * ============================================================================
 * ERROR SCENARIOS & HANDLING
 * ============================================================================
 * 
 * ERROR: File too large (>5MB)
 * - multer fileSize limit triggers
 * - Returns: { success: false, message: 'File too large...' }
 * - Frontend shows: "File size must be less than 5MB"
 * 
 * ERROR: Invalid file type (e.g., .pdf)
 * - fileFilter rejects MIME type
 * - Returns: 400 with "Only JPEG, PNG, WebP allowed"
 * - Frontend shows: error message
 * 
 * ERROR: Cloudinary upload fails (network issue)
 * - Multer/Cloudinary throws error
 * - Controller's catch block runs
 * - Cleanup: tries to delete any partial uploads
 * - Returns: 500 with "Upload failed, try again"
 * 
 * ERROR: MongoDB save fails after Cloudinary success
 * - Images already in Cloudinary
 * - Controller's catch block deletes each image using public_id
 * - Returns: 500 error to frontend
 * - User can retry (images won't accumulate garbage)
 * 
 * ============================================================================
 * CLOUDINARY URL STRUCTURE (after optimization)
 * ============================================================================
 * 
 * Direct upload URL:
 * https://res.cloudinary.com/{cloud_name}/image/upload/saree-products/xyz.jpg
 * 
 * With transformations applied:
 * https://res.cloudinary.com/{cloud_name}/image/upload/w_1200,q_auto,f_auto/saree-products/xyz.jpg
 * 
 * When you upload with multer-storage-cloudinary:
 * - Params.width, quality, fetch_format are applied automatically
 * - URL returned: already optimized version
 * - No need to add ?w=1200&q=auto&f=auto to URLs later
 * 
 * ============================================================================
 * DATABASE SCHEMA FOR IMAGES
 * ============================================================================
 * 
 * Saree model stores:
 * {
 *   ...otherFields,
 *   images: [
 *     {
 *       url: "https://res.cloudinary.com/.../saree-products/xyz.jpg",
 *       public_id: "saree-products/xyz"  // Must match Cloudinary public_id
 *     },
 *     ...more images
 *   ]
 * }
 * 
 * Why store both?
 * - url: display to customer (already optimized)
 * - public_id: delete from Cloudinary when saree is edited/deleted
 * 
 * ============================================================================
 */

export default uploadMiddleware;
