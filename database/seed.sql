-- 
-- CIE2-Activity-Management-System
-- File: database/seed.sql
-- Purpose: Inserts starter mock data into schemas for testing purposes.
-- Scalability: Easily runnable on Docker containers or local database instances.
-- 

-- Insert Users
INSERT INTO users (id, username, email, password_hash, role) VALUES 
('usr-student-1', 'alexrivera', 'alex.rivera@college.edu', 'hashedpassword123', 'student'),
('usr-teacher-1', 'eleanorvance', 'eleanor.vance@college.edu', 'hashedpassword456', 'teacher'),
('usr-admin-1', 'sysadmin', 'admin@college.edu', 'hashedpassword789', 'admin')
ON CONFLICT DO NOTHING;

-- Insert Activities
INSERT INTO activities (id, title, description, activity_type, max_marks, deadline, created_by) VALUES 
('act-1', 'Data Structures Lab - Trees & Graphs', 'Implement Binary Search Trees and traversals in C++', 'lab', 20, '2026-10-24 23:59:59', 'usr-teacher-1')
ON CONFLICT DO NOTHING;

-- Insert Submissions
INSERT INTO submissions (id, activity_id, student_id, file_path, status, remarks) VALUES 
('sub-101', 'act-1', 'usr-student-1', 'uploads/submissions/sub-101.zip', 'evaluated', 'Finished traversal methods.')
ON CONFLICT DO NOTHING;

-- Insert Evaluations
INSERT INTO evaluations (id, submission_id, evaluator_id, marks_awarded, feedback) VALUES 
('eval-1', 'sub-101', 'usr-teacher-1', 18, 'Excellent structure and correct implementation.')
ON CONFLICT DO NOTHING;
