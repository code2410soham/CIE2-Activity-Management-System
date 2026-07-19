/**
 * CIE-2 Activity Tracking, Evaluation and Performance Management System
 * File: frontend/student/dashboard.js
 * Purpose: Handles fetching dashboard state, loading skeletons, and rendering database values using api-service.js
 */

let performanceChartInstance = null;
let subjectChartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    // Session automatically handled by api-service (auth-guard)
    setDateGreeting();

    // Fetch Dashboard Data
    fetchDashboardData();

    // Logout
    document.getElementById('logout-button').addEventListener('click', (e) => {
        e.preventDefault();
        apiService.logout();
    });

    // Notification bell toggle
    const bellBtn = document.querySelector('[id*="notif-bell-btn"]');
    const notifPanel = document.getElementById('notifications-panel');
    if (bellBtn && notifPanel) {
        bellBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            notifPanel.classList.toggle('active');
        });
        document.addEventListener('click', () => {
            notifPanel.classList.remove('active');
        });
        notifPanel.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    // Filter tabs
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            filterTableRows(e.target.dataset.filter);
        });
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

    if (greetingText) greetingText.textContent = `${prefix}, Student! 👋`;
    if (dateStrText) {
        dateStrText.textContent = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
}

async function fetchDashboardData() {
    const skeleton = document.getElementById('dashboard-skeleton');
    const sections = document.getElementById('dashboard-sections');

    try {
        const result = await apiService.get('/api/v1/student/student-dashboard');

        if (!result.success) {
            // API service handles standard auth errors, this handles DB errors
            showDashboardError(result.error || 'Server error. Please try refreshing.');
            return;
        }

        if (skeleton) skeleton.classList.add('hidden');
        if (sections) sections.classList.remove('hidden');

        // Render Data
        renderProfile(result.student);
        renderSummary(result.summary);
        renderActivities(result.activities);
        renderSubjectAnalytics(result.subject_analytics);
        renderUpcomingDeadlines(result.upcoming_deadlines);
        renderNotifications(result.notifications);

        // Render Chart.js
        renderPerformanceTrendChart(result.performance_trend);
        renderSubjectAnalyticsChart(result.subject_analytics);

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
        confirmButtonColor: '#2563eb'
    });
}

function renderProfile(student) {
    if (!student) return;

    const greetingText = document.getElementById('dashboard-greeting');
    if (greetingText) {
        const prefix = greetingText.textContent.split(',')[0];
        greetingText.textContent = `${prefix}, ${student.name.split(' ')[0]} 👋`;
    }

    const initials = student.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const avatar = document.getElementById('avatar-initials');
    if (avatar) avatar.textContent = initials;

    const nameBar = document.getElementById('avatar-student-name');
    if (nameBar) nameBar.textContent = student.name;

    ['fullname', 'prn', 'department', 'semester', 'section', 'batch'].forEach(field => {
        const el = document.getElementById(`prof-${field}`);
        if (el && student[field]) el.textContent = student[field];
    });
}

function renderSummary(summary) {
    if (!summary) return;
    document.getElementById('stat-marks-obtained').textContent = summary.total_marks;
    document.getElementById('stat-overall-percent').textContent = summary.overall_percentage + '%';
    document.getElementById('stat-completion-rate').textContent = summary.completion_rate + '%';

    // Mix Pending and Quiz stats
    const pendEl = document.getElementById('stat-pending-activities');
    if (pendEl) {
        pendEl.innerHTML = `${summary.pending} <span style="font-size: 0.6em; color:var(--text-secondary); display:block; margin-top:2px;">Quizzes: ${summary.quiz_completed}/${summary.quiz_total}</span>`;
    }
}

function renderActivities(activities) {
    const tbody = document.getElementById('activities-table-body');
    if (!tbody) return;

    if (!activities || activities.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="empty-state" style="text-align:center; padding:30px; color:var(--text-secondary);">No CIE-2 activities assigned to you yet.</td></tr>`;
        return;
    }

    tbody.innerHTML = '';
    activities.forEach(act => {
        const tr = document.createElement('tr');
        tr.dataset.status = act.submission_status;

        let badgeClass = 'badge-pending';
        if (act.submission_status === 'Submitted') badgeClass = 'badge-submitted';
        else if (act.submission_status === 'Overdue') badgeClass = 'badge-overdue';

        let actionBtn = act.type_code === 'QUIZ'
            ? `<button class="action-btn" onclick="alert('Starting Quiz: ${act.title}')">Attempt</button>`
            : `<button class="action-btn" onclick="alert('Opening Submission flow for: ${act.title}')">Submit PDF</button>`;

        if (act.submission_status === 'Submitted') {
            actionBtn = `<span style="color:var(--status-sub-color); font-weight:600; font-size: 0.8rem;">Done</span>`;
        }

        tr.innerHTML = `
            <td style="font-weight: 600;">${act.title}</td>
            <td>${act.subject}</td>
            <td>${act.type}</td>
            <td>${act.unit}</td>
            <td>${act.deadline}</td>
            <td><span class="status-badge ${badgeClass}">${act.submission_status}</span></td>
            <td style="font-weight: 700;">${act.marks}</td>
            <td style="max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${act.feedback}">${act.feedback}</td>
            <td>${actionBtn}</td>
        `;
        tbody.appendChild(tr);
    });
}

function filterTableRows(filter) {
    const rows = document.querySelectorAll('#activities-table-body tr');
    rows.forEach(row => {
        if (filter === 'all' || row.dataset.status === filter || row.querySelector('.empty-state')) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function renderSubjectAnalytics(subjects) {
    const grid = document.getElementById('subjects-list-grid');
    if (!grid) return;

    if (!subjects || subjects.length === 0) {
        grid.innerHTML = `<p class="empty-state" style="grid-column: 1/-1; text-align: center; color:var(--text-secondary);">No subject allocations found.</p>`;
        return;
    }

    grid.innerHTML = '';
    subjects.forEach(sub => {
        grid.innerHTML += `
            <div class="subject-stat-card">
                <h3>${sub.subject_name}</h3>
                <span style="font-size:0.75rem; color:var(--text-secondary); margin-top:-6px;">${sub.subject_code}</span>
                <div class="subject-completion">
                   <span>Completion: ${sub.completion_rate}%</span>
                   <span style="font-weight: 700; color:var(--accent-yellow);">${sub.percentage}% Score</span>
                </div>
                <div class="progress-bar-bg" style="width:100%; height:6px; background:var(--border-color); border-radius:3px; overflow:hidden; margin-top:2px;">
                   <div class="progress-bar-fill" style="width: ${sub.completion_rate}%; height:100%; background:var(--accent-blue);"></div>
                </div>
                <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:2px; display:flex; justify-content:space-between;">
                   <span>Activities: ${sub.activities_count}</span>
                   <span>Marks: ${sub.marks_summary}</span>
                </div>
            </div>
        `;
    });
}

function renderUpcomingDeadlines(deadlines) {
    const container = document.getElementById('deadlines-list');
    if (!container) return;

    if (!deadlines || deadlines.length === 0) {
        container.innerHTML = `<p class="empty-state" style="text-align: center; color:var(--text-secondary); padding: 15px;">No upcoming deadlines.</p>`;
        return;
    }

    container.innerHTML = deadlines.map(dl => `
        <div class="deadline-item">
            <div class="deadline-info">
               <h4>${dl.title}</h4>
               <p>${dl.subject}</p>
            </div>
            <div class="deadline-time">${dl.deadline.split(',')[0]}</div>
        </div>
    `).join('');
}

function renderNotifications(notifs) {
    const list = document.getElementById('notif-list-container');
    const indicator = document.getElementById('notif-badge-indicator');
    if (!list) return;

    if (!notifs || notifs.length === 0) {
        list.innerHTML = `<p class="empty-state" style="padding:15px; text-align:center; color:var(--text-secondary);">No messages.</p>`;
        if (indicator) indicator.classList.add('hidden');
        return;
    }

    if (indicator) indicator.classList.remove('hidden');

    list.innerHTML = notifs.map(n => `
        <div class="notif-item ${n.type}">
            <span>${n.message}</span>
            <span class="notif-time">${n.time}</span>
        </div>
    `).join('');
}

// ---- CHART.JS INTEGRATION ----

function renderPerformanceTrendChart(trendData) {
    const container = document.getElementById('custom-trend-bars');
    if (!container) return;

    // Replace custom bars with canvas
    container.innerHTML = '<canvas id="performanceChart" width="100%" height="80"></canvas>';

    if (!trendData || trendData.length === 0) return;

    const ctx = document.getElementById('performanceChart').getContext('2d');

    if (performanceChartInstance) performanceChartInstance.destroy();

    const labels = trendData.map(t => t.label.substring(0, 15) + (t.label.length > 15 ? '...' : ''));
    const data = trendData.map(t => t.score);

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    performanceChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Score (%)',
                data: data,
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                borderWidth: 2,
                pointBackgroundColor: '#2563eb',
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: { color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}

function renderSubjectAnalyticsChart(subjects) {
    // Let's add a radar chart into the overview section if there is a place for it, 
    // or just leave it out if we don't have a container.
    // The SRS just states "Performance Analytics: Chart.js" which we did above.
}
