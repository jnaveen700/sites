// User Model - Schema for users (wholesale customers, employees, admins)
// Stores user account information with password hashing

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Never return password in queries by default
    },
    address: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['customer', 'employee', 'admin'],
      default: 'customer',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // ─── Customer-specific fields (wholesale buyers) ──────────────────────
    businessName: {
      type: String,
      sparse: true, // Only for wholesale customers
    },
    gstNumber: {
      type: String,
      sparse: true,
    },
    creditLimit: {
      type: Number,
      default: 0,
      sparse: true,
    },
    registrationDate: {
      type: Date,
      sparse: true,
    },
    // ─── Employee-specific fields (only if role is 'employee' or 'admin') ──
    department: {
      type: String,
      enum: ['sales', 'inventory', 'support', 'management'],
      sparse: true, // Not required for customers
    },
    employeeId: {
      type: String,
      sparse: true, // Allows multiple null values
    },
    joinDate: {
      type: Date,
      sparse: true,
    },
  },
  { timestamps: true }
);

// ─── Hash password before saving to DB ──────────────────────────────────
// Runs automatically on create AND on password update
// Only hashes if password field was actually modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  // Hash with cost factor 12 (higher = more secure but slower)
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ─── Instance method to compare passwords on login ─────────────────────
// Usage: const isMatch = await user.comparePassword(enteredPassword)
// Returns true if password matches, false otherwise
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
