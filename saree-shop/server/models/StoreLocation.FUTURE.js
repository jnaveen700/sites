// ⚠️ FUTURE FEATURE - PHASE 2
// Store Location Management Model
// Purpose: Track store/warehouse locations, inventory by location, delivery zones
// Status: DISABLED in production (rename .FUTURE to activate)
// How to enable: Rename to StoreLocation.js and uncomment in server.js
// TODO for future agents: 
//   - Update imports in controllers/storeLocationController.FUTURE.js
//   - Add routes to server.js: app.use('/api/stores', storeLocationRoutes)
//   - Implement location-based inventory tracking
//   - Add delivery zone management

import mongoose from 'mongoose';

const sareeSchema = new mongoose.Schema(
  {
    designName: {
      type: String,
      required: [true, 'Design name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    retailPrice: {
      type: Number,
      required: [true, 'Retail price is required'],
      min: [0, 'Price must be positive'],
    },
    wholesalePrice: {
      type: Number,
      required: [true, 'Wholesale price is required'],
      min: [0, 'Price must be positive'],
    },
    minOrderQuantity: {
      type: Number,
      default: 1,
      min: [1, 'Minimum order must be at least 1'],
    },
    color: {
      type: String,
      required: [true, 'Color is required'],
      trim: true,
    },
    material: {
      type: String,
      enum: ['silk', 'cotton', 'linen', 'georgette', 'chiffon', 'dupioni', 'mixed'],
      required: [true, 'Material is required'],
    },
    pattern: {
      type: String,
      enum: ['plain', 'striped', 'checked', 'printed', 'embroidered', 'woven'],
      required: [true, 'Pattern is required'],
    },
    length: {
      type: String,
      default: '6 yards',
    },
    // ─── Image URLs from Cloudinary ──────────────────────────────────────
    images: {
      type: [
        {
          url: {
            type: String,
            required: true,
          },
          public_id: {
            type: String,
            required: true,
          },
        },
      ],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length <= 10;
        },
        message: 'Cannot have more than 10 images per saree',
      },
    },
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    status: {
      type: String,
      enum: ['in-stock', 'low-stock', 'out-of-stock', 'discontinued'],
      default: 'in-stock',
    },
    season: {
      type: String,
      enum: ['spring', 'summer', 'monsoon', 'autumn', 'winter', 'all-season'],
      default: 'all-season',
    },
    // Track who created/modified the product
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Saree', sareeSchema);
