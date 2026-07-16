<?php
/**
 * CIE-2 Activity Tracking, Evaluation and Performance Management System
 * File: backend/api/enroll_all.php
 * Purpose: Enrolls all students into course subject allocations to display items dynmically.
 */

require_once __DIR__ . '/db.php';

try {
    $db = getDbConnection();

    // Disable FK checks to truncate safely
    $db->exec("SET FOREIGN_KEY_CHECKS = 0;");
    $db->exec("TRUNCATE TABLE student_course_enrollments;");
    $db->exec("SET FOREIGN_KEY_CHECKS = 1;");

    $students = $db->query("SELECT * FROM student_profiles")->fetchAll();

    $stmt = $db->prepare("INSERT INTO student_course_enrollments (id, student_id, subject_allocation_id) VALUES (?, ?, ?)");

    $count = 0;
    foreach ($students as $student) {
        $id = $student['id'];
        $section = trim($student['section']);

        if ($section === 'A') {
            // Enroll in alloc-ds-a and alloc-dbms-a
            $stmt->execute(["enr-{$id}-ds-a", $id, 'alloc-ds-a']);
            $stmt->execute(["enr-{$id}-dbms-a", $id, 'alloc-dbms-a']);
            $count += 2;
        } else {
            // Section B, enroll in alloc-dbms-b
            $stmt->execute(["enr-{$id}-dbms-b", $id, 'alloc-dbms-b']);
            $count += 1;
        }
    }

    echo "Successfully enrolled students: $count enrollments created.\n";

} catch (Exception $e) {
    echo "Error enrolling: " . $e->getMessage() . "\n";
}
