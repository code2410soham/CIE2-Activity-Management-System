<?php
/**
 * CIE-2 Activity Tracking, Evaluation and Performance Management System
 * File: backend/api/student-activities.php
 * Path: /api/v1/student/student-activities
 * Purpose: Provides a dedicated list of assignments and quizzes for the student activities tab.
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
if (!$userData || !isset($userData['id']) || $userData['role'] !== 'student') {
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "Invalid or expired token for Student role."]);
    exit();
}

$student_id = $userData['id'];

try {
    $stmt = $conn->prepare("
        SELECT 
            a.id as activity_id,
            a.title,
            a.description as instructions,
            t.type_name as category,
            s.subject_name as subject,
            a.max_marks,
            a.deadline,
            COALESCE(sub.submission_status, 'pending') as submission_status,
            sub.submitted_at
        FROM activities a
        JOIN activity_types t ON a.type_id = t.id
        JOIN subject_allocations sa ON a.subject_allocation_id = sa.id
        JOIN student_course_enrollments sce ON sa.id = sce.subject_allocation_id
        JOIN subjects s ON sa.subject_id = s.id
        LEFT JOIN submissions sub ON a.id = sub.activity_id AND sub.student_id = ?
        WHERE sce.student_id = ?
        ORDER BY a.deadline ASC
    ");

    $stmt->execute([$student_id, $student_id]);
    $activities = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "activities" => $activities]);
    exit();

} catch (PDOException $e) {
    error_log("[Student Activities API] Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Database fetch failed."]);
}
