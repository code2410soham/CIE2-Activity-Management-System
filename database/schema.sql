-- 
-- CIE2-Activity-Management-System
-- File: database/schema.sql
-- Purpose: Defines tables, relationships, integrity constraints, and indexes for CIE-2 tracking.
-- Scalability: Designed with relational schema norms and indexes for fast queries.
-- 

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activities (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('lab', 'quiz', 'exam')),
    max_marks INT NOT NULL CHECK (max_marks > 0),
    deadline TIMESTAMP NOT NULL,
    created_by VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS submissions (
    id VARCHAR(50) PRIMARY KEY,
    activity_id VARCHAR(50) REFERENCES activities(id) ON DELETE CASCADE,
    student_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    file_path VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'evaluated')),
    remarks TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quizzes (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quiz_questions (
    id VARCHAR(50) PRIMARY KEY,
    quiz_id VARCHAR(50) REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options JSON NOT NULL,
    correct_option_index INT NOT NULL CHECK (correct_option_index >= 0)
);

CREATE TABLE IF NOT EXISTS evaluations (
    id VARCHAR(50) PRIMARY KEY,
    submission_id VARCHAR(50) UNIQUE REFERENCES submissions(id) ON DELETE CASCADE,
    evaluator_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    marks_awarded INT NOT NULL CHECK (marks_awarded >= 0),
    feedback TEXT,
    evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analytics_logs (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index creation for search optimizations
CREATE INDEX idx_submissions_student ON submissions(student_id);
CREATE INDEX idx_submissions_activity ON submissions(activity_id);
CREATE INDEX idx_evaluations_submission ON evaluations(submission_id);
