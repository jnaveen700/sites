import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';

// Get current directory path (needed for ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables FIRST - before any other modules that need them
const envPath = path.join(__dirname, '.env');
const envResult = dotenv.config({ path: envPath });
if (envResult.error) {
  console.error('[ERROR] Failed to load .env file:', envResult.error.message);
}

// NOW dynamically import modules that depend on environment variables
const connectDB = (await import('./config/db.js')).default;
const authRoutes = (await import('./routes/authRoutes.js')).default;
const propertyRoutes = (await import('./routes/sareeRoutes.js')).default;
const bookingRoutes = (await import('./routes/orderRoutes.js')).default;
const batchRoutes = (await import('./routes/batchRoutes.js')).default;

// Initialize Express app
const app = express();

// ============================================================================
// MIDDLEWARE CONFIGURATION
// ============================================================================

// Enable CORS (Cross-Origin Resource Sharing)
// Allows frontend to make requests to backend
const corsOptions = {
  origin: function (origin, callback) {
    // Allow Codespaces URLs, localhost, and any origin in development
    const allowedOrigins = [
      /\.app\.github\.dev$/, // GitHub Codespaces domains
      /^http:\/\/localhost/, // localhost
      /^http:\/\/127\.0\.0\.1/ // localhost IP
    ];

    if (!origin || allowedOrigins.some(pattern =>
      typeof pattern === 'string' ? origin === pattern : pattern.test(origin)
    )) {
      callback(null, true);
    } else if (process.env.NODE_ENV === 'development') {
      // Allow all origins in development
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Parse incoming JSON requests
app.use(express.json());

// Parse incoming form data (URL-encoded)
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================================================
// DATABASE CONNECTION
// ============================================================================

// Connect to MongoDB when server starts
connectDB();

// ============================================================================
// ROUTES
// ============================================================================

// Health Check Route - Simple endpoint to verify server is running
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Mount all routes
app.use('/api/auth', authRoutes);
app.use('/api/sarees', propertyRoutes);
app.use('/api/orders', bookingRoutes);
app.use('/api/batches', batchRoutes);

// TODO: Add employee routes
// app.use('/api/employees', employeeRoutes);

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 Not Found Handler - Catches requests to undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// Global Error Handler - Catches all errors from routes and middleware
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${new Date().toISOString()}`);
  console.error(`[ERROR] Route: ${req.method} ${req.path}`);
  console.error(`[ERROR] Full error object:`, err);
  console.error(`[ERROR] Message: ${err?.message || 'undefined'}`);
  console.error(`[ERROR] Code: ${err?.code || 'undefined'}`);
  console.error(`[ERROR] Stack:`, err?.stack || 'undefined');

  // Log the raw error type
  console.error(`[ERROR] Error type: ${typeof err}`);
  console.error(`[ERROR] Error constructor: ${err?.constructor?.name}`);

  // Multer error handling
  if (err?.code === 'LIMIT_FILE_SIZE') {
    console.error('[ERROR] Multer: File size limit exceeded');
    return res.status(413).json({
      success: false,
      message: 'File size too large (max 5MB per file)',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }

  if (err?.code === 'LIMIT_FILE_COUNT') {
    console.error('[ERROR] Multer: Too many files');
    return res.status(400).json({
      success: false,
      message: 'Too many files (max 50)',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }

  if (err?.code === 'INVALID_FILE_TYPE') {
    console.error('[ERROR] Multer: Invalid file type');
    return res.status(400).json({
      success: false,
      message: err.message || 'Invalid file type',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }

  if (err?.code === 'LIMIT_UNEXPECTED_FILE') {
    console.error('[ERROR] Multer: Unexpected file field');
    return res.status(400).json({
      success: false,
      message: 'Unexpected file upload field',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }

  // Generic error response
  res.status(err?.status || 500).json({
    success: false,
    message: err?.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? {
      code: err?.code,
      message: err?.message,
      stack: err?.stack,
    } : undefined,
  });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

// Start server on configured PORT
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  process.exit(1);
});

export default app;
