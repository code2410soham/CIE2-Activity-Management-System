<?php
/**
 * CIE-2 Activity Tracking
 * File: backend/api/student-submissions-history.php
 */

require_once 'config.php';
require_once 'db.php';
require_once 'jwt.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$conn = getDBConnection();
$token = JWT::getBearerToken();

if (!$token) {
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "Auth token missing."]);
    exit();
}

$userData = JWT::verify($token);
if (!$userData || $userData['role'] !== 'student') {
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "Invalid student token."]);
    exit();
}

$user_id = $userData['id'];

try {
    // 1. Get student profile id
    $stmt = $conn->prepare("SELECT id FROM student_profiles WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $student = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$student) {
        echo json_encode(["success" => false, "error" => "Student profile not found."]);
        exit();
    }
    $student_id = $student['id'];

    // 2. Fetch submissions history with marks
    // A submission belongs to an activity. We also join evaluations.
    $sql = "
        SELECT 
            sub.id as submission_id,
            sub.submission_status,
            sub.submitted_at,
            a.title as activity_title,
            t.name as activity_type,
            s.name as subject,
            a.max_marks,
            sf.file_name,
            sf.file_path,
            sqa.earned_score as quiz_score,
            ev.marks_awarded as teacher_marks,
            ev.general_feedback as feedback,
            u.username as evaluator_name,
            ev.evaluated_at
        FROM submissions sub
        JOIN activities a ON sub.activity_id = a.id
        JOIN activity_types t ON a.activity_type_id = t.id
        JOIN subject_allocations sa ON a.subject_allocation_id = sa.id
        JOIN subjects s ON sa.subject_id = s.id
        LEFT JOIN submission_files sf ON sub.id = sf.submission_id
        LEFT JOIN student_quiz_attempts sqa ON sub.id = sqa.submission_id
        LEFT JOIN evaluations ev ON sub.id = ev.submission_id
        LEFT JOIN users u ON ev.evaluator_id = u.id
        WHERE sub.student_id = ?
        ORDER BY sub.submitted_at DESC
    ";

    $stmt = $conn->prepare($sql);
    $stmt->execute([$student_id]);
    $history = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "history" => $history]);

} catch (PDOException $e) {
    error_log("Error in student-submissions-history: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "DB Error"]);
}
