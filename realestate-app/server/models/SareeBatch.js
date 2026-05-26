import mongoose from 'mongoose';

const SareBatchSchema = new mongoose.Schema(
  {
    // Required fields
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },

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
      required: [true, 'At least one image is required'],
      validate: {
        validator: function (arr) {
          return arr.length > 0 && arr.length <= 50;
        },
        message: 'Batch must have between 1 and 50 images',
      },
    },

    // Optional fields
    title: {
      type: String,
      trim: true,
      default: null,
    },

    category: {
      type: String,
      enum: {
        values: ['Wedding', 'Casual', 'Budget', 'Other'],
        message: 'Please select a valid category: Wedding, Casual, Budget, or Other',
      },
      default: 'Other',
    },

    description: {
      type: String,
      trim: true,
      default: null,
    },

    status: {
      type: String,
      enum: {
        values: ['active', 'archived'],
        message: 'Status must be either active or archived',
      },
      default: 'active',
    },

    // Metadata
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Update updatedAt before saving
SareBatchSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('SareeBatch', SareBatchSchema);
