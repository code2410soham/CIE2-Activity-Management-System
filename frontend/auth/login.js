/**
 * CIE-2 Activity Tracking, Evaluation and Performance Management System
 * File: frontend/auth/login.js
 * Purpose: Interactive frontend scripts for role-switching, real-time validations, and login integration.
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

    let currentRole = 'student'; // Default selection

    // 1. Role Selection Switching
    roleTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();

            // Update active tab state
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

    // Initialize placeholder text
    updateFormLabels();

    // 2. Password Visibility Toggle
    togglePasswordBtn.addEventListener('click', () => {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';

        // Toggle visual class or title
        togglePasswordBtn.classList.toggle('active', isPassword);
    });

    // 3. Real-time Inputs Validation
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

    // 4. Form Submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();

        // Check validations
        const isUserValid = validateField(usernameInput, 'username-error');
        const isPassValid = validateField(passwordInput, 'password-error');

        if (!isUserValid || !isPassValid) {
            showStatusAlert('Please correct the validation errors before signing in.', 'danger');
            return;
        }

        // Set Loading state
        setLoading(true);

        try {
            // Build request body matching server specifications
            const payload = {
                role: currentRole,
                password: passwordInput.value
            };

            if (currentRole === 'student') {
                payload.prn = usernameInput.value.trim();
            } else if (currentRole === 'teacher') {
                payload.employeeId = usernameInput.value.trim();
            } else if (currentRole === 'admin') {
                payload.email = usernameInput.value.trim();
            }

            // Perform AJAX Post call
            const response = await fetch('../../backend/api/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Authentication failed. Please check credentials.');
            }

            // Store JWT details
            if (result.token) {
                localStorage.setItem('authToken', result.token);
            }

            showStatusAlert('Authentication successful! Redirecting...', 'success');

            // Redirect according to user role
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
            showStatusAlert(err.message, 'danger');
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
