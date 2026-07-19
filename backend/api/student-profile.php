<?php
/**
 * CIE-2 Activity Tracking
 * File: backend/api/student-profile.php
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
    $stmt = $conn->prepare("
        SELECT 
            u.username, u.email, sp.usn, d.name as department, sem.term, ay.name as academic_year, sp.section, sp.admission_year
        FROM users u
        JOIN student_profiles sp ON u.id = sp.user_id
        JOIN departments d ON sp.department_id = d.id
        JOIN semesters sem ON sp.current_semester_id = sem.id
        JOIN academic_years ay ON sem.academic_year_id = ay.id
        WHERE u.id = ?
    ");
    $stmt->execute([$user_id]);
    $profile = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "profile" => $profile]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "DB Error"]);
}
