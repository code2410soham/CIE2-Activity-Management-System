/**
 * CIE-2 Activity Tracking, Evaluation and Performance Management System
 * File: backend/utils/logger.js
 * Purpose: Centralized structured file-based logger for API, error, and audit events.
 *
 * Writes to:
 *   /backend/logs/api.log    - All HTTP requests
 *   /backend/logs/error.log  - All unhandled and caught errors
 *   /backend/logs/audit.log  - Auth events (login success/fail, password changes)
 */

const fs = require('fs');
const path = require('path');

// Ensure the logs directory exists
const LOGS_DIR = path.join(__dirname, '../logs');
if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
}

const LOG_FILES = {
    api: path.join(LOGS_DIR, 'api.log'),
    error: path.join(LOGS_DIR, 'error.log'),
    audit: path.join(LOGS_DIR, 'audit.log'),
};

// ────────────────────────────────────────────────────────────────
// Internal write helper
// ────────────────────────────────────────────────────────────────
function _write(file, level, data) {
    const entry = JSON.stringify({
        timestamp: new Date().toISOString(),
        level,
        ...data,
    }) + '\n';

    fs.appendFile(file, entry, (err) => {
        if (err) {
            // Silently fail — logging must NEVER crash the application
            console.error('[logger] Failed to write log entry:', err.message);
        }
    });
}

// ────────────────────────────────────────────────────────────────
// Public Logger API
// ────────────────────────────────────────────────────────────────
const logger = {
    /**
     * Log an HTTP API request/response event.
     * @param {object} req   - Express request
     * @param {number} status - HTTP response status code
     * @param {number} durationMs - Request processing duration
     */
    api(req, status, durationMs) {
        _write(LOG_FILES.api, 'INFO', {
            method: req.method,
            url: req.originalUrl,
            ip: req.ip || req.connection?.remoteAddress,
            status,
            durationMs,
            userAgent: (req.headers['user-agent'] || '').substring(0, 100),
        });
    },

    /**
     * Log an application error.
     * @param {Error|string} err - Error object or message
     * @param {object} [context] - Optional context key-values
     */
    error(err, context = {}) {
        _write(LOG_FILES.error, 'ERROR', {
            message: err instanceof Error ? err.message : String(err),
            stack: err instanceof Error ? err.stack : undefined,
            ...context,
        });
        // Mirror to console for real-time visibility
        console.error(`[ERROR] ${err instanceof Error ? err.message : err}`);
    },

    /**
     * Log an authentication/security audit event.
     * @param {string} event   - e.g. 'LOGIN_SUCCESS', 'LOGIN_FAIL', 'PASSWORD_CHANGE'
     * @param {object} details - Additional context
     */
    audit(event, details = {}) {
        _write(LOG_FILES.audit, 'AUDIT', {
            event,
            ...details,
        });
        console.log(`[AUDIT] ${event}`, details);
    },
};

module.exports = logger;
