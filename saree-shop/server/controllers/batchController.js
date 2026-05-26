import SareeBatch from '../models/SareeBatch.js';
import { deleteImageFromCloudinary } from '../config/cloudinary.js';

// CREATE BATCH - with image upload
export const createBatch = async (req, res) => {
  try {
    const { price, title, category, description } = req.body;
    const createdBy = req.user.id; // Use req.user.id (set by auth middleware)
    const numericPrice = Number(String(price).trim());

    // Validate price
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a positive number',
      });
    }

    // Check if images were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one image is required',
      });
    }

    // Check max images limit (should be enforced by middleware, but double-check)
    if (req.files.length > 50) {
      // Cleanup uploaded images
      for (const file of req.files) {
        await deleteImageFromCloudinary(file.filename);
      }
      return res.status(400).json({
        success: false,
        message: 'Maximum 50 images allowed per batch',
      });
    }

    // Map Cloudinary files to images array
    const images = req.files.map((file) => ({
      url: file.path,
      public_id: file.filename,
    }));

    // Create new batch
    const newBatch = new SareeBatch({
      price: numericPrice,
      title: title && title.trim() ? title.trim() : null,
      category: category || 'Other',
      description: description && description.trim() ? description.trim() : null,
      images,
      createdBy,
    });

    // Save to database
    await newBatch.save();

    res.status(201).json({
      success: true,
      message: 'Batch created successfully',
      batch: newBatch,
    });
  } catch (err) {
    console.error('[ERROR] Exception during batch creation:');
    console.error('[ERROR] Message:', err.message);
    console.error('[ERROR] Stack:', err.stack);
    console.error('[ERROR] Full error:', err);

    // Cleanup Cloudinary images on error
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          await deleteImageFromCloudinary(file.filename);
        } catch (cleanupErr) {
          console.error('Failed to cleanup image:', file.filename, cleanupErr);
        }
      }
    }

    res.status(500).json({
      success: false,
      message: 'Error creating batch',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
      details: process.env.NODE_ENV === 'development' ? {
        errorType: err.name,
        stack: err.stack,
      } : undefined,
    });
  }
};

// GET ALL BATCHES - public endpoint
export const getBatches = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'active', category, sortBy = 'newest' } = req.query;

    // Build filter
    const filter = { status };
    if (category) {
      filter.category = category;
    }

    // Build sort
    let sort = {};
    if (sortBy === 'newest') {
      sort = { createdAt: -1 };
    } else if (sortBy === 'oldest') {
      sort = { createdAt: 1 };
    } else if (sortBy === 'price-low') {
      sort = { price: 1 };
    } else if (sortBy === 'price-high') {
      sort = { price: -1 };
    }

    const skip = (page - 1) * limit;

    // Fetch batches
    const batches = await SareeBatch.find(filter)
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await SareeBatch.countDocuments(filter);
    const pages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      count: batches.length,
      total,
      pages,
      page: parseInt(page),
      batches,
    });
  } catch (err) {
    console.error('Error fetching batches:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching batches',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

// GET SINGLE BATCH - by ID
export const getBatchById = async (req, res) => {
  try {
    const { id } = req.params;

    const batch = await SareeBatch.findById(id).populate('createdBy', 'name email');

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found',
      });
    }

    res.status(200).json({
      success: true,
      batch,
    });
  } catch (err) {
    console.error('Error fetching batch:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching batch',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

// UPDATE BATCH - metadata only (no image changes)
export const updateBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, description, price, status } = req.body;
    const numericPrice = price !== undefined ? Number(String(price).trim()) : undefined;

    // Find batch
    const batch = await SareeBatch.findById(id);
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found',
      });
    }

    // Update only provided fields
    if (title !== undefined) batch.title = title && title.trim() ? title.trim() : null;
    if (category !== undefined) batch.category = category || 'Other';
    if (description !== undefined) batch.description = description && description.trim() ? description.trim() : null;
    if (price !== undefined) {
      if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Price must be a positive number',
        });
      }

      batch.price = numericPrice;
    }
    if (status !== undefined) batch.status = status;

    // Save
    await batch.save();

    res.status(200).json({
      success: true,
      message: 'Batch updated successfully',
      batch,
    });
  } catch (err) {
    console.error('Error updating batch:', err);
    res.status(500).json({
      success: false,
      message: 'Error updating batch',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

// DELETE BATCH - with Cloudinary cleanup
export const deleteBatch = async (req, res) => {
  try {
    const { id } = req.params;

    // Find batch
    const batch = await SareeBatch.findById(id);
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found',
      });
    }

    // Delete images from Cloudinary
    const deleteErrors = [];
    for (const image of batch.images) {
      try {
        await deleteImageFromCloudinary(image.public_id);
      } catch (err) {
        console.error('Failed to delete image from Cloudinary:', image.public_id);
        deleteErrors.push(image.public_id);
      }
    }

    // Delete batch from database
    await SareeBatch.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Batch deleted successfully',
      cloudinaryErrorCount: deleteErrors.length,
      cloudinaryErrors: deleteErrors.length > 0 ? deleteErrors : undefined,
    });
  } catch (err) {
    console.error('Error deleting batch:', err);
    res.status(500).json({
      success: false,
      message: 'Error deleting batch',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

// ARCHIVE BATCH - soft delete without Cloudinary cleanup
export const archiveBatch = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and update
    const batch = await SareeBatch.findByIdAndUpdate(
      id,
      { status: 'archived' },
      { new: true }
    );

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Batch archived successfully',
      batch,
    });
  } catch (err) {
    console.error('Error archiving batch:', err);
    res.status(500).json({
      success: false,
      message: 'Error archiving batch',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};
