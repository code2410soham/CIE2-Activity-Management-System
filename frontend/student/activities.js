/**
 * CIE-2 Activity Tracking
 * File: frontend/student/activities.js
 */

let allActivities = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchActivities();

    const filters = document.querySelectorAll('#filters-container .btn');
    filters.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filters.forEach(b => {
                b.classList.remove('btn-primary');
                b.classList.add('btn-outline');
            });
            e.target.classList.remove('btn-outline');
            e.target.classList.add('btn-primary');
            renderCards(e.target.dataset.filter);
        });
    });
});

async function fetchActivities() {
    try {
        const result = await apiService.get('/api/v1/student/student-activities');
        if (!result.success) {
            Swal.fire('Error', result.error || 'Failed to load activities', 'error');
            return;
        }

        allActivities = result.activities || [];
        renderCards('all');

    } catch (err) {
        console.error(err);
        document.getElementById('activities-deck').innerHTML = `<p style="grid-column:1/-1;">Error loading data.</p>`;
    }
}

function renderCards(filter) {
    const deck = document.getElementById('activities-deck');
    let filtered = allActivities;

    if (filter !== 'all') {
        filtered = allActivities.filter(a => a.submission_status.toLowerCase() === filter);
    }

    if (filtered.length === 0) {
        deck.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 40px; color: var(--text-muted); font-size:1.1rem;">No activities found matching criteria.</div>`;
        return;
    }

    deck.innerHTML = filtered.map(a => {
        let badgeType = 'badge-info';
        if (a.submission_status === 'pending') badgeType = 'badge-pending';
        if (a.submission_status === 'submitted') badgeType = 'badge-success';
        if (a.submission_status === 'overdue') badgeType = 'badge-danger';

        const isQuiz = a.type_code === 'QUIZ';
        let actionBtn = '';
        if (a.submission_status === 'pending') {
            if (isQuiz) {
                actionBtn = `<button class="btn btn-primary" style="width:100%" onclick="window.location.href='quizzes.php?act_id=${a.activity_id}'">Take Quiz</button>`;
            } else {
                // We will implement file upload in submissions.php modal or here.
                actionBtn = `<button class="btn btn-outline" style="width:100%; border-color:var(--brand-indigo); color:var(--brand-indigo);" onclick="openUploadModal('${a.activity_id}', '${a.title}')">Submit File</button>`;
            }
        } else if (a.submission_status === 'submitted') {
            actionBtn = `<button class="btn btn-outline" style="width:100%" disabled>Submitted</button>`;
            // allow replacement logic later via submissions tab
        } else if (a.submission_status === 'overdue') {
            actionBtn = `<button class="btn btn-outline" style="width:100%; opacity:0.5; color:var(--brand-rose);" disabled>Deadline Passed</button>`;
        }

        return `
            <div class="glass-panel" style="display:flex; flex-direction:column; justify-content:space-between; gap:16px;">
                <div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
                        <span class="badge ${badgeType}">${a.category}</span>
                        <span style="font-size:0.8rem; color:var(--text-muted); font-weight:600;">${a.max_marks} Marks</span>
                    </div>
                    <h3 style="font-weight:700; font-size:1.2rem; margin-bottom:8px;">${a.title}</h3>
                    <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:16px; line-height:1.4;">${a.subject}</p>
                    <p style="color:var(--text-secondary); font-size:0.85rem; margin-bottom:16px; min-height:40px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${a.instructions || 'No special instructions given.'}</p>
                    <div style="display:flex; align-items:center; gap:6px; color:var(--text-muted); font-size:0.8rem; margin-bottom:4px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        ${a.deadline}
                    </div>
                </div>
                <div>
                    ${actionBtn}
                </div>
            </div>
        `;
    }).join('');
}

function openUploadModal(actId, title) {
    Swal.fire({
        title: 'Submit Assignment',
        html: `
            <p style="margin-bottom:16px;">Activity: <strong>${title}</strong></p>
            <input type="file" id="assignment-pdf" accept=".pdf" class="swal2-input" style="width:85%; font-size:0.9rem;" />
        `,
        showCancelButton: true,
        confirmButtonText: 'Upload',
        confirmButtonColor: '#10b981',
        preConfirm: () => {
            const fileInput = document.getElementById('assignment-pdf');
            if (fileInput.files.length === 0) {
                Swal.showValidationMessage('Please select a PDF file');
            }
            return fileInput.files[0];
        }
    }).then((res) => {
        if (res.isConfirmed) {
            uploadFile(actId, res.value);
        }
    });
}

function uploadFile(actId, file) {
    const fd = new FormData();
    fd.append('activity_id', actId);
    fd.append('file', file);

    // We will call the upload API here. Let's assume we have it.
    Swal.fire({
        title: 'Uploading...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    // In native Fetch logic we use token
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    fetch(apiService.baseUrl + '/student-upload.php', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token },
        body: fd
    })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                Swal.fire('Success', 'File uploaded successfully!', 'success').then(() => fetchActivities());
            } else {
                Swal.fire('Error', data.error || 'Upload failed', 'error');
            }
        })
        .catch(err => {
            Swal.fire('Error', 'Network Error', 'error');
        });
}
