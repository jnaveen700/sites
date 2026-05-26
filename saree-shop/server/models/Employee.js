// Employee Model - Schema for employees
// Stores employee information and details

import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    employeeId: {
      type: String,
      unique: true,
      required: true,
    },
    department: {
      type: String,
      enum: ['sales', 'support', 'management'],
      default: 'sales',
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Employee', employeeSchema);
