<?php
/**
 * CIE-2 Activity Tracking
 * File: backend/api/teacher-quiz-builder.php
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
    echo json_encode(["success" => false, "error" => "No token"]);
    exit();
}

$user = JWT::verify($token);
if (!$user || $user['role'] !== 'teacher') {
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "Invalid teacher token"]);
    exit();
}

// Payload format:
// { activity_id: "...", questions: [ { text: "...", points: 1, options: [ {text: "...", is_correct: true/false} ] } ] }
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['activity_id']) || !isset($data['questions'])) {
    echo json_encode(["success" => false, "error" => "Missing data."]);
    exit();
}

$act_id = $data['activity_id'];
$questions = $data['questions'];

try {
    $conn->beginTransaction();

    // The activity might need a quiz bank. We'll create one dynamically if needed, 
    // or just bind questions directly to the activity using activity_quizzes.
    // 1. Create a dynamic quiz bank
    // Find subject for this activity
    $stmt = $conn->prepare("SELECT s.subject_id, t.id as teacher_pid FROM activities a JOIN subject_allocations s ON a.subject_allocation_id = s.id JOIN teacher_profiles t ON s.teacher_id = t.id WHERE a.id = ?");
    $stmt->execute([$act_id]);
    $actData = $stmt->fetch();

    if (!$actData)
        throw new Exception("Activity not found or lacking permissions.");

    $bank_id = uniqid('qb_');
    $stmt = $conn->prepare("INSERT INTO quiz_banks (id, subject_id, title, created_by) VALUES (?, ?, ?, ?)");
    $stmt->execute([$bank_id, $actData['subject_id'], "Auto-Gen Bank for Activity " . $act_id, $actData['teacher_pid']]);

    foreach ($questions as $idx => $q) {
        $q_id = uniqid('qq_');
        $insQ = $conn->prepare("INSERT INTO quiz_questions (id, quiz_bank_id, question_text, points) VALUES (?, ?, ?, ?)");
        $insQ->execute([$q_id, $bank_id, $q['text'], $q['points']]);

        // Link to activity
        $lnk = $conn->prepare("INSERT INTO activity_quizzes (activity_id, question_id, sort_order) VALUES (?, ?, ?)");
        $lnk->execute([$act_id, $q_id, $idx]);

        foreach ($q['options'] as $oidx => $opt) {
            $opt_id = uniqid('qo_');
            $insO = $conn->prepare("INSERT INTO quiz_question_options (id, question_id, option_text, is_correct, sort_order) VALUES (?, ?, ?, ?, ?)");
            $insO->execute([$opt_id, $q_id, $opt['text'], $opt['is_correct'] ? 1 : 0, $oidx]);
        }
    }

    $conn->commit();
    echo json_encode(["success" => true, "message" => "Quiz saved successfully!"]);

} catch (\Throwable $th) {
    $conn->rollBack();
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $th->getMessage()]);
}
