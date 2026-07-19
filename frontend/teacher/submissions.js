/**
 * CIE-2 Activity Tracking
 * File: frontend/teacher/submissions.js
 */

document.addEventListener('DOMContentLoaded', () => {
    fetchSubmissions();
});

async function fetchSubmissions() {
    try {
        const res = await apiService.get('/api/v1/teacher/teacher-submissions');
        const tb = document.getElementById('subs-body');
        if (!tb) return;

        if (res.success && res.submissions) {
            if (res.submissions.length === 0) {
                tb.innerHTML = '<tr><td colspan="4" style="text-align:center;">No submissions found.</td></tr>';
                return;
            }

            tb.innerHTML = res.submissions.map(s => {
                let statusBadge = 'badge-pending';
                if (s.submission_status === 'submitted') statusBadge = 'badge-success';
                else if (s.submission_status === 'late') statusBadge = 'badge-danger';

                let actionStr = '';
                if (s.file_path) {
                    actionStr = `<a href="../../${s.file_path}" target="_blank" class="btn btn-sm btn-outline">View PDF</a>`;
                } else {
                    actionStr = `<span style="color:var(--text-muted); font-size:0.8rem;">Auto-graded / No File</span>`;
                }

                // If evaluated already
                let evalInfo = '';
                if (s.evaluation_id) {
                    evalInfo = `<div style="font-size:0.75rem; color:var(--brand-emerald); margin-top:4px;">Evaluated: ${s.marks_awarded} / ${s.max_marks}</div>`;
                }

                return `
                    <tr>
                        <td>
                            <div style="font-weight:600;">${s.student_name}</div>
                            <div style="font-size:0.75rem; color:var(--text-muted);">${s.student_prn}</div>
                        </td>
                        <td>
                            <div style="font-weight:600; font-size: 0.9rem;">${s.activity_title}</div>
                            ${evalInfo}
                        </td>
                        <td><span class="badge ${statusBadge}">${s.submission_status}</span></td>
                        <td>${actionStr}</td>
                    </tr>
                `;
            }).join('');
        } else {
            tb.innerHTML = '<tr><td colspan="4" style="text-align:center;">Failed to load data.</td></tr>';
        }
    } catch (err) {
        console.error(err);
    }
}
