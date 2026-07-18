-- 
-- CIE2-Activity-Management-System
-- File: database/data_integrity_checks.sql
-- Purpose: Diagnostic SQL queries to verify referential integrity, check constraints, and flag data anomalies.
-- 

-- 1. Detetct Student Profiles with missing users (Orphaned records)
SELECT sp.id, sp.usn, sp.user_id 
FROM student_profiles sp
LEFT JOIN users u ON sp.user_id = u.id
WHERE u.id IS NULL;

-- 2. Detect Duplicate Course Enrollments (same student, same subject allocation)
SELECT student_id, subject_allocation_id, COUNT(*) as enrollment_count
FROM student_course_enrollments
GROUP BY student_id, subject_allocation_id
HAVING enrollment_count > 1;

-- 3. Detect Out-of-Bounds Evaluation Marks (marks_awarded > max_marks)
SELECT e.id AS evaluation_id, e.submission_id, e.marks_awarded, a.title AS activity_title, a.max_marks
FROM evaluations e
JOIN submissions s ON e.submission_id = s.id
JOIN activities a ON s.activity_id = a.id
WHERE e.marks_awarded > a.max_marks;

-- 4. Detect Orphaned Submissions (missing activity or student profile)
SELECT s.id, s.activity_id, s.student_id 
FROM submissions s
LEFT JOIN activities a ON s.activity_id = a.id
LEFT JOIN student_profiles sp ON s.student_id = sp.id
WHERE a.id IS NULL OR sp.id IS NULL;

-- 5. Detect Non-Bcrypt/Truncated Password Hashes (Standard bcrypt is exactly 60 chars)
SELECT id, username, role, LENGTH(password_hash) AS hash_length 
FROM users 
WHERE LENGTH(password_hash) != 60 OR password_hash NOT LIKE '$2%';
