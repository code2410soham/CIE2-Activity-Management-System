<?php
/**
 * CIE-2 Activity Tracking, Evaluation and Performance Management System
 * File: backend/api/student-upload.php
 * Path: /api/v1/student/student-upload
 * Purpose: Allows students to upload PDFs/files as submissions.
 */

require_once 'config.php';
require_once 'db.php';
require_once 'jwt.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $activity_id = $_POST['activity_id'] ?? null;
        if (!$activity_id) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "Activity ID is required."]);
            exit();
        }

        // Verify if activity exists and student is enrolled in that subject class
        $verify = $conn->prepare("
            SELECT a.id, a.deadline 
            FROM activities a
            JOIN student_course_enrollments sce ON a.subject_allocation_id = sce.subject_allocation_id
            WHERE a.id = ? AND sce.student_id = ?
        ");
        $verify->execute([$activity_id, $student_id]);
        $activity = $verify->fetch(PDO::FETCH_ASSOC);

        if (!$activity) {
            http_response_code(403);
            echo json_encode(["success" => false, "error" => "You are not enrolled in the subject for this activity."]);
            exit();
        }

        // Check deadline
        if (strtotime($activity['deadline']) < time()) {
            http_response_code(403);
            echo json_encode(["success" => false, "error" => "The deadline for this activity has passed."]);
            exit();
        }

        // File Validation
        if (!isset($_FILES['submission_file']) || $_FILES['submission_file']['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "No file uploaded or upload error occurred."]);
            exit();
        }

        $file = $_FILES['submission_file'];

        // Strict file type checking (PDFs allowed)
        $allowed_mimes = ['application/pdf'];
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime_type = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!in_array($mime_type, $allowed_mimes)) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "Invalid file format. Only PDF files are allowed."]);
            exit();
        }

        // Setup Upload Path
        $upload_dir = __DIR__ . '/../../uploads/submissions/';
        if (!is_dir($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }

        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $file_name = uniqid("submission_{$student_id}_{$activity_id}_") . '.' . $extension;
        $file_path = $upload_dir . $file_name;

        if (!move_uploaded_file($file['tmp_name'], $file_path)) {
            http_response_code(500);
            echo json_encode(["success" => false, "error" => "Failed to save file to disk."]);
            exit();
        }

        $conn->beginTransaction();

        // Check if submission already exists (update submission)
        $stmt = $conn->prepare("SELECT id FROM submissions WHERE activity_id = ? AND student_id = ?");
        $stmt->execute([$activity_id, $student_id]);
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($existing) {
            $submission_id = $existing['id'];
            $conn->prepare("UPDATE submissions SET submission_status = 'submitted', updated_at = CURRENT_TIMESTAMP WHERE id = ?")->execute([$submission_id]);

            // Delete old file mapping if needed (optional: we can keep historical or just overwrite)
            $conn->prepare("DELETE FROM submission_files WHERE submission_id = ?")->execute([$submission_id]);
        } else {
            $stmt = $conn->prepare("INSERT INTO submissions (activity_id, student_id, submission_status) VALUES (?, ?, 'submitted')");
            $stmt->execute([$activity_id, $student_id]);
            $submission_id = $conn->lastInsertId();
        }

        // Insert new file record
        $stmt = $conn->prepare("
            INSERT INTO submission_files (submission_id, file_path, file_name, file_size, mime_type)
            VALUES (?, ?, ?, ?, ?)
        ");

        $relative_path = 'uploads/submissions/' . $file_name;
        $stmt->execute([$submission_id, $relative_path, $file['name'], $file['size'], $mime_type]);

        $conn->commit();
        echo json_encode(["success" => true, "message" => "File uploaded successfully!"]);

    } catch (Exception $e) {
        if ($conn->inTransaction()) {
            $conn->rollBack();
        }
        error_log("[Student Upload API] Error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "An internal server error occurred during upload."]);
    }
} else {
    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Method not allowed."]);
}
