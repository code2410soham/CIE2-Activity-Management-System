<!--
  CIE-2 Activity Tracking, Evaluation and Performance Management System
  File: frontend/teacher/evaluation.php
  Purpose: Enables instructors to review student PDF submissions and assign grades seamlessly.
-->
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Evaluation Portal | CIE-2 Performance Management</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700&display=swap"
    rel="stylesheet">
  <link rel="stylesheet" href="../student/dashboard.css?v=2.0">
  <style>
    .split-layout {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 24px;
      margin-top: 16px;
    }

    @media (max-width: 1024px) {
      .split-layout {
        grid-template-columns: 1fr;
      }
    }

    .pdf-viewer-container {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      overflow: hidden;
      height: 70vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary);
    }

    .pdf-viewer-container iframe {
      width: 100%;
      height: 100%;
      border: none;
    }

    .grading-panel {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .queue-list {
      max-height: 250px;
      overflow-y: auto;
      border: 1px solid var(--border-color);
      border-radius: 6px;
    }

    .queue-item {
      padding: 12px;
      border-bottom: 1px solid var(--border-color);
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .queue-item:hover,
    .queue-item.active {
      background: rgba(37, 99, 235, 0.1);
    }

    .queue-item:last-child {
      border-bottom: none;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-control {
      padding: 10px;
      border-radius: 6px;
      border: 1px solid var(--border-color);
      background-color: var(--bg-primary);
      color: var(--text-primary);
      font-family: inherit;
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
        <a href="activity-management.php" class="menu-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
          <span>Activity Management</span>
        </a>
        <a href="evaluation.php" class="menu-item active">
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
          <button class="hamburger-menu" id="toggle-sidebar" aria-label="Toggle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          <div class="greeting-wrapper">
            <h2 class="greeting-title">Evaluation Portal</h2>
            <p class="greeting-subtitle">Review documents and assign academic marks</p>
          </div>
        </div>
        <div class="header-right">
          <button class="header-action-btn" id="theme-toggler">
            <svg id="theme-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"></svg>
          </button>
        </div>
      </header>

      <div class="scroll-content">
        <div class="split-layout">
          <!-- Document Preview -->
          <div class="pdf-viewer-container" id="pdf-viewer">
            <p>Select a submission from the queue to preview.</p>
          </div>

          <!-- Grading Panel -->
          <div class="grading-panel">
            <h3 style="font-family: var(--font-title);">Submission Queue</h3>
            <div class="queue-list" id="queue-list">
              <div style="padding:20px; text-align:center;">Loading queue...</div>
            </div>

            <hr style="border:0; border-top:1px solid var(--border-color);">

            <div id="grading-form-container" style="display:none; flex-direction:column; gap:16px;">
              <div>
                <h4 style="margin:0; font-family:var(--font-title);" id="lbl-student-name">Student Name</h4>
                <p style="margin:4px 0 0; font-size:0.8rem; color:var(--text-secondary);" id="lbl-activity-title">
                  Activity Title</p>
              </div>

              <div class="form-group">
                <label>Marks Awarded (Max: <span id="lbl-max-marks">0</span>)</label>
                <input type="number" id="grade-marks" class="form-control" step="0.5" min="0">
              </div>

              <div class="form-group">
                <label>Instructor Feedback (Optional)</label>
                <textarea id="grade-feedback" class="form-control" rows="3"
                  placeholder="Provide constructive feedback..."></textarea>
              </div>

              <button class="action-btn" id="submit-grade-btn" style="background-color: var(--accent-green);">Save
                Grading</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
  <script src="../shared/config.js?v=2.0"></script>
  <script src="../shared/api-service.js?v=2.0"></script>
  <script src="evaluation.js?v=2.0"></script>
  <script>
    const appTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', appTheme);
  </script>
</body>

</html>