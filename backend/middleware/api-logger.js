/**
 * CIE-2 Activity Tracking, Evaluation and Performance Management System
 * File: backend/middleware/api-logger.js
 * Purpose: Express middleware to log every incoming HTTP request and response to api.log
 */

const logger = require('../utils/logger');

module.exports = function apiLoggerMiddleware(req, res, next) {
    const startTime = Date.now();

    // Log when response finishes (captures real status code)
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        logger.api(req, res.statusCode, duration);
    });

    next();
};
