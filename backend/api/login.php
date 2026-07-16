<?php
/**
 * CIE-2 Activity Tracking, Evaluation and Performance Management System
 * File: backend/api/login.php
 * Purpose: Authenticates student/teacher/admin users.
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
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        throw new Exception('Invalid JSON input data.');
    }

    $role = $input['role'] ?? '';
    $password = $input['password'] ?? '';

    if (empty($role) || empty($password)) {
        throw new Exception('Role and password are required.');
    }

    $db = getDbConnection();
    $user = null;

    if ($role === 'student') {
        $prn = $input['prn'] ?? '';
        if (empty($prn)) {
            throw new Exception('PRN is required for student login.');
        }

        // Search by username
        $stmt = $db->prepare('SELECT * FROM users WHERE username = ? AND is_deleted = 0 AND is_active = 1');
        $stmt->execute([$prn]);
        $user = $stmt->fetch();

        // Fallback: search by usn
        if (!$user) {
            $stmt = $db->prepare('SELECT u.* FROM users u JOIN student_profiles sp ON u.id = sp.user_id WHERE sp.usn = ? AND u.is_deleted = 0 AND u.is_active = 1');
            $stmt->execute([$prn]);
            $user = $stmt->fetch();
        }
    } elseif ($role === 'teacher') {
        $employeeId = $input['employeeId'] ?? '';
        if (empty($employeeId)) {
            throw new Exception('Employee ID is required.');
        }
        $stmt = $db->prepare('SELECT u.* FROM users u JOIN teacher_profiles tp ON u.id = tp.user_id WHERE tp.employee_id = ? AND u.is_deleted = 0 AND u.is_active = 1');
        $stmt->execute([$employeeId]);
        $user = $stmt->fetch();
    } elseif ($role === 'admin') {
        $email = $input['email'] ?? '';
        if (empty($email)) {
            throw new Exception('Email is required.');
        }
        $stmt = $db->prepare('SELECT * FROM users WHERE email = ? AND is_deleted = 0 AND is_active = 1');
        $stmt->execute([$email]);
        $user = $stmt->fetch();
    } else {
        throw new Exception('Invalid login role.');
    }

    if (!$user) {
        throw new Exception('Invalid credentials');
    }

    if ($user['role'] !== $role) {
        throw new Exception('Role mismatch directory.');
    }

    // Verify Password using PHP native password_verify
    if (!password_verify($password, $user['password_hash'])) {
        throw new Exception('Invalid credentials');
    }

    // Sign JWT containing core profile fields
    $payload = [
        'id' => $user['id'],
        'username' => $user['username'],
        'email' => $user['email'],
        'role' => $user['role']
    ];
    $token = JWT::sign($payload);

    // Set cookie response
    setcookie('token', $token, [
        'expires' => time() + 86400,
        'path' => '/',
        'secure' => false, // Set true in production HTTPS
        'httponly' => true,
        'samesite' => 'Lax'
    ]);

    echo json_encode([
        'success' => true,
        'token' => $token,
        'mustChangePassword' => false
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
