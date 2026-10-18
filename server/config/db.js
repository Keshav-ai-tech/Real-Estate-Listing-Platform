const mongoose = require('mongoose');

const DEFAULT_MONGO_URI = 'mongodb+srv://alanbaker958_db_user:uTAyqFJkr5AEN8rW@cluster0.1k1bnti.mongodb.net/estate-platform?retryWrites=true&w=majority&appName=Cluster0';

let isConnecting = null;

const connectDB = async () => {
  // If already connected, return existing connection
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // If currently connecting, await existing promise
  if (isConnecting) {
    return isConnecting;
  }

  const uri = process.env.MONGO_URI || DEFAULT_MONGO_URI;

  try {
    isConnecting = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000
    });
    const conn = await isConnecting;
    isConnecting = null;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    isConnecting = null;
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // Do not call process.exit(1) in serverless environments (Vercel)
    throw error;
  }
};

module.exports = connectDB;

