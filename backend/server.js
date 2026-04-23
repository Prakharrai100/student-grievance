// ============================================================
// server.js - Main entry point for the Express application
// In production, also serves the React frontend (single deploy)
// ============================================================

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// ── Middleware ────────────────────────────────────────────────
// Parse incoming JSON requests
app.use(express.json());

// Enable Cross-Origin Resource Sharing (needed for local dev with Vite proxy)
app.use(cors({
  origin: true,
  credentials: true
}));

// ── API Routes ───────────────────────────────────────────────
// Auth routes: /api/register and /api/login
app.use('/api', require('./routes/auth'));

// Grievance routes (protected): full CRUD
app.use('/api/grievances', require('./routes/grievances'));

// ── Serve Frontend in Production ─────────────────────────────
// After building the React app (npm run build), the output goes to frontend/dist
// The backend serves those static files so everything runs on ONE URL
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React build folder
  app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));

  // SPA Fallback: Any route that is NOT an /api route serves index.html
  // This lets React Router handle client-side routing (/login, /dashboard, etc.)
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
  });
} else {
  // Dev-only health check (in production, / serves the React app)
  app.get('/', (req, res) => {
    res.json({ message: '🎓 Student Grievance API is running!' });
  });
}

// ── Global Error Handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// ── Start Server ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
});
