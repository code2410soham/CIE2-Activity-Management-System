# CIE2-Activity-Management-System

A high-performance, scalable web application designed to manage, evaluate, and track student activities, multiple-choice quizzes, term tests, and submissions for the **CIE-2 (Continuous Internal Evaluation 2) & Termwork tracking system**.

## 🚀 Key Features

*   **Student Portal**: Dynamic dashboard showing due dates, pending submissions, graded labs, and quiz modules.
*   **Instructor Evaluation Engine**: Modular evaluation panel with grading fields, qualitative feedback logs, and automatic status updates.
*   **System Administrator Operations**: Full control over user accounts, audit logs, database connection statistics, and performance compliance metrics.
*   **Database Design**: Optimized PostgreSQL schemas with indexed foreign keys for rapid data fetching.
*   **Structured Upload System**: Partitioned directories separating activities, student submissions, and profile avatars.

---

## 📂 Project Structure

Below is the directory architecture, structured to allow 10+ developers to work simultaneously without code conflicts:

```text
CIE2-Activity-Management-System
│
├── frontend/
│   ├── student/                 # Student dashboard, activity lists, and submission panels
│   │   ├── dashboard.html
│   │   ├── activities.html
│   │   └── submissions.html
│   ├── teacher/                 # Instructor dashboard, activity publishing, and evaluation portals
│   │   ├── dashboard.html
│   │   ├── activity-management.html
│   │   └── evaluation.html
│   ├── admin/                   # Admin user managers, server status dashboard, and log analytics
│   │   ├── dashboard.html
│   │   ├── user-management.html
│   │   └── reports.html
│   └── shared/                  # Common resources (styles, script interactions, reusable assets)
│       ├── styles.css
│       ├── scripts.js
│       └── components/          # Reusable HTML/CSS web components
│
├── backend/                     # Isolated node modules for specific features
│   ├── auth/                    # Register, login, and JWT middleware
│   ├── activities/              # CRUD actions for assignments/tests
│   ├── submissions/             # Handling student file uploads and grading status
│   ├── quiz/                    # Start attempt sessions and evaluate MCQ responses
│   ├── evaluation/              # Grading criteria logic and evaluator assignments
│   ├── analytics/               # Track log events and system activity summaries
│   └── reports/                 # Compilation of overall grades and stats
│       ├── controller.js        # Controller layer (Express req/res parse)
│       ├── service.js           # Business logic layer
│       ├── routes.js            # Router mapping to controllers
│       └── model.js             # Model layer (Database drivers)
│
├── database/                    # Database setups
│   ├── schema.sql               # Primary table structure DDL
│   ├── seed.sql                 # Development dummy data inserters
│   └── database-design.md       # Logical entity descriptions and indexes
│
├── uploads/                     # Local storage directories (ignored in production)
│   ├── activities/
│   ├── submissions/
│   └── profile-images/
│
├── docs/                        # Complete technical logs
│   ├── API_Documentation.md
│   ├── Database_Documentation.md
│   ├── Project_Workflow.md
│   └── Team_Guidelines.md
│
└── README.md                    # Project Entry point documentation
```

---

## ⚙️ Installation & Setup

Follow these steps to launch the repository locally:

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- PostgreSQL (v14+) or MySQL

### 2. Repository Setup
Clone the repository:
```bash
git clone https://github.com/your-org/CIE2-Activity-Management-System.git
cd CIE2-Activity-Management-System
```

### 3. Install Dependencies (Backend)
Navigate to backend and initialize dependencies:
```bash
cd backend
npm init -y
npm install express pg jsonwebtoken dotenv cors
```

### 4. Database Initialization
Run the DDL scripts against your local SQL server:
```bash
# Example using PostgreSQL client
psql -U your_postgres_user -d your_database_name -f database/schema.sql
psql -U your_postgres_user -d your_database_name -f database/seed.sql
```

---

## 🤝 Team Collaboration Workflow

To ensure a seamless flow for **10 developers** working simultaneously, please follow the documentation rules inside [Project_Workflow.md](docs/Project_Workflow.md) and [Team_Guidelines.md](docs/Team_Guidelines.md):

*   **Branching Principle**: Create task-specific branches (e.g., `feature/student-dashboard-tabs`) stemming from `develop`.
*   **Pull Requests (PRs)**: Must target `develop` and require two approving peer reviews.
*   **Coding Standards**: Keep javascript code structured inside `service.js` layers; controllers should contain zero DB statements.
*   **Style Syncing**: All page layouts must reference the common `/frontend/shared/styles.css` color constants.
