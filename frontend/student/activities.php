<!--
  CIE-2 Activity Tracking, Evaluation and Performance Management System
  File: frontend/student/activities.php
  Purpose: Students can view pending assignments, evaluate deadlines, and submit PDFs securely.
-->
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pending Activities | CIE-2 Performance Management Portal</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700&display=swap"
    rel="stylesheet">
  <link rel="stylesheet" href="dashboard.css?v=2.0">
  <style>
    .activity-timeline {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .assignment-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .assignment-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .assignment-info h3 {
      margin-bottom: 4px;
      color: var(--text-primary);
      font-family: var(--font-title);
    }

    .assignment-info p {
      color: var(--text-secondary);
      font-size: 0.9rem;
      margin-bottom: 12px;
    }

    .assignment-meta {
      display: flex;
      gap: 12px;
    }

    .meta-tag {
      background-color: var(--bg-secondary);
      color: var(--text-secondary);
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .assignment-action {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 10px;
    }

    .deadline-text {
      font-size: 0.9rem;
      font-weight: 600;
    }

    .text-danger {
      color: var(--accent-red);
    }

    .text-success {
      color: var(--accent-green);
    }
  </style>
</head>

<body>
  <div class="dashboard-container">
    <!-- Sidebar Navigation -->
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-brand">
        <svg class="nav-logo" viewBox="0 0 64 64" fill="none">
          <rect width="64" height="64" rx="16" fill="url(#brandGrad)" />
          <path d="M32 14L16 23V41L32 50L48 41V23L32 14Z" stroke="white" stroke-width="3" stroke-linejoin="round" />
          <path d="M32 20V44" stroke="white" stroke-width="2" />
          <defs>
            <linearGradient id="brandGrad" x1="0" y1="0" x2="64" y2="64">
              <stop stop-color="#2563eb" />
              <stop offset="1" stop-color="#1d4ed8" />
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
          <span>Overview</span>
        </a>
        <a href="activities.php" class="menu-item active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
          <span>Assigned Activities</span>
        </a>
        <a href="quizzes.php" class="menu-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span>Quizzes</span>
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
            <h2 class="greeting-title">Assigned Activities</h2>
            <p class="greeting-subtitle">Monitor deadlines and submit deliverables securely</p>
          </div>
        </div>
        <div class="header-right">
          <button class="header-action-btn" id="theme-toggler" aria-label="Toggle Light/Dark Theme">
            <svg id="theme-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"></svg>
          </button>
        </div>
      </header>

      <div class="scroll-content">
        <div class="dashboard-sections" id="activity-sections">
          <section class="dashboard-panel">
            <div class="panel-header flex-header">
              <h2>Pending & Submitted Assignments</h2>
            </div>
            <div class="activity-timeline" id="activities-container">
              <div style="padding:40px; text-align:center; color: var(--text-secondary);">Loading your tasks...</div>
            </div>
          </section>
        </div>
      </div>
    </main>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
  <script src="../shared/config.js?v=2.0"></script>
  <script src="../shared/api-service.js?v=2.0"></script>
  <script src="activities.js?v=2.0"></script>
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