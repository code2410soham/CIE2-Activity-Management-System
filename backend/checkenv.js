/**
 * CIE-2 Activity Management System
 * File: backend/checkenv.js
 * Purpose: Pre-flight script that validates all required environment variables and
 *          tests the database connection before the server starts.
 *          Run with: node checkenv.js
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

const REQUIRED_VARS = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_NAME', 'JWT_SECRET'];

function checkEnvVars() {
    console.log('\n📋 Checking environment variables...');
    const missing = [];

    for (const v of REQUIRED_VARS) {
        if (!process.env[v]) {
            missing.push(v);
            console.log(`  ❌ MISSING: ${v}`);
        } else {
            console.log(`  ✅ OK: ${v}`);
        }
    }

    // Warn about default JWT secret
    if (process.env.JWT_SECRET === 'replace_this_with_a_long_random_secret_string') {
        console.warn('  ⚠️  WARNING: JWT_SECRET is still the default example value. Change it in your .env file.');
    }

    if (missing.length > 0) {
        console.error(`\n🚨 Missing ${missing.length} required variable(s): ${missing.join(', ')}`);
        console.error('   → Copy backend/.env.example to backend/.env and fill in the values.\n');
        process.exit(1);
    }

    console.log('  All required env vars found.\n');
}

async function checkDatabaseConnection() {
    console.log('🔌 Testing MySQL database connection...');
    console.log(`   Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    console.log(`   User: ${process.env.DB_USER}`);
    console.log(`   Database: ${process.env.DB_NAME}\n`);

    try {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME,
            connectTimeout: 5000
        });

        await conn.ping();
        console.log('  ✅ Database connection successful!\n');

        // Check if core tables exist
        const [tables] = await conn.query('SHOW TABLES LIKE "users"');
        if (tables.length === 0) {
            console.warn('  ⚠️  WARNING: "users" table not found!');
            console.warn('   → Run: mysql -u root -p cie2_db < database/schema.sql');
            console.warn('   → Then: mysql -u root -p cie2_db < database/seed.sql\n');
        } else {
            const [count] = await conn.query('SELECT COUNT(*) AS c FROM users');
            console.log(`  ✅ "users" table found with ${count[0].c} record(s).\n`);
        }

        await conn.end();
    } catch (err) {
        console.error('  ❌ Database connection FAILED!');
        console.error(`   Error: ${err.message}\n`);

        if (err.code === 'ECONNREFUSED') {
            console.error('  🔧 Fix: MySQL is not running. Start XAMPP → click Start on MySQL.');
        } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('  🔧 Fix: Wrong DB_USER or DB_PASSWORD in your .env file.');
        } else if (err.code === 'ER_BAD_DB_ERROR') {
            console.error(`  🔧 Fix: Database "${process.env.DB_NAME}" does not exist.`);
            console.error('         Create it: mysql -u root -p -e "CREATE DATABASE cie2_db;"');
            console.error('         Then import: mysql -u root -p cie2_db < database/schema.sql');
        }

        process.exit(1);
    }
}

async function main() {
    console.log('===========================================');
    console.log(' CIE-2 System — Pre-flight Check');
    console.log('===========================================');
    checkEnvVars();
    await checkDatabaseConnection();
    console.log('===========================================');
    console.log(' All checks passed! Run: npm start');
    console.log('===========================================\n');
}

main();
