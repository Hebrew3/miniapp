const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/database');
const bookRoutes = require('./routes/books');
const path = require('path');
const fs = require('fs');

// Load environment variables
const envPath = path.join(__dirname, 'config.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/books', bookRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Book App Backend is running',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Book App API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      books: {
        getAll: 'GET /api/books',
        getOne: 'GET /api/books/:id',
        create: 'POST /api/books',
        update: 'PUT /api/books/:id',
        delete: 'DELETE /api/books/:id',
        search: 'GET /api/books/search/:query'
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Server is running!');
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`📚 API: http://localhost:${PORT}/api/books`);
  console.log(`💚 Health: http://localhost:${PORT}/health`);
  console.log('📖 Available endpoints:');
  console.log('  GET    /api/books - Get all books');
  console.log('  GET    /api/books/:id - Get a specific book');
  console.log('  POST   /api/books - Add a new book');
  console.log('  PUT    /api/books/:id - Update a book');
  console.log('  DELETE /api/books/:id - Delete a book');
  console.log('  GET    /api/books/search/:query - Search books');
  console.log('  GET    /health - Health check');
});

module.exports = app; 