-- ============================================================
-- CIE2-Activity-Management-System
-- File: database/ise_enrollment_patch.sql
-- Purpose: Creates ISE department subjects, teachers, allocations,
--          and enrollments so that ISE students (125UIT...) have
--          real dashboard data.
-- Run AFTER: schema.sql, seed.sql, students_seed.sql
-- Usage: SOURCE ise_enrollment_patch.sql; (in phpMyAdmin or MySQL CLI)
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Ensure dept-ise exists (from seed.sql) — no insert needed

-- 2. Add ISE subjects
INSERT IGNORE INTO subjects (id, code, name, credits, department_id) VALUES
('sub-ise-dbms',   'IS-301', 'Database Management Systems',        4, 'dept-ise'),
('sub-ise-os',     'IS-302', 'Operating Systems',                   3, 'dept-ise'),
('sub-ise-cn',     'IS-401', 'Computer Networks',                   3, 'dept-ise'),
('sub-ise-se',     'IS-402', 'Software Engineering',                4, 'dept-ise');

-- 3. Add ISE teacher users (if not already present)
INSERT IGNORE INTO users (id, username, email, password_hash, role, is_active) VALUES
('usr-teacher-ise-1', 'prof.kiran', 'kiran.ise@college.edu', '$2b$10$wE99Y5YkX9e877C5ZJ4mDuS0zK4sD1Q8tJ6v0tN8aGxW4S1X', 'teacher', TRUE),
('usr-teacher-ise-2', 'prof.anjali', 'anjali.ise@college.edu', '$2b$10$wE99Y5YkX9e877C5ZJ4mDuS0zK4sD1Q8tJ6v0tN8aGxW4S1X', 'teacher', TRUE);

-- 4. Add ISE teacher profiles
INSERT IGNORE INTO teacher_profiles (id, user_id, employee_id, department_id, designation, name) VALUES
('prof-kiran',  'usr-teacher-ise-1', 'EMP-ISE-001', 'dept-ise', 'Assistant Professor', 'Kiran Patil'),
('prof-anjali', 'usr-teacher-ise-2', 'EMP-ISE-002', 'dept-ise', 'Associate Professor', 'Anjali Sharma');

-- 5. Add subject allocations for ISE (Odd Semester 2025)
INSERT IGNORE INTO subject_allocations (id, subject_id, semester_id, teacher_id, section) VALUES
('alloc-ise-dbms-a', 'sub-ise-dbms', 'sem-odd-2025', 'prof-kiran',  'A'),
('alloc-ise-os-a',   'sub-ise-os',   'sem-odd-2025', 'prof-kiran',  'A'),
('alloc-ise-cn-b',   'sub-ise-cn',   'sem-odd-2025', 'prof-anjali', 'B'),
('alloc-ise-se-b',   'sub-ise-se',   'sem-odd-2025', 'prof-anjali', 'B');

-- 6. Add activity types (safe IGNORE)
INSERT IGNORE INTO activity_types (id, name, code, description) VALUES
('type-lab',  'Laboratory Exercise', 'LAB',     'Practical programming/laboratory exercises'),
('type-quiz', 'Multiple Choice Quiz','QUIZ',    'Interactive MCQ assessments'),
('type-proj', 'Mini Project',        'PROJECT', 'Group projects with milestones');

-- 7. Add sample ISE activities
INSERT IGNORE INTO activities (id, subject_allocation_id, activity_type_id, title, description, max_marks, weightage, deadline, status) VALUES
('act-ise-dbms-1', 'alloc-ise-dbms-a', 'type-lab',  'ER Diagram Design Lab',           'Design and implement ER diagrams for a college ERP system.', 20.00, 10.00, '2026-11-10 23:59:59', 'published'),
('act-ise-dbms-2', 'alloc-ise-dbms-a', 'type-quiz', 'DBMS Normalization Quiz',         'MCQ quiz on 1NF, 2NF, 3NF and BCNF.',                        10.00,  5.00, '2026-11-20 23:59:59', 'published'),
('act-ise-os-1',   'alloc-ise-os-a',   'type-lab',  'Process Scheduling Simulation',   'Implement FCFS, SJF and Round Robin algorithms in C.',        20.00, 10.00, '2026-11-30 23:59:59', 'published'),
('act-ise-cn-1',   'alloc-ise-cn-b',   'type-lab',  'Socket Programming Lab',          'Build a simple TCP/UDP client-server in Python.',             20.00, 10.00, '2026-12-05 23:59:59', 'published'),
('act-ise-se-1',   'alloc-ise-se-b',   'type-proj', 'Software Requirements Document',  'Write a complete SRS for any management system.',             30.00, 15.00, '2026-12-15 23:59:59', 'published');

-- 8. Enroll ALL section A students in ISE DBMS-A and OS-A
INSERT IGNORE INTO student_course_enrollments (id, student_id, subject_allocation_id)
SELECT CONCAT('enroll-a-dbms-', sp.id), sp.id, 'alloc-ise-dbms-a'
FROM student_profiles sp
WHERE sp.section = 'A' AND sp.department_id = 'dept-ise' AND sp.is_deleted = 0;

INSERT IGNORE INTO student_course_enrollments (id, student_id, subject_allocation_id)
SELECT CONCAT('enroll-a-os-', sp.id), sp.id, 'alloc-ise-os-a'
FROM student_profiles sp
WHERE sp.section = 'A' AND sp.department_id = 'dept-ise' AND sp.is_deleted = 0;

-- 9. Enroll ALL section B students in ISE CN-B and SE-B
INSERT IGNORE INTO student_course_enrollments (id, student_id, subject_allocation_id)
SELECT CONCAT('enroll-b-cn-', sp.id), sp.id, 'alloc-ise-cn-b'
FROM student_profiles sp
WHERE sp.section = 'B' AND sp.department_id = 'dept-ise' AND sp.is_deleted = 0;

INSERT IGNORE INTO student_course_enrollments (id, student_id, subject_allocation_id)
SELECT CONCAT('enroll-b-se-', sp.id), sp.id, 'alloc-ise-se-b'
FROM student_profiles sp
WHERE sp.section = 'B' AND sp.department_id = 'dept-ise' AND sp.is_deleted = 0;

-- 10. Add a sample submission + evaluation for 125UIT1103 (ISHARI SHAMRAO ADE) as demo
INSERT IGNORE INTO submissions (id, activity_id, student_id, submission_status, submitted_at) VALUES
('sub-ise-demo-1', 'act-ise-dbms-1', 'stud-prof-125UIT1103', 'submitted', '2026-11-08 16:45:00');

INSERT IGNORE INTO evaluations (id, submission_id, evaluator_id, marks_awarded, general_feedback) VALUES
('eval-ise-demo-1', 'sub-ise-demo-1', 'usr-teacher-ise-1', 17.50, 'Good ER diagram structure. Cardinality needs more detail.');

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- Run this query to verify enrollment counts:
-- SELECT sp.name, COUNT(sce.id) AS enrolled_subjects
-- FROM student_profiles sp
-- LEFT JOIN student_course_enrollments sce ON sce.student_id = sp.id
-- WHERE sp.department_id = 'dept-ise'
-- GROUP BY sp.id, sp.name
-- LIMIT 10;
-- ============================================================
