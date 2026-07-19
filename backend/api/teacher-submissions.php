<?php
/**
 * CIE-2 Activity Tracking
 * File: backend/api/teacher-submissions.php
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
    echo json_encode(["success" => false, "error" => "No token"]);
    exit();
}

$user = JWT::verify($token);
if (!$user || $user['role'] !== 'teacher') {
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "Invalid teacher token"]);
    exit();
}

$teacher_user_id = $user['id'];

try {
    $stmt = $conn->prepare("SELECT id FROM teacher_profiles WHERE user_id = ?");
    $stmt->execute([$teacher_user_id]);
    $t = $stmt->fetch();
    if (!$t) {
        echo json_encode(["success" => false, "error" => "Teacher profile not found"]);
        exit();
    }
    $teacher_profile_id = $t['id'];

    // Fetch all submissions for subjects allocated to this teacher
    $sql = "
        SELECT 
            sub.id as submission_id,
            sp.usn as student_prn,
            u.username as student_name,
            a.title as activity_title,
            a.max_marks,
            sub.submission_status,
            sub.submitted_at,
            sf.file_path,
            ev.id as evaluation_id,
            ev.marks_awarded,
            ev.general_feedback
        FROM submissions sub
        JOIN student_profiles sp ON sub.student_id = sp.id
        JOIN users u ON sp.user_id = u.id
        JOIN activities a ON sub.activity_id = a.id
        JOIN subject_allocations sa ON a.subject_allocation_id = sa.id
        LEFT JOIN submission_files sf ON sub.id = sf.submission_id
        LEFT JOIN evaluations ev ON sub.id = ev.submission_id
        WHERE sa.teacher_id = ?
        ORDER BY sub.submitted_at DESC
    ";

    $stmt = $conn->prepare($sql);
    $stmt->execute([$teacher_profile_id]);
    $submissions = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "submissions" => $submissions]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "DB Error"]);
}
