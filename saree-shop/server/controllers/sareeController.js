// Saree Controller
// Handles saree product CRUD operations with authorization checks
// Admin only: Create, Update, Delete
// Public: View all, View single

import Saree from '../models/Saree.js';
import { deleteImageFromCloudinary } from '../config/cloudinary.js';

/**
 * getSarees - Retrieves all sarees (public endpoint, no auth required)
 * Supports filtering, pagination, and search
 * GET /api/sarees
 * Query params: ?material=silk&pattern=embroidered&page=1&limit=10&search=wedding
 */
export const getSarees = async (req, res) => {
  try {
    const { material, pattern, status, page = 1, limit = 10, search } = req.query;

    // Build filter object dynamically
    const filter = {};
    if (material) filter.material = material;
    if (pattern) filter.pattern = pattern;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { designName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { color: { $regex: search, $options: 'i' } },
      ];
    }

    // Calculate pagination values
    const skip = (page - 1) * limit;

    // Fetch sarees with pagination
    const sarees = await Saree.find(filter)
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    // Get total count for pagination
    const total = await Saree.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: sarees.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: sarees,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching sarees',
    });
  }
};

/**
 * getSareeById - Retrieves a single saree by ID (public endpoint)
 * GET /api/sarees/:id
 */
export const getSareeById = async (req, res) => {
  try {
    const { id } = req.params;

    const saree = await Saree.findById(id);

    if (!saree) {
      return res.status(404).json({
        success: false,
        message: 'Saree not found',
      });
    }

    res.status(200).json({
      success: true,
      data: saree,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching saree',
    });
  }
};

/**
 * createSaree - Creates a new saree listing (admin only)
 * 
 * AUTHORIZATION: Only admins can create sarees
 * Middleware chain: authMiddleware → authorizeRoles('admin') → uploadMiddleware.array() → createSaree
 * 
 * POST /api/sarees
 * Body: { designName, description, retailPrice, wholesalePrice, color, material, pattern, stock }
 * Files: multipart/form-data with 'images' field (max 10 files)
 * 
 * ─────────────────────────────────────────────────────────────────────────
 * IMAGE HANDLING & CLOUDINARY INTEGRATION:
 * ─────────────────────────────────────────────────────────────────────────
 * 
 * 1. UPLOAD MIDDLEWARE PROCESSES IMAGES:
 *    - uploadMiddleware.array('images', 10) intercepts multipart request
 *    - Validates: file type (JPEG/PNG/WebP), size (<5MB)
 *    - Streams to Cloudinary (folder: saree-products)
 *    - Applies transformations: width: 1200, quality: auto, format: auto
 *    - Returns: req.files = [{ path: URL, filename: public_id }, ...]
 * 
 * 2. CONTROLLER PROCESSES UPLOADED FILES:
 *    - Maps req.files to { url: path, public_id: filename }
 *    - Validates count (max 10 images)
 *    - Stores in MongoDB: saree.images = [{ url, public_id }, ...]
 * 
 * 3. ERROR HANDLING - CLEANUP ON FAILURE:
 *    - If MongoDB save fails: catch block runs
 *    - Loops through req.files and calls deleteImageFromCloudinary()
 *    - Removes images from Cloudinary (prevents garbage accumulation)
 *    - Returns 500 error to frontend
 *    - Frontend can retry without creating duplicate images
 * 
 * 4. WHY STORE public_id:
 *    - public_id = "saree-products/xyz123" (unique identifier in Cloudinary)
 *    - Used later when editing/deleting saree
 *    - Allows server to delete specific image from Cloudinary
 *    - Without it: would have no way to remove images from CDN
 * 
 * ─────────────────────────────────────────────────────────────────────────
 * MOBILE-FRIENDLY OPTIMIZATION:
 * ─────────────────────────────────────────────────────────────────────────
 * 
 * Original image from phone: 12MP JPEG, ~8MB
 * After Cloudinary optimization:
 *   - Resized to 1200px width
 *   - Converted to WebP (if browser supports)
 *   - Quality auto-optimized (usually 80%)
 *   - Result: ~1.2MB (85% smaller!)
 * 
 * Benefits for 4G networks:
 *   - Faster upload (5MB limit)
 *   - Faster delivery to customer phones
 *   - Lower bandwidth costs
 * 
 * ─────────────────────────────────────────────────────────────────────────
 */
export const createSaree = async (req, res) => {
  try {
    const {
      designName,
      description,
      retailPrice,
      wholesalePrice,
      color,
      material,
      pattern,
      stock,
      minOrderQuantity,
      season,
    } = req.body;

    // Validate required fields
    if (
      !designName ||
      !description ||
      !retailPrice ||
      !wholesalePrice ||
      !color ||
      !material ||
      !pattern ||
      stock === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Please provide all required fields (designName, description, retailPrice, wholesalePrice, color, material, pattern, stock)',
      });
    }

    // Validate prices
    if (retailPrice <= 0 || wholesalePrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Prices must be greater than 0',
      });
    }

    if (wholesalePrice > retailPrice) {
      return res.status(400).json({
        success: false,
        message: 'Wholesale price cannot be higher than retail price',
      });
    }

    // Process uploaded images
    // req.files is populated by uploadMiddleware.array('images', 10)
    // Each file: { path: Cloudinary URL, filename: public_id, mimetype, size }
    const images = req.files
      ? req.files.map((file) => ({
          url: file.path, // Cloudinary URL (already optimized)
          public_id: file.filename, // For deleting image later
        }))
      : [];

    // Validate image count
    if (images.length > 10) {
      // This shouldn't happen (multer limits to 10), but safety check
      // If somehow >10 images uploaded: cleanup and reject
      for (const image of images) {
        try {
          await deleteImageFromCloudinary(image.public_id);
        } catch (deleteError) {
          console.error(`Cleanup error: ${deleteError.message}`);
        }
      }
      return res.status(400).json({
        success: false,
        message: 'Maximum 10 images allowed per saree',
        received: images.length,
      });
    }

    // Create new saree with images
    // Images array contains: [{ url: Cloudinary URL, public_id: for deletion }, ...]
    // 
    // MONGODB STRUCTURE EXAMPLE:
    // {
    //   _id: ObjectId(...),
    //   designName: "Red Silk Saree",
    //   description: "Beautiful red silk",
    //   images: [
    //     {
    //       url: "https://res.cloudinary.com/xxx/image/upload/w_1200,q_auto,f_auto/saree-products/abc123.jpg",
    //       public_id: "saree-products/abc123"
    //     },
    //     {
    //       url: "https://res.cloudinary.com/xxx/image/upload/w_1200,q_auto,f_auto/saree-products/def456.jpg",
    //       public_id: "saree-products/def456"
    //     }
    //   ],
    //   retailPrice: 2500,
    //   wholesalePrice: 1800,
    //   stock: 50,
    //   createdBy: ObjectId(admin_user_id),
    //   createdAt: 2024-05-23T10:30:00Z,
    //   updatedAt: 2024-05-23T10:30:00Z
    // }
    //
    // KEY POINTS:
    // - url: served to customers, already optimized by Cloudinary
    // - public_id: stored for DELETION when admin edits/deletes saree
    // - If image needs removal: admin clicks delete → controller calls deleteImageFromCloudinary(public_id)
    // - Cloudinary finds image by public_id and removes it
    // - MongoDB removes from images array
    //
    const newSaree = new Saree({
      designName,
      description,
      retailPrice: parseFloat(retailPrice),
      wholesalePrice: parseFloat(wholesalePrice),
      color,
      material,
      pattern,
      stock: parseInt(stock),
      minOrderQuantity: minOrderQuantity ? parseInt(minOrderQuantity) : 1,
      season: season || 'all-season',
      images,
      status: stock > 0 ? 'in-stock' : 'out-of-stock',
      createdBy: req.user.id,
    });

    await newSaree.save();

    res.status(201).json({
      success: true,
      message: 'Saree created successfully with images',
      data: newSaree,
    });
  } catch (error) {
    // ─────────────────────────────────────────────────────────────────────
    // ERROR HANDLING & CLEANUP
    // ─────────────────────────────────────────────────────────────────────
    //
    // If we reach here, something failed after images were uploaded to Cloudinary
    // We must clean up images to prevent orphaned files accumulating in Cloudinary
    //
    // Scenarios:
    // 1. MongoDB save failed (database connection issue)
    // 2. Validation failed (prices wrong, duplicate, etc.)
    // 3. Unexpected server error
    //
    // In all cases: delete images from Cloudinary using their public_ids
    // This ensures: no wasted storage, no hidden garbage, cost-effective
    // ─────────────────────────────────────────────────────────────────────
    
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          await deleteImageFromCloudinary(file.filename);
        } catch (deleteError) {
          console.error(`✗ Cleanup failed for ${file.filename}: ${deleteError.message}`);
          // Continue cleanup even if one deletion fails
        }
      }
    }

    // Return error response
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating saree with images',
      // In development, include error details. In production, generic message
      ...(process.env.NODE_ENV === 'development' && { error: error.stack }),
    });
  }
};

/**
 * updateSaree - Updates an existing saree (admin only)
 * 
 * AUTHORIZATION: Only admins can update sarees
 * 
 * PUT /api/sarees/:id
 * Body: { designName, description, retailPrice, wholesalePrice, stock, status }
 * Files: multipart/form-data with 'images' field to ADD more images
 */
export const updateSaree = async (req, res) => {
  try {
    const { id } = req.params;
    const { deleteImages } = req.body;
    const updates = req.body;

    delete updates.images;
    delete updates.deleteImages;

    // Find saree first
    const saree = await Saree.findById(id);
    if (!saree) {
      return res.status(404).json({
        success: false,
        message: 'Saree not found',
      });
    }

    // Handle image deletion
    if (deleteImages && Array.isArray(deleteImages)) {
      for (const publicId of deleteImages) {
        try {
          await deleteImageFromCloudinary(publicId);
          saree.images = saree.images.filter((img) => img.public_id !== publicId);
        } catch (deleteError) {
          console.error(`Error deleting image ${publicId}: ${deleteError.message}`);
        }
      }
    }

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => ({
        url: file.path,
        public_id: file.filename,
      }));

      if (saree.images.length + newImages.length > 10) {
        for (const file of req.files) {
          await deleteImageFromCloudinary(file.filename);
        }
        return res.status(400).json({
          success: false,
          message: `Cannot add ${newImages.length} images. Total would exceed 10 image limit.`,
        });
      }

      saree.images.push(...newImages);
    }

    // Update status based on stock if not explicitly set
    if (updates.stock !== undefined) {
      if (updates.stock <= 0) {
        updates.status = 'out-of-stock';
      } else if (updates.stock < 5) {
        updates.status = 'low-stock';
      } else {
        updates.status = 'in-stock';
      }
    }

    // Apply other updates
    Object.assign(saree, updates);

    await saree.save();

    res.status(200).json({
      success: true,
      message: 'Saree updated successfully',
      data: saree,
    });
  } catch (error) {
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          await deleteImageFromCloudinary(file.filename);
        } catch (deleteError) {
          console.error(`Cleanup failed for ${file.filename}: ${deleteError.message}`);
        }
      }
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Error updating saree',
    });
  }
};

/**
 * deleteSaree - Deletes a saree (admin only)
 * 
 * AUTHORIZATION: Only admins can delete sarees
 * 
 * DELETE /api/sarees/:id
 * 
 * IMPORTANT: Automatically deletes all associated images from Cloudinary
 */
export const deleteSaree = async (req, res) => {
  try {
    const { id } = req.params;

    const saree = await Saree.findByIdAndDelete(id);

    if (!saree) {
      return res.status(404).json({
        success: false,
        message: 'Saree not found',
      });
    }

    // Delete all associated images from Cloudinary
    if (saree.images && saree.images.length > 0) {
      const deletePromises = saree.images.map((image) =>
        deleteImageFromCloudinary(image.public_id).catch((err) => {
          console.error(`Failed to delete image ${image.public_id}: ${err.message}`);
        })
      );

      await Promise.all(deletePromises);
    }

    res.status(200).json({
      success: true,
      message: 'Saree and all associated images deleted successfully',
      data: saree,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting saree',
    });
  }
};
