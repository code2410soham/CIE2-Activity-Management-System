/**
 * CIE-2 Activity Tracking, Evaluation and Performance Management System
 * File: frontend/auth/change-password.js
 * Purpose: Secure validations and endpoint post requests for password changes.
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

    // Verify that an auth token is in localStorage
    const token = localStorage.getItem('authToken');
    if (!token) {
        showStatusAlert('Authentication token missing. Redirecting to login...', 'danger');
        setTimeout(() => {
            window.location.href = './login.html';
        }, 2000);
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

        // Perform AJAX Post call
        const payload = {
            currentPassword: currentPassInput.value,
            newPassword: newPassInput.value
        };

        try {
            const response = await fetch('../../backend/api/change-password.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Failed to update password. Verify current credentials.');
            }

            showStatusAlert('Password updated successfully! Redirecting to dashboard...', 'success');

            // Clear the temporary mustChangePassword criteria and continue to dashboard
            setTimeout(() => {
                window.location.href = '../student/dashboard.php';
            }, 1500);

        } catch (err) {
            showStatusAlert(err.message, 'danger');
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
