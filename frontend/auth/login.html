<!--
  CIE-2 Activity Tracking, Evaluation and Performance Management System
  File: frontend/auth/login.php
  Purpose: Production-ready ERP Login UI with role selector tabs, theme options, and PHP integration.
-->
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login | CIE-2 Activity Tracking & Evaluation System</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700&display=swap"
        rel="stylesheet">
    <link rel="stylesheet" href="login.css">
    <style>
        /* Mode Toggle Styles in Login */
        .theme-toggle {
            position: absolute;
            top: 20px;
            right: 20px;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 50%;
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            transition: var(--transition-smooth);
            color: var(--text-primary);
        }

        .theme-toggle:hover {
            transform: scale(1.05);
        }

        .theme-toggle svg {
            width: 20px;
            height: 20px;
        }
    </style>
</head>

<body>

    <!-- Theme Toggle Button -->
    <button class="theme-toggle" id="dark-mode-toggle" aria-label="Toggle Light/Dark Theme">
        <!-- Sun Icon (default in light mode) -->
        <svg id="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
    </button>

    <div class="login-container">
        <div class="login-card">
            <div class="card-header">
                <div class="logo-wrapper">
                    <svg class="college-logo" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="64" height="64" rx="16" fill="url(#grad)" />
                        <path d="M32 14L16 23V41L32 50L48 41V23L32 14Z" stroke="white" stroke-width="3"
                            stroke-linejoin="round" />
                        <path d="M32 20V44" stroke="white" stroke-width="2" />
                        <path d="M22 26.5H42" stroke="white" stroke-width="2" />
                        <path d="M22 37.5H42" stroke="white" stroke-width="2" />
                        <defs>
                            <linearGradient id="grad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                                <stop stop-color="#1e40af" />
                                <stop offset="1" stop-color="#3b82f6" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
                <h1 class="project-title">CIE-2 Activity Tracking, Evaluation and Performance Management System</h1>
                <p class="subtitle">Official Institutional Portal</p>
            </div>

            <!-- Role Selector Tabs -->
            <div class="role-selector" role="tablist">
                <button class="role-tab active" data-role="student" role="tab" aria-selected="true"
                    id="tab-student">Student</button>
                <button class="role-tab" data-role="teacher" role="tab" aria-selected="false"
                    id="tab-teacher">Teacher</button>
                <button class="role-tab" data-role="admin" role="tab" aria-selected="false"
                    id="tab-admin">Admin</button>
            </div>

            <!-- Authentication Form -->
            <form id="login-form" class="login-form" novalidate>
                <!-- Dynamic Username Field -->
                <div class="form-group">
                    <label for="username-input" id="username-label">PRN Number</label>
                    <div class="input-wrapper">
                        <input type="text" id="username-input" class="form-control" placeholder="Enter your PRN"
                            required autocomplete="username">
                        <span class="error-msg" id="username-error" aria-live="polite"></span>
                    </div>
                </div>

                <!-- Password Field -->
                <div class="form-group">
                    <label for="password-input">Password</label>
                    <div class="input-wrapper">
                        <input type="password" id="password-input" class="form-control"
                            placeholder="Enter your password" required autocomplete="current-password">
                        <button type="button" class="btn-toggle-password" id="toggle-password"
                            aria-label="Toggle Password Visibility">
                            <svg class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        </button>
                        <span class="error-msg" id="password-error" aria-live="polite"></span>
                    </div>
                </div>

                <div class="form-options">
                    <label class="checkbox-container">
                        <input type="checkbox" id="remember-me">
                        <span class="checkmark"></span>
                        Remember Me
                    </label>
                    <a href="#" class="forgot-link" id="forgot-password-link">Forgot Password?</a>
                </div>

                <div id="status-message" class="status-alert hidden" role="alert"></div>

                <button type="submit" class="btn btn-login" id="btn-login-submit">
                    <span class="btn-text">Sign In</span>
                    <span class="spinner hidden"></span>
                </button>
            </form>
        </div>

        <!-- Footer -->
        <footer class="login-footer">
            <p>&copy; 2026 CIE-2 Performance Management Portal. All rights reserved.</p>
            <p class="compliance-tag">Secured with SSL & JWT Encryption</p>
        </footer>
    </div>

    <script src="../shared/config.js?v=2.0"></script>
    <script src="../shared/api-service.js?v=2.0"></script>
    <script src="login.js?v=2.0"></script>
    <script>
        // Theme Switcher implementation (White, light blue and yellow for light theme)
        const toggleButton = document.getElementById('dark-mode-toggle');
        const themeIcon = document.getElementById('theme-icon');

        // Load active theme
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);

        toggleButton.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });

        function updateThemeIcon(theme) {
            if (theme === 'dark') {
                themeIcon.innerHTML = `
          <!-- Moon Icon -->
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        `;
            } else {
                themeIcon.innerHTML = `
          <!-- Sun Icon -->
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        `;
            }
        }
    </script>
</body>

</html>