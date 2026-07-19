<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>My Profile | CIE-2 Portal</title>
    <link rel='stylesheet' href='../shared/styles.css?v=3.0'>
</head>
<body data-theme='dark'>

<div class='app-layout'>
    <aside class='sidebar' id='sidebar'>
        <div class='sidebar-brand'>
            <span class='brand-title'>CIE-2 Teachers</span>
        </div>
        <nav class='sidebar-nav'>
            <a href='dashboard.php' class='nav-item '>Dashboard</a>
            <a href='activity-management.php' class='nav-item '>Activities</a>
            <a href='quizzes.php' class='nav-item '>Quiz Management</a>
            <a href='submissions.php' class='nav-item '>Submissions</a>
            <a href='evaluation.php' class='nav-item '>Evaluation</a>
            <a href='reports.php' class='nav-item '>Reports</a>
            <a href='profile.php' class='nav-item active'>Profile</a>
        </nav>
        <div style='padding: 24px;'>
            <button id='logout-btn' class='btn btn-outline' style='width: 100%;'>Logout</button>
        </div>
    </aside>

    <main class='main-wrapper'>
        <header class='topbar'>
            <div class='topbar-left'>
                <h2 class='outfit-font'>My Profile</h2>
            </div>
        </header>

        <div class='content-scroll'>
            <div class="glass-panel" style="max-width:600px;"><div id="prof-details">Loading...</div></div>
        </div>
    </main>
</div>
<script src='https://cdn.jsdelivr.net/npm/sweetalert2@11'></script>
<script src='https://cdn.jsdelivr.net/npm/chart.js'></script>
<script src='../shared/config.js'></script>
<script src='../shared/api-service.js'></script>
<script src='profile.js'></script>
<script>
    document.getElementById('logout-btn').addEventListener('click', () => apiService.logout());
</script>
</body>
</html>
