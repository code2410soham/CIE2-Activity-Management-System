/**
 * CIE-2 Activity Tracking, Evaluation and Performance Management System
 * File: frontend/shared/api-service.js
 * Purpose: Centralized, production-grade API client with retry logic, timeouts,
 *          safe JSON parsing, and SweetAlert2-powered error notifications.
 *
 * Usage:
 *   const result = await apiService.post('/api/v1/auth/login', payload);
 *   if (!result.success) { ... }
 */

(function (global) {
    'use strict';

    // ────────────────────────────────────────────────────────────────
    // Configuration
    // ────────────────────────────────────────────────────────────────
    const CONFIG = {
        timeout: 10000,       // 10 s request timeout
        maxRetries: 2,        // Retry network/timeout errors this many times
        retryDelay: 800,      // ms wait between retries (exponential: × attempt#)
    };

    // ────────────────────────────────────────────────────────────────
    // SweetAlert2 helpers (gracefully degrade if SA2 not loaded)
    // ────────────────────────────────────────────────────────────────
    function _saAlert(icon, title, text) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon,
                title,
                text,
                confirmButtonColor: '#3b82f6',
                background: '#1e293b',
                color: '#f8fafc',
                confirmButtonText: 'Got it',
                timer: icon === 'success' ? 2500 : undefined,
                timerProgressBar: icon === 'success',
            });
        } else {
            console.warn('[api-service] SweetAlert2 not loaded — alert fallback:', title, text);
        }
    }

    // ────────────────────────────────────────────────────────────────
    // Sleep helper
    // ────────────────────────────────────────────────────────────────
    function _sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    // ────────────────────────────────────────────────────────────────
    // Core Safe Fetch
    // This is the hardened replace for bare fetch() + response.json()
    // ────────────────────────────────────────────────────────────────
    async function _safeFetch(endpoint, options = {}, attempt = 1) {
        // 1. Build AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.timeout);

        let fullUrl = endpoint;
        if (endpoint.startsWith('/api/') || endpoint.startsWith('/')) {
            const baseUrl = (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) || '/CIE2-Activity-Management-System/backend/api';
            // Extract just the endpoint name after /api/v1/auth/ or /api/v1/student/
            // e.g. /api/v1/auth/login -> /login.php
            let path = endpoint.split('/').pop() + '.php';
            fullUrl = baseUrl + '/' + path;
        }

        let response;
        try {
            response = await fetch(fullUrl, {
                ...options,
                signal: controller.signal,
            });
        } catch (networkErr) {
            clearTimeout(timeoutId);

            const isAbort = networkErr.name === 'AbortError';
            const isRetryable = isAbort || networkErr.message.includes('Failed to fetch');

            if (isRetryable && attempt <= CONFIG.maxRetries) {
                console.warn(`[api-service] ${isAbort ? 'Timeout' : 'Network error'} on attempt ${attempt}. Retrying in ${CONFIG.retryDelay * attempt}ms…`);
                await _sleep(CONFIG.retryDelay * attempt);
                return _safeFetch(endpoint, options, attempt + 1);
            }

            const friendlyMsg = isAbort
                ? 'The request timed out. The server may be slow or offline. Please try again.'
                : 'Network error — cannot reach the server. Check your internet connection.';

            return { success: false, error: friendlyMsg, _type: isAbort ? 'timeout' : 'network' };
        } finally {
            clearTimeout(timeoutId);
        }

        // 2. Verify response exists (should always be true here)
        if (!response) {
            return { success: false, error: 'No response received from the server.', _type: 'no_response' };
        }

        // 3. Safely parse body — never call .json() without checking content first
        const contentType = response.headers.get('content-type') || '';
        let data = null;

        try {
            const rawText = await response.text();

            if (!rawText || rawText.trim() === '') {
                // Empty body — treat as an implicit success/failure based on HTTP status
                data = {
                    success: response.ok,
                    error: response.ok ? undefined : `Server returned HTTP ${response.status} with an empty body.`,
                };
            } else if (contentType.includes('application/json')) {
                data = JSON.parse(rawText);
            } else {
                // HTML error page or plain text got through (e.g. Express 500 HTML response)
                console.warn('[api-service] Unexpected Content-Type from server:', contentType);
                console.warn('[api-service] Raw body snippet:', rawText.substring(0, 200));
                data = {
                    success: false,
                    error: response.ok
                        ? 'Server returned an unexpected response format. Please contact support.'
                        : `Server error (HTTP ${response.status}). Please try again or contact support.`,
                };
            }
        } catch (parseErr) {
            console.error('[api-service] JSON parse error:', parseErr);
            data = {
                success: false,
                error: 'Server returned malformed data. Please try again.',
                _type: 'parse_error',
            };
        }

        // 4. Retry on 500-class errors (server errors, not client errors)
        if (response.status >= 500 && attempt <= CONFIG.maxRetries) {
            console.warn(`[api-service] Server error ${response.status} on attempt ${attempt}. Retrying…`);
            await _sleep(CONFIG.retryDelay * attempt);
            return _safeFetch(endpoint, options, attempt + 1);
        }

        // 5. Attach HTTP status code for upstream use
        if (data && typeof data === 'object') {
            data._httpStatus = response.status;
        }

        return data;
    }

    // ────────────────────────────────────────────────────────────────
    // Public API Service
    // ────────────────────────────────────────────────────────────────
    const apiService = {
        /**
         * POST request.
         * @param {string} endpoint - API path, e.g. '/api/v1/auth/login'
         * @param {object} body     - JSON payload
         * @param {object} [extraHeaders] - Additional headers (e.g. Authorization)
         * @returns {Promise<object>} Parsed response object (always has .success field)
         */
        async post(endpoint, body, extraHeaders = {}) {
            const token = localStorage.getItem('authToken');
            const headers = {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                ...extraHeaders,
            };
            return _safeFetch(endpoint, { method: 'POST', headers, body: JSON.stringify(body) });
        },

        /**
         * GET request.
         * @param {string} endpoint
         * @param {object} [extraHeaders]
         * @returns {Promise<object>}
         */
        async get(endpoint, extraHeaders = {}) {
            const token = localStorage.getItem('authToken');
            const headers = {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                ...extraHeaders,
            };
            return _safeFetch(endpoint, { method: 'GET', headers });
        },

        // ── Alert helpers (pass-throughs to SweetAlert2) ──────────────
        alertSuccess(title, text) { _saAlert('success', title, text); },
        alertError(title, text) { _saAlert('error', title, text); },
        alertWarning(title, text) { _saAlert('warning', title, text); },
        alertInfo(title, text) { _saAlert('info', title, text); },

        /**
         * Show friendly error from a result object returned by .post() / .get()
         * Detects common failure modes and maps them to helpful messages.
         */
        showResultError(result, defaultTitle = 'Authentication Failed') {
            let title = defaultTitle;
            let text = result.error || 'An unexpected error occurred. Please try again.';

            if (result._type === 'timeout') {
                title = 'Request Timed Out';
                text = 'The server did not respond in time. Please check your connection and try again.';
            } else if (result._type === 'network') {
                title = 'Network Error';
                text = 'Unable to reach the server. Make sure you\'re connected and the server is running.';
            } else if (result._type === 'parse_error') {
                title = 'Server Response Error';
                text = 'The server returned an unreadable response. This is a server-side issue.';
            } else if (result._httpStatus === 401) {
                title = 'Invalid Credentials';
            } else if (result._httpStatus === 403) {
                title = 'Access Denied';
            } else if (result._httpStatus >= 500) {
                title = 'Server Error';
                text = 'A server error occurred. The team has been notified. Please try again shortly.';
            }

            _saAlert('error', title, text);
        },
    };

    // Expose globally
    global.apiService = apiService;

})(window);
