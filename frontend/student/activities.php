<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assigned Activities | CIE-2 Portal</title>
  <link rel="stylesheet" href="../shared/styles.css?v=3.0">
</head>

<body data-theme="dark">

  <div class="app-layout">
    <!-- Sidebar -->
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-brand">
        <svg width="32" height="32" viewBox="0 0 64 64" fill="none">
          <rect width="64" height="64" rx="16" fill="url(#brandGrad)" />
          <path d="M32 14L16 23V41L32 50L48 41V23L32 14Z" stroke="white" stroke-width="3" stroke-linejoin="round" />
          <path d="M32 20V44" stroke="white" stroke-width="2" />
          <defs>
            <linearGradient id="brandGrad" x1="0" y1="0" x2="64" y2="64">
              <stop stop-color="#4338ca" />
              <stop offset="1" stop-color="#7e22ce" />
            </linearGradient>
          </defs>
        </svg>
        <span class="brand-title">CIE-2 Portal</span>
      </div>
      <nav class="sidebar-nav">
        <a href="dashboard.php" class="nav-item">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="3" width="7" height="9" rx="1" />
            <rect x="14" y="3" width="7" height="5" rx="1" />
            <rect x="14" y="12" width="7" height="9" rx="1" />
            <rect x="3" y="16" width="7" height="5" rx="1" />
          </svg>
          Dashboard
        </a>
        <a href="activities.php" class="nav-item active">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          Activities
        </a>
        <a href="quizzes.php" class="nav-item">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          Quizzes
        </a>
        <a href="submissions.php" class="nav-item">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Submissions
        </a>
        <a href="performance.php" class="nav-item">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          Performance
        </a>
        <a href="notifications.php" class="nav-item">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          Notifications
        </a>
        <a href="profile.php" class="nav-item">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          Profile
        </a>
      </nav>
      <div style="padding: 24px;">
        <button id="logout-btn" class="btn btn-outline" style="width: 100%;">
          <svg viewBox="0 0 24 24" fill="none" class="nav-icon" stroke="currentColor">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg> Logout
        </button>
      </div>
    </aside>

    <main class="main-wrapper">
      <header class="topbar">
        <div class="topbar-left">
          <h2 class="outfit-font">Assigned Activities</h2>
        </div>
        <div class="topbar-right">
          <button class="icon-btn" id="themeToggle"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" class="nav-icon">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg></button>
        </div>
      </header>

      <div class="content-scroll">
        <div class="glass-panel animate-enter" style="margin-bottom: 24px; padding: 20px;">
          <div style="display: flex; gap: 12px; overflow-x: auto;" id="filters-container">
            <button class="btn btn-primary" data-filter="all">All</button>
            <button class="btn btn-outline" data-filter="pending">Pending</button>
            <button class="btn btn-outline" data-filter="submitted">Submitted</button>
            <button class="btn btn-outline" data-filter="overdue">Overdue</button>
          </div>
        </div>

        <!-- Activity Cards Grid -->
        <div class="kpi-grid animate-enter delay-100" id="activities-deck">
          <div style="text-align:center; padding:40px; grid-column:1/-1;">Loading Activities...</div>
        </div>
      </div>
    </main>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
  <script src="../shared/config.js?v=2.0"></script>
  <script src="../shared/api-service.js?v=2.0"></script>
  <script src="activities.js?v=3.0"></script>
  <script>
    document.getElementById('logout-btn').addEventListener('click', () => apiService.logout());

    // Theme setup
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    document.getElementById('themeToggle').addEventListener('click', () => {
      let currentTheme = document.body.getAttribute('data-theme');
      let newTheme = currentTheme === 'light' ? 'dark' : 'light';
      document.body.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    });
  </script>
</body>

</html>