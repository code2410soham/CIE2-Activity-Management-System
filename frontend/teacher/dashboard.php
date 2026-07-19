<!--
  CIE-2 Activity Tracking, Evaluation and Performance Management System
  File: frontend/teacher/dashboard.php
  Purpose: Premium instructor dashboard view loading teacher assignments and evaluation tasks.
-->
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Teacher Dashboard | CIE-2 Performance Management Portal</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700&display=swap"
    rel="stylesheet">
  <link rel="stylesheet" href="../student/dashboard.css">
  <style>
    /* Small localized overrides for Teacher theme */
    .icon-red {
      background-color: #fee2e2;
      color: #dc2626;
    }

    [data-theme="dark"] .icon-red {
      background-color: rgba(220, 38, 38, 0.15);
      color: #f87171;
    }

    .sidebar-brand .nav-logo rect {
      fill: url(#brandGradTeacher);
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
            <linearGradient id="brandGradTeacher" x1="0" y1="0" x2="64" y2="64">
              <stop stop-color="#7c3aed" />
              <stop offset="1" stop-color="#4c1d95" />
            </linearGradient>
          </defs>
        </svg>
        <span class="brand-text">CIE-2 Portal</span>
      </div>

      <nav class="sidebar-menu">
        <a href="#overview" class="menu-item active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="9" rx="1" />
            <rect x="14" y="3" width="7" height="5" rx="1" />
            <rect x="14" y="12" width="7" height="9" rx="1" />
            <rect x="3" y="16" width="7" height="5" rx="1" />
          </svg>
          <span>Overview & Stats</span>
        </a>
        <a href="activity-management.html" class="menu-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
          <span>Activity Management</span>
        </a>
        <a href="evaluation.html" class="menu-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
          <span>Evaluation Portal</span>
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

    <!-- Main Content Area -->
    <main class="main-content">

      <!-- Top header bar -->
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
            <h2 id="dashboard-greeting" class="greeting-title">Hello, Instructor! 👋</h2>
            <p id="dashboard-date-str" class="greeting-subtitle">Loading current date...</p>
          </div>
        </div>

        <div class="header-right">
          <button class="header-action-btn" id="theme-toggler" aria-label="Toggle Light/Dark Theme">
            <svg id="theme-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round"></svg>
          </button>
          <div class="student-profile-summary">
            <div class="avatar" id="avatar-initials" style="background-color: var(--accent-yellow);">T</div>
            <div class="profile-details-text">
              <span class="user-name-text" id="avatar-teacher-name">Loading...</span>
              <span class="user-role-text">Teacher / Instructor</span>
            </div>
          </div>
        </div>
      </header>

      <div class="scroll-content">

        <!-- Skeleton Loader UI -->
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

          <section class="dashboard-panel profile-panel">
            <div class="panel-header flex-header">
              <h2>Instructor Details</h2>
            </div>
            <div class="profile-grid">
              <div class="profile-card-field"><span class="field-label-tag">Full Name</span><span
                  class="field-value-text" id="prof-fullname">-</span></div>
              <div class="profile-card-field"><span class="field-label-tag">Employee ID</span><span
                  class="field-value-text" id="prof-emp">-</span></div>
              <div class="profile-card-field"><span class="field-label-tag">Department</span><span
                  class="field-value-text" id="prof-department">-</span></div>
              <div class="profile-card-field"><span class="field-label-tag">Designation</span><span
                  class="field-value-text" id="prof-designation">-</span></div>
              <div class="profile-card-field"><span class="field-label-tag">Email</span><span class="field-value-text"
                  id="prof-email">-</span></div>
            </div>
          </section>

          <!-- Analytics & Summary Overview Row (Section 2) -->
          <div class="overview-cards-row">
            <div class="stat-card">
              <div class="stat-icon icon-blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <div class="stat-details">
                <h4 id="stat-activities-created">0</h4>
                <p>Activities Created</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon icon-yellow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div class="stat-details">
                <h4 id="stat-pending-evals">0</h4>
                <p>Pending Evaluations</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon icon-green">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div class="stat-details">
                <h4 id="stat-published-results">0</h4>
                <p>Published Results</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon icon-purple">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 20V10" />
                  <path d="M18 20V4" />
                  <path d="M6 20v-4" />
                </svg>
              </div>
              <div class="stat-details">
                <h4 id="stat-pass-rate">0%</h4>
                <p>Class Pass Rate</p>
              </div>
            </div>
          </div>

          <!-- Teacher Assignments -->
          <section class="dashboard-panel">
            <div class="panel-header flex-header">
              <h2>Recent Activity Assigments</h2>
              <a href="activity-management.html" class="action-btn">Manage All Activities</a>
            </div>
            <div class="table-scroll-container">
              <table class="activities-table">
                <thead>
                  <tr>
                    <th>Activity Title</th>
                    <th>Subject</th>
                    <th>Section Class</th>
                    <th>Type</th>
                    <th>Deadline</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody id="activities-table-body">
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
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

  <!-- Application Core JS -->
  <script src="../shared/config.js"></script>
  <script src="../shared/api-service.js"></script>
  <script src="dashboard.js"></script>
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