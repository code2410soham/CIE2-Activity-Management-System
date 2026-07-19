/**
 * CIE-2 Activity Tracking, Evaluation and Performance Management System
 * File: frontend/teacher/activity-management.js
 * Purpose: Handles Teacher CRUD operations for Activities.
 */

document.addEventListener('DOMContentLoaded', () => {
    fetchActivityMetadataAndList();

    document.getElementById('logout-button').addEventListener('click', (e) => {
        e.preventDefault();
        apiService.logout();
    });

    const form = document.getElementById('create-activity-form');
    if (form) {
        form.addEventListener('submit', handleCreateActivity);
    }
});

async function fetchActivityMetadataAndList() {
    try {
        const result = await apiService.get('/api/v1/teacher/teacher-activities');
        if (!result.success) {
            Swal.fire('Error', result.error || 'Failed to load activity management data.', 'error');
            return;
        }

        // Populate Selects
        populateSelect('act-type', result.metadata.types, 'id', 'type_name', 'Select Category');
        // Format subject display
        const classOpts = result.metadata.allocations.map(a => ({
            id: a.allocation_id,
            label: `${a.subject_name} (${a.subject_code}) - Div ${a.section} [${a.academic_year}]`
        }));
        populateSelect('act-subject', classOpts, 'id', 'label', 'Select Active Assignment');

        // Render Table
        renderActivitiesTable(result.activities);

        // Update profile name
        const teacherName = document.getElementById('avatar-teacher-name');
        if (teacherName) {
            const tokenUser = JSON.parse(atob(apiService.getToken().split('.')[1]));
            teacherName.textContent = tokenUser.username;
            document.getElementById('avatar-initials').textContent = tokenUser.username.substring(0, 2).toUpperCase();
        }

    } catch (err) {
        console.error('Fetch error:', err);
    }
}

function populateSelect(elementId, items, valueKey, labelKey, defaultText = '') {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.innerHTML = `<option value="" disabled selected>${defaultText}</option>`;
    items.forEach(item => {
        el.innerHTML += `<option value="${item[valueKey]}">${item[labelKey]}</option>`;
    });
}

function renderActivitiesTable(activities) {
    const tbody = document.getElementById('activities-table-body');
    if (!tbody) return;

    if (!activities || activities.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="empty-state" style="text-align:center; padding:30px; color:var(--text-secondary);">No activities created yet. Create one above!</td></tr>`;
        return;
    }

    tbody.innerHTML = '';
    activities.forEach(act => {
        const tr = document.createElement('tr');

        let typeBadgeClass = 'badge-pending';
        if (act.type_name === 'Assignment') typeBadgeClass = 'badge-submitted';
        if (act.type_name === 'Quiz') typeBadgeClass = 'badge-overdue';

        tr.innerHTML = `
            <td style="font-weight: 600;">${act.title}</td>
            <td>
               <span style="display:block;">${act.subject_name}</span>
               <span style="font-size:0.75rem; color:var(--text-secondary);">Div: ${act.section}</span>
            </td>
            <td><span class="status-badge ${typeBadgeClass}">${act.type_name}</span></td>
            <td>${new Date(act.deadline).toLocaleString()}</td>
            <td><strong>${act.max_marks}</strong></td>
            <td>${act.submission_count}</td>
            <td>
                <button class="action-btn" style="background-color: transparent; color: var(--accent-red); border: 1px solid var(--accent-red); display: inline-flex; align-items:center; gap:4px; padding: 4px 8px; font-size: 0.8rem;" onclick="deleteActivity(${act.id}, '${act.title}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px;"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    Delete
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function handleCreateActivity(event) {
    event.preventDefault();

    const title = document.getElementById('act-title').value;
    const type_id = document.getElementById('act-type').value;
    const allocation_id = document.getElementById('act-subject').value;
    const deadline = document.getElementById('act-deadline').value;
    const max_marks = document.getElementById('act-marks').value;
    const instructions = document.getElementById('act-desc').value;

    if (!title || !type_id || !allocation_id || !deadline || !max_marks) {
        Swal.fire('Warning', 'Please fill in all required fields.', 'warning');
        return;
    }

    const payload = {
        title, type_id, allocation_id, deadline, max_marks, instructions
    };

    const btn = document.getElementById('publish-btn');
    btn.disabled = true;
    btn.textContent = 'Publishing...';

    const result = await apiService.post('/api/v1/teacher/teacher-activities', payload);

    btn.disabled = false;
    btn.textContent = 'Publish Activity';

    if (result.success) {
        Swal.fire({
            icon: 'success',
            title: 'Activity Published!',
            text: 'Your students have been notified and it is now active.',
            background: '#1e293b',
            color: '#f8fafc',
            timer: 3000
        });
        document.getElementById('create-activity-form').reset();
        fetchActivityMetadataAndList(); // Refresh table
    } else {
        Swal.fire('Failed', result.error || 'Server error while saving.', 'error');
    }
}

function deleteActivity(id, title) {
    Swal.fire({
        title: 'Delete Activity?',
        text: `Are you sure you want to delete "${title}"? This cannot be undone!`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#475569',
        confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
        if (result.isConfirmed) {
            const apiRes = await apiService.delete(`/api/v1/teacher/teacher-activities?id=${id}`);
            if (apiRes.success) {
                Swal.fire('Deleted!', 'The activity has been removed.', 'success');
                fetchActivityMetadataAndList(); // refresh
            } else {
                Swal.fire('Error', apiRes.error || 'Could not delete.', 'error');
            }
        }
    });
}
