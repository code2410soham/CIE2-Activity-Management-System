/**
 * CIE-2 Activity Tracking, Evaluation and Performance Management System
 * File: frontend/teacher/evaluation.js
 * Purpose: Manage the evaluation queue, render PDFs dynamically into the split view, and push grades to the API.
 */

let currentSubmissionsList = [];
let activeSubmissionId = null;

document.addEventListener('DOMContentLoaded', () => {
    fetchEvaluationQueue();

    document.getElementById('logout-button').addEventListener('click', (e) => {
        e.preventDefault();
        apiService.logout();
    });

    document.getElementById('submit-grade-btn').addEventListener('click', submitEvaluation);
});

async function fetchEvaluationQueue() {
    try {
        const result = await apiService.get('/api/v1/teacher/evaluations');
        if (!result.success) {
            Swal.fire('Error', result.error || 'Failed to load submissions queue.', 'error');
            return;
        }

        currentSubmissionsList = result.submissions;
        renderQueue();
    } catch (err) {
        console.error('Fetch error:', err);
    }
}

function renderQueue() {
    const listEl = document.getElementById('queue-list');
    listEl.innerHTML = '';

    if (currentSubmissionsList.length === 0) {
        listEl.innerHTML = `<div style="padding:20px; text-align:center; color: var(--text-secondary);">No submissions available for review.</div>`;
        return;
    }

    currentSubmissionsList.forEach(sub => {
        const item = document.createElement('div');
        item.className = 'queue-item';
        item.id = `q-item-${sub.submission_id}`;

        let statusMarker = '';
        if (sub.marks_awarded !== null) {
            statusMarker = `<span style="font-size: 0.8rem; color: var(--accent-green);">Graded: ${sub.marks_awarded}/${sub.max_marks}</span>`;
        } else {
            statusMarker = `<span style="font-size: 0.8rem; color: var(--accent-yellow);">Needs Grading</span>`;
        }

        item.innerHTML = `
            <div>
                <strong style="display:block; font-size:0.9rem;">${sub.first_name} ${sub.last_name} (${sub.zrpn})</strong>
                <span style="font-size:0.8rem; color:var(--text-secondary);">${sub.activity_title}</span>
            </div>
            <div>
                ${statusMarker}
            </div>
        `;

        item.addEventListener('click', () => selectSubmission(sub.submission_id));
        listEl.appendChild(item);
    });
}

function selectSubmission(submissionId) {
    // Clear active styling
    document.querySelectorAll('.queue-item').forEach(el => el.classList.remove('active'));

    // Set active
    const itemEl = document.getElementById(`q-item-${submissionId}`);
    if (itemEl) itemEl.classList.add('active');

    const sub = currentSubmissionsList.find(s => s.submission_id === submissionId);
    if (!sub) return;

    activeSubmissionId = submissionId;

    // Load PDF Preview
    const pdfContainer = document.getElementById('pdf-viewer');
    if (sub.file_path) {
        // Appending timestamp to strictly bypass iframe cache if teacher evaluating multi versions
        const fullUrl = window.APP_CONFIG.API_BASE_URL + '/' + sub.file_path + '?v=' + new Date().getTime();
        pdfContainer.innerHTML = `<iframe src="${fullUrl}" title="PDF Viewer"></iframe>`;
    } else {
        pdfContainer.innerHTML = `<p style="padding:20px; text-align:center;">No digital file provided for this submission (Text answers or empty).</p>`;
    }

    // Load Grading Panel Data
    document.getElementById('grading-form-container').style.display = 'flex';
    document.getElementById('lbl-student-name').textContent = `${sub.first_name} ${sub.last_name} (${sub.zrpn})`;
    document.getElementById('lbl-activity-title').textContent = `${sub.activity_title} - ${sub.subject_name}`;
    document.getElementById('lbl-max-marks').textContent = sub.max_marks;

    document.getElementById('grade-marks').value = sub.marks_awarded !== null ? sub.marks_awarded : '';
    document.getElementById('grade-marks').max = sub.max_marks;
    document.getElementById('grade-feedback').value = sub.general_feedback || '';
}

async function submitEvaluation() {
    if (!activeSubmissionId) return;

    const marks = document.getElementById('grade-marks').value;
    const feedback = document.getElementById('grade-feedback').value;

    if (marks === '') {
        Swal.fire('Warning', 'Please enter marks to award.', 'warning');
        return;
    }

    const max_marks = parseFloat(document.getElementById('lbl-max-marks').textContent);
    if (parseFloat(marks) > max_marks || parseFloat(marks) < 0) {
        Swal.fire('Error', `Marks must be between 0 and ${max_marks}.`, 'error');
        return;
    }

    const payload = {
        submission_id: activeSubmissionId,
        marks: parseFloat(marks),
        feedback: feedback
    };

    const btn = document.getElementById('submit-grade-btn');
    btn.disabled = true;
    btn.textContent = 'Saving...';

    const result = await apiService.post('/api/v1/teacher/evaluations', payload);

    btn.disabled = false;
    btn.textContent = 'Save Grading';

    if (result.success) {
        Swal.fire({
            icon: 'success',
            title: 'Evaluation Saved',
            timer: 2000,
            showConfirmButton: false,
            background: '#1e293b',
            color: '#f8fafc'
        });
        fetchEvaluationQueue(); // Refresh list to update UI indicators
    } else {
        Swal.fire('Failed', result.error, 'error');
    }
}
