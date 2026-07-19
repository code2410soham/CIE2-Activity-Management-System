<?php
/**
 * CIE-2 Activity Tracking
 * File: backend/api/student-notifications.php
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
        SELECT id as notif_id, title, message, notification_type, is_read, created_at, link_url
        FROM notifications
        WHERE recipient_id = ?
        ORDER BY created_at DESC
        LIMIT 50
    ");
    $stmt->execute([$user_id]);
    $notifs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "notifications" => $notifs]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "DB Error"]);
}
