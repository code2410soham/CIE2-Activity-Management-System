<?php
/**
 * CIE-2 Activity Tracking, Evaluation and Performance Management System
 * File: backend/api/db.php
 * Purpose: Centralized PDO database helper that reads configuration from .env file.
 */

require_once __DIR__ . '/config.php';

// Function to get active PDO connection
function getDbConnection()
{
    $host = DB_HOST;
    $port = DB_PORT;
    $db = DB_NAME;
    $user = DB_USER;
    $pass = DB_PASSWORD;
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
