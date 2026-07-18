/**
 * CIE-2 Activity Management System
 * File: backend/generate_students_sql.js
 * Purpose: Reads database/students.json, hashes each student's ZRPN as their password,
 *          and writes a self-contained database/students_seed.sql that any teammate
 *          can import to get all student accounts working immediately.
 *
 * Run: node generate_students_sql.js
 * Output: database/students_seed.sql
 */

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const studentsJsonPath = path.join(__dirname, '../database/students.json');
const outputSqlPath = path.join(__dirname, '../database/students_seed.sql');

async function main() {
    if (!fs.existsSync(studentsJsonPath)) {
        console.error('❌ students.json not found at:', studentsJsonPath);
        process.exit(1);
    }

    const students = JSON.parse(fs.readFileSync(studentsJsonPath, 'utf8'));
    console.log(`📋 Loaded ${students.length} students from students.json`);
    console.log('⏳ Hashing passwords (this may take ~30 seconds)...\n');

    const sqlLines = [];

    sqlLines.push('-- ============================================================');
    sqlLines.push('-- CIE2-Activity-Management-System');
    sqlLines.push('-- File: database/students_seed.sql');
    sqlLines.push('-- Purpose: Auto-generated student user accounts with bcrypt-hashed passwords.');
    sqlLines.push('--          Default password for each student = their ZRPN number.');
    sqlLines.push('-- Generated: ' + new Date().toISOString());
    sqlLines.push('-- ============================================================');
    sqlLines.push('');
    sqlLines.push('SET FOREIGN_KEY_CHECKS = 0;');
    sqlLines.push('');
    sqlLines.push('-- Remove old placeholder students from seed.sql (if any)');
    sqlLines.push("DELETE FROM student_course_enrollments WHERE student_id IN ('stud-alex', 'stud-sarah');");
    sqlLines.push("DELETE FROM student_profiles WHERE id IN ('stud-alex', 'stud-sarah');");
    sqlLines.push("DELETE FROM users WHERE id IN ('usr-student-1', 'usr-student-2');");
    sqlLines.push('');
    sqlLines.push('-- Insert all real student users');
    sqlLines.push('-- Format: (user_id, username=ZRPN, email, bcrypt_hash, role, is_active)');
    sqlLines.push('');

    const userInserts = [];
    const profileInserts = [];
    let done = 0;

    for (const s of students) {
        const zrpn = s.zrpn.trim();
        const name = s.name.trim().replace(/'/g, "\\'");
        const usn = (s.roll_no || zrpn).trim();
        const section = (s.div || 'A').trim();

        const userId = `usr-stud-${zrpn}`;
        const profileId = `stud-prof-${zrpn}`;
        const email = `${zrpn.toLowerCase()}@college.edu`;

        // Hash password = ZRPN (default credential)
        const hash = bcrypt.hashSync(zrpn, 10);

        userInserts.push(
            `('${userId}', '${zrpn}', '${email}', '${hash}', 'student', TRUE)`
        );
        profileInserts.push(
            `('${profileId}', '${userId}', '${name}', '${usn}', 'dept-ise', 'sem-odd-2025', '2025', '${section}')`
        );

        done++;
        if (done % 25 === 0 || done === students.length) {
            process.stdout.write(`\r  Processed: ${done}/${students.length}`);
        }
    }

    // Write users in batches of 50 for MySQL compatibility
    const BATCH = 50;
    for (let i = 0; i < userInserts.length; i += BATCH) {
        const batch = userInserts.slice(i, i + BATCH);
        sqlLines.push('INSERT IGNORE INTO users (id, username, email, password_hash, role, is_active) VALUES');
        sqlLines.push(batch.join(',\n') + ';');
        sqlLines.push('');
    }

    sqlLines.push('-- Insert student profiles');
    for (let i = 0; i < profileInserts.length; i += BATCH) {
        const batch = profileInserts.slice(i, i + BATCH);
        sqlLines.push('INSERT IGNORE INTO student_profiles (id, user_id, name, usn, department_id, current_semester_id, admission_year, section) VALUES');
        sqlLines.push(batch.join(',\n') + ';');
        sqlLines.push('');
    }

    sqlLines.push('SET FOREIGN_KEY_CHECKS = 1;');
    sqlLines.push('');
    sqlLines.push(`-- Total students imported: ${students.length}`);
    sqlLines.push('-- Login with: Role=Student, PRN=<ZRPN>, Password=<ZRPN>');
    sqlLines.push('-- Example: PRN=125UIT1103, Password=125UIT1103');

    fs.writeFileSync(outputSqlPath, sqlLines.join('\n'), 'utf8');

    console.log(`\n\n✅ Done! Generated: database/students_seed.sql`);
    console.log(`   📊 ${students.length} student users with bcrypt-hashed passwords`);
    console.log(`\n   Teammates can now run:`);
    console.log(`   mysql -u root -p cie2_db < database/students_seed.sql\n`);
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
