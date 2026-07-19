<?php
/**
 * CIE-2 Activity Tracking, Evaluation and Performance Management System
 * File: backend/api/teacher-evaluations.php
 * Path: /api/v1/teacher/evaluations
 * Purpose: Fetch submissions for teacher's activities and submit evaluated marks.
 */

require_once 'config.php';
require_once 'db.php';
require_once 'jwt.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
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
        // Fetch all submissions for the logged-in teacher's activities
        $stmt = $conn->prepare("
            SELECT 
                sub.id as submission_id,
                sub.submission_status,
                sub.submitted_at,
                a.id as activity_id,
                a.title as activity_title,
                a.max_marks,
                s.subject_name,
                sa.section,
                sp.name as first_name,
                '' as last_name,
                sp.usn as zrpn,
                sf.file_path,
                sf.file_name,
                eval.marks_awarded,
                eval.evaluated_at
            FROM submissions sub
            JOIN activities a ON sub.activity_id = a.id
            JOIN subject_allocations sa ON a.subject_allocation_id = sa.id
            JOIN subjects s ON sa.subject_id = s.id
            JOIN student_profiles sp ON sub.student_id = sp.id
            LEFT JOIN submission_files sf ON sub.id = sf.submission_id
            LEFT JOIN evaluations eval ON sub.id = eval.submission_id
            WHERE sa.teacher_id = ?
            ORDER BY sub.submitted_at DESC
        ");
        $stmt->execute([$teacher_id]);
        $submissions = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["success" => true, "submissions" => $submissions]);
        exit();

    } elseif ($method === 'POST') {
        // Evaluate a submission
        $input = json_decode(file_get_contents('php://input'), true);

        $submission_id = $input['submission_id'] ?? null;
        $marks = $input['marks'] ?? null;
        $feedback = $input['feedback'] ?? '';

        if (!$submission_id || $marks === null) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "Missing submission ID or marks."]);
            exit();
        }

        // 1. Verify Submission belongs to this teacher
        $verify = $conn->prepare("
            SELECT a.max_marks 
            FROM submissions sub
            JOIN activities a ON sub.activity_id = a.id
            JOIN subject_allocations sa ON a.subject_allocation_id = sa.id
            WHERE sub.id = ? AND sa.teacher_id = ?
        ");
        $verify->execute([$submission_id, $teacher_id]);
        $record = $verify->fetch(PDO::FETCH_ASSOC);

        if (!$record) {
            http_response_code(403);
            echo json_encode(["success" => false, "error" => "Unauthorized access to this submission."]);
            exit();
        }

        if ((float) $marks > (float) $record['max_marks']) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "Marks awarded cannot exceed max marks ({$record['max_marks']})."]);
            exit();
        }

        $conn->beginTransaction();

        // 2. Insert or Update Evaluation
        $chk = $conn->prepare("SELECT id FROM evaluations WHERE submission_id = ?");
        $chk->execute([$submission_id]);
        $existing = $chk->fetch(PDO::FETCH_ASSOC);

        if ($existing) {
            $update = $conn->prepare("UPDATE evaluations SET marks_awarded = ?, general_feedback = ?, evaluated_at = CURRENT_TIMESTAMP WHERE id = ?");
            $update->execute([$marks, $feedback, $existing['id']]);
        } else {
            $insert = $conn->prepare("INSERT INTO evaluations (submission_id, evaluator_id, marks_awarded, general_feedback) VALUES (?, ?, ?, ?)");
            $insert->execute([$submission_id, $teacher_id, $marks, $feedback]);
        }

        $conn->commit();
        echo json_encode(["success" => true, "message" => "Evaluation saved successfully!"]);
        exit();
    } else {
        http_response_code(405);
        echo json_encode(["success" => false, "error" => "Method not allowed."]);
        exit();
    }
} catch (PDOException $e) {
    if ($conn->inTransaction()) {
        $conn->rollBack();
    }
    error_log("[Teacher Evaluations API] Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "A database error occurred."]);
}
