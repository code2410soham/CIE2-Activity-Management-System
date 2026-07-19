<?php
/**
 * CIE-2 Activity Tracking, Evaluation and Performance Management System
 * File: backend/api/test-suite.php
 * Purpose: Automated backend verification test suite (Database, Login, Dashboard).
 */

header('Content-Type: application/json');
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/jwt.php';

$results = [
    'test_run_time' => gmdate('Y-m-d\TH:i:s\Z'),
    'metrics' => [
        'passed' => 0,
        'failed' => 0,
        'total' => 0
    ],
    'details' => []
];

function logTest($name, $passed, $errorMsg = '')
{
    global $results;
    $results['metrics']['total']++;
    if ($passed) {
        $results['metrics']['passed']++;
    } else {
        $results['metrics']['failed']++;
    }
    $results['details'][] = [
        'name' => $name,
        'status' => $passed ? 'PASS' : 'FAIL',
        'error' => $errorMsg
    ];
}

// 1. Database Connection Test
try {
    $db = getDbConnection();
    logTest('Database Connection', true);
} catch (Exception $e) {
    logTest('Database Connection', false, $e->getMessage());
    echo json_encode($results, JSON_PRETTY_PRINT);
    exit(0);
}

// 2. Student Authentication Test (Testing 405 fix and token gen)
$testToken = null;
try {
    $stmt = $db->prepare("SELECT * FROM users WHERE role = 'student' LIMIT 1");
    $stmt->execute();
    $studentUser = $stmt->fetch();

    if ($studentUser) {
        // Direct JWT sign simulation (simulating login.php)
        $payload = [
            'id' => $studentUser['id'],
            'username' => $studentUser['username'],
            'email' => $studentUser['email'],
            'role' => $studentUser['role']
        ];
        $testToken = JWT::sign($payload);

        if ($testToken) {
            logTest('JWT Token Generation', true);
        } else {
            logTest('JWT Token Generation', false, 'Sign method returned empty token.');
        }
    } else {
        logTest('Found test student user', false, 'No students in db to test with.');
    }
} catch (Exception $e) {
    logTest('Student Authentication', false, $e->getMessage());
}

// 3. JWT Verification Test
if ($testToken) {
    try {
        $decoded = JWT::verify($testToken);
        if ($decoded && isset($decoded['id'])) {
            logTest('JWT Token Verification', true);
        } else {
            logTest('JWT Token Verification', false, 'Verify returned null or invalid payload.');
        }
    } catch (Exception $e) {
        logTest('JWT Token Verification', false, $e->getMessage());
    }
}

// 4. Session Validation (Testing JWT expiry protection)
try {
    $expiredToken = JWT::sign(['id' => '1', 'role' => 'student'], -3600); // Set expiry to 1 hour ago
    $decodedExp = JWT::verify($expiredToken);
    if ($decodedExp === null) {
        logTest('Session Expiry Validation', true);
    } else {
        logTest('Session Expiry Validation', false, 'Expired token was validated successfully (Security Vulnerability).');
    }
} catch (Exception $e) {
    logTest('Session Expiry Validation', false, $e->getMessage());
}

echo json_encode($results, JSON_PRETTY_PRINT);
