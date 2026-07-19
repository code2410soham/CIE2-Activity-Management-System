<?php
/**
 * CIE-2 Activity Tracking, Evaluation and Performance Management System
 * File: backend/api/admin-users.php
 * Path: /api/v1/admin/users
 * Purpose: Provides CRUD operations for users, fetching student and teacher profiles.
 */

require_once 'config.php';
require_once 'db.php';
require_once 'jwt.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$conn = getDBConnection();
$token = JWT::getBearerToken();

if (!$token) {
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "Authorization header missing or malformed."]);
    exit();
}

$userData = JWT::verify($token);
if (!$userData || !isset($userData['id']) || $userData['role'] !== 'admin') {
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "Invalid or expired token for Admin role."]);
    exit();
}

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Fetch Students
        $studentStmt = $conn->query("
            SELECT u.id as user_id, u.username, u.email, u.is_active, 
                   sp.usn, sp.name, d.name as department, s.term as semester, sp.section
            FROM users u
            JOIN student_profiles sp ON u.id = sp.user_id
            JOIN departments d ON sp.department_id = d.id
            JOIN semesters s ON sp.current_semester_id = s.id
            WHERE u.role = 'student' AND u.is_deleted = 0
            ORDER BY u.created_at DESC
        ");
        $students = $studentStmt->fetchAll(PDO::FETCH_ASSOC);

        // Fetch Teachers
        $teacherStmt = $conn->query("
            SELECT u.id as user_id, u.username, u.email, u.is_active,
                   tp.employee_id, tp.designation, d.name as department
            FROM users u
            JOIN teacher_profiles tp ON u.id = tp.user_id
            JOIN departments d ON tp.department_id = d.id
            WHERE u.role = 'teacher' AND u.is_deleted = 0
            ORDER BY u.created_at DESC
        ");
        $teachers = $teacherStmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true,
            "students" => $students,
            "teachers" => $teachers
        ]);
        exit();
    } else {
        http_response_code(405);
        echo json_encode(["success" => false, "error" => "Method not allowed."]);
        exit();
    }
} catch (PDOException $e) {
    error_log("[Admin Users API] Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Database fetch failed."]);
}
