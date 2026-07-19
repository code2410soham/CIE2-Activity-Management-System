/**
 * CIE-2 Activity Tracking, Evaluation and Performance Management System
 * File: frontend/teacher/dashboard.js
 * Purpose: Handles fetching Teacher dashboard state, loading skeletons, and rendering database values using api-service.js
 */

document.addEventListener('DOMContentLoaded', () => {
    setDateGreeting();
    fetchTeacherDashboardData();

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

    if (greetingText) greetingText.textContent = `${prefix}, Instructor! 👋`;
    if (dateStrText) {
        dateStrText.textContent = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
}

async function fetchTeacherDashboardData() {
    const skeleton = document.getElementById('dashboard-skeleton');
    const sections = document.getElementById('dashboard-sections');

    try {
        const result = await apiService.get('/api/v1/teacher/teacher-dashboard');

        if (!result.success) {
            showDashboardError(result.error || 'Server error. Please try refreshing.');
            return;
        }

        if (skeleton) skeleton.classList.add('hidden');
        if (sections) sections.classList.remove('hidden');

        // Render Data
        renderTeacherProfile(result.teacher);
        renderTeacherSummary(result.summary);
        renderTeacherActivities(result.activities);

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
        confirmButtonColor: '#7c3aed'
    });
}

function renderTeacherProfile(teacher) {
    if (!teacher) return;

    const greetingText = document.getElementById('dashboard-greeting');
    if (greetingText) {
        const prefix = greetingText.textContent.split(',')[0];
        greetingText.textContent = `${prefix}, ${teacher.username} 👋`;
    }

    const initials = teacher.username.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const avatar = document.getElementById('avatar-initials');
    if (avatar) avatar.textContent = initials;

    const nameBar = document.getElementById('avatar-teacher-name');
    if (nameBar) nameBar.textContent = 'Prof. ' + teacher.username;

    ['emp', 'department', 'designation', 'email'].forEach(field => {
        const el = document.getElementById(`prof-${field}`);
        const dataField = field === 'emp' ? 'employee_id' : field;
        if (el && teacher[dataField]) el.textContent = teacher[dataField];
    });

    // Fullname override for teacher if custom exists, else username
    document.getElementById('prof-fullname').textContent = teacher.name || teacher.username;
}

function renderTeacherSummary(summary) {
    if (!summary) return;
    document.getElementById('stat-activities-created').textContent = summary.activities_created;
    document.getElementById('stat-pending-evals').textContent = summary.pending_evaluations;
    document.getElementById('stat-published-results').textContent = summary.published_results;
    document.getElementById('stat-pass-rate').textContent = summary.pass_rate + '%';
}

function renderTeacherActivities(activities) {
    const tbody = document.getElementById('activities-table-body');
    if (!tbody) return;

    if (!activities || activities.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="empty-state" style="text-align:center; padding:30px; color:var(--text-secondary);">No activities created yet.</td></tr>`;
        return;
    }

    tbody.innerHTML = '';
    activities.forEach(act => {
        const tr = document.createElement('tr');

        let badgeClass = 'badge-pending';
        if (act.status === 'published') badgeClass = 'badge-submitted';

        // Fix missing deadline format gracefully
        const actDeadline = act.deadline ? new Date(act.deadline).toLocaleString() : 'N/A';

        tr.innerHTML = `
            <td style="font-weight: 600;">${act.title}</td>
            <td>${act.subject_name}</td>
            <td>${act.section}</td>
            <td>${act.type_name}</td>
            <td>${actDeadline}</td>
            <td><span class="status-badge ${badgeClass}">${act.status.toUpperCase()}</span></td>
        `;
        tbody.appendChild(tr);
    });
}
