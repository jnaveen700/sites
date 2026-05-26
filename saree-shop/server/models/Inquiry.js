// Inquiry Model - Schema for "Interested" leads
// Lightweight system to capture customer interest without requiring login
// Stores: name, phone, message, and optional product reference

import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    message: {
      type: String,
      trim: true,
    },
    // Reference to saree or batch the user is interested in
    productType: {
      type: String,
      enum: ['saree', 'batch'],
      default: 'saree',
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'productType',
    },
    // How did they find us?
    source: {
      type: String,
      enum: ['website', 'whatsapp', 'direct', 'social', 'referral', 'other'],
      default: 'website',
    },
    // Admin notes
    notes: String,
    // Status tracking
    status: {
      type: String,
      enum: ['new', 'contacted', 'interested', 'converted', 'archived'],
      default: 'new',
    },
    // When admin contacted them
    contactedAt: Date,
    // When they converted to order/customer
    convertedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Index for faster searches
inquirySchema.index({ phone: 1 });
inquirySchema.index({ email: 1 });
inquirySchema.index({ createdAt: -1 });
inquirySchema.index({ status: 1 });

const Inquiry = mongoose.model('Inquiry', inquirySchema);

export default Inquiry;
