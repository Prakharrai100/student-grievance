// ============================================================
// server.js - Main entry point for the Express application
// Can optionally serve the React frontend when hosted together
// ============================================================

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Parse incoming JSON requests
app.use(express.json());

// Enable Cross-Origin Resource Sharing (needed for separate frontend service)
app.use(cors({
  origin: true,
  credentials: true
}));

// Auth routes: /api/register and /api/login
app.use('/api', require('./routes/auth'));

// Grievance routes (protected): full CRUD
app.use('/api/grievances', require('./routes/grievances'));

// Optional frontend static serving for single-service deployment only
if (process.env.NODE_ENV === 'production' && process.env.SERVE_FRONTEND === 'true') {
  const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist');
  const frontendIndexPath = path.join(frontendDistPath, 'index.html');
  const hasFrontendBuild = fs.existsSync(frontendIndexPath);

  if (hasFrontendBuild) {
    app.use(express.static(frontendDistPath));

    // SPA fallback handled by React Router
    app.get('*', (req, res) => {
      res.sendFile(frontendIndexPath);
    });
  } else {
    console.warn('Frontend build not found at frontend/dist. Set SERVE_FRONTEND=false for API-only deployment.');
  }
}

// API health check route
app.get('/', (req, res) => {
  res.json({ message: 'Student Grievance API is running!' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
