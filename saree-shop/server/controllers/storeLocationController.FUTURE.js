// ⚠️ FUTURE FEATURE - PHASE 2: Store Location Management
// Handles store/warehouse locations, inventory tracking by location
// Status: DISABLED (awaiting Phase 2 implementation)
// Related files:
//   - models/StoreLocation.FUTURE.js
//   - routes/storeLocationRoutes.FUTURE.js
// Implementation notes: Currently not used

// Saree Controller
// Handles saree product CRUD operations with authorization checks
// Admin only: Create, Update, Delete
// Public: View all, View single

import Saree from '../models/Property.js';
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
    const images = req.files
      ? req.files.map((file) => ({
          url: file.path,
          public_id: file.filename,
        }))
      : [];

    if (images.length > 10) {
      for (const image of images) {
        await deleteImageFromCloudinary(image.public_id);
      }
      return res.status(400).json({
        success: false,
        message: 'Maximum 10 images allowed per saree',
      });
    }

    // Create new saree
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
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          await deleteImageFromCloudinary(file.filename);
        } catch (deleteError) {
          console.error(`Failed to cleanup image: ${deleteError.message}`);
        }
      }
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Error creating saree',
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
