# Database Documentation

This document describes the schema setup, table dictionaries, and optimization practices for the relational data storage layer.

## Connection Configuration
*   **DBMS**: PostgreSQL / MySQL (Relational)
*   **Driver**: `pg` (Node.js pg client pool)
*   **Environment Var**: `DATABASE_URL=postgres://user:pass@host:5432/dbname`

## Table Dictionary

### 1. `users` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR(50) | PRIMARY KEY | User identifier |
| `username` | VARCHAR(100) | UNIQUE, NOT NULL | Unique handle |
| `email` | VARCHAR(150) | UNIQUE, NOT NULL | College email address |
| `password_hash` | VARCHAR(255) | NOT NULL | Encrypted password |
| `role` | VARCHAR(20) | CHECK Constraint | 'student', 'teacher', or 'admin' |

### 2. `activities` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR(50) | PRIMARY KEY | Activity identifier |
| `title` | VARCHAR(200) | NOT NULL | Activity display title |
| `activity_type` | VARCHAR(50) | CHECK Constraint | 'lab', 'quiz', or 'exam' |
| `max_marks` | INT | > 0 | Total marks possible |
| `deadline` | TIMESTAMP | NOT NULL | Submission cutoff time |

### 3. `submissions` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR(50) | PRIMARY KEY | Submission identifier |
| `activity_id` | VARCHAR(50) | REFERENCES activities | Assigned activity |
| `student_id` | VARCHAR(50) | REFERENCES users | Student identifier |
| `file_path` | VARCHAR(255) | NOT NULL | Location of the zip/pdf |

## Security & Maintenance
- Database credentials must never be committed to source control (use `.env` config file).
- Weekly DB backups are configured via CRON backups to external storage.
