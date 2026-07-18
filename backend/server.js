/**
 * CIE-2 Activity Tracking, Evaluation and Performance Management System
 * File: backend/server.js
 * Purpose: Central server entry point. Serves static frontend files and mounts API endpoints.
 */

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./auth/routes');
const studentRoutes = require('./student/routes');
const authMiddleware = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Global Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

// 2. Serve Static Frontend Files
// Maps root request to login view
app.use('/frontend', express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
    res.redirect('/frontend/auth/login.html');
});

// 3. Mount Backend API Endpoints
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/student', authMiddleware, studentRoutes);

// 4. Global Error Handler
app.use((err, req, res, next) => {
    console.error('Express Error handler caught:', err.stack);
    res.status(500).json({
        success: false,
        error: 'Internal Server Error'
    });
});

// 5. Start Server Listener
app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(` CIE-2 ERP Server Running on Port: ${PORT}`);
    console.log(` Local URL: http://localhost:${PORT}`);
    console.log(` Login Page: http://localhost:${PORT}/frontend/auth/login.html`);
    console.log(`=========================================`);
});
