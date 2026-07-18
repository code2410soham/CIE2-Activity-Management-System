-- 
-- CIE2-Activity-Management-System
-- File: database/migration_safe.sql
-- Purpose: Safely adds missing columns, indexes, and audit logging tables to MySQL.
-- Standard: Fully data-preserving ALTER queries.
-- 

-- 1. Add missing Profile Name Columns
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS name VARCHAR(200) DEFAULT '' AFTER user_id;
ALTER TABLE teacher_profiles ADD COLUMN IF NOT EXISTS name VARCHAR(200) DEFAULT '' AFTER user_id;

-- 2. Populate Standard Names if empty
UPDATE student_profiles SET name = 'Alex Rivera' WHERE id = 'stud-alex' AND (name = '' OR name IS NULL);
UPDATE student_profiles SET name = 'Sarah Connor' WHERE id = 'stud-sarah' AND (name = '' OR name IS NULL);
UPDATE teacher_profiles SET name = 'Eleanor Vance' WHERE id = 'prof-eleanor' AND (name = '' OR name IS NULL);
UPDATE teacher_profiles SET name = 'Marcus Wright' WHERE id = 'prof-marcus' AND (name = '' OR name IS NULL);

-- 3. Create Audit Log Tables (per SRS requirements)
CREATE TABLE IF NOT EXISTS activity_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    activity_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL, -- e.g., 'CREATED', 'UPDATED', 'DELETED', 'PUBLISHED'
    description TEXT,
    ip_address VARCHAR(45) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_actlog_activity FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
    CONSTRAINT fk_actlog_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- e.g., 'LOGIN_SUCCESS', 'LOGIN_FAILURE', 'PASSWORD_CHANGED', 'LOGOUT'
    description TEXT,
    ip_address VARCHAR(45) DEFAULT NULL,
    user_agent VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_userlog_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS change_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id VARCHAR(100) NOT NULL,
    column_name VARCHAR(100) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_by VARCHAR(50) DEFAULT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_chg_user FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Create Performance & Access Optimization Indexes
CREATE INDEX idx_users_role_active ON users(role, is_active);
CREATE INDEX idx_student_profiles_user ON student_profiles(user_id);
CREATE INDEX idx_actlog_activity ON activity_logs(activity_id);
CREATE INDEX idx_userlog_user_type ON user_logs(user_id, event_type);
CREATE INDEX idx_chg_table_record ON change_history(table_name, record_id);
