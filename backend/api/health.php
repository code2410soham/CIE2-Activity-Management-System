<?php
/**
 * CIE-2 Activity Tracking, Evaluation and Performance Management System
 * File: backend/api/health.php
 * Purpose: Health check endpoint testing API and DB connectivity on XAMPP.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/db.php';

$response = [
    'success' => false,
    'status' => 'error',
    'database' => 'disconnected',
    'timestamp' => gmdate('Y-m-d\TH:i:s\Z')
];

try {
    $db = getDbConnection();
    if ($db) {
        $response['success'] = true;
        $response['status'] = 'ok';
        $response['database'] = 'connected';
    }
} catch (Exception $e) {
    $response['error'] = 'Database connection failed: ' . $e->getMessage();
    http_response_code(503);
}

echo json_encode($response);
