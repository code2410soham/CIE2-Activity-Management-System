/**
 * CIE-2 Activity Tracking, Evaluation and Performance Management System
 * File: backend/server.js
 * Purpose: Central server entry point. Serves static frontend files and mounts API endpoints.
 *          Validates environment and tests DB connection before starting.
 */

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./auth/routes');
const studentRoutes = require('./student/routes');
const authMiddleware = require('./middleware/auth');
const { pool } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── 0. Startup Environment Validation ──────────────────────────────────────

const REQUIRED_ENV = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_NAME', 'JWT_SECRET'];
const missingEnv = REQUIRED_ENV.filter(v => !process.env[v]);
if (missingEnv.length > 0) {
    console.error('\n🚨 STARTUP FAILED — Missing required environment variables:');
    missingEnv.forEach(v => console.error(`   ❌ ${v}`));
    console.error('\n   → Copy backend/.env.example to backend/.env and fill in your values.\n');
    process.exit(1);
}

// ─── 1. Global Middleware ────────────────────────────────────────────────────

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS: Allow requests from any localhost origin (works for all team members)
const allowedOrigins = [
    `http://localhost:${PORT}`,
    `http://127.0.0.1:${PORT}`,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    // Add additional custom origins from .env if needed
    process.env.CORS_ORIGIN
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g., same-origin, Postman, curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        // In development, allow all localhost origins dynamically
        if (process.env.NODE_ENV !== 'production' && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`CORS policy: Origin ${origin} not allowed.`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// ─── 2. Serve Static Frontend Files ─────────────────────────────────────────

app.use('/frontend', express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
    res.redirect('/frontend/auth/login.html');
});

// ─── 3. Health Check Endpoint ────────────────────────────────────────────────

app.get('/api/health', async (req, res) => {
    try {
        const conn = await pool.getConnection();
        await conn.ping();
        conn.release();
        res.json({ success: true, status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
    } catch (err) {
        res.status(503).json({ success: false, status: 'error', database: 'disconnected', error: err.message });
    }
});

// ─── 4. Mount Backend API Endpoints ─────────────────────────────────────────

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/student', authMiddleware, studentRoutes);

// ─── 5. Global Error Handler ─────────────────────────────────────────────────

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    if (err.message && err.message.startsWith('CORS policy')) {
        return res.status(403).json({ success: false, error: err.message });
    }
    console.error('Express Error handler caught:', err.stack);
    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
    });
});

// ─── 6. Start Server with DB Connection Test ─────────────────────────────────

async function startServer() {
    // Test DB connection before accepting requests
    try {
        const conn = await pool.getConnection();
        await conn.ping();
        conn.release();
        console.log('✅ Database connection verified.');
    } catch (err) {
        console.error('\n🚨 STARTUP FAILED — Cannot connect to MySQL database!');
        console.error(`   Error: ${err.message}`);
        if (err.code === 'ECONNREFUSED') {
            console.error('   → MySQL is not running. Start XAMPP and click Start on MySQL.');
        } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('   → Check DB_USER and DB_PASSWORD in your .env file.');
        } else if (err.code === 'ER_BAD_DB_ERROR') {
            console.error(`   → Database "${process.env.DB_NAME}" does not exist.`);
            console.error(`   → Run: mysql -u ${process.env.DB_USER} -p -e "CREATE DATABASE ${process.env.DB_NAME};"`);
            console.error(`   → Then: mysql -u ${process.env.DB_USER} -p ${process.env.DB_NAME} < database/schema.sql`);
        }
        console.error('');
        process.exit(1);
    }

    app.listen(PORT, () => {
        console.log(`=========================================`);
        console.log(` CIE-2 ERP Server Running on Port: ${PORT}`);
        console.log(` Local URL:    http://localhost:${PORT}`);
        console.log(` Login Page:   http://localhost:${PORT}/frontend/auth/login.html`);
        console.log(` Health Check: http://localhost:${PORT}/api/health`);
        console.log(`=========================================`);
    });
}

startServer();
