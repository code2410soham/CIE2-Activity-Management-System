-- 
-- CIE2-Activity-Management-System
-- File: database/seed.sql
-- Purpose: Populates the normalized MySQL database with standard, enterprise-grade mock data.
-- Seeding: Academic structure, dynamic activity metadata, quiz configuration, submissions, and auditing.
-- Architect: Senior Database Architect
-- 

SET FOREIGN_KEY_CHECKS = 0;

-- Clean existing data
TRUNCATE TABLE audit_logs;
TRUNCATE TABLE notification_preferences;
TRUNCATE TABLE notifications;
TRUNCATE TABLE user_devices;
TRUNCATE TABLE student_lms_mappings;
TRUNCATE TABLE external_lms_integrations;
TRUNCATE TABLE student_subject_summaries;
TRUNCATE TABLE ai_analytics_insights;
TRUNCATE TABLE certificates;
TRUNCATE TABLE student_attendance;
TRUNCATE TABLE attendance_sessions;
TRUNCATE TABLE evaluation_reviews;
TRUNCATE TABLE evaluation_rubric_scores;
TRUNCATE TABLE evaluation_rubrics;
TRUNCATE TABLE evaluations;
TRUNCATE TABLE student_quiz_answers;
TRUNCATE TABLE student_quiz_attempts;
TRUNCATE TABLE submission_files;
TRUNCATE TABLE submissions;
TRUNCATE TABLE activity_quizzes;
TRUNCATE TABLE quiz_question_options;
TRUNCATE TABLE quiz_questions;
TRUNCATE TABLE quiz_banks;
TRUNCATE TABLE activity_field_values;
TRUNCATE TABLE field_definitions;
TRUNCATE TABLE activity_templates;
TRUNCATE TABLE activity_types;
TRUNCATE TABLE activities;
TRUNCATE TABLE student_course_enrollments;
TRUNCATE TABLE subject_allocations;
TRUNCATE TABLE student_profiles;
TRUNCATE TABLE teacher_profiles;
TRUNCATE TABLE users;
TRUNCATE TABLE subjects;
TRUNCATE TABLE semesters;
TRUNCATE TABLE departments;
TRUNCATE TABLE academic_years;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. Insert Academic Years
INSERT INTO academic_years (id, name, start_date, end_date, is_current) VALUES 
('ay-2025-2026', 'Academic Year 2025-2026', '2025-06-01', '2026-05-31', TRUE),
('ay-2026-2027', 'Academic Year 2026-2027', '2026-06-01', '2027-05-31', FALSE);

-- 2. Insert Departments
INSERT INTO departments (id, code, name, is_active) VALUES 
('dept-cse', 'CSE', 'Computer Science and Engineering', TRUE),
('dept-ece', 'ECE', 'Electronics and Communication Engineering', TRUE),
('dept-ise', 'ISE', 'Information Science and Engineering', TRUE);

-- 3. Insert Semesters
INSERT INTO semesters (id, academic_year_id, term, start_date, end_date, is_active) VALUES 
('sem-odd-2025', 'ay-2025-2026', 'Odd Semester 2025', '2025-06-15', '2025-11-30', TRUE),
('sem-even-2026', 'ay-2025-2026', 'Even Semester 2026', '2025-12-15', '2026-05-15', FALSE);

-- 4. Insert Subjects (Courses)
INSERT INTO subjects (id, code, name, credits, department_id) VALUES 
('sub-ds', 'CS-301', 'Data Structures and Algorithms', 4, 'dept-cse'),
('sub-dbms', 'CS-402', 'Database Management Systems', 4, 'dept-cse'),
('sub-cn', 'CS-503', 'Computer Networks', 3, 'dept-cse');

-- 5. Insert Users (Core authentication logins)
INSERT INTO users (id, username, email, password_hash, role, is_active) VALUES 
('usr-student-1', 'alexrivera', 'alex.rivera@college.edu', '$2b$10$wE99Y5YkX9e877C5ZJ4mDuS0zK4sD1Q8tJ6v0tN8aGxW4S1X', 'student', TRUE),
('usr-student-2', 'sarahconnor', 'sarah.c@college.edu', '$2b$10$wE99Y5YkX9e877C5ZJ4mDuS0zK4sD1Q8tJ6v0tN8aGxW4S1X', 'student', TRUE),
('usr-teacher-1', 'eleanorvance', 'eleanor.vance@college.edu', '$2b$10$wE99Y5YkX9e877C5ZJ4mDuS0zK4sD1Q8tJ6v0tN8aGxW4S1X', 'teacher', TRUE),
('usr-teacher-2', 'marcuswright', 'marcus.w@college.edu', '$2b$10$wE99Y5YkX9e877C5ZJ4mDuS0zK4sD1Q8tJ6v0tN8aGxW4S1X', 'teacher', TRUE),
('usr-admin-1', 'sysadmin', 'admin@college.edu', '$2b$10$wE99Y5YkX9e877C5ZJ4mDuS0zK4sD1Q8tJ6v0tN8aGxW4S1X', 'admin', TRUE);

-- 6. Insert Teacher Profiles
INSERT INTO teacher_profiles (id, user_id, employee_id, department_id, designation) VALUES 
('prof-eleanor', 'usr-teacher-1', 'EMP-CSE-001', 'dept-cse', 'Assistant Professor'),
('prof-marcus', 'usr-teacher-2', 'EMP-CSE-002', 'dept-cse', 'Associate Professor');

-- 7. Insert Student Profiles
INSERT INTO student_profiles (id, user_id, usn, department_id, current_semester_id, admission_year, section) VALUES 
('stud-alex', 'usr-student-1', '2GI23CS001', 'dept-cse', 'sem-odd-2025', '2023', 'A'),
('stud-sarah', 'usr-student-2', '2GI23CS002', 'dept-cse', 'sem-odd-2025', '2023', 'B');

-- 8. Insert Subject Allocations (Co-ordinates Teacher -> Course offering -> Section)
INSERT INTO subject_allocations (id, subject_id, semester_id, teacher_id, section) VALUES 
('alloc-ds-a', 'sub-ds', 'sem-odd-2025', 'prof-eleanor', 'A'),
('alloc-dbms-a', 'sub-dbms', 'sem-odd-2025', 'prof-marcus', 'A'),
('alloc-dbms-b', 'sub-dbms', 'sem-odd-2025', 'prof-marcus', 'B');

-- 9. Insert Student Enrollment in offering
INSERT INTO student_course_enrollments (id, student_id, subject_allocation_id) VALUES 
('enroll-1', 'stud-alex', 'alloc-ds-a'),
('enroll-2', 'stud-alex', 'alloc-dbms-a'),
('enroll-3', 'stud-sarah', 'alloc-dbms-b');

-- 10. Insert Activity Types
INSERT INTO activity_types (id, name, code, description) VALUES 
('type-lab', 'Laboratory Exercise', 'LAB', 'Practical programming/laboratory exercises with toolchains'),
('type-quiz', 'Multiple Choice Quiz', 'QUIZ', 'Interactive MCQ assessments via quiz module'),
('type-proj', 'Mini Project', 'PROJECT', 'Group projects with milestones, documentation, and source code repositories');

-- 11. Insert Activity Templates
INSERT INTO activity_templates (id, activity_type_id, name, description) VALUES 
('tmpl-cpp-lab', 'type-lab', 'C++ Programming Lab Spec', 'Template for evaluation on C++ based labs'),
('tmpl-auto-quiz', 'type-quiz', 'Auto-graded Standard MCQ Quiz', 'Template config for online quiz assessments');

-- 12. Insert Dynamic Field Definitions
INSERT INTO field_definitions (id, activity_type_id, template_id, field_name, field_label, field_type, is_required, default_value, validation_rules) VALUES 
-- Fields for Labs
('fld-prog-lang', 'type-lab', 'tmpl-cpp-lab', 'programming_language', 'Programming Language', 'STRING', TRUE, 'C++', '{"allowed": ["C++", "Python", "Java"]}'),
('fld-git-req', 'type-lab', 'tmpl-cpp-lab', 'github_repo_required', 'GitHub Repository Required', 'BOOLEAN', TRUE, 'true', NULL),
('fld-compiler', 'type-lab', 'tmpl-cpp-lab', 'compiler_specs', 'Compiler Specifications', 'STRING', FALSE, 'g++ 11.2', NULL),
-- Fields for Quizzes
('fld-time-limit', 'type-quiz', 'tmpl-auto-quiz', 'time_limit_mins', 'Quiz Time Limit (Minutes)', 'NUMBER', TRUE, '30', '{"min": 1, "max": 180}'),
('fld-shuffle', 'type-quiz', 'tmpl-auto-quiz', 'shuffle_questions', 'Shuffle Questions', 'BOOLEAN', TRUE, 'true', NULL);

-- 13. Insert Activities (Core configurations)
INSERT INTO activities (id, subject_allocation_id, activity_type_id, title, description, max_marks, weightage, deadline, status) VALUES 
('act-cpp-bst', 'alloc-ds-a', 'type-lab', 'BST Insertion & Traversal', 'Implement Binary Search Trees insertions, deletions, and standard DFS/BFS traversals in C++.', 20.00, 10.00, '2026-10-24 23:59:59', 'published'),
('act-dbms-mcq', 'alloc-dbms-a', 'type-quiz', 'DBMS Relational Algebra Quiz', 'Self-evaluation quiz assessing SQL & relational calculus.', 10.00, 5.00, '2026-10-26 23:59:59', 'published');

-- 14. Insert Activity Dynamic Field Values (EAV configuration mapping)
INSERT INTO activity_field_values (id, activity_id, field_definition_id, value_text, value_json) VALUES 
-- BST Lab configurations
('val-1', 'act-cpp-bst', 'fld-prog-lang', 'C++', NULL),
('val-2', 'act-cpp-bst', 'fld-git-req', 'true', NULL),
('val-3', 'act-cpp-bst', 'fld-compiler', 'g++ 12.1', NULL),
-- Database Quiz configurations
('val-4', 'act-dbms-mcq', 'fld-time-limit', '45', NULL),
('val-5', 'act-dbms-mcq', 'fld-shuffle', 'true', NULL);

-- 15. Setup Quiz Bank for DBMS Course
INSERT INTO quiz_banks (id, subject_id, title, description, created_by) VALUES 
('qb-dbms-relational', 'sub-dbms', 'DBMS Relational Algebra Pool', 'Standard MCQs on joins, projections, divisions and calculus.', 'prof-marcus');

-- 16. Insert Quiz Questions
INSERT INTO quiz_questions (id, quiz_bank_id, question_text, question_type, points, explanation) VALUES 
('qq-1', 'qb-dbms-relational', 'Which operator in relational algebra is used to filter rows based on a condition?', 'mcq', 1.00, 'The selection operator (sigma) extracts rows matching predicates.'),
('qq-2', 'qb-dbms-relational', 'Which join returns all rows from the left table and matched rows from the right table?', 'mcq', 1.00, 'Left Outer join returns all tuples from the left relation, adding NULLs where the right relation does not match.');

-- 17. Insert Options for Questions
INSERT INTO quiz_question_options (id, question_id, option_text, is_correct, sort_order) VALUES 
('qo-1a', 'qq-1', 'Projection (pi)', FALSE, 1),
('qo-1b', 'qq-1', 'Selection (sigma)', TRUE, 2),
('qo-1c', 'qq-1', 'Rename (rho)', FALSE, 3),
('qo-1d', 'qq-1', 'Join (bowtie)', FALSE, 4),

('qo-2a', 'qq-2', 'Inner Join', FALSE, 1),
('qo-2b', 'qq-2', 'Right Outer Join', FALSE, 2),
('qo-2c', 'qq-2', 'Left Outer Join', TRUE, 3),
('qo-2d', 'qq-2', 'Full Outer Join', FALSE, 4);

-- 18. Map Quiz Questions to DBMS Quiz Activity
INSERT INTO activity_quizzes (activity_id, question_id, sort_order) VALUES 
('act-dbms-mcq', 'qq-1', 1),
('act-dbms-mcq', 'qq-2', 2);

-- 19. Insert Submissions
INSERT INTO submissions (id, activity_id, student_id, submission_status, submitted_at) VALUES 
('sub-1', 'act-cpp-bst', 'stud-alex', 'submitted', '2026-10-23 14:32:00'),
('sub-2', 'act-dbms-mcq', 'stud-alex', 'submitted', '2026-10-24 10:15:00');

-- 20. Insert Submission Files (Lab files)
INSERT INTO submission_files (id, submission_id, file_path, file_name, file_size, mime_type) VALUES 
('sf-1', 'sub-1', '/uploads/submissions/stud-alex/bst_traversal.val', 'bst_traversal.cpp', 4120, 'text/x-c++src');

-- 21. Insert Quiz Attempts Details
INSERT INTO student_quiz_attempts (id, submission_id, started_at, completed_at, earned_score) VALUES 
('att-1', 'sub-2', '2026-10-24 10:00:00', '2026-10-24 10:15:00', 2.00);

-- 22. Inset Students Quiz Answers
INSERT INTO student_quiz_answers (id, attempt_id, question_id, selected_option_id, text_answer, is_correct, marks_awarded) VALUES 
('ans-1', 'att-1', 'qq-1', 'qo-1b', NULL, TRUE, 1.00),
('ans-2', 'att-1', 'qq-2', 'qo-2c', NULL, TRUE, 1.00);

-- 23. Insert Evaluations (Grading by teacher)
INSERT INTO evaluations (id, submission_id, evaluator_id, marks_awarded, general_feedback) VALUES 
('eval-bst', 'sub-1', 'usr-teacher-1', 18.50, 'Excellent recursive traversals. Great complexity analysis.');

-- 24. Setup Rubrics for Lab activity
INSERT INTO evaluation_rubrics (id, activity_id, criterion_name, max_marks, weight, description) VALUES 
('rub-bst-correctness', 'act-cpp-bst', 'Logic correctness', 10.00, 1.00, 'Passes all primary edge test cases on tree values'),
('rub-bst-codequality', 'act-cpp-bst', 'Adhering to Style Guides', 5.00, 1.00, 'Appropriate variable naming, indentations, and helper methods'),
('rub-bst-documentation', 'act-cpp-bst', 'ReadMe Document & Specs', 5.00, 1.00, 'Valid compiler setup instructions provided in text');

-- 25. Seeding rubric subscores
INSERT INTO evaluation_rubric_scores (id, evaluation_id, rubric_id, marks_awarded, feedback) VALUES 
('ers-val-1', 'eval-bst', 'rub-bst-correctness', 10.00, 'All assertions compiled and passed successfully.'),
('ers-val-2', 'eval-bst', 'rub-bst-codequality', 4.50, 'Outstanding formatting, minor redundant functions.'),
('ers-val-3', 'eval-bst', 'rub-bst-documentation', 4.00, 'Short readme, instructions could explain code arguments better.');

-- 26. Insert Peer Review/AI Grading Details
INSERT INTO evaluation_reviews (id, submission_id, reviewer_type, reviewer_id, marks_awarded, rubric_scores, comments) VALUES 
('rev-ai-bst', 'sub-1', 'ai', NULL, 19.00, '{"correctness": 10, "readability": 9}', 'Automated system checked tree pointer sanity. Compilation clean.');

-- 27. Insert Attendance Sessions & Records
INSERT INTO attendance_sessions (id, subject_allocation_id, session_date, start_time, end_time, units) VALUES 
('att-sess-1', 'alloc-ds-a', '2026-07-10', '09:00:00', '10:00:00', 1);

INSERT INTO student_attendance (id, session_id, student_id, status, remarks) VALUES 
('sa-rec-1', 'att-sess-1', 'stud-alex', 'present', 'Came on time');

-- 28. Seeding pre-calculated student performance reports (cached aggregates)
INSERT INTO student_subject_summaries (student_id, subject_allocation_id, total_activities, completed_activities, total_marks_possible, total_marks_earned, average_percentage) VALUES 
('stud-alex', 'alloc-ds-a', 1, 1, 20.00, 18.50, 92.50),
('stud-alex', 'alloc-dbms-a', 1, 1, 10.00, 2.00, 20.00);

-- 29. Insert AI alerts predictive insight
INSERT INTO ai_analytics_insights (id, student_id, subject_id, insight_type, confidence_score, insight_details) VALUES 
('ai-in-1', 'stud-alex', 'sub-dbms', 'PERFORMANCE_CRITICAL', 0.915, '{"reason": "Low scores in relational algebra basics. High risk of poor mid-sem performance.", "actions": ["Assigned review material on Joins", "Suggest counselor meet-up"]}');

-- 30. Seeding Notifications
INSERT INTO notifications (id, recipient_id, sender_id, title, message, notification_type, is_read, link_url) VALUES 
('notif-1', 'usr-student-1', 'usr-teacher-1', 'Activity BST Graded', 'Your submission for BST Insertion has been reviewed by your professor.', 'GRADE_PUBLISHED', FALSE, '/dashboard/activities/act-cpp-bst/grade');

-- 31. Seed Audit log
INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent) VALUES 
('usr-teacher-1', 'INSERT', 'evaluations', 'eval-bst', NULL, '{"marks_awarded": 18.5, "feedback": "Excellent recursive traversals."}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0');
