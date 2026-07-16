/**
 * CIE-2 Activity Tracking, Evaluation and Performance Management System
 * File: backend/middleware/auth.js
 * Purpose: Authentication middleware to verify JWT tokens and attach user payload to requests.
 */

const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // Get token from header, query parameter, or cookie
    let token = req.cookies?.token || req.cookies?.authToken;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Access denied. No authentication token provided.'
        });
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'cie2_activity_mgmt_jwt_secret_token_19853'
        );
        req.user = decoded;
        next();
    } catch (err) {
        console.error('JWT verification error:', err);
        return res.status(401).json({
            success: false,
            error: 'Invalid or expired authentication token.'
        });
    }
};
