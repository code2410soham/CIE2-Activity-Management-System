<!--
  CIE-2 Activity Tracking, Evaluation and Performance Management System
  File: frontend/admin/dashboard.php
  Purpose: System Administrator dashboard for observing active users, subjects, and activities.
-->
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Dashboard | CIE-2 Performance Management Portal</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700&display=swap"
    rel="stylesheet">
  <link rel="stylesheet" href="../student/dashboard.css">
  <style>
    .admin-stat-card {
      background-color: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 24px;
      box-shadow: var(--shadow-sm);
      text-align: center;
    }

    .admin-stat-card h3 {
      font-size: 1.1rem;
      color: var(--text-secondary);
      margin-bottom: 8px;
    }

    .admin-stat-card h1 {
      font-size: 2.5rem;
      font-family: var(--font-title);
      color: var(--text-primary);
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
        <a href="#overview" class="menu-item active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 3v18h18" />
            <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
          </svg>
          <span>System Analytics</span>
        </a>
        <a href="user-management.html" class="menu-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span>User Management</span>
        </a>
        <a href="reports.html" class="menu-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <span>Compliance & Reports</span>
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
            <h2 id="dashboard-greeting" class="greeting-title">Hello, Admin! 👋</h2>
            <p id="dashboard-date-str" class="greeting-subtitle">Loading current date...</p>
          </div>
        </div>

        <div class="header-right">
          <button class="header-action-btn" id="theme-toggler" aria-label="Toggle Theme">
            <svg id="theme-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"></svg>
          </button>
          <div class="student-profile-summary">
            <div class="avatar" id="avatar-initials" style="background-color: #0f172a;">A</div>
            <div class="profile-details-text">
              <span class="user-name-text" id="avatar-admin-name">Loading...</span>
              <span class="user-role-text">System Administrator</span>
            </div>
          </div>
        </div>
      </header>

      <div class="scroll-content">
        <div class="main-loader-skeleton" id="dashboard-skeleton">
          <div class="skeleton-header-cards">
            <div class="skeleton-card"></div>
            <div class="skeleton-card"></div>
            <div class="skeleton-card"></div>
            <div class="skeleton-card"></div>
          </div>
          <div class="skeleton-body-content">
            <div class="skeleton-table-panel" style="grid-column: 1/-1;"></div>
          </div>
        </div>

        <div class="dashboard-sections hidden" id="dashboard-sections">
          <div class="overview-cards-row" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">

            <div class="admin-stat-card">
              <h3>Total Students</h3>
              <h1 id="kpi-students" style="color:var(--accent-blue)">0</h1>
            </div>
            <div class="admin-stat-card">
              <h3>Total Instructors</h3>
              <h1 id="kpi-teachers" style="color:#7c3aed">0</h1>
            </div>
            <div class="admin-stat-card">
              <h3>Total Subjects</h3>
              <h1 id="kpi-subjects" style="color:#059669">0</h1>
            </div>
            <div class="admin-stat-card">
              <h3>Live Activities</h3>
              <h1 id="kpi-activities" style="color:var(--accent-yellow)">0</h1>
            </div>
            <div class="admin-stat-card">
              <h3>Submissions Processed</h3>
              <h1 id="kpi-submissions" style="color:#ea580c">0</h1>
            </div>

          </div>

          <section class="dashboard-panel">
            <div class="panel-header flex-header">
              <h2>System Activity Audit Log</h2>
              <a href="reports.html" class="action-btn">Export Log</a>
            </div>
            <div class="table-scroll-container">
              <table class="activities-table">
                <thead>
                  <tr>
                    <th>Log ID</th>
                    <th>Action Taken</th>
                    <th>Affected Table</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody id="audit-table-body">
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </main>
  </div>

  <!-- Vendor JS -->
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
  <script src="../shared/config.js?v=2.0"></script>
  <script src="../shared/api-service.js?v=2.0"></script>
  <script src="dashboard.js?v=2.0"></script>
  <script>
    const themeToggler = document.getElementById('theme-toggler');
    const themeBtnIcon = document.getElementById('theme-btn-icon');
    const appTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', appTheme);
    updateBtnIcon(appTheme);
    themeToggler.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const toTheme = currentTheme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', toTheme);
      localStorage.setItem('theme', toTheme);
      updateBtnIcon(toTheme);
    });
    function updateBtnIcon(theme) {
      themeBtnIcon.innerHTML = theme === 'dark'
        ? '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>'
        : '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
    }
  </script>
</body>

</html>