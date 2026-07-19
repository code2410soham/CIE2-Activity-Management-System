<?php
/**
 * CIE-2 Activity Tracking, Evaluation and Performance Management System
 * File: backend/api/teacher-activities.php
 * Path: /api/v1/teacher/teacher-activities
 * Purpose: Full CRUD controller for Activity Management by Teachers.
 */

require_once 'config.php';
require_once 'db.php';
require_once 'jwt.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
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
if (!$userData || !isset($userData['id']) || $userData['role'] !== 'teacher') {
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "Invalid or expired token for Instructor role."]);
    exit();
}

$teacher_id = $userData['id'];
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        // Fetch Metadata for Form (Subjects, Types) AND List of Activities

        // 1. Get Subjects the teacher is allocated to
        $stmt = $conn->prepare("
            SELECT sa.id as allocation_id, s.subject_name, s.subject_code, sa.section, sa.academic_year
            FROM subject_allocations sa
            JOIN subjects s ON sa.subject_id = s.id
            WHERE sa.teacher_id = ?
        ");
        $stmt->execute([$teacher_id]);
        $allocations = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // 2. Get Activity Types
        $stmt = $conn->query("SELECT * FROM activity_types ORDER BY id ASC");
        $types = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // 3. Get Existing Activities for this Teacher
        $stmt = $conn->prepare("
            SELECT 
                a.id, a.title, a.type_id, at.type_name, a.subject_allocation_id, 
                s.subject_name, sa.section, a.instructions, a.max_marks, 
                a.created_at, a.deadline,
                (SELECT COUNT(*) FROM submissions sub WHERE sub.activity_id = a.id) as submission_count
            FROM activities a
            JOIN activity_types at ON a.type_id = at.id
            JOIN subject_allocations sa ON a.subject_allocation_id = sa.id
            JOIN subjects s ON sa.subject_id = s.id
            WHERE sa.teacher_id = ?
            ORDER BY a.created_at DESC
        ");
        $stmt->execute([$teacher_id]);
        $activities = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true,
            "metadata" => [
                "allocations" => $allocations,
                "types" => $types
            ],
            "activities" => $activities
        ]);
        exit();

    } elseif ($method === 'POST') {
        // Create an Activity
        $input = json_decode(file_get_contents('php://input'), true);

        $title = trim($input['title'] ?? '');
        $type_id = $input['type_id'] ?? null;
        $allocation_id = $input['allocation_id'] ?? null;
        $deadline = $input['deadline'] ?? null;
        $max_marks = $input['max_marks'] ?? null;
        $instructions = trim($input['instructions'] ?? '');

        if (!$title || !$type_id || !$allocation_id || !$deadline || !$max_marks) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "All fields except instructions are mandatory."]);
            exit();
        }

        // Verify allocation belongs to this teacher
        $verify = $conn->prepare("SELECT id FROM subject_allocations WHERE id = ? AND teacher_id = ?");
        $verify->execute([$allocation_id, $teacher_id]);
        if (!$verify->fetch()) {
            http_response_code(403);
            echo json_encode(["success" => false, "error" => "Unauthorized subject allocation."]);
            exit();
        }

        $stmt = $conn->prepare("
            INSERT INTO activities (subject_allocation_id, type_id, title, instructions, max_marks, deadline)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$allocation_id, $type_id, $title, $instructions, $max_marks, $deadline]);
        $newId = $conn->lastInsertId();

        // Log Audit
        $audit = $conn->prepare("INSERT INTO audit_logs (user_id, action, table_name, record_id) VALUES (?, 'INSERT', 'activities', ?)");
        $audit->execute([$teacher_id, $newId]);

        echo json_encode(["success" => true, "message" => "Activity published successfully.", "activity_id" => $newId]);
        exit();

    } elseif ($method === 'DELETE') {
        $activity_id = $_GET['id'] ?? null;
        if (!$activity_id) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "Missing activity ID"]);
            exit();
        }

        // Verify ownership
        $verify = $conn->prepare("
            SELECT a.id FROM activities a 
            JOIN subject_allocations sa ON a.subject_allocation_id = sa.id
            WHERE a.id = ? AND sa.teacher_id = ?
        ");
        $verify->execute([$activity_id, $teacher_id]);
        if (!$verify->fetch()) {
            http_response_code(403);
            echo json_encode(["success" => false, "error" => "Unauthorized. Cannot delete this activity."]);
            exit();
        }

        // Delete (Cascade deletes will handle child rows in evaluation/submission if setup, but in safe mode we should just delete the activity directly)
        $stmt = $conn->prepare("DELETE FROM activities WHERE id = ?");
        $stmt->execute([$activity_id]);

        $audit = $conn->prepare("INSERT INTO audit_logs (user_id, action, table_name, record_id) VALUES (?, 'DELETE', 'activities', ?)");
        $audit->execute([$teacher_id, $activity_id]);

        echo json_encode(["success" => true, "message" => "Activity deleted successfully."]);
        exit();
    } else {
        http_response_code(405);
        echo json_encode(["success" => false, "error" => "Method not allowed."]);
        exit();
    }

} catch (PDOException $e) {
    error_log("[Teacher Activities API] DB Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "A database error occurred."]);
}
