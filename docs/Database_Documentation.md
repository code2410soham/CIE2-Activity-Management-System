# Database Schema & Technical Documentation

This document describes the schema setup, table dictionaries, and optimization practices for the relational data storage layer of the **CIE2-Activity-Management-System**.

---

## 1. Connection & Infrastructure Configurations
*   **DBMS**: MySQL 8.0+ / MariaDB (relational database engine)
*   **Storage Engine**: InnoDB (for row-level locking, ACID transactions, and foreign key enforcement)
*   **Character Set**: `utf8mb4` (complete Unicode support including emojis)
*   **Collation**: `utf8mb4_unicode_ci`

---

## 2. Table Directory & Dictionary

### 2.1 Core Academic Structure Modules

#### 1. `academic_years`
Stores college academic session cycles.
*   `id` (VARCHAR(50)): Primary key.
*   `name` (VARCHAR(50)): Descriptive name (e.g. 'Academic Year 2025-2026'). UNIQUE.
*   `start_date` / `end_date` (DATE): Term limits.
*   `is_current` (BOOLEAN): Current active year toggle.

#### 2. `departments`
Academic units or branches within the university.
*   `id` (VARCHAR(50)): Primary key.
*   `code` (VARCHAR(20)): Unique code representation (e.g., 'CSE', 'ECE').
*   `name` (VARCHAR(150)): Full department name.

#### 3. `semesters`
Specific terms mapped to academic years.
*   `id` (VARCHAR(50)): Primary key.
*   `academic_year_id` (VARCHAR(50)): FK to `academic_years.id`.
*   `term` (VARCHAR(50)): Term label (e.g. 'Odd Semester 2025').
*   `start_date` / `end_date` (DATE): Semester timelines.

#### 4. `subjects`
List of courses/papers offered.
*   `id` (VARCHAR(50)): Primary key.
*   `code` (VARCHAR(20)): COURSE Code (e.g., 'CS-301'). UNIQUE.
*   `name` (VARCHAR(150)): Subject title.
*   `credits` (INT): Course weight credits.
*   `department_id` (VARCHAR(50)): Owner department. FK to `departments.id`.

---

### 2.2 Users & Authentication Profiles

#### 5. `users`
Central logins. Role checks: 'student', 'teacher', 'admin'.
*   `id` (VARCHAR(50)): Primary key.
*   `username` (VARCHAR(100)): Student USN or Staff email handle. UNIQUE.
*   `email` (VARCHAR(150)): College email address. UNIQUE.
*   `password_hash` (VARCHAR(255)): Salted password string.
*   `role` (VARCHAR(20)): 'student', 'teacher', 'admin'.
*   `is_active` (BOOLEAN): Status indicator.

#### 6. `teacher_profiles`
Academic metadata for teachers.
*   `id` (VARCHAR(50)): Primary key.
*   `user_id` (VARCHAR(50)): FK to `users.id` (1:1 mapping).
*   `employee_id` (VARCHAR(50)): Staff identification. UNIQUE.
*   `department_id` (VARCHAR(50)): FK to `departments.id`.
*   `designation` (VARCHAR(100)): Designation description.

#### 7. `student_profiles`
Academic metadata for students.
*   `id` (VARCHAR(50)): Primary key.
*   `user_id` (VARCHAR(50)): FK to `users.id` (1:1 mapping).
*   `usn` (VARCHAR(50)): University Seat Number. UNIQUE.
*   `department_id` (VARCHAR(50)): FK to `departments.id`.
*   `current_semester_id` (VARCHAR(50)): FK to `semesters.id`.
*   `admission_year` (VARCHAR(10)) / `section` (VARCHAR(5)).

---

### 2.3 Course Allocations & Enrollments

#### 8. `subject_allocations`
Maps teachers to specific subjects, semesters, and sections.
*   `id` (VARCHAR(50)): Primary key.
*   `subject_id` (VARCHAR(50)): FK to `subjects.id`.
*   `semester_id` (VARCHAR(50)): FK to `semesters.id`.
*   `teacher_id` (VARCHAR(50)): FK to `teacher_profiles.id`.
*   `section` (VARCHAR(5)): Target classroom section.

#### 9. `student_course_enrollments`
Binds students to allocated course sections.
*   `id` (VARCHAR(50)): Primary key.
*   `student_id` (VARCHAR(50)): FK to `student_profiles.id`.
*   `subject_allocation_id` (VARCHAR(50)): FK to `subject_allocations.id`.

---

### 2.4 Dynamic EAV Metadata Configuration Module

#### 10. `activity_types`
Classes of activities.
*   `id` (VARCHAR(50)): Primary key.
*   `name` (VARCHAR(50)): E.g. 'Laboratory Exercise'.
*   `code` (VARCHAR(50)): E.g. 'LAB', 'QUIZ', 'PROJECT'. UNIQUE.

#### 11. `activity_templates`
Groups standard custom fields configurations.
*   `id` / `name` / `description`.
*   `activity_type_id` (VARCHAR(50)): FK to `activity_types.id`.

#### 12. `field_definitions`
Attributes specification for dynamic configurations.
*   `id` (VARCHAR(50)): Primary key.
*   `activity_type_id` (VARCHAR(50)): FK to `activity_types.id`.
*   `field_name` (VARCHAR(100)): E.g., 'programming_language', 'github_repo_required'.
*   `field_type` (VARCHAR(50)): ENUM constraint: 'STRING', 'NUMBER', 'BOOLEAN', 'TEXT', 'JSON', 'DATE', 'FILE'.
*   `is_required` (BOOLEAN).
*   `default_value` (TEXT).
*   `validation_rules` (JSON): Rules (regex, lengths, limits).

#### 13. `activities`
Central transactional table for assignments.
*   `id` (VARCHAR(50)): Primary key.
*   `subject_allocation_id` (VARCHAR(50)): FK to `subject_allocations.id`.
*   `activity_type_id` (VARCHAR(50)): FK to `activity_types.id`.
*   `title` / `description` / `deadline` / `status`.
*   `max_marks` (DECIMAL(5,2)) / `weightage` (DECIMAL(5,2)).

#### 14. `activity_field_values`
Contains custom EAV attributes mapping to Activities.
*   `id` (VARCHAR(50)): Primary key.
*   `activity_id` (VARCHAR(50)): FK to `activities.id`.
*   `field_definition_id` (VARCHAR(50)): FK to `field_definitions.id`.
*   `value_text` (TEXT) / `value_json` (JSON).

---

### 2.5 Submissions & Quiz Module

#### 15. `submissions`
Wrapper for student deliverables.
*   `id` (VARCHAR(50)): Primary key.
*   `activity_id` (VARCHAR(50)): FK to `activities.id`.
*   `student_id` (VARCHAR(50)): FK to `student_profiles.id`.
*   `submission_status` (VARCHAR(20)): 'draft', 'submitted', 'late', 'failed'.
*   `submitted_at` (TIMESTAMP).

#### 16. `submission_files`
Uploaded files logs.
*   `id` / `file_path` / `file_name` / `file_size` / `mime_type`.
*   `submission_id` (VARCHAR(50)): FK to `submissions.id`.

#### 17. `student_quiz_attempts`
Manages MCQ quiz submissions details.
*   `id` / `started_at` / `completed_at` / `earned_score`.
*   `submission_id` (VARCHAR(50)): FK to `submissions.id`. UNIQUE.

#### 18. `student_quiz_answers`
Student option selections.
*   `attempt_id` (VARCHAR(50)): FK to `student_quiz_attempts.id`.
*   `question_id` (VARCHAR(50)): FK to `quiz_questions.id`.
*   `selected_option_id` (VARCHAR(50)): FK to `quiz_question_options.id`.
*   `text_answer` (TEXT) / `marks_awarded` (DECIMAL(5,2)).

---

### 2.6 Evaluation, Rubrics & Feedback

#### 19. `evaluations`
Official student marks.
*   `id` (VARCHAR(50)): Primary key.
*   `submission_id` (VARCHAR(50)): FK to `submissions.id`. UNIQUE.
*   `evaluator_id` (VARCHAR(50)): FK to `users.id`.
*   `marks_awarded` (DECIMAL(5,2)) / `general_feedback` (TEXT).

#### 20. `evaluation_rubrics`
Rubric definitions for detailed activity criteria.
*   `id` / `criterion_name` / `max_marks` / `weight` / `description`.
*   `activity_id` (VARCHAR(50)): FK to `activities.id`.

#### 21. `evaluation_rubric_scores`
Criterion scoring.
*   `id` (VARCHAR(50)): Primary key.
*   `evaluation_id` (VARCHAR(50)): FK to `evaluations.id`.
*   `rubric_id` (VARCHAR(50)): FK to `evaluation_rubrics.id`.
*   `marks_awarded` (DECIMAL(5,2)) / `feedback` (TEXT).

---

## 3. High Integrity Safeguards

1.  **Duplicate Submission Prevention**: Enforced via composite unique key `idx_sub_student_act_del` on `submissions (activity_id, student_id, deleted_at)`.
2.  **Cascading Actions**:
    *   `ON DELETE CASCADE` is set on transactional details: `submission_files`, `student_quiz_attempts`, `student_quiz_answers`, `evaluation_rubric_scores` so profile wipe/submissions resets cleanly wipe dependents.
    *   `ON DELETE RESTRICT` is configured on baseline entities: `departments`, `subjects`, `courses`, `academic_years` to preclude orphan child statistics.
3.  **Auditing Triggers**:
    `audit_logs` archives database edits. Stashes transaction context JSON snapshots (`old_values`, `new_values`).
4.  **Soft-Deletes Model**:
    We use `is_deleted` and `deleted_at` keys (defaulting to `'1970-01-01 00:00:00'`) to enable non-conflicting unique constraints. Only active configurations block identical keys!
