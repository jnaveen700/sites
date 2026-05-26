import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';

// Get current directory path (needed for ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables FIRST - before any other modules that need them
dotenv.config();

const REQUIRED_ENV_VARS = [
  'MONGO_URI',
  'JWT_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];

const missingEnvVars = REQUIRED_ENV_VARS.filter((name) => !process.env[name]);
if (missingEnvVars.length > 0) {
  console.warn(`[startup] Missing environment variables: ${missingEnvVars.join(', ')}`);
}

// NOW dynamically import modules that depend on environment variables
const connectDB = (await import('./config/db.js')).default;
const authRoutes = (await import('./routes/authRoutes.js')).default;
const sareeRoutes = (await import('./routes/sareeRoutes.js')).default;
const batchRoutes = (await import('./routes/batchRoutes.js')).default;
const inquiryRoutes = (await import('./routes/inquiryRoutes.js')).default;

// Initialize Express app
const app = express();

// ============================================================================
// MIDDLEWARE CONFIGURATION
// ============================================================================

// Enable CORS (Cross-Origin Resource Sharing)
// Allows the deployed frontend and local development server to call the API
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  process.env.ALLOWED_ORIGIN,
  /^https:\/\/[a-z0-9-]+\.vercel\.app$/i,
  /^https:\/\/[a-z0-9-]+\.netlify\.app$/i,
  /^http:\/\/localhost:5173$/i,
  /^http:\/\/127\.0\.0\.1:5173$/i,
  /^http:\/\/localhost:\d+$/i,
  /^http:\/\/127\.0\.0\.1:\d+$/i,
  /^https:\/\/[a-z0-9-]+\.github\.dev$/i,
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.some(pattern =>
      typeof pattern === 'string' ? origin === pattern : pattern.test(origin)
    )) {
      callback(null, true);
    } else if (process.env.NODE_ENV !== 'production') {
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
app.use('/api/sarees', sareeRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/interests', inquiryRoutes);

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

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log('[startup] Server started');
      console.log(`[startup] Running port ${PORT}`);
      console.log(`[startup] NODE_ENV=${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('[startup] Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('[runtime] Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('[runtime] Uncaught Exception:', err);
});

export default app;
