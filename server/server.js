const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error.middleware');

// Load environment variables from .env
dotenv.config({ path: path.join(__dirname, '.env') });
if (!process.env.MONGO_URI) {
  dotenv.config({ path: path.join(__dirname, '../.env') });
}

// Fallbacks for live deployment (Vercel) if not explicitly set in dashboard
process.env.JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_me';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
process.env.CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'cofhi8cg';
process.env.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || '476363533826275';
process.env.CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || 'xz548dzkh81DtSQ35VKA8fEQ2qs';

// Route files
const auth = require('./routes/auth.routes');
const properties = require('./routes/property.routes');
const agents = require('./routes/agent.routes');
const inquiries = require('./routes/inquiry.routes');
const favorites = require('./routes/favorite.routes');

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Dev logging middleware
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.use(morgan('dev'));
}

// Ensure Database is connected before serving any request (works for both standalone server & serverless)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB Middleware Error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Database connection failed. Please check MongoDB Atlas connection.'
    });
  }
});

// Set up public folder for static upload fallbacks
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Mount routers (supports both prefixed /api/* and direct /* on Vercel)
app.use(['/api/auth', '/auth'], auth);
app.use(['/api/properties', '/properties'], properties);
app.use(['/api/agents', '/agents'], agents);
app.use(['/api/inquiries', '/inquiries'], inquiries);
app.use(['/api/favorites', '/favorites'], favorites);

// Base route checker
app.get('/api', (req, res) => {
  res.json({ success: true, message: 'Welcome to the Estate API Service' });
});
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Welcome to the Estate API Service' });
});

// Mount error handler middleware
app.use(errorHandler);

// If run directly (node server.js), start listening on PORT
if (require.main === module) {
  const PORT = process.env.PORT || 5001;
  const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });

  process.on('unhandledRejection', (err, promise) => {
    console.error(`Unhandled Rejection Error: ${err.message}`);
    server.close(() => process.exit(1));
  });
}

module.exports = app;
