/**
 * CIE-2 Activity Tracking, Evaluation and Performance Management System
 * File: frontend/admin/dashboard.js
 * Purpose: Connects to the admin dashboard API endpoint and displays high-level analytics.
 */

document.addEventListener('DOMContentLoaded', () => {
    setDateGreeting();
    fetchAdminDashboardData();

    document.getElementById('logout-button').addEventListener('click', (e) => {
        e.preventDefault();
        apiService.logout();
    });
});

function setDateGreeting() {
    const greetingText = document.getElementById('dashboard-greeting');
    const dateStrText = document.getElementById('dashboard-date-str');
    const now = new Date();
    const hours = now.getHours();

    let prefix = "Good Morning";
    if (hours >= 12 && hours < 17) prefix = "Good Afternoon";
    else if (hours >= 17 && hours < 22) prefix = "Good Evening";
    else if (hours >= 22 || hours < 5) prefix = "Good Night";

    if (greetingText) greetingText.textContent = `${prefix}, Admin! 👋`;
    if (dateStrText) {
        dateStrText.textContent = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
}

async function fetchAdminDashboardData() {
    const skeleton = document.getElementById('dashboard-skeleton');
    const sections = document.getElementById('dashboard-sections');

    try {
        const result = await apiService.get('/api/v1/admin/admin-dashboard');

        if (!result.success) {
            showDashboardError(result.error || 'Server error. Please try refreshing.');
            return;
        }

        if (skeleton) skeleton.classList.add('hidden');
        if (sections) sections.classList.remove('hidden');

        // Render Data
        if (result.admin && result.admin.username) {
            document.getElementById('avatar-admin-name').textContent = result.admin.username;
            document.getElementById('avatar-initials').textContent = result.admin.username.substring(0, 2).toUpperCase();
        }

        renderMetrics(result.summary);
        renderAuditLogs(result.recent_activity);

    } catch (err) {
        console.error('[dashboard.js] fetchDashboardData error:', err);
    }
}

function showDashboardError(message) {
    const skeleton = document.getElementById('dashboard-skeleton');
    if (skeleton) skeleton.classList.add('hidden');

    Swal.fire({
        icon: 'error',
        title: 'Data Load Failed',
        text: message,
        confirmButtonColor: '#111827'
    });
}

function renderMetrics(summary) {
    if (!summary) return;
    document.getElementById('kpi-students').textContent = summary.total_students || 0;
    document.getElementById('kpi-teachers').textContent = summary.total_teachers || 0;
    document.getElementById('kpi-subjects').textContent = summary.total_subjects || 0;
    document.getElementById('kpi-activities').textContent = summary.active_activities || 0;
    document.getElementById('kpi-submissions').textContent = summary.total_submissions || 0;
}

function renderAuditLogs(logs) {
    const tbody = document.getElementById('audit-table-body');
    if (!tbody) return;

    if (!logs || logs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="empty-state" style="text-align:center; padding:30px; color:var(--text-secondary);">No recent system audit activity.</td></tr>`;
        return;
    }

    tbody.innerHTML = '';
    logs.forEach(log => {
        const tr = document.createElement('tr');

        let actionColor = '#2563eb';
        if (log.action === 'UPDATE') actionColor = '#ea580c';
        else if (log.action === 'INSERT') actionColor = '#16a34a';
        else if (log.action === 'DELETE') actionColor = '#dc2626';

        tr.innerHTML = `
            <td>#${log.id}</td>
            <td><span style="font-weight:700; color:${actionColor};">${log.action}</span></td>
            <td><code style="background-color: var(--bg-primary); padding:2px 6px; border-radius:4px;">${log.table_name}</code></td>
            <td style="color:var(--text-secondary); font-size:0.8rem;">${new Date(log.created_at).toLocaleString()}</td>
        `;
        tbody.appendChild(tr);
    });
}
