<!--
  CIE-2 Activity Tracking System
  File: frontend/student/dashboard.php
  Purpose: 2026 SaaS Redesigned Student Dashboard
-->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Student Dashboard | CIE-2 Performance Management</title>
    <link rel="stylesheet" href="../shared/styles.css?v=3.0">
</head>
<body data-theme="dark">

<div class="app-layout">

    <!-- Premium Sidebar -->
    <aside class="sidebar" id="sidebar">
        <div class="sidebar-brand">
            <svg width="32" height="32" viewBox="0 0 64 64" fill="none">
                <rect width="64" height="64" rx="16" fill="url(#brandGrad)"/>
                <path d="M32 14L16 23V41L32 50L48 41V23L32 14Z" stroke="white" stroke-width="3" stroke-linejoin="round"/>
                <path d="M32 20V44" stroke="white" stroke-width="2"/>
                <defs>
                    <linearGradient id="brandGrad" x1="0" y1="0" x2="64" y2="64">
                        <stop stop-color="#4338ca"/>
                        <stop offset="1" stop-color="#7e22ce"/>
                    </linearGradient>
                </defs>
            </svg>
            <span class="brand-title">CIE-2 Portal</span>
        </div>

        <nav class="sidebar-nav">
            <a href="dashboard.php" class="nav-item active">
                <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
                Dashboard
            </a>
            <a href="activities.php" class="nav-item">
                <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                Activities
            </a>
            <a href="quizzes.php" class="nav-item">
                <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                Quizzes
            </a>
            <a href="submissions.php" class="nav-item">
                <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                Submissions
            </a>
            <a href="performance.php" class="nav-item">
                <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                Performance
            </a>
            <a href="notifications.php" class="nav-item">
                <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                Notifications
            </a>
            <a href="profile.php" class="nav-item">
                <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Profile
            </a>
        </nav>
        
        <div style="padding: 24px;">
            <button id="logout-btn" class="btn btn-outline" style="width: 100%;">
                <svg viewBox="0 0 24 24" fill="none" class="nav-icon" stroke="currentColor"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Logout
            </button>
        </div>
    </aside>

    <!-- Main View -->
    <main class="main-wrapper">
        <header class="topbar">
            <div class="topbar-left">
                <h2 id="greetingMsg" class="outfit-font">Good Morning, Student</h2>
            </div>
            
            <div class="topbar-right">
                <button class="icon-btn" id="themeToggle" aria-label="Toggle Theme">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="nav-icon"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                </button>
                
                <div class="user-profile-btn" onclick="window.location.href='profile.php'">
                    <div class="avatar-circle" id="profileInitials">ST</div>
                    <div>
                        <div style="font-weight: 600; font-size: 0.9rem;" id="profileName">Student Name</div>
                        <div style="color: var(--text-muted); font-size: 0.75rem;">USN: <span id="profilePRN">-</span></div>
                    </div>
                </div>
            </div>
        </header>

        <div class="content-scroll">
            
            <!-- KPI Cards -->
            <div class="kpi-grid animate-enter">
                <div class="glass-panel kpi-card">
                    <div class="kpi-icon-box indigo"><svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
                    <div class="kpi-details">
                        <p>Avg Score</p>
                        <h3 id="kpi-avg-score">0%</h3>
                    </div>
                </div>

                <div class="glass-panel kpi-card delay-100">
                    <div class="kpi-icon-box emerald"><svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
                    <div class="kpi-details">
                        <p>Completed Activity</p>
                        <h3 id="kpi-completed">0</h3>
                    </div>
                </div>

                <div class="glass-panel kpi-card delay-200">
                    <div class="kpi-icon-box amber"><svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
                    <div class="kpi-details">
                        <p>Pending Submissions</p>
                        <h3 id="kpi-pending">0</h3>
                    </div>
                </div>

                <div class="glass-panel kpi-card delay-300">
                    <div class="kpi-icon-box rose"><svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>
                    <div class="kpi-details">
                        <p>Quizzes Scored</p>
                        <h3 id="kpi-quizzes">0 / 0</h3>
                    </div>
                </div>
            </div>

            <!-- Dashboard Grid -->
            <div class="dashboard-grid animate-enter delay-200">
                
                <!-- Main Activities View -->
                <div class="glass-panel">
                    <h3 style="margin-bottom: 24px; font-weight: 700;">Upcoming Deadlines & Pending</h3>
                    <div class="table-responsive">
                        <table class="modern-table">
                            <thead>
                                <tr>
                                    <th>Activity Title</th>
                                    <th>Type</th>
                                    <th>Deadline</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody id="upcoming-table-body">
                                <tr><td colspan="4" style="text-align: center; color: var(--text-muted);">Loading assignments...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Secondary Panel (Analytics Chart) -->
                <div class="glass-panel">
                    <h3 style="margin-bottom: 24px; font-weight: 700;">Subject Analytics</h3>
                    <canvas id="performanceChart" style="width: 100%; height: 250px;"></canvas>
                </div>
            </div>

        </div>
    </main>

</div>

<!-- Scripts -->
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="../shared/config.js?v=2.0"></script>
<script src="../shared/api-service.js?v=2.0"></script>
<script src="dashboard.js?v=3.0"></script>

</body>
</html>