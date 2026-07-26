const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error.middleware');

// Load environment variables from .env
dotenv.config({ path: path.join(__dirname, '.env') });

// Fallback to parent directory env if not found in server
if (!process.env.MONGO_URI) {
  dotenv.config({ path: path.join(__dirname, '../.env') });
}

// Connect to Database
connectDB();

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
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Set up public folder for static upload fallbacks
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Mount routers
app.use('/api/auth', auth);
app.use('/api/properties', properties);
app.use('/api/agents', agents);
app.use('/api/inquiries', inquiries);
app.use('/api/favorites', favorites);

// Base route checker
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Estate API Service' });
});

// Mount error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
