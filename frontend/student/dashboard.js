/**
 * CIE-2 Activity Tracking
 * File: frontend/student/dashboard.js
 */

let performanceChartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    setDateGreeting();
    fetchDashboardData();

    document.getElementById('logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        apiService.logout();
    });

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const body = document.body;
            let currentTheme = body.getAttribute('data-theme') || 'light';
            let newTheme = currentTheme === 'light' ? 'dark' : 'light';
            body.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);

            // Redraw chart to match theme lines
            if (window.cachedDashboardData) {
                renderPerformanceTrendChart(window.cachedDashboardData.performance_trend);
            }
        });

        // Initialize from localstorage
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.setAttribute('data-theme', savedTheme);
    }
});

function setDateGreeting() {
    const greetingMsg = document.getElementById('greetingMsg');
    if (!greetingMsg) return;

    const now = new Date();
    const hours = now.getHours();
    let prefix = "Good Morning";
    if (hours >= 12 && hours < 17) prefix = "Good Afternoon";
    else if (hours >= 17 && hours < 22) prefix = "Good Evening";
    else if (hours >= 22 || hours < 5) prefix = "Good Night";

    greetingMsg.textContent = `${prefix}, Loading...`;
}

async function fetchDashboardData() {
    try {
        const result = await apiService.get('/api/v1/student/student-dashboard');

        if (!result.success) {
            Swal.fire({ icon: 'error', title: 'Oops', text: result.error || 'Failed to load dashboard' });
            return;
        }

        window.cachedDashboardData = result;

        // Render sections
        renderProfile(result.student);
        renderSummary(result.summary);
        renderUpcoming(result.upcoming_deadlines || result.activities); // Fallback to all activities if no distinct upcoming
        renderPerformanceTrendChart(result.performance_trend);

    } catch (err) {
        console.error(err);
    }
}

function renderProfile(student) {
    if (!student) return;

    // Update Greeting
    const greetingMsg = document.getElementById('greetingMsg');
    if (greetingMsg) {
        const parts = greetingMsg.textContent.split(',');
        greetingMsg.textContent = `${parts[0]}, ${student.name.split(' ')[0]} 👋`;
    }

    const initials = student.name.substring(0, 2).toUpperCase();
    document.getElementById('profileInitials').textContent = initials;
    document.getElementById('profileName').textContent = student.name;
    document.getElementById('profilePRN').textContent = student.prn || student.usn || 'N/A';
}

function renderSummary(summary) {
    if (!summary) return;

    // Animate Counters
    animateValue("kpi-avg-score", 0, summary.overall_percentage || 0, 1000, "%");
    animateValue("kpi-completed", 0, summary.completion_rate ? Math.round((summary.completion_rate / 100) * (summary.total_activities || 10)) : 0, 1000, "");
    animateValue("kpi-pending", 0, summary.pending || 0, 1000, "");

    const qs = summary.quiz_completed || 0;
    const qt = summary.quiz_total || 0;
    document.getElementById('kpi-quizzes').textContent = `${qs} / ${qt}`;
}

function animateValue(id, start, end, duration, suffix) {
    const obj = document.getElementById(id);
    if (!obj) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const current = Math.floor(progress * (end - start) + start);
        obj.innerHTML = current + suffix;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function renderUpcoming(deadlines) {
    const tbody = document.getElementById('upcoming-table-body');
    if (!tbody) return;

    if (!deadlines || deadlines.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">No upcoming activities found.</td></tr>`;
        return;
    }

    tbody.innerHTML = '';
    deadlines.slice(0, 5).forEach(act => {
        let badge = 'badge-info';
        if (act.submission_status === 'Pending') badge = 'badge-pending';
        if (act.submission_status === 'Submitted') badge = 'badge-success';
        if (act.submission_status === 'Overdue') badge = 'badge-danger';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div style="font-weight: 600;">${act.title}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${act.subject}</div>
            </td>
            <td><span class="badge ${badge}">${act.type || 'N/A'}</span></td>
            <td>${act.deadline}</td>
            <td><a href="activities.php" class="btn btn-sm btn-outline">View</a></td>
        `;
        tbody.appendChild(tr);
    });
}

function renderPerformanceTrendChart(trendData) {
    const ctx = document.getElementById('performanceChart');
    if (!ctx) return;

    if (performanceChartInstance) performanceChartInstance.destroy();

    // Dummy fallback if no trend data from DB
    if (!trendData || trendData.length === 0) {
        trendData = [
            { label: 'Activity 1', score: 60 },
            { label: 'Activity 2', score: 85 },
            { label: 'Activity 3', score: 70 }
        ];
    }

    const isDark = document.body.getAttribute('data-theme') === 'dark';
    const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
    const textColor = isDark ? '#cbd5e1' : '#475569';

    performanceChartInstance = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: trendData.map(t => t.label.substring(0, 10)),
            datasets: [{
                label: 'Score (%)',
                data: trendData.map(t => t.score),
                borderColor: '#4338ca',
                backgroundColor: 'rgba(67, 56, 202, 0.1)',
                borderWidth: 2,
                pointBackgroundColor: '#4338ca',
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, max: 100, grid: { color: gridColor }, ticks: { color: textColor } },
                x: { grid: { display: false }, ticks: { color: textColor } }
            }
        }
    });
}
