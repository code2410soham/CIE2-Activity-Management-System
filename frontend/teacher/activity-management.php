<!--
  CIE-2 Activity Tracking, Evaluation and Performance Management System
  File: frontend/teacher/activity-management.php
  Purpose: Enables instructors to create activities, manage deadlines, assign marks, and configure parameters.
-->
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Activity Management | CIE-2 Performance Management Portal</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700&display=swap"
    rel="stylesheet">
  <link rel="stylesheet" href="../student/dashboard.css?v=2.0">
  <style>
    .builder-section {
      background-color: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-top: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    .form-control {
      padding: 10px 14px;
      border-radius: 6px;
      border: 1px solid var(--border-color);
      background-color: var(--bg-primary);
      color: var(--text-primary);
      font-family: inherit;
    }

    .form-control:focus {
      outline: none;
      border-color: var(--accent-blue);
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
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
        <a href="dashboard.php" class="menu-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="9" rx="1" />
            <rect x="14" y="3" width="7" height="5" rx="1" />
            <rect x="14" y="12" width="7" height="9" rx="1" />
            <rect x="3" y="16" width="7" height="5" rx="1" />
          </svg>
          <span>Overview & Stats</span>
        </a>
        <a href="activity-management.php" class="menu-item active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
          <span>Activity Management</span>
        </a>
        <a href="evaluation.php" class="menu-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2-2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
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
            <h2 class="greeting-title">Activity Management</h2>
            <p class="greeting-subtitle">Create and oversee assignments and quizzes</p>
          </div>
        </div>

        <div class="header-right">
          <button class="header-action-btn" id="theme-toggler" aria-label="Toggle Light/Dark Theme">
            <svg id="theme-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"></svg>
          </button>
          <div class="student-profile-summary">
            <div class="avatar" id="avatar-initials" style="background-color: var(--accent-yellow);">T</div>
            <div class="profile-details-text">
              <span class="user-name-text" id="avatar-teacher-name">Instructor</span>
              <span class="user-role-text">Teacher Mode</span>
            </div>
          </div>
        </div>
      </header>

      <div class="scroll-content">
        <div class="dashboard-sections" id="management-sections">
          <!-- Activity Builder Form -->
          <div class="builder-section glass-card">
            <h2 style="font-family: var(--font-title); font-size: 1.25rem;">Create New Activity</h2>
            <form id="create-activity-form" class="form-grid">
              <div class="form-group">
                <label for="act-title">Title</label>
                <input type="text" id="act-title" class="form-control" placeholder="e.g. Array Assignment" required>
              </div>

              <div class="form-group">
                <label for="act-type">Category</label>
                <select id="act-type" class="form-control" required>
                  <option value="" disabled selected>Loading Types...</option>
                </select>
              </div>

              <div class="form-group">
                <label for="act-subject">Target Subject & Class</label>
                <select id="act-subject" class="form-control" required>
                  <option value="" disabled selected>Loading Active Assignments...</option>
                </select>
              </div>

              <div class="form-group">
                <label for="act-deadline">Enforced Deadline</label>
                <input type="datetime-local" id="act-deadline" class="form-control" required>
              </div>

              <div class="form-group">
                <label for="act-marks">Max Marks Allocation</label>
                <input type="number" id="act-marks" class="form-control" min="1" max="100" placeholder="e.g. 20"
                  required>
              </div>

              <div class="form-group full-width">
                <label for="act-desc">Content Guidelines / Instructions</label>
                <textarea id="act-desc" class="form-control" rows="3"
                  placeholder="Provide instructions, guidelines, and reference links..." required></textarea>
              </div>

              <div class="form-group full-width" style="align-items: flex-end;">
                <button type="submit" class="action-btn" id="publish-btn">Publish Activity</button>
              </div>
            </form>
          </div>

          <!-- Managed Activities List -->
          <section class="dashboard-panel">
            <div class="panel-header flex-header">
              <h2>Live Assigned Activities</h2>
            </div>
            <div class="table-scroll-container">
              <table class="activities-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Subject (Class)</th>
                    <th>Type</th>
                    <th>Deadline</th>
                    <th>Max Marks</th>
                    <th>Submissions</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody id="activities-table-body">
                  <tr>
                    <td colspan="7" style="text-align: center;">Loading existing activities...</td>
                  </tr>
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

  <!-- Application Core JS -->
  <script src="../shared/config.js?v=2.0"></script>
  <script src="../shared/api-service.js?v=2.0"></script>
  <script src="activity-management.js?v=2.0"></script>
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