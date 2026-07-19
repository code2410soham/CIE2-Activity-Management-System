<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Manage Users | Admin Portal</title>
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
            <a href='user-management.php' class='nav-item active'>User Management</a>
            <a href='activity-logs.php' class='nav-item '>Activity Logs</a>
            <a href='reports.php' class='nav-item '>System Reports</a>
            <a href='settings.php' class='nav-item '>Settings</a>
        </nav>
        <div style='padding: 24px;'>
            <button id='logout-btn' class='btn btn-outline' style='width: 100%;'>Logout</button>
        </div>
    </aside>

    <main class='main-wrapper'>
        <header class='topbar'>
            <div class='topbar-left'>
                <h2 class='outfit-font'>Manage Users</h2>
            </div>
        </header>

        <div class='content-scroll'>
            <div class="glass-panel"><button class="btn btn-primary" onclick="window.addUserModal()">+ Add New User</button><table class="modern-table" style="margin-top:24px;"><thead><tr><th>Username</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead><tbody id="user-body"></tbody></table></div>
        </div>
    </main>
</div>
<script src='https://cdn.jsdelivr.net/npm/sweetalert2@11'></script>
<script src='../shared/config.js'></script>
<script src='../shared/api-service.js'></script>
<script src='user-management.js'></script>
<script>
    document.getElementById('logout-btn').addEventListener('click', () => apiService.logout());
</script>
</body>
</html>
