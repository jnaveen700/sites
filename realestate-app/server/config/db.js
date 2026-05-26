// Database Configuration
// This file handles MongoDB connection using Mongoose

import mongoose from 'mongoose';

/**
 * connectDB - Establishes connection to MongoDB Atlas
 * Reads MONGO_URI from environment variables
 * Logs success or failure messages
 */
const connectDB = async () => {
  try {
    // Mongoose 7+ doesn't need useNewUrlParser or useUnifiedTopology
    const conn = await mongoose.connect(process.env.MONGO_URI);
    return conn;
  } catch (error) {
    // Log connection error
    console.error(`✗ MongoDB Connection Error: ${error.message}`);
    
    // Exit process if connection fails (critical error)
    process.exit(1);
  }
};

export default connectDB;
