/**
 * CIE-2 Activity Tracking, Evaluation and Performance Management System
 * File: frontend/auth/login.js
 * Purpose: Interactive frontend scripts for role-switching, real-time validations, and login integration.
 *          Uses the centralized apiService for crash-proof, retry-safe API calls.
 */

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const roleTabs = document.querySelectorAll('.role-tab');
    const usernameLabel = document.getElementById('username-label');
    const usernameInput = document.getElementById('username-input');
    const passwordInput = document.getElementById('password-input');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const statusMessage = document.getElementById('status-message');
    const submitBtn = document.getElementById('btn-login-submit');
    const btnText = submitBtn.querySelector('.btn-text');
    const spinner = submitBtn.querySelector('.spinner');

    let currentRole = 'student';

    // 1. Role Selection Switching
    roleTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            roleTabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
            currentRole = tab.getAttribute('data-role');
            updateFormLabels();
            clearErrors();
        });
    });

    function updateFormLabels() {
        if (currentRole === 'student') {
            usernameLabel.textContent = 'PRN Number';
            usernameInput.placeholder = 'Enter your PRN (e.g. 125UIT1103)';
            usernameInput.type = 'text';
        } else if (currentRole === 'teacher') {
            usernameLabel.textContent = 'Employee ID';
            usernameInput.placeholder = 'Enter your Employee ID (e.g. EMP458)';
            usernameInput.type = 'text';
        } else if (currentRole === 'admin') {
            usernameLabel.textContent = 'Admin Email';
            usernameInput.placeholder = 'Enter your email (e.g. admin@college.edu)';
            usernameInput.type = 'email';
        }
        usernameInput.value = '';
        passwordInput.value = '';
    }

    updateFormLabels();

    // 2. Password Visibility Toggle
    togglePasswordBtn.addEventListener('click', () => {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        togglePasswordBtn.classList.toggle('active', isPassword);
    });

    // 3. Real-time Input Validation
    usernameInput.addEventListener('input', () => validateField(usernameInput, 'username-error'));
    passwordInput.addEventListener('input', () => validateField(passwordInput, 'password-error'));

    function validateField(input, errorId) {
        const errorSpan = document.getElementById(errorId);
        if (!input.value.trim()) {
            errorSpan.textContent = 'This field is required.';
            errorSpan.classList.add('visible');
            return false;
        }
        if (currentRole === 'admin' && input.type === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value.trim())) {
                errorSpan.textContent = 'Please enter a valid email address.';
                errorSpan.classList.add('visible');
                return false;
            }
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

    // 4. Form Submission — uses apiService for safe, crash-proof fetch
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();

        const isUserValid = validateField(usernameInput, 'username-error');
        const isPassValid = validateField(passwordInput, 'password-error');

        if (!isUserValid || !isPassValid) {
            showStatusAlert('Please correct the validation errors before signing in.', 'danger');
            return;
        }

        setLoading(true);

        try {
            const payload = { role: currentRole, password: passwordInput.value };

            if (currentRole === 'student') {
                payload.prn = usernameInput.value.trim();
            } else if (currentRole === 'teacher') {
                payload.employeeId = usernameInput.value.trim();
            } else if (currentRole === 'admin') {
                payload.email = usernameInput.value.trim();
            }

            // ── Safe API call via centralized apiService ──────────────
            // Never crashes with "Unexpected end of JSON input"
            const result = await apiService.post('/api/v1/auth/login', payload);

            if (!result || !result.success) {
                // Use the smart error dialog to give role-specific messages
                apiService.showResultError(result, 'Login Failed');
                showStatusAlert(result?.error || 'Authentication failed. Please check your credentials.', 'danger');
                setLoading(false);
                return;
            }

            // Store JWT token
            if (result.token) {
                localStorage.setItem('authToken', result.token);
            }

            // Flag mustChangePassword flow
            if (result.mustChangePassword) {
                showStatusAlert('First-time login detected. Redirecting to password setup...', 'warning');
                setTimeout(() => {
                    window.location.href = './change-password.php';
                }, 1200);
                return;
            }

            showStatusAlert('Authentication successful! Redirecting...', 'success');
            apiService.alertSuccess('Welcome!', 'Login successful.');

            setTimeout(() => {
                if (currentRole === 'student') {
                    window.location.href = '../student/dashboard.php';
                } else if (currentRole === 'teacher') {
                    window.location.href = '../teacher/dashboard.php';
                } else if (currentRole === 'admin') {
                    window.location.href = '../admin/dashboard.php';
                }
            }, 1000);

        } catch (err) {
            // Final safety net — should not normally be reached
            console.error('[login.js] Unexpected error:', err);
            apiService.alertError('Unexpected Error', err.message || 'An unknown error occurred.');
            showStatusAlert(err.message || 'An unexpected error occurred.', 'danger');
            setLoading(false);
        }
    });

    function setLoading(isLoading) {
        submitBtn.disabled = isLoading;
        if (isLoading) {
            btnText.textContent = 'Verifying...';
            spinner.classList.remove('hidden');
        } else {
            btnText.textContent = 'Sign In';
            spinner.classList.add('hidden');
        }
    }

    function showStatusAlert(msg, type) {
        statusMessage.textContent = msg;
        statusMessage.className = `status-alert ${type}`;
        statusMessage.classList.remove('hidden');
    }
});
