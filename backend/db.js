/**
 * CIE-2 Activity Tracking, Evaluation and Performance Management System
 * File: backend/db.js
 * Purpose: Centralized database connection pool using mysql2/promise.
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// Create the connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'cie2_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Simple helper to execute queries
async function query(sql, params) {
    try {
        const [results] = await pool.execute(sql, params);
        return results;
    } catch (err) {
        console.error('Database query error:', err);
        throw err;
    }
}

module.exports = {
    pool,
    query
};
