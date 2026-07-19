/**
 * CIE-2 Activity Tracking, Evaluation and Performance Management System
 * File: backend/middleware/global-error-handler.js
 * Purpose: Centralized Express error-handling middleware.
 *          Guarantees that ALL error responses are well-formed JSON — eliminating
 *          the risk of HTML error pages crashing the frontend's response.json() call.
 */

const logger = require('../utils/logger');

/**
 * Express error handler (must be 4-argument function).
 * Register LAST in server.js after all routes.
 */
// eslint-disable-next-line no-unused-vars
module.exports = function globalErrorHandler(err, req, res, next) {
    // Log to error.log
    logger.error(err, {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip || req.connection?.remoteAddress,
        body: req.method !== 'GET' ? JSON.stringify(req.body).substring(0, 200) : undefined,
    });

    // CORS errors
    if (err.message && err.message.startsWith('CORS policy')) {
        return res.status(403).json({ success: false, error: err.message });
    }

    // Validation / auth errors thrown intentionally
    if (err.status && err.status < 500) {
        return res.status(err.status).json({
            success: false,
            error: err.message || 'Request error.',
        });
    }

    // Generic server error — never expose internal details in production
    const isDev = process.env.NODE_ENV !== 'production';
    return res.status(500).json({
        success: false,
        error: isDev
            ? err.message || 'Internal Server Error'
            : 'An unexpected server error occurred. Please try again shortly.',
    });
};
