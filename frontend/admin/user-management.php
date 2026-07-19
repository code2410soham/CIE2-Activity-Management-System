<!--
  CIE-2 Activity Tracking, Evaluation and Performance Management System
  File: frontend/admin/user-management.php
  Purpose: Display dynamic lists of system users with CRUD UI capabilities for Admins.
-->
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>User Management | Admin Portal</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700&display=swap"
    rel="stylesheet">
  <link rel="stylesheet" href="../student/dashboard.css?v=2.0">
  <style>
    .tab-nav {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
      border-bottom: 2px solid var(--border-color);
      padding-bottom: 12px;
    }

    .tab-btn {
      background: none;
      border: none;
      color: var(--text-secondary);
      font-size: 1rem;
      font-weight: 500;
      padding: 8px 16px;
      cursor: pointer;
      position: relative;
    }

    .tab-btn:hover {
      color: var(--text-primary);
    }

    .tab-btn.active {
      color: var(--accent-blue);
    }

    .tab-btn.active::after {
      content: '';
      position: absolute;
      bottom: -14px;
      left: 0;
      width: 100%;
      height: 2px;
      background: var(--accent-blue);
      border-radius: 2px;
    }

    .tab-pane {
      display: none;
    }

    .tab-pane.active {
      display: block;
    }

    .sidebar-brand .nav-logo rect {
      fill: url(#brandGradAdmin);
    }
  </style>
</head>

<body>
  <div class="dashboard-container">
    <!-- Sidebar Navigation -->
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-brand">
        <svg class="nav-logo" viewBox="0 0 64 64" fill="none">
          <rect width="64" height="64" rx="16" />
          <path d="M32 14L16 23V41L32 50L48 41V23L32 14Z" stroke="white" stroke-width="3" stroke-linejoin="round" />
          <path d="M32 20V44" stroke="white" stroke-width="2" />
          <defs>
            <linearGradient id="brandGradAdmin" x1="0" y1="0" x2="64" y2="64">
              <stop stop-color="#111827" />
              <stop offset="1" stop-color="#030712" />
            </linearGradient>
          </defs>
        </svg>
        <span class="brand-text">CIE-2 Admin</span>
      </div>

      <nav class="sidebar-menu">
        <a href="dashboard.php" class="menu-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 3v18h18" />
            <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
          </svg>
          <span>System Analytics</span>
        </a>
        <a href="user-management.php" class="menu-item active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span>User Management</span>
        </a>
      </nav>

      <div class="sidebar-footer">
        <a href="#" class="logout-btn" id="logout-button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Logout</span>
        </a>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <header class="header">
        <div class="header-left">
          <button class="hamburger-menu" id="toggle-sidebar" aria-label="Toggle Sidebar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          <div class="greeting-wrapper">
            <h2 class="greeting-title">User Management</h2>
            <p class="greeting-subtitle">Add, edit, or deactivate system roles</p>
          </div>
        </div>

        <div class="header-right">
          <button class="header-action-btn" id="theme-toggler">
            <svg id="theme-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"></svg>
          </button>
          <div class="student-profile-summary">
            <div class="avatar" id="avatar-initials" style="background-color: #0f172a;">A</div>
            <div class="profile-details-text">
              <span class="user-name-text" id="avatar-admin-name">Admin</span>
              <span class="user-role-text">System Administrator</span>
            </div>
          </div>
        </div>
      </header>

      <div class="scroll-content">
        <div class="dashboard-panel">

          <!-- Tabs -->
          <div class="tab-nav">
            <button class="tab-btn active" data-tab="students-tab">Students Cohort</button>
            <button class="tab-btn" data-tab="teachers-tab">Faculty Registry</button>
          </div>

          <!-- Students Table -->
          <div class="tab-pane active" id="students-tab">
            <div class="table-scroll-container">
              <table class="activities-table">
                <thead>
                  <tr>
                    <th>Name / Username</th>
                    <th>PRN (USN)</th>
                    <th>Department & Class</th>
                    <th>Email</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody id="student-tbody">
                  <tr>
                    <td colspan="5" style="text-align:center;">Loading users...</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Teachers Table -->
          <div class="tab-pane" id="teachers-tab">
            <div class="table-scroll-container">
              <table class="activities-table">
                <thead>
                  <tr>
                    <th>Name / Username</th>
                    <th>Employee ID</th>
                    <th>Department</th>
                    <th>Designation</th>
                    <th>Email</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody id="teacher-tbody">
                  <tr>
                    <td colspan="6" style="text-align:center;">Loading records...</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </main>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
  <script src="../shared/config.js?v=2.0"></script>
  <script src="../shared/api-service.js?v=2.0"></script>
  <script src="user-management.js?v=2.0"></script>
  <script>
    const appTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', appTheme);
    const themeBtnIcon = document.getElementById('theme-btn-icon');
    if (appTheme === 'dark') themeBtnIcon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
    else themeBtnIcon.innerHTML = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
  </script>
</body>

</html>