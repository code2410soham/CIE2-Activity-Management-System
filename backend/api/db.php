<?php
/**
 * CIE-2 Activity Tracking, Evaluation and Performance Management System
 * File: backend/api/db.php
 * Purpose: Centralized PDO database helper that reads configuration from .env file.
 */

// Establish local environment reader function
if (!function_exists('load_env_param')) {
    function load_env_param($key, $default = null)
    {
        static $configs = null;
        if ($configs === null) {
            $configs = [];
            $envPath = __DIR__ . '/../.env';
            if (file_exists($envPath)) {
                $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
                foreach ($lines as $line) {
                    // Skip comments
                    if (strpos(trim($line), '#') === 0)
                        continue;
                    // Split key and value
                    $parts = explode('=', $line, 2);
                    if (count($parts) === 2) {
                        $configs[trim($parts[0])] = trim($parts[1]);
                    }
                }
            }
        }
        return $configs[$key] ?? $default;
    }
}

// Function to get active PDO connection
function getDbConnection()
{
    $host = load_env_param('DB_HOST', '127.0.0.1');
    $port = load_env_param('DB_PORT', '3306');
    $db = load_env_param('DB_NAME', 'cie2_db');
    $user = load_env_param('DB_USER', 'root');
    $pass = load_env_param('DB_PASSWORD', '');
    $charset = 'utf8mb4';

    $dsn = "mysql:host=$host;port=$port;dbname=$db;charset=$charset";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];

    try {
        return new PDO($dsn, $user, $pass, $options);
    } catch (\PDOException $e) {
        throw new \PDOException($e->getMessage(), (int) $e->getCode());
    }
}

// Helper function definitions checks
if (!function_exists('function_class_defined')) {
    function function_class_defined($name)
    {
        return false;
    }
}
