<?php
/**
 * CIE-2 Activity Tracking
 * File: backend/api/student-quizzes.php
 * Path: /api/v1/student/student-quizzes
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

// Get Student Profile ID
$stmt = $conn->prepare("SELECT id FROM student_profiles WHERE user_id = ?");
$stmt->execute([$user_id]);
$student = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$student) {
    echo json_encode(["success" => false, "error" => "Student profile not found."]);
    exit();
}
$student_id = $student['id'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $activity_id = $_GET['activity_id'] ?? null;

    if ($activity_id) {
        // Fetch Questions for this activity
        try {
            $stmt = $conn->prepare("
                SELECT q.id as question_id, q.question_text, q.question_type, q.points, qo.id as option_id, qo.option_text
                FROM activity_quizzes aq
                JOIN quiz_questions q ON aq.question_id = q.id
                LEFT JOIN quiz_question_options qo ON q.id = qo.question_id
                WHERE aq.activity_id = ?
                ORDER BY aq.sort_order ASC, q.id ASC, qo.sort_order ASC
            ");
            $stmt->execute([$activity_id]);
            $raw = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Group options
            $questions = [];
            foreach ($raw as $row) {
                $qid = $row['question_id'];
                if (!isset($questions[$qid])) {
                    $questions[$qid] = [
                        'id' => $qid,
                        'text' => $row['question_text'],
                        'type' => $row['question_type'],
                        'points' => (float) $row['points'],
                        'options' => []
                    ];
                }
                if ($row['option_id']) {
                    $questions[$qid]['options'][] = [
                        'id' => $row['option_id'],
                        'text' => $row['option_text']
                    ];
                }
            }

            echo json_encode(["success" => true, "questions" => array_values($questions)]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "error" => "DB Error"]);
        }
    } else {
        // Just fetch all Quizzes assigned to student
        try {
            $stmt = $conn->prepare("
                SELECT 
                    a.id as activity_id, a.title, s.name as subject, a.max_marks, a.deadline,
                    COALESCE(sub.submission_status, 'pending') as submission_status
                FROM activities a
                JOIN activity_types t ON a.activity_type_id = t.id
                JOIN subject_allocations sa ON a.subject_allocation_id = sa.id
                JOIN student_course_enrollments sce ON sa.id = sce.subject_allocation_id
                JOIN subjects s ON sa.subject_id = s.id
                LEFT JOIN submissions sub ON a.id = sub.activity_id AND sub.student_id = ?
                WHERE sce.student_id = ? AND t.code = 'QUIZ'
                ORDER BY a.deadline ASC
            ");
            $stmt->execute([$student_id, $student_id]);
            $quizzes = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(["success" => true, "quizzes" => $quizzes]);
        } catch (\Throwable $th) {
            http_response_code(500);
            echo json_encode(["success" => false, "error" => "DB Error"]);
        }
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Submit Quiz: receives activity_id, answers: { question_id: option_id }
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['activity_id']) || !isset($data['answers'])) {
        echo json_encode(["success" => false, "error" => "Missing data."]);
        exit();
    }
    $activity_id = $data['activity_id'];
    $answers = $data['answers'];

    // Auto grader logic
    try {
        $conn->beginTransaction();

        // 1. Create Submission wrapper
        $subId = uniqid('sub_');
        $stmt = $conn->prepare("INSERT INTO submissions (id, activity_id, student_id, submission_status) VALUES (?, ?, ?, 'submitted')");
        $stmt->execute([$subId, $activity_id, $student_id]);

        // 2. Create Attempt
        $attemptId = uniqid('att_');
        $stmt = $conn->prepare("INSERT INTO student_quiz_attempts (id, submission_id, completed_at) VALUES (?, ?, NOW())");
        $stmt->execute([$attemptId, $subId]);

        // 3. Grade answers
        $totalEarned = 0;
        foreach ($answers as $qId => $optId) {
            // Check if correct
            $chk = $conn->prepare("SELECT is_correct, (SELECT points FROM quiz_questions WHERE id=?) as pts FROM quiz_question_options WHERE id=?");
            $chk->execute([$qId, $optId]);
            $optData = $chk->fetch(PDO::FETCH_ASSOC);

            $isCorrect = $optData['is_correct'] ?? 0;
            $marks = $isCorrect ? $optData['pts'] : 0;
            $totalEarned += $marks;

            $ins = $conn->prepare("INSERT INTO student_quiz_answers (id, attempt_id, question_id, selected_option_id, is_correct, marks_awarded) VALUES (?, ?, ?, ?, ?, ?)");
            $ins->execute([uniqid('ans_'), $attemptId, $qId, $optId, $isCorrect, $marks]);
        }

        // Update Attempt score
        $upd = $conn->prepare("UPDATE student_quiz_attempts SET earned_score = ? WHERE id = ?");
        $upd->execute([$totalEarned, $attemptId]);

        // Create Evaluation entry automatically (Auto-graded)
        $evalId = uniqid('ev_');
        // We will assign a system evaluator ID if needed, or teacher. We can use a dummy for auto.
        $stmt = $conn->prepare("INSERT INTO evaluations (id, submission_id, evaluator_id, marks_awarded, general_feedback) VALUES (?, ?, ?, ?, 'Auto-graded by System')");
        $stmt->execute([$evalId, $subId, $user_id, $totalEarned]); // using current student as sys reference for now

        $conn->commit();
        echo json_encode(["success" => true, "score" => $totalEarned]);

    } catch (PDOException $e) {
        $conn->rollBack();
        echo json_encode(["success" => false, "error" => "Submission failed: " . $e->getMessage()]);
    }
}
