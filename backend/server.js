/**
 * CIE-2 Activity Tracking, Evaluation and Performance Management System
 * File: backend/server.js
 * Purpose: Central server entry point. Serves static frontend files and mounts API endpoints.
 *          Validates environment and tests DB connection before starting.
 *          Now includes structured API logging and a centralized JSON error handler.
 */

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./auth/routes');
const studentRoutes = require('./student/routes');
const authMiddleware = require('./middleware/auth');
const apiLogger = require('./middleware/api-logger');
const globalErrorHandler = require('./middleware/global-error-handler');
const logger = require('./utils/logger');
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
app.use(apiLogger); // Log every request to api.log

// CORS: Allow requests from any localhost origin (works for all team members)
const allowedOrigins = [
    `http://localhost:${PORT}`,
    `http://127.0.0.1:${PORT}`,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.CORS_ORIGIN
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
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
    res.sendFile(path.join(__dirname, '../index.html'));
});

app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

app.get('/404.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../404.html'));
});

// ─── 3. Health Check Endpoint ────────────────────────────────────────────────

app.get('/api/health', async (req, res) => {
    try {
        const conn = await pool.getConnection();
        await conn.ping();
        conn.release();
        res.json({ success: true, status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
    } catch (err) {
        logger.error(err, { context: 'health-check' });
        res.status(503).json({ success: false, status: 'error', database: 'disconnected', error: 'Database connection failed.' });
    }
});

// ─── 4. Mount Backend API Endpoints ─────────────────────────────────────────

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/student', authMiddleware, studentRoutes);

// ─── 5. Wildcard 404 Fallback ────────────────────────────────────────────────

app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
        // API routes get JSON 404 — never HTML
        return res.status(404).json({ success: false, error: `API endpoint not found: ${req.method} ${req.originalUrl}` });
    }
    if (req.accepts('html')) {
        res.status(404).sendFile(path.join(__dirname, '../404.html'));
    } else {
        res.status(404).json({ success: false, error: 'Not Found' });
    }
});

// ─── 6. Centralized JSON Error Handler (logs + guarantees JSON) ──────────────

app.use(globalErrorHandler);

// ─── 7. Process-level Safety Net ────────────────────────────────────────────

process.on('uncaughtException', (err) => {
    logger.error(err, { context: 'uncaughtException' });
    console.error('💥 Uncaught Exception:', err.message);
    // Give time to flush logs before exit
    setTimeout(() => process.exit(1), 500);
});

process.on('unhandledRejection', (reason) => {
    logger.error(reason instanceof Error ? reason : new Error(String(reason)), { context: 'unhandledRejection' });
    console.error('💥 Unhandled Rejection:', reason);
});

// ─── 8. Start Server with DB Connection Test ─────────────────────────────────

async function startServer() {
    try {
        const conn = await pool.getConnection();
        await conn.ping();
        conn.release();
        console.log('✅ Database connection verified.');
    } catch (err) {
        logger.error(err, { context: 'startup-db-check' });
        console.error('\n🚨 STARTUP FAILED — Cannot connect to MySQL database!');
        console.error(`   Error: ${err.message}`);
        if (err.code === 'ECONNREFUSED') {
            console.error('   → MySQL is not running. Start XAMPP and click Start on MySQL.');
        } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('   → Check DB_USER and DB_PASSWORD in your .env file.');
        } else if (err.code === 'ER_BAD_DB_ERROR') {
            console.error(`   → Database "${process.env.DB_NAME}" does not exist.`);
            console.error(`   → Run: mysql -u ${process.env.DB_USER} -p -e "CREATE DATABASE ${process.env.DB_NAME};"`);
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
        console.log(` Logs Dir:     backend/logs/`);
        console.log(`=========================================`);
    });
}

startServer();
