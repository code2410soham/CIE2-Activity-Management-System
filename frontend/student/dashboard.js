/**
 * CIE-2 Activity Tracking, Evaluation and Performance Management System
 * File: frontend/student/dashboard.js
 * Purpose: Handles fetching dashboard state, client loading skeletons, and rendering database values.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Verify Authorization Token
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '../auth/login.html';
        return;
    }

    // Set greeting current local datetime
    setDateGreeting();

    // 2. Fetch Dashboard Data
    fetchDashboardData(token);

    // Setup Logout Trigger
    document.getElementById('logout-button').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('authToken');
        // Delete cookie by setting expiry to past
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = '../auth/login.html';
    });

    // Setup Notification bell toggle
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

    // Setup filter tabs
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            filterTableRows(e.target.dataset.filter);
        });
    });
});

/**
 * Renders the local greeting based on time of day (Good Morning, Afternoon, Evening, Night)
 */
function setDateGreeting() {
    const greetingText = document.getElementById('dashboard-greeting');
    const dateStrText = document.getElementById('dashboard-date-str');

    // Use target local date in UTC+5:30
    const now = new Date();
    const hours = now.getHours();

    let prefix = "Good Morning";
    if (hours >= 12 && hours < 17) {
        prefix = "Good Afternoon";
    } else if (hours >= 17 && hours < 22) {
        prefix = "Good Evening";
    } else if (hours >= 22 || hours < 5) {
        prefix = "Good Night";
    }

    if (greetingText) {
        greetingText.textContent = `${prefix}, Student! 👋`;
    }

    if (dateStrText) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateStrText.textContent = now.toLocaleDateString('en-US', options);
    }
}

async function fetchDashboardData(token) {
    const skeleton = document.getElementById('dashboard-skeleton');
    const sections = document.getElementById('dashboard-sections');

    try {
        const response = await fetch('/api/v1/student/dashboard', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.error || 'Failed to authenticate dashboard session.');
        }

        // Hide loader, show sections
        if (skeleton) skeleton.classList.add('hidden');
        if (sections) sections.classList.remove('hidden');

        // Render Data Content
        renderProfile(result.student);
        renderSummary(result.summary);
        renderActivities(result.activities);
        renderSubjectAnalytics(result.subject_analytics);
        renderUpcomingDeadlines(result.upcoming_deadlines);
        renderNotifications(result.notifications);
        renderPerformanceTrend(result.performance_trend);

    } catch (err) {
        console.error(err);
        // Show session redirect
        localStorage.removeItem('authToken');
        window.location.href = '../auth/login.html';
    }
}

function renderProfile(student) {
    if (!student) return;

    // Greeting custom name
    const greetingText = document.getElementById('dashboard-greeting');
    if (greetingText) {
        const text = greetingText.textContent;
        const prefix = text.split(',')[0];
        greetingText.textContent = `${prefix}, ${student.name.split(' ')[0]} 👋`;
    }

    // Set Initials in Avatar
    const initials = student.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const avatar = document.getElementById('avatar-initials');
    if (avatar) avatar.textContent = initials;

    const nameBar = document.getElementById('avatar-student-name');
    if (nameBar) nameBar.textContent = student.name;

    // Field settings
    document.getElementById('prof-fullname').textContent = student.name;
    document.getElementById('prof-prn').textContent = student.prn;
    document.getElementById('prof-department').textContent = student.department;
    document.getElementById('prof-semester').textContent = student.semester;
    document.getElementById('prof-section').textContent = student.section;
    document.getElementById('prof-batch').textContent = student.batch;
}

function renderSummary(summary) {
    if (!summary) return;
    document.getElementById('stat-marks-obtained').textContent = summary.total_marks;
    document.getElementById('stat-overall-percent').textContent = summary.overall_percentage + '%';
    document.getElementById('stat-completion-rate').textContent = summary.completion_rate + '%';
    document.getElementById('stat-pending-activities').textContent = summary.pending;
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

        // Badge class
        let badgeClass = 'badge-pending';
        if (act.submission_status === 'Submitted') {
            badgeClass = 'badge-submitted';
        } else if (act.submission_status === 'Overdue') {
            badgeClass = 'badge-overdue';
        }

        // Action button spec
        let actionBtn = '';
        if (act.type_code === 'QUIZ') {
            actionBtn = `<button class="action-btn" onclick="alert('Starting Quiz: ${act.title}')">Attempt</button>`;
        } else {
            actionBtn = `<button class="action-btn" onclick="alert('Opening Submission flow for: ${act.title}')">Submit PDF</button>`;
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
    const tbody = document.getElementById('activities-table-body');
    if (!tbody) return;

    const rows = tbody.querySelectorAll('tr');
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
        const card = document.createElement('div');
        card.className = 'subject-stat-card';
        card.innerHTML = `
            <h3>${sub.subject_name}</h3>
            <span style="font-size:0.75rem; color:var(--text-secondary); margin-top:-6px;">${sub.subject_code}</span>
            <div class="subject-completion">
               <span>Completion: ${sub.completion_rate}%</span>
               <span style="font-weight: 700; color:var(--accent-yellow);">${sub.percentage}% Score</span>
            </div>
            <div class="progress-bar-bg">
               <div class="progress-bar-fill" style="width: ${sub.completion_rate}%;"></div>
            </div>
            <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:2px; display:flex; justify-content:space-between;">
               <span>Activities: ${sub.activities_count}</span>
               <span>Marks: ${sub.marks_summary}</span>
            </div>
        `;
        grid.appendChild(card);
    });
}

function renderUpcomingDeadlines(deadlines) {
    const container = document.getElementById('deadlines-list');
    if (!container) return;

    if (!deadlines || deadlines.length === 0) {
        container.innerHTML = `<p class="empty-state" style="text-align: center; color:var(--text-secondary); padding: 15px;">No upcoming deadlines.</p>`;
        return;
    }

    container.innerHTML = '';
    deadlines.forEach(dl => {
        const item = document.createElement('div');
        item.className = 'deadline-item';

        // Extract time parts
        item.innerHTML = `
            <div class="deadline-info">
               <h4>${dl.title}</h4>
               <p>${dl.subject}</p>
            </div>
            <div class="deadline-time">
               ${dl.deadline.split(',')[0]}
            </div>
        `;
        container.appendChild(item);
    });
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

    list.innerHTML = '';
    notifs.forEach(n => {
        const div = document.createElement('div');
        div.className = `notif-item ${n.type}`;
        div.innerHTML = `
            <span>${n.message}</span>
            <span class="notif-time">${n.time}</span>
        `;
        list.appendChild(div);
    });
}

function renderPerformanceTrend(trend) {
    const container = document.getElementById('custom-trend-bars');
    if (!container) return;

    if (!trend || trend.length === 0) {
        container.style.display = 'none';
        const p = document.createElement('p');
        p.textContent = "Insufficient assessment data to view trends.";
        p.className = 'empty-state';
        p.style.textAlign = 'center';
        p.style.padding = '20px';
        p.style.color = 'var(--text-secondary)';
        container.parentNode.appendChild(p);
        return;
    }

    container.innerHTML = '';
    trend.forEach(t => {
        const barWr = document.createElement('div');
        barWr.className = 'bar-wrapper';
        barWr.innerHTML = `
            <div class="bar-col" style="height: ${t.score}px;" data-score="${t.score}"></div>
            <span class="bar-label" title="${t.label}">${t.label}</span>
        `;
        container.appendChild(barWr);
    });
}
