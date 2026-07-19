/**
 * CIE-2 Activity Tracking, Evaluation and Performance Management System
 * File: frontend/student/activities.js
 * Purpose: Handles fetching pending activities and processing PDF uploads gracefully via SweetAlert2.
 */

document.addEventListener('DOMContentLoaded', () => {
    fetchActivities();

    document.getElementById('logout-button').addEventListener('click', (e) => {
        e.preventDefault();
        apiService.logout();
    });
});

async function fetchActivities() {
    try {
        const result = await apiService.get('/api/v1/student/student-activities');
        if (!result.success) {
            Swal.fire('Error', result.error || 'Failed to load activities.', 'error');
            return;
        }

        renderActivitiesList(result.activities);
    } catch (err) {
        console.error('Fetch error:', err);
    }
}

function renderActivitiesList(activities) {
    const container = document.getElementById('activities-container');
    if (!container) return;

    if (!activities || activities.length === 0) {
        container.innerHTML = `<div style="padding:40px; text-align:center; color: var(--text-secondary);">You have no pending or past activities at this moment. You're all caught up!</div>`;
        return;
    }

    container.innerHTML = '';
    const now = new Date();

    activities.forEach(act => {
        const deadline = new Date(act.deadline);
        let timeStatusHTML = '';
        let actionHTML = '';

        if (act.submission_status === 'submitted') {
            timeStatusHTML = `<span class="deadline-text text-success">Submitted on ${new Date(act.submitted_at).toLocaleString()}</span>`;
            actionHTML = `
                <button class="action-btn" style="background-color: transparent; border: 1px solid var(--accent-green); color: var(--accent-green);" onclick="triggerUpload('${act.activity_id}', '${act.title}', true)">
                   Update Submission
                </button>`;
        } else if (deadline < now) {
            timeStatusHTML = `<span class="deadline-text text-danger">Missed Deadline (${deadline.toLocaleDateString()})</span>`;
            actionHTML = `<button class="btn btn-secondary disabled" disabled>Locked</button>`;
        } else {
            timeStatusHTML = `<span class="deadline-text" style="color:var(--accent-yellow)">Due: ${deadline.toLocaleString()}</span>`;
            actionHTML = `<button class="action-btn" onclick="triggerUpload('${act.activity_id}', '${act.title}', false)">Submit PDF</button>`;
        }

        const card = document.createElement('div');
        card.className = 'assignment-card';
        card.innerHTML = `
            <div class="assignment-info">
                <h3>${act.title}</h3>
                <p>${act.instructions || 'No special instructions provided.'}</p>
                <div class="assignment-meta">
                    <span class="meta-tag">${act.subject}</span>
                    <span class="meta-tag">${act.category}</span>
                    <span class="meta-tag">Marks: ${act.max_marks}</span>
                </div>
            </div>
            <div class="assignment-action">
                ${timeStatusHTML}
                ${actionHTML}
            </div>
        `;
        container.appendChild(card);
    });
}

function triggerUpload(activityId, title, isUpdate) {
    Swal.fire({
        title: isUpdate ? 'Update Submission' : 'Submit Activity',
        html: `
            <p style="margin-bottom: 20px;">Uploading for <strong>${title}</strong></p>
            <input type="file" id="submissionFile" accept="application/pdf" style="margin: 0 auto; display: block; border: 1px solid #ccc; padding: 10px; border-radius: 6px; width: 80%;">
            <p style="font-size:0.8rem; color: #888; margin-top:10px;">Only .pdf files are accepted. Max 5MB.</p>
        `,
        showCancelButton: true,
        confirmButtonText: 'Upload File',
        cancelButtonText: 'Cancel',
        showLoaderOnConfirm: true,
        background: '#1e293b',
        color: '#f8fafc',
        preConfirm: async () => {
            const fileInput = document.getElementById('submissionFile');
            if (!fileInput.files.length) {
                Swal.showValidationMessage('Please select a PDF file.');
                return false;
            }
            const file = fileInput.files[0];
            if (file.type !== 'application/pdf') {
                Swal.showValidationMessage('Invalid format. Please upload a PDF.');
                return false;
            }

            const formData = new FormData();
            formData.append('activity_id', activityId);
            formData.append('submission_file', file);

            try {
                // Fetch directly because apiService currently wraps JSON.stringify, and we need multipart Form
                const token = apiService.getToken();
                const response = await fetch(window.APP_CONFIG.API_BASE_URL + '/api/v1/student/student-upload', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + token
                    },
                    body: formData
                });
                const result = await response.json();
                if (!result.success) throw new Error(result.error);
                return result;
            } catch (error) {
                Swal.showValidationMessage(`Upload failed: ${error.message}`);
                return false;
            }
        },
        allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Success!',
                text: 'Your document was uploaded securely.',
                icon: 'success',
                background: '#1e293b',
                color: '#f8fafc'
            });
            fetchActivities(); // refresh listing
        }
    });
}
