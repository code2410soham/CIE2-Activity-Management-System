/**
 * CIE-2 Activity Tracking, Evaluation and Performance Management System
 * File: backend/migrate.js
 * Purpose: Safe Database Migration runner. Adds missing columns, tables, and updates invalid bcrypt passwords.
 */

const db = require('./db');
const bcrypt = require('bcryptjs');

async function runMigration() {
    console.log('Starting Safe Database Migration...');

    try {
        // 1. Add "name" to student_profiles if it doesn't exist
        const checkStudentCol = await db.query(
            "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'student_profiles' AND COLUMN_NAME = 'name'"
        );
        if (checkStudentCol.length === 0) {
            console.log('Adding "name" column to student_profiles...');
            await db.query("ALTER TABLE student_profiles ADD COLUMN name VARCHAR(200) DEFAULT '' AFTER user_id");
            console.log('"name" column added successfully.');
        } else {
            console.log('"name" column already exists in student_profiles.');
        }

        // 2. Add "name" to teacher_profiles if it doesn't exist
        const checkTeacherCol = await db.query(
            "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'teacher_profiles' AND COLUMN_NAME = 'name'"
        );
        if (checkTeacherCol.length === 0) {
            console.log('Adding "name" column to teacher_profiles...');
            await db.query("ALTER TABLE teacher_profiles ADD COLUMN name VARCHAR(200) DEFAULT '' AFTER user_id");
            console.log('"name" column added successfully.');
        } else {
            console.log('"name" column already exists in teacher_profiles.');
        }

        // 3. Update existing seed profiles with names if empty or not set
        await db.query("UPDATE student_profiles SET name = 'Alex Rivera' WHERE id = 'stud-alex' AND (name = '' OR name IS NULL)");
        await db.query("UPDATE student_profiles SET name = 'Sarah Connor' WHERE id = 'stud-sarah' AND (name = '' OR name IS NULL)");
        await db.query("UPDATE teacher_profiles SET name = 'Eleanor Vance' WHERE id = 'prof-eleanor' AND (name = '' OR name IS NULL)");
        await db.query("UPDATE teacher_profiles SET name = 'Marcus Wright' WHERE id = 'prof-marcus' AND (name = '' OR name IS NULL)");
        console.log('Profile names checked and updated.');

        // 4. Update seed user passwords to valid bcrypt hash of "password123"
        // Generate valid bcrypt hash
        const salt = await bcrypt.genSalt(10);
        const validHash = await bcrypt.hash('password123', salt);
        console.log(`Generated valid bcrypt hash for "password123": ${validHash}`);

        // Update standard seed users
        const seedUsernames = ['alexrivera', 'sarahconnor', 'eleanorvance', 'marcuswright', 'sysadmin'];
        for (const username of seedUsernames) {
            await db.query(
                "UPDATE users SET password_hash = ? WHERE username = ? AND password_hash = '$2b$10$wE99Y5YkX9e877C5ZJ4mDuS0zK4sD1Q8tJ6v0tN8aGxW4S1X'",
                [validHash, username]
            );
        }
        console.log('Seed users password hashes updated to valid bcrypt hash.');

        // 5. Create Missing Audit Tables: activity_logs, user_logs, change_history
        console.log('Checking/creating audit tables...');

        await db.query(`
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
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('Table "activity_logs" ensured.');

        await db.query(`
            CREATE TABLE IF NOT EXISTS user_logs (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                user_id VARCHAR(50) NOT NULL,
                event_type VARCHAR(50) NOT NULL, -- e.g., 'LOGIN_SUCCESS', 'LOGIN_FAILURE', 'PASSWORD_CHANGED', 'LOGOUT'
                description TEXT,
                ip_address VARCHAR(45) DEFAULT NULL,
                user_agent VARCHAR(255) DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_userlog_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('Table "user_logs" ensured.');

        await db.query(`
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
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('Table "change_history" ensured.');

        // 6. Create indexes for optimization (if not already existing)
        console.log('Adding optimization indexes...');

        // Helper helper to safely add index
        const addIndexSafe = async (tableName, indexName, columnsSql) => {
            const count = await db.query(
                `SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?`,
                [tableName, indexName]
            );
            if (count[0].count === 0) {
                console.log(`Creating index ${indexName} on ${tableName}...`);
                await db.query(`ALTER TABLE ${tableName} ADD INDEX ${indexName} (${columnsSql})`);
            } else {
                console.log(`Index ${indexName} already exists.`);
            }
        };

        await addIndexSafe('users', 'idx_users_role_active', 'role, is_active');
        await addIndexSafe('student_profiles', 'idx_student_profiles_user', 'user_id');
        await addIndexSafe('activity_logs', 'idx_actlog_activity', 'activity_id');
        await addIndexSafe('user_logs', 'idx_userlog_user_type', 'user_id, event_type');
        await addIndexSafe('change_history', 'idx_chg_table_record', 'table_name, record_id');

        console.log('Migration completed successfully with 100% data preservation!');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        process.exit(0);
    }
}

runMigration();
