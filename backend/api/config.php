<?php
/**
 * CIE-2 Activity Tracking, Evaluation and Performance Management System
 * File: backend/api/config.php
 * Purpose: Centralized configuration file for the PHP Backend.
 */

// Define environment constants
define('DB_HOST', '127.0.0.1');
define('DB_PORT', '3306');
define('DB_NAME', 'cie2_db');
define('DB_USER', 'root');
define('DB_PASSWORD', '');

// Security configurations
define('JWT_SECRET', 'cie2_activity_mgmt_jwt_secret_token_19853');
define('JWT_EXPIRY_SECONDS', 86400); // 24 hours

// Session Timeouts
define('SESSION_TIMEOUT_MINUTES', 30);
