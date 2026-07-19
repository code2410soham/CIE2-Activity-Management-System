/**
 * CIE-2 Activity Tracking, Evaluation and Performance Management System
 * File: frontend/auth/change-password.js
 * Purpose: Secure validations and endpoint post requests for password changes.
 *          Uses the centralized apiService for crash-proof, retry-safe API calls.
 */

document.addEventListener('DOMContentLoaded', () => {
    const changeForm = document.getElementById('change-password-form');
    const currentPassInput = document.getElementById('current-password-input');
    const newPassInput = document.getElementById('new-password-input');
    const confirmPassInput = document.getElementById('confirm-password-input');
    const statusMessage = document.getElementById('status-message');
    const submitBtn = document.getElementById('btn-submit');
    const btnText = submitBtn.querySelector('.btn-text');
    const spinner = submitBtn.querySelector('.spinner');

    // Verify that an auth token is in localStorage before rendering
    const token = localStorage.getItem('authToken');
    if (!token) {
        apiService.alertWarning('Session Expired', 'No authentication token found. Redirecting to login.');
        showStatusAlert('Authentication token missing. Redirecting to login...', 'danger');
        setTimeout(() => { window.location.href = './login.php'; }, 2000);
        return;
    }

    // Real-time validations
    currentPassInput.addEventListener('input', () => validateField(currentPassInput, 'current-password-error'));
    newPassInput.addEventListener('input', () => validateField(newPassInput, 'new-password-error'));
    confirmPassInput.addEventListener('input', () => validateField(confirmPassInput, 'confirm-password-error'));

    function validateField(input, errorId) {
        const errorSpan = document.getElementById(errorId);
        const val = input.value.trim();

        if (!val) {
            errorSpan.textContent = 'This field is required.';
            errorSpan.classList.add('visible');
            return false;
        }
        if (input === newPassInput && val.length < 6) {
            errorSpan.textContent = 'Password must be at least 6 characters long.';
            errorSpan.classList.add('visible');
            return false;
        }
        if (input === confirmPassInput && val !== newPassInput.value.trim()) {
            errorSpan.textContent = 'Passwords do not match.';
            errorSpan.classList.add('visible');
            return false;
        }
        errorSpan.textContent = '';
        errorSpan.classList.remove('visible');
        return true;
    }

    function clearErrors() {
        document.querySelectorAll('.error-msg').forEach(el => {
            el.textContent = '';
            el.classList.remove('visible');
        });
        statusMessage.classList.add('hidden');
    }

    changeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();

        const isCurrentValid = validateField(currentPassInput, 'current-password-error');
        const isNewValid = validateField(newPassInput, 'new-password-error');
        const isConfirmValid = validateField(confirmPassInput, 'confirm-password-error');

        if (!isCurrentValid || !isNewValid || !isConfirmValid) {
            showStatusAlert('Please correct the validation errors before submitting.', 'danger');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                currentPassword: currentPassInput.value,
                newPassword: newPassInput.value,
            };

            // ── Safe API call via centralized apiService ──────────────
            const result = await apiService.post('/api/v1/auth/change-password', payload);

            if (!result || !result.success) {
                apiService.showResultError(result, 'Password Update Failed');
                showStatusAlert(result?.error || 'Failed to update password. Please verify your current credentials.', 'danger');
                setLoading(false);
                return;
            }

            apiService.alertSuccess('Password Updated', 'Your password has been changed successfully.');
            showStatusAlert('Password updated successfully! Redirecting to dashboard...', 'success');

            // Determine redirect based on token's role
            setTimeout(() => {
                try {
                    const parts = token.split('.');
                    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
                    const role = payload.role;
                    if (role === 'teacher') {
                        window.location.href = '../teacher/dashboard.php';
                    } else if (role === 'admin') {
                        window.location.href = '../admin/dashboard.php';
                    } else {
                        window.location.href = '../student/dashboard.php';
                    }
                } catch {
                    window.location.href = '../student/dashboard.php';
                }
            }, 1500);

        } catch (err) {
            console.error('[change-password.js] Unexpected error:', err);
            apiService.alertError('Unexpected Error', err.message || 'An unknown error occurred.');
            showStatusAlert(err.message || 'An unexpected error occurred.', 'danger');
            setLoading(false);
        }
    });

    function setLoading(isLoading) {
        submitBtn.disabled = isLoading;
        if (isLoading) {
            btnText.textContent = 'Updating...';
            spinner.classList.remove('hidden');
        } else {
            btnText.textContent = 'Update Password';
            spinner.classList.add('hidden');
        }
    }

    function showStatusAlert(msg, type) {
        statusMessage.textContent = msg;
        statusMessage.className = `status-alert ${type}`;
        statusMessage.classList.remove('hidden');
    }
});
