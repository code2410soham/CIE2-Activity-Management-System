<?php
/**
 * CIE-2 Activity Tracking, Evaluation and Performance Management System
 * File: backend/api/change-password.php
 * Purpose: Update security credentials for authenticated users.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/jwt.php';

try {
    $token = JWT::getBearerToken();
    if (!$token) {
        throw new Exception('Access denied. Authorization token missing.');
    }

    $payload = JWT::verify($token);
    if (!$payload) {
        throw new Exception('Access denied. Invalid or expired token.');
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $currentPassword = $input['currentPassword'] ?? '';
    $newPassword = $input['newPassword'] ?? '';

    if (empty($currentPassword) || empty($newPassword)) {
        throw new Exception('Current and new passwords are required.');
    }

    if (strlen($newPassword) < 6) {
        throw new Exception('New password must be at least 6 characters.');
    }

    $db = getDbConnection();

    // Look up user's hash
    $stmt = $db->prepare('SELECT * FROM users WHERE id = ? AND is_deleted = 0');
    $stmt->execute([$payload['id']]);
    $user = $stmt->fetch();

    if (!$user) {
        throw new Exception('User profile not found.');
    }

    // Verify current password
    if (!password_verify($currentPassword, $user['password_hash'])) {
        throw new Exception('Current password does not match.');
    }

    // Hash new password using PHP standard BCRYPT
    $newHash = password_hash($newPassword, PASSWORD_BCRYPT);

    // Update in database
    $stmt = $db->prepare('UPDATE users SET password_hash = ? WHERE id = ?');
    $stmt->execute([$newHash, $user['id']]);

    echo json_encode([
        'success' => true,
        'message' => 'Password updated successfully.'
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
