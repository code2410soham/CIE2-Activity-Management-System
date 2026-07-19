<?php
/**
 * CIE-2 Activity Tracking, Evaluation and Performance Management System
 * File: backend/api/admin-dashboard.php
 * Purpose: Provides all real-time system-wide metrics for the Admin Dashboard.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
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
    if (!$payload || $payload['role'] !== 'admin') {
        throw new Exception('Access denied. Invalid session or incorrect user role.');
    }

    $userId = $payload['id'];
    $db = getDbConnection();

    // 1. Admin Profile
    $adminStmt = $db->prepare('SELECT id, username, email, role FROM users WHERE id = ? AND is_deleted = 0');
    $adminStmt->execute([$userId]);
    $admin = $adminStmt->fetch();

    if (!$admin) {
        throw new Exception('Admin profile not found.');
    }

    // 2. Fetch Aggregated Metrics
    $metrics = [
        'total_students' => 0,
        'total_teachers' => 0,
        'total_subjects' => 0,
        'active_activities' => 0,
        'total_submissions' => 0
    ];

    $metrics['total_students'] = $db->query("SELECT COUNT(*) FROM student_profiles WHERE is_deleted = 0")->fetchColumn();
    $metrics['total_teachers'] = $db->query("SELECT COUNT(*) FROM teacher_profiles WHERE is_deleted = 0")->fetchColumn();
    $metrics['total_subjects'] = $db->query("SELECT COUNT(*) FROM subjects WHERE is_deleted = 0")->fetchColumn();
    $metrics['active_activities'] = $db->query("SELECT COUNT(*) FROM activities WHERE status = 'published' AND is_deleted = 0 AND deadline > NOW()")->fetchColumn();
    $metrics['total_submissions'] = $db->query("SELECT COUNT(*) FROM submissions WHERE is_deleted = 0")->fetchColumn();

    // 3. System Statistics & Recent Activity Logs
    $recentActivity = $db->query("
        SELECT id, action, table_name, created_at 
        FROM audit_logs 
        ORDER BY created_at DESC 
        LIMIT 10
    ")->fetchAll();

    echo json_encode([
        'success' => true,
        'admin' => $admin,
        'summary' => $metrics,
        'recent_activity' => $recentActivity,
        'server_time' => time()
    ]);

} catch (Exception $e) {
    $msg = $e->getMessage();
    if (strpos($msg, 'Access denied') !== false) {
        http_response_code(401);
    } else {
        http_response_code(400);
    }
    echo json_encode([
        'success' => false,
        'error' => $msg
    ]);
}
