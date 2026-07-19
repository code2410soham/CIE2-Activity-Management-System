<?php
/**
 * CIE-2 Activity Tracking, Evaluation and Performance Management System
 * File: backend/api/teacher-dashboard.php
 * Purpose: Provides all real-time teacher-specific data for the dashboard.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/jwt.php';

try {
    $token = JWT::getBearerToken();
    if (!$token) {
        throw new Exception('Access denied. Authorization token missing.');
    }

    $payload = JWT::verify($token);
    if (!$payload || $payload['role'] !== 'teacher') {
        throw new Exception('Access denied. Invalid session or incorrect user role.');
    }

    $userId = $payload['id'];
    $db = getDbConnection();

    // 1. Fetch Teacher Profile details
    $profileStmt = $db->prepare('
        SELECT tp.id AS teacher_profile_id, tp.employee_id, u.username, u.email,
               dept.name AS department, tp.designation
        FROM teacher_profiles tp
        JOIN users u ON tp.user_id = u.id
        JOIN departments dept ON tp.department_id = dept.id
        WHERE tp.user_id = ? AND tp.is_deleted = 0
    ');
    $profileStmt->execute([$userId]);
    $teacher = $profileStmt->fetch();

    if (!$teacher) {
        throw new Exception('Teacher profile not found.');
    }

    // Default name fallback if not present in users
    $teacher['name'] = $teacher['username'];

    $teacherId = $teacher['teacher_profile_id'];

    // 2. Activities Created & Stats (Owned by teacher allocations)
    $activitiesStmt = $db->prepare("
        SELECT a.id, a.title, a.max_marks, a.deadline, a.status,
               t.name AS type_name, sub.name AS subject_name, sa.section
        FROM activities a
        JOIN subject_allocations sa ON a.subject_allocation_id = sa.id
        JOIN subjects sub ON sa.subject_id = sub.id
        JOIN activity_types t ON a.activity_type_id = t.id
        WHERE sa.teacher_id = ? AND a.is_deleted = 0
        ORDER BY a.created_at DESC
    ");
    $activitiesStmt->execute([$teacherId]);
    $activities = $activitiesStmt->fetchAll();

    // Fetch submissions for these activities
    $pendingEvaluations = 0;
    $publishedResults = 0;
    $totalSubmissions = 0;
    $passCount = 0;

    $activityIds = array_column($activities, 'id');
    $submissions = [];

    if (!empty($activityIds)) {
        $inQuery = implode(',', array_fill(0, count($activityIds), '?'));

        $subStmt = $db->prepare("
            SELECT s.id, s.activity_id, s.submission_status, 
                   e.id AS eval_id, e.marks_awarded
            FROM submissions s
            LEFT JOIN evaluations e ON e.submission_id = s.id AND e.is_deleted = 0
            WHERE s.activity_id IN ($inQuery) AND s.is_deleted = 0
        ");
        $subStmt->execute($activityIds);
        $allSubmissions = $subStmt->fetchAll();

        $activityLookup = [];
        foreach ($activities as $act) {
            $activityLookup[$act['id']] = $act['max_marks'];
        }

        foreach ($allSubmissions as $sub) {
            $totalSubmissions++;
            if ($sub['submission_status'] === 'submitted' || $sub['submission_status'] === 'late') {
                if (empty($sub['eval_id'])) {
                    $pendingEvaluations++;
                } else {
                    $publishedResults++;

                    // Stats / Pass-Fail Ratio
                    $max = $activityLookup[$sub['activity_id']] ?? 1;
                    $percent = ($sub['marks_awarded'] / $max) * 100;
                    if ($percent >= 40) { // 40% pass criteria
                        $passCount++;
                    }
                }
            }
        }
    }

    $passRate = $publishedResults > 0 ? round(($passCount / $publishedResults) * 100) : 0;

    echo json_encode([
        'success' => true,
        'teacher' => $teacher,
        'summary' => [
            'activities_created' => count($activities),
            'pending_evaluations' => $pendingEvaluations,
            'published_results' => $publishedResults,
            'total_submissions' => $totalSubmissions,
            'pass_rate' => $passRate
        ],
        'activities' => array_slice($activities, 0, 10), // Latest 10 for dashboard
        'server_time' => time()
    ]);

} catch (Exception $e) {
    $msg = $e->getMessage();
    if (strpos($msg, 'Access denied') !== false) {
        http_response_code(401);
    } else {
        http_response_code(400);
    }
    echo json_encode([
        'success' => false,
        'error' => $msg
    ]);
}
