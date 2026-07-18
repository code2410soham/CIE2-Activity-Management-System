# CIE-2 Activity Management System
## 🚀 Team Setup Guide — First-Time Local Installation

Follow these steps **exactly** to get the project running on your machine after cloning from GitHub.

---

## Prerequisites

Make sure these are installed before you start:

| Requirement | Download | Version |
|---|---|---|
| Node.js | https://nodejs.org | v18 or later |
| XAMPP (MySQL) | https://apachefriends.org | Any recent |
| Git | https://git-scm.com | Any |

> **Windows users:** XAMPP is the easiest way to run MySQL locally.
> **Mac users:** You can use XAMPP for Mac or install MySQL via Homebrew.

---

## Step 1 — Clone the Repository

```bash
git clone https://github.com/code2410soham/CIE2-Activity-Management-System.git
cd CIE2-Activity-Management-System
```

---

## Step 2 — Create Your `.env` File

The `.env` file is **not on GitHub** (it contains passwords). You must create it yourself.

```bash
cd backend
copy .env.example .env
```

> On Mac/Linux: `cp .env.example .env`

Now open `backend/.env` in any text editor and fill in your MySQL settings:

```
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=           ← Leave empty if XAMPP default (no password)
DB_NAME=cie2_db
JWT_SECRET=any_long_random_string_you_make_up
NODE_ENV=development
```

> ⚠️ Change `JWT_SECRET` to any random string. Example: `JWT_SECRET=myCIE2SecretKey2025`

---

## Step 3 — Start MySQL (XAMPP)

1. Open **XAMPP Control Panel**
2. Click **Start** next to **MySQL**
3. Confirm it shows green/running (port 3306)

Do **NOT** start Apache — only MySQL is needed.

---

## Step 4 — Create the Database

Open **phpMyAdmin** (`http://localhost/phpmyadmin`) or a MySQL terminal and run:

```sql
CREATE DATABASE IF NOT EXISTS cie2_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Or from command line:
```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS cie2_db;"
```

---

## Step 5 — Import the Database Schema and Seed Data

From the **project root folder**, run these two commands in order:

```bash
mysql -u root -p cie2_db < database/schema.sql
mysql -u root -p cie2_db < database/seed.sql
```

> If your MySQL has a password, enter it when prompted. If it has no password, just press Enter.

After importing, verify by checking phpMyAdmin — you should see `cie2_db` with ~39 tables.

---

## Step 6 — Install Node.js Dependencies

```bash
cd backend
npm install
```

---

## Step 7 — Run Pre-flight Check (Optional but Recommended)

This script verifies your `.env` and database connection before starting:

```bash
node checkenv.js
```

Expected output:
```
✅ DB_HOST, DB_PORT... all OK
✅ Database connection successful!
✅ "users" table found with N records.
→ All checks passed! Run: npm start
```

If it fails, the error message will tell you exactly what to fix.

---

## Step 8 — Start the Server

```bash
npm start
```

Or for auto-reload during development:
```bash
npm run dev
```

Open your browser and go to: **http://localhost:5000**

---

## Step 9 — Test Login

Use one of the pre-seeded student accounts:

| Field | Value |
|---|---|
| Role | Student |
| PRN | `125UIT1103` |
| Password | `125UIT1103` |

On first login, you will be prompted to change your password (since it matches the PRN). This is expected.

---

## Troubleshooting Checklist

### ❌ "Cannot connect to database" on startup
- Is XAMPP → MySQL running? Check port 3306.
- Is `DB_USER` and `DB_PASSWORD` correct in your `.env`?
- Did you create the database `cie2_db`? (Step 4)

### ❌ Login fails with "Invalid credentials"
- Did you import `seed.sql`? (Step 5)
- Run `node checkenv.js` and confirm the `users` table has records.
- Try the health check: http://localhost:5000/api/health

### ❌ "Database 'cie2_db' does not exist"
- Run Step 4 and Step 5 again.

### ❌ Page not found / 404 errors
- Make sure you're accessing via `http://localhost:5000`, NOT by opening HTML files directly.
- The Express server must be running (`npm start`).

### ❌ CORS errors in the browser console
- You're likely opening the HTML file directly (double-click). Always use the server URL.

### ❌ "JWT_SECRET not set" warning
- Check your `.env` file has `JWT_SECRET=<some_value>`.

---

## Project Structure Reference

```
CIE2-Activity-Management-System/
├── backend/
│   ├── .env.example       ← Copy this to .env and fill in your values
│   ├── checkenv.js        ← Pre-flight diagnostic tool
│   ├── server.js          ← Main Express server
│   ├── auth/              ← Login, register, JWT logic
│   ├── student/           ← Student dashboard API
│   ├── middleware/         ← JWT auth middleware
│   └── db.js              ← MySQL connection pool
├── database/
│   ├── schema.sql         ← Full database structure (import first)
│   └── seed.sql           ← Sample data for testing (import second)
└── frontend/
    ├── auth/login.html    ← Login page
    └── student/           ← Student dashboard
```

---

## Quick Summary

```bash
# After cloning:
cd backend
cp .env.example .env        # Edit with your MySQL credentials
npm install
# Start XAMPP MySQL, create cie2_db, import schema.sql and seed.sql
node checkenv.js            # Verify setup
npm start                   # Start the server
# Open http://localhost:5000
```
