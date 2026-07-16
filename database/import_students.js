/**
 * CIE-2 Activity Tracking, Evaluation and Performance Management System
 * File: database/import_students.js
 * Purpose: Connects to local MySQL database, processes students.json, hashes passwords and imports data.
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const studentsJsonPath = path.join(__dirname, 'students.json');

async function main() {
    if (!fs.existsSync(studentsJsonPath)) {
        console.error('students.json does not exist. Run parse_to_json.py first.');
        process.exit(1);
    }

    const students = JSON.parse(fs.readFileSync(studentsJsonPath, 'utf8'));
    console.log(`Loaded ${students.length} students from JSON.`);

    // Create database connection pool
    const pool = mysql.createPool({
        host: process.env.DB_HOST || '127.0.0.1',
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'cie2_db',
        connectionLimit: 10
    });

    const connection = await pool.getConnection();

    try {
        console.log('Connected to MySQL. Starting import...');

        // Clear existing mock student users to avoid conflicts if desired, but we can also just run INSERT IGNORE
        // Let's delete the specific mock students from seed.sql so they don't conflict
        // ('usr-student-1', 'alexrivera') and ('usr-student-2', 'sarahconnor')
        await connection.query('DELETE FROM student_course_enrollments WHERE student_id IN ("stud-alex", "stud-sarah")');
        await connection.query('DELETE FROM student_profiles WHERE id IN ("stud-alex", "stud-sarah")');
        await connection.query('DELETE FROM users WHERE id IN ("usr-student-1", "usr-student-2")');

        let userCount = 0;
        let profileCount = 0;

        for (let index = 0; index < students.length; index++) {
            const s = students[index];
            const zrpn = s.zrpn;
            const name = s.name;
            // Default to ZRPN if roll_no is empty
            const usn = s.roll_no || zrpn;
            const section = s.div || 'A';

            // 1. Generate IDs
            const userId = `usr-stud-${zrpn}`;
            const profileId = `stud-prof-${zrpn}`;
            const username = zrpn;
            // Unique email based on ZRPN
            const email = `${zrpn.toLowerCase()}@college.edu`;

            // 2. Default password is ZRPN. Hash it using bcrypt
            const passwordHash = bcrypt.hashSync(zrpn, 10);

            // Check if user already exists
            const [existingUsers] = await connection.query(
                'SELECT id FROM users WHERE username = ? OR email = ?',
                [username, email]
            );

            if (existingUsers.length > 0) {
                console.log(`Skipping duplicate username/email: ${username}`);
                continue;
            }

            // 3. Insert into users
            await connection.query(
                'INSERT INTO users (id, username, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?, ?)',
                [userId, username, email, passwordHash, 'student', true]
            );
            userCount++;

            // 4. Insert into student_profiles
            await connection.query(
                'INSERT INTO student_profiles (id, user_id, usn, department_id, current_semester_id, admission_year, section) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [profileId, userId, usn, 'dept-ise', 'sem-odd-2025', '2025', section]
            );
            profileCount++;

            if ((index + 1) % 50 === 0 || index === students.length - 1) {
                console.log(`Progress: Imported ${index + 1}/${students.length} students.`);
            }
        }

        console.log(`Successfully completed!`);
        console.log(`Users inserted: ${userCount}`);
        console.log(`Student profiles inserted: ${profileCount}`);

    } catch (error) {
        console.error('Error importing students:', error);
    } finally {
        connection.release();
        await pool.end();
    }
}

main();
