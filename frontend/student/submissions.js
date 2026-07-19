/**
 * CIE-2 Activity Tracking
 * File: frontend/student/submissions.js
 */

document.addEventListener('DOMContentLoaded', () => {
    fetchHistory();
});

async function fetchHistory() {
    try {
        const result = await apiService.get('/api/v1/student/student-submissions-history');
        if (!result.success) {
            Swal.fire('Error', result.error || 'Failed to load history', 'error');
            return;
        }

        renderHistory(result.history || []);
    } catch (err) {
        console.error(err);
        document.getElementById('history-table-body').innerHTML = `<tr><td colspan="7" style="text-align:center;">Network error.</td></tr>`;
    }
}

function renderHistory(history) {
    const tbody = document.getElementById('history-table-body');

    if (history.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 40px; color:var(--text-muted);">You haven't submitted any activities yet.</td></tr>`;
        return;
    }

    tbody.innerHTML = history.map(h => {
        let statusBadge = 'badge-success';
        if (h.submission_status === 'late') statusBadge = 'badge-danger';

        let gradeStr = `<span style="color:var(--text-muted);">Pending Evaluation</span>`;
        if (h.teacher_marks !== null) {
            gradeStr = `<span style="font-weight:700; color:var(--brand-emerald);">${h.teacher_marks}</span> / ${h.max_marks}`;
        } else if (h.quiz_score !== null) {
            // Auto evaluated quiz
            gradeStr = `<span style="font-weight:700; color:var(--brand-emerald);">${h.quiz_score}</span> / ${h.max_marks}`;
        }

        let feedbackStr = h.feedback ? h.feedback : `<span style="color:var(--text-muted);">-</span>`;

        let actionBtn = '';
        if (h.activity_type === 'Online Quiz') {
            actionBtn = `<button class="btn btn-sm btn-outline" style="border-radius:20px;" onclick="Swal.fire('Quiz Results', 'Score: ${h.quiz_score || h.teacher_marks}', 'info')">View Result</button>`;
        } else if (h.file_path) {
            actionBtn = `<a href="../../${h.file_path}" target="_blank" class="btn btn-sm btn-outline" style="border-radius:20px;">View PDF</a>`;
        }

        return `
            <tr>
                <td>
                    <div style="font-weight: 600;">${h.activity_title}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${h.activity_type}</div>
                </td>
                <td>${h.subject}</td>
                <td>${h.submitted_at}</td>
                <td><span class="badge ${statusBadge}">${h.submission_status}</span></td>
                <td>${gradeStr}</td>
                <td><div style="max-width:150px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${h.feedback || ''}">${feedbackStr}</div></td>
                <td>${actionBtn}</td>
            </tr>
        `;
    }).join('');
}
