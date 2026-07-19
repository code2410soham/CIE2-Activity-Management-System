/**
 * CIE-2 Activity Tracking, Evaluation and Performance Management System
 * File: frontend/admin/user-management.js
 * Purpose: Fetch user statistics and control the table rendering via DOM tabs for Admins.
 */

document.addEventListener('DOMContentLoaded', () => {
    bindTabs();
    fetchUsers();

    document.getElementById('logout-button').addEventListener('click', (e) => {
        e.preventDefault();
        apiService.logout();
    });
});

function bindTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const panes = document.querySelectorAll('.tab-pane');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active from all tabs & panes
            tabs.forEach(t => t.classList.remove('active'));
            panes.forEach(p => p.classList.remove('active'));

            // Add active to clicked target
            tab.classList.add('active');
            const targetId = tab.getAttribute('data-tab');
            document.getElementById(targetId).classList.add('active');
        });
    });
}

async function fetchUsers() {
    try {
        const result = await apiService.get('/api/v1/admin/users');
        if (!result.success) {
            Swal.fire('Error', result.error || 'Failed to load users.', 'error');
            return;
        }

        renderStudents(result.students);
        renderTeachers(result.teachers);
    } catch (err) {
        console.error('Fetch error:', err);
    }
}

function renderStudents(students) {
    const tbody = document.getElementById('student-tbody');
    tbody.innerHTML = '';

    if (!students || students.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No students found in the registry.</td></tr>`;
        return;
    }

    students.forEach(s => {
        const tr = document.createElement('tr');
        const statColor = s.is_active ? 'var(--accent-green)' : 'var(--text-secondary)';
        const statLabel = s.is_active ? 'Active' : 'Inactive';

        tr.innerHTML = `
            <td>
               <strong style="display:block;">${s.name}</strong>
               <span style="font-size:0.8rem; color:var(--text-secondary)">@${s.username}</span>
            </td>
            <td style="font-family: monospace;">${s.usn}</td>
            <td>${s.department} (${s.semester} - Sec ${s.section})</td>
            <td>${s.email}</td>
            <td style="color:${statColor}; font-weight:600;">${statLabel}</td>
        `;
        tbody.appendChild(tr);
    });
}

function renderTeachers(teachers) {
    const tbody = document.getElementById('teacher-tbody');
    tbody.innerHTML = '';

    if (!teachers || teachers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No faculty members registered.</td></tr>`;
        return;
    }

    teachers.forEach(t => {
        const tr = document.createElement('tr');
        const statColor = t.is_active ? 'var(--accent-blue)' : 'var(--text-secondary)';
        const statLabel = t.is_active ? 'Active' : 'Archived';
        const name = (typeof t.name !== 'undefined') ? t.name : t.username; // fallback since teachers might not have name map currently

        tr.innerHTML = `
            <td>
               <strong style="display:block;">${name}</strong>
               <span style="font-size:0.8rem; color:var(--text-secondary)">@${t.username}</span>
            </td>
            <td style="font-family: monospace;">${t.employee_id}</td>
            <td>${t.department}</td>
            <td>${t.designation || 'Faculty'}</td>
            <td>${t.email}</td>
            <td style="color:${statColor}; font-weight:600;">${statLabel}</td>
        `;
        tbody.appendChild(tr);
    });
}
