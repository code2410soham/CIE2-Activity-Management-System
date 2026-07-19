-- 
-- CIE2-Activity-Management-System
-- File: database/schema.sql
-- Purpose: Defines enterprise-grade, fully normalized (3NF+) MySQL database schema.
-- Architect: Senior Database Architect
-- Designed for: Scalability, Performance, Integrity, and Extensibility (Dynamic Metadata System)
-- 

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Academic Years
DROP TABLE IF EXISTS academic_years;
CREATE TABLE academic_years (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP NOT NULL DEFAULT '1980-01-01 00:00:01',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY idx_ay_name_del (name, deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Departments
DROP TABLE IF EXISTS departments;
CREATE TABLE departments (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(20) NOT NULL,
    name VARCHAR(150) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP NOT NULL DEFAULT '1980-01-01 00:00:01',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY idx_dept_code_del (code, deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Semesters
DROP TABLE IF EXISTS semesters;
CREATE TABLE semesters (
    id VARCHAR(50) PRIMARY KEY,
    academic_year_id VARCHAR(50) NOT NULL,
    term VARCHAR(50) NOT NULL, -- e.g., 'Odd', 'Even', 'Summer'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP NOT NULL DEFAULT '1980-01-01 00:00:01',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_sem_academic_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE RESTRICT,
    UNIQUE KEY idx_sem_term_del (academic_year_id, term, deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Subjects
DROP TABLE IF EXISTS subjects;
CREATE TABLE subjects (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(20) NOT NULL,
    name VARCHAR(150) NOT NULL,
    credits INT NOT NULL CHECK (credits > 0),
    department_id VARCHAR(50) NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP NOT NULL DEFAULT '1980-01-01 00:00:01',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_subject_dept FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
    UNIQUE KEY idx_sub_code_del (code, deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Users
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP NOT NULL DEFAULT '1980-01-01 00:00:01',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY idx_user_username_del (username, deleted_at),
    UNIQUE KEY idx_user_email_del (email, deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Teacher Profiles
DROP TABLE IF EXISTS teacher_profiles;
CREATE TABLE teacher_profiles (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NULL,
    employee_id VARCHAR(50) NOT NULL,
    department_id VARCHAR(50) NOT NULL,
    designation VARCHAR(100) DEFAULT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP NOT NULL DEFAULT '1980-01-01 00:00:01',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_teacher_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_teacher_dept FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
    UNIQUE KEY idx_teacher_emp_del (employee_id, deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Student Profiles
DROP TABLE IF EXISTS student_profiles;
CREATE TABLE student_profiles (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NULL,
    usn VARCHAR(50) NOT NULL, -- University Seat Number (Unique Roll Number)
    department_id VARCHAR(50) NOT NULL,
    current_semester_id VARCHAR(50) NOT NULL,
    admission_year VARCHAR(10) NOT NULL,
    section VARCHAR(5) NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP NOT NULL DEFAULT '1980-01-01 00:00:01',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_student_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_student_dept FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
    CONSTRAINT fk_student_sem FOREIGN KEY (current_semester_id) REFERENCES semesters(id) ON DELETE RESTRICT,
    UNIQUE KEY idx_student_usn_del (usn, deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Subject Allocations
DROP TABLE IF EXISTS subject_allocations;
CREATE TABLE subject_allocations (
    id VARCHAR(50) PRIMARY KEY,
    subject_id VARCHAR(50) NOT NULL,
    semester_id VARCHAR(50) NOT NULL,
    teacher_id VARCHAR(50) NOT NULL,
    section VARCHAR(5) NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP NOT NULL DEFAULT '1980-01-01 00:00:01',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_alloc_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE RESTRICT,
    CONSTRAINT fk_alloc_sem FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE RESTRICT,
    CONSTRAINT fk_alloc_teacher FOREIGN KEY (teacher_id) REFERENCES teacher_profiles(id) ON DELETE RESTRICT,
    UNIQUE KEY idx_alloc_details_del (subject_id, semester_id, teacher_id, section, deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Student Course Enrollments
DROP TABLE IF EXISTS student_course_enrollments;
CREATE TABLE student_course_enrollments (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    subject_allocation_id VARCHAR(50) NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_enroll_student FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_enroll_alloc FOREIGN KEY (subject_allocation_id) REFERENCES subject_allocations(id) ON DELETE CASCADE,
    UNIQUE KEY idx_enroll_student_alloc (student_id, subject_allocation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Activity Types
DROP TABLE IF EXISTS activity_types;
CREATE TABLE activity_types (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    code VARCHAR(50) NOT NULL, -- e.g. 'LAB', 'QUIZ', 'PROJECT', 'EXAM'
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP NOT NULL DEFAULT '1980-01-01 00:00:01',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY idx_act_type_code_del (code, deleted_at),
    UNIQUE KEY idx_act_type_name_del (name, deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Activity Templates
DROP TABLE IF EXISTS activity_templates;
CREATE TABLE activity_templates (
    id VARCHAR(50) PRIMARY KEY,
    activity_type_id VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP NOT NULL DEFAULT '1980-01-01 00:00:01',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_template_act_type FOREIGN KEY (activity_type_id) REFERENCES activity_types(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Dynamic Custom Field Definitions (EAV Model)
DROP TABLE IF EXISTS field_definitions;
CREATE TABLE field_definitions (
    id VARCHAR(50) PRIMARY KEY,
    activity_type_id VARCHAR(50) NOT NULL,
    template_id VARCHAR(50) DEFAULT NULL,
    field_name VARCHAR(100) NOT NULL, -- e.g. 'github_repo_required', 'quiz_time_limit'
    field_label VARCHAR(150) NOT NULL,
    field_type VARCHAR(50) NOT NULL CHECK (field_type IN ('STRING', 'NUMBER', 'BOOLEAN', 'TEXT', 'JSON', 'DATE', 'FILE')),
    is_required BOOLEAN DEFAULT FALSE,
    default_value TEXT DEFAULT NULL,
    validation_rules JSON DEFAULT NULL, -- regex patterns, size limits, format checks
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP NOT NULL DEFAULT '1980-01-01 00:00:01',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_field_def_act_type FOREIGN KEY (activity_type_id) REFERENCES activity_types(id) ON DELETE CASCADE,
    CONSTRAINT fk_field_def_tmpl FOREIGN KEY (template_id) REFERENCES activity_templates(id) ON DELETE SET NULL,
    UNIQUE KEY idx_field_name_act_type_del (activity_type_id, field_name, deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Activities Table (Stores core activity configurations)
DROP TABLE IF EXISTS activities;
CREATE TABLE activities (
    id VARCHAR(50) PRIMARY KEY,
    subject_allocation_id VARCHAR(50) NOT NULL,
    activity_type_id VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    max_marks DECIMAL(5,2) NOT NULL CHECK (max_marks >= 0),
    weightage DECIMAL(5,2) NOT NULL CHECK (weightage >= 0), -- CIE component weight
    deadline TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed')),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP NOT NULL DEFAULT '1980-01-01 00:00:01',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_activity_allocation FOREIGN KEY (subject_allocation_id) REFERENCES subject_allocations(id) ON DELETE RESTRICT,
    CONSTRAINT fk_activity_type FOREIGN KEY (activity_type_id) REFERENCES activity_types(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Activity Dynamic Field Values (EAV Values mapping to Activities)
DROP TABLE IF EXISTS activity_field_values;
CREATE TABLE activity_field_values (
    id VARCHAR(50) PRIMARY KEY,
    activity_id VARCHAR(50) NOT NULL,
    field_definition_id VARCHAR(50) NOT NULL,
    value_text TEXT DEFAULT NULL,
    value_json JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_val_activity FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
    CONSTRAINT fk_val_field_def FOREIGN KEY (field_definition_id) REFERENCES field_definitions(id) ON DELETE RESTRICT,
    UNIQUE KEY idx_act_field_unique (activity_id, field_definition_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Activity Version History (Compliance and change audits)
DROP TABLE IF EXISTS activity_versions;
CREATE TABLE activity_versions (
    id VARCHAR(50) PRIMARY KEY,
    activity_id VARCHAR(50) NOT NULL,
    version_number INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    max_marks DECIMAL(5,2) NOT NULL,
    deadline TIMESTAMP NOT NULL,
    changed_by VARCHAR(50) NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ver_activity FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
    CONSTRAINT fk_ver_user FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. Quiz Banks (Groups questions conceptually per subject)
DROP TABLE IF EXISTS quiz_banks;
CREATE TABLE quiz_banks (
    id VARCHAR(50) PRIMARY KEY,
    subject_id VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT DEFAULT NULL,
    created_by VARCHAR(50) NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP NOT NULL DEFAULT '1980-01-01 00:00:01',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_qb_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    CONSTRAINT fk_qb_teacher FOREIGN KEY (created_by) REFERENCES teacher_profiles(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. Quiz Questions
DROP TABLE IF EXISTS quiz_questions;
CREATE TABLE quiz_questions (
    id VARCHAR(50) PRIMARY KEY,
    quiz_bank_id VARCHAR(50) NOT NULL,
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) NOT NULL DEFAULT 'mcq' CHECK (question_type IN ('mcq', 'msq', 'true_false', 'short_answer')),
    points DECIMAL(4,2) NOT NULL DEFAULT 1.00,
    explanation TEXT DEFAULT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP NOT NULL DEFAULT '1980-01-01 00:00:01',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_qq_bank FOREIGN KEY (quiz_bank_id) REFERENCES quiz_banks(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. Quiz Question Options
DROP TABLE IF EXISTS quiz_question_options;
CREATE TABLE quiz_question_options (
    id VARCHAR(50) PRIMARY KEY,
    question_id VARCHAR(50) NOT NULL,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_qo_question FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. Activity Quiz Mappings (Questions included in a specific activity)
DROP TABLE IF EXISTS activity_quizzes;
CREATE TABLE activity_quizzes (
    activity_id VARCHAR(50) NOT NULL,
    question_id VARCHAR(50) NOT NULL,
    sort_order INT DEFAULT 0,
    PRIMARY KEY (activity_id, question_id),
    CONSTRAINT fk_aq_activity FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
    CONSTRAINT fk_aq_question FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 20. Submissions (General wrapper for student deliverables)
DROP TABLE IF EXISTS submissions;
CREATE TABLE submissions (
    id VARCHAR(50) PRIMARY KEY,
    activity_id VARCHAR(50) NOT NULL,
    student_id VARCHAR(50) NOT NULL,
    submission_status VARCHAR(20) NOT NULL DEFAULT 'submitted' CHECK (submission_status IN ('draft', 'submitted', 'late', 'failed')),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP NOT NULL DEFAULT '1980-01-01 00:00:01',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_sub_activity FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
    CONSTRAINT fk_sub_student FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    UNIQUE KEY idx_sub_student_act_del (activity_id, student_id, deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 21. Submission Files (For file uploads, attachments, lab files)
DROP TABLE IF EXISTS submission_files;
CREATE TABLE submission_files (
    id VARCHAR(50) PRIMARY KEY,
    submission_id VARCHAR(50) NOT NULL,
    file_path VARCHAR(512) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sf_submission FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 22. Student Quiz Attempts
DROP TABLE IF EXISTS student_quiz_attempts;
CREATE TABLE student_quiz_attempts (
    id VARCHAR(50) PRIMARY KEY,
    submission_id VARCHAR(50) NOT NULL UNIQUE,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL DEFAULT NULL,
    earned_score DECIMAL(5,2) DEFAULT NULL,
    CONSTRAINT fk_sqa_submission FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 23. Student Quiz Answers
DROP TABLE IF EXISTS student_quiz_answers;
CREATE TABLE student_quiz_answers (
    id VARCHAR(50) PRIMARY KEY,
    attempt_id VARCHAR(50) NOT NULL,
    question_id VARCHAR(50) NOT NULL,
    selected_option_id VARCHAR(50) DEFAULT NULL,
    text_answer TEXT DEFAULT NULL,
    is_correct BOOLEAN DEFAULT NULL,
    marks_awarded DECIMAL(5,2) DEFAULT NULL,
    CONSTRAINT fk_sqans_attempt FOREIGN KEY (attempt_id) REFERENCES student_quiz_attempts(id) ON DELETE CASCADE,
    CONSTRAINT fk_sqans_question FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE RESTRICT,
    CONSTRAINT fk_sqans_option FOREIGN KEY (selected_option_id) REFERENCES quiz_question_options(id) ON DELETE SET NULL,
    UNIQUE KEY idx_sqans_attempt_question (attempt_id, question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 24. Submission Versions (Tracks history of code/files uploads)
DROP TABLE IF EXISTS submission_versions;
CREATE TABLE submission_versions (
    id VARCHAR(50) PRIMARY KEY,
    submission_id VARCHAR(50) NOT NULL,
    version_number INT NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL,
    metadata JSON DEFAULT NULL,
    CONSTRAINT fk_subver_submission FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 25. Evaluations Table (Grade tracking)
DROP TABLE IF EXISTS evaluations;
CREATE TABLE evaluations (
    id VARCHAR(50) PRIMARY KEY,
    submission_id VARCHAR(50) NOT NULL UNIQUE,
    evaluator_id VARCHAR(50) NOT NULL,
    marks_awarded DECIMAL(5,2) NOT NULL CHECK (marks_awarded >= 0),
    general_feedback TEXT DEFAULT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP NOT NULL DEFAULT '1980-01-01 00:00:01',
    evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_eval_submission FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
    CONSTRAINT fk_eval_evaluator FOREIGN KEY (evaluator_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 26. Evaluation Rubrics (Custom evaluation structures associated with Activities)
DROP TABLE IF EXISTS evaluation_rubrics;
CREATE TABLE evaluation_rubrics (
    id VARCHAR(50) PRIMARY KEY,
    activity_id VARCHAR(50) NOT NULL,
    criterion_name VARCHAR(150) NOT NULL,
    max_marks DECIMAL(5,2) NOT NULL CHECK (max_marks >= 0),
    weight DECIMAL(5,2) DEFAULT 1.00,
    description TEXT DEFAULT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP NOT NULL DEFAULT '1980-01-01 00:00:01',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_rub_activity FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 27. Rubric Sub-scores (Normalized scoring for sub-criteria evaluation)
DROP TABLE IF EXISTS evaluation_rubric_scores;
CREATE TABLE evaluation_rubric_scores (
    id VARCHAR(50) PRIMARY KEY,
    evaluation_id VARCHAR(50) NOT NULL,
    rubric_id VARCHAR(50) NOT NULL,
    marks_awarded DECIMAL(5,2) NOT NULL CHECK (marks_awarded >= 0),
    feedback TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_ers_eval FOREIGN KEY (evaluation_id) REFERENCES evaluations(id) ON DELETE CASCADE,
    CONSTRAINT fk_ers_rub FOREIGN KEY (rubric_id) REFERENCES evaluation_rubrics(id) ON DELETE RESTRICT,
    UNIQUE KEY idx_eval_rubric_unique (evaluation_id, rubric_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 28. Multi-Evaluator Reviews (Supports peer grading, AI analytics scores, etc.)
DROP TABLE IF EXISTS evaluation_reviews;
CREATE TABLE evaluation_reviews (
    id VARCHAR(50) PRIMARY KEY,
    submission_id VARCHAR(50) NOT NULL,
    reviewer_type VARCHAR(20) NOT NULL CHECK (reviewer_type IN ('peer', 'teacher', 'ai', 'self')),
    reviewer_id VARCHAR(50) DEFAULT NULL, -- NULL if AI grader
    marks_awarded DECIMAL(5,2) NOT NULL CHECK (marks_awarded >= 0),
    rubric_scores JSON DEFAULT NULL,
    comments TEXT DEFAULT NULL,
    reviewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rev_submission FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
    CONSTRAINT fk_rev_reviewer FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 29. Attendance Sessions (Future Feature)
DROP TABLE IF EXISTS attendance_sessions;
CREATE TABLE attendance_sessions (
    id VARCHAR(50) PRIMARY KEY,
    subject_allocation_id VARCHAR(50) NOT NULL,
    session_date DATE NOT NULL,
    start_time TIME DEFAULT NULL,
    end_time TIME DEFAULT NULL,
    units INT NOT NULL DEFAULT 1 CHECK (units > 0),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP NOT NULL DEFAULT '1980-01-01 00:00:01',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_att_alloc FOREIGN KEY (subject_allocation_id) REFERENCES subject_allocations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 30. Student Attendance (Future Feature)
DROP TABLE IF EXISTS student_attendance;
CREATE TABLE student_attendance (
    id VARCHAR(50) PRIMARY KEY,
    session_id VARCHAR(50) NOT NULL,
    student_id VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
    remarks VARCHAR(255) DEFAULT NULL,
    CONSTRAINT fk_sa_session FOREIGN KEY (session_id) REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_sa_student FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    UNIQUE KEY idx_sa_student_session (session_id, student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 31. Certificates module (Future Feature)
DROP TABLE IF EXISTS certificates;
CREATE TABLE certificates (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    academic_year_id VARCHAR(50) NOT NULL,
    certificate_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    issued_by VARCHAR(150) NOT NULL,
    issue_date DATE NOT NULL,
    certificate_path VARCHAR(512) NOT NULL,
    verification_code VARCHAR(100) NOT NULL,
    meta_data JSON DEFAULT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP NOT NULL DEFAULT '1980-01-01 00:00:01',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cert_student FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_cert_ay FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE RESTRICT,
    UNIQUE KEY idx_cert_verify_del (verification_code, deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 32. AI Performance Analytics / Predictive Insights (Future Feature)
DROP TABLE IF EXISTS ai_analytics_insights;
CREATE TABLE ai_analytics_insights (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    subject_id VARCHAR(50) DEFAULT NULL,
    insight_type VARCHAR(100) NOT NULL, -- e.g. 'AT_RISK_ALERT', 'PERFORMANCE_FORECAST'
    confidence_score DECIMAL(4,3) NOT NULL CHECK (confidence_score >= 0.000 AND confidence_score <= 1.000),
    insight_details JSON NOT NULL, -- factors, recommended actions
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ai_student FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_ai_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 33. Student Subject Summaries (Optimized read model for Dashboards)
DROP TABLE IF EXISTS student_subject_summaries;
CREATE TABLE student_subject_summaries (
    student_id VARCHAR(50) NOT NULL,
    subject_allocation_id VARCHAR(50) NOT NULL,
    total_activities INT DEFAULT 0,
    completed_activities INT DEFAULT 0,
    total_marks_possible DECIMAL(7,2) DEFAULT 0.00,
    total_marks_earned DECIMAL(7,2) DEFAULT 0.00,
    average_percentage DECIMAL(5,2) DEFAULT 0.00,
    last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (student_id, subject_allocation_id),
    CONSTRAINT fk_summary_student FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_summary_alloc FOREIGN KEY (subject_allocation_id) REFERENCES subject_allocations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 34. External LMS Integrations (Future Feature)
DROP TABLE IF EXISTS external_lms_integrations;
CREATE TABLE external_lms_integrations (
    id VARCHAR(50) PRIMARY KEY,
    integration_name VARCHAR(150) NOT NULL,
    connector_type VARCHAR(50) NOT NULL CHECK (connector_type IN ('LTI_1_1', 'LTI_1_3', 'REST_API')),
    api_endpoint VARCHAR(255) DEFAULT NULL,
    client_id VARCHAR(100) DEFAULT NULL,
    client_secret VARCHAR(255) DEFAULT NULL,
    configuration_settings JSON DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 35. Student LMS Mappings (Future Feature)
DROP TABLE IF EXISTS student_lms_mappings;
CREATE TABLE student_lms_mappings (
    student_id VARCHAR(50) NOT NULL,
    lms_user_id VARCHAR(100) NOT NULL,
    external_system VARCHAR(50) NOT NULL, -- e.g. 'Canvas', 'Moodle'
    mapped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (student_id, external_system),
    CONSTRAINT fk_lms_student FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 36. User Mobile/Web Devices (Future Feature, mobile app integration)
DROP TABLE IF EXISTS user_devices;
CREATE TABLE user_devices (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    device_token VARCHAR(255) NOT NULL,
    device_type VARCHAR(20) NOT NULL CHECK (device_type IN ('ios', 'android', 'web')),
    last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_ud_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY idx_ud_user_token (user_id, device_token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 37. Notifications Table
DROP TABLE IF EXISTS notifications;
CREATE TABLE notifications (
    id VARCHAR(50) PRIMARY KEY,
    recipient_id VARCHAR(50) NOT NULL,
    sender_id VARCHAR(50) DEFAULT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL, -- e.g. 'GRADE_PUBLISHED', 'SUBMISSION_ALERT'
    is_read BOOLEAN DEFAULT FALSE,
    link_url VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_recipient FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_notif_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 38. Notification Preferences Table
DROP TABLE IF EXISTS notification_preferences;
CREATE TABLE notification_preferences (
    user_id VARCHAR(50) NOT NULL,
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('in_app', 'email', 'sms', 'push')),
    event_type VARCHAR(50) NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (user_id, channel, event_type),
    CONSTRAINT fk_pref_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 39. System Transaction Audit Logs
DROP TABLE IF EXISTS audit_logs;
CREATE TABLE audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) DEFAULT NULL,
    action VARCHAR(100) NOT NULL, -- e.g. 'INSERT', 'UPDATE', 'DELETE'
    table_name VARCHAR(100) NOT NULL,
    record_id VARCHAR(100) NOT NULL,
    old_values JSON DEFAULT NULL,
    new_values JSON DEFAULT NULL,
    ip_address VARCHAR(45) DEFAULT NULL,
    user_agent VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------------------------------
-- PERFORMANCE & INDEXING STRATEGY
-- ----------------------------------------------------

-- Indexes to optimize Student Search & Enrollment flows
CREATE INDEX idx_student_sem_dept ON student_profiles (current_semester_id, department_id);
CREATE INDEX idx_alloc_sem_teacher ON subject_allocations (semester_id, teacher_id);

-- Speed up Academic Course Queries
CREATE INDEX idx_subjects_dept ON subjects (department_id);

-- Indexes to optimize Submissions checks & deadline compliance
CREATE INDEX idx_submissions_act_status ON submissions (activity_id, submission_status);
CREATE INDEX idx_submissions_student_at ON submissions (student_id, submitted_at);
CREATE INDEX idx_activities_deadline_status ON activities (deadline, status);
CREATE INDEX idx_activities_allocation ON activities (subject_allocation_id);

-- Evaluation joins and grading views
CREATE INDEX idx_evaluations_submission ON evaluations (submission_id);
CREATE INDEX idx_evaluations_evaluator ON evaluations (evaluator_id);

-- Notifications delivery optimization
CREATE INDEX idx_notifications_recipient_read ON notifications (recipient_id, is_read);
CREATE INDEX idx_user_devices_token ON user_devices (device_token);

-- Audit query optimizations
CREATE INDEX idx_audit_table_record ON audit_logs (table_name, record_id);
CREATE INDEX idx_audit_created ON audit_logs (created_at);

-- Quiz query optimizations
CREATE INDEX idx_quiz_questions_bank ON quiz_questions (quiz_bank_id);
CREATE INDEX idx_qn_options_question ON quiz_question_options (question_id);
CREATE INDEX idx_student_quiz_attempt_sub ON student_quiz_attempts (submission_id);
CREATE INDEX idx_student_quiz_ans_attempt ON student_quiz_answers (attempt_id);
