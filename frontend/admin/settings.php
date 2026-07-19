<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Global Settings | Admin Portal</title>
    <link rel='stylesheet' href='../shared/styles.css?v=3.0'>
</head>
<body data-theme='dark'>

<div class='app-layout'>
    <aside class='sidebar' id='sidebar'>
        <div class='sidebar-brand'>
            <span class='brand-title'>CIE-2 Admin</span>
        </div>
        <nav class='sidebar-nav'>
            <a href='dashboard.php' class='nav-item '>Dashboard</a>
            <a href='user-management.php' class='nav-item '>User Management</a>
            <a href='activity-logs.php' class='nav-item '>Activity Logs</a>
            <a href='reports.php' class='nav-item '>System Reports</a>
            <a href='settings.php' class='nav-item active'>Settings</a>
        </nav>
        <div style='padding: 24px;'>
            <button id='logout-btn' class='btn btn-outline' style='width: 100%;'>Logout</button>
        </div>
    </aside>

    <main class='main-wrapper'>
        <header class='topbar'>
            <div class='topbar-left'>
                <h2 class='outfit-font'>Global Settings</h2>
            </div>
        </header>

        <div class='content-scroll'>
            <div class="glass-panel" style="max-width:600px;"><h3>Academic Term</h3><input type="text" class="swal2-input" value="Fall 2026" style="margin-bottom:20px;" /><br><button class="btn btn-primary">Save Settings</button></div>
        </div>
    </main>
</div>
<script src='https://cdn.jsdelivr.net/npm/sweetalert2@11'></script>
<script src='../shared/config.js'></script>
<script src='../shared/api-service.js'></script>
<script src='settings.js'></script>
<script>
    document.getElementById('logout-btn').addEventListener('click', () => apiService.logout());
</script>
</body>
</html>
