<!--
  CIE-2 Activity Tracking, Evaluation and Performance Management System
  File: frontend/auth/change-password.php
  Purpose: Secure Change Password View for first-login enforcement or user-initiated updates.
-->
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Change Password | CIE-2 Activity Tracking & Evaluation System</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700&display=swap"
        <link rel="stylesheet" href="login.css">

    <!-- Centralized config and API service layer -->
    <script src="../shared/config.js"></script>
    <script src="../shared/api-service.js"></script>
    <style>
        /* Styling adjustments specifically for Change Password */
        .compliance-warning {
            background-color: rgba(245, 158, 11, 0.1);
            border: 1px solid #f59e0b;
            color: #df8a00;
            padding: 12px;
            border-radius: 10px;
            font-size: 0.8rem;
            line-height: 1.4;
            margin-bottom: 20px;
            text-align: left;
        }

        @media (prefers-color-scheme: dark) {
            .compliance-warning {
                background-color: rgba(245, 158, 11, 0.15);
                border-color: #d97706;
                color: #fcd34d;
            }
        }

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
    </style>
</head>

<body>

    <!-- Theme Toggle Button -->
    <button class="theme-toggle" id="dark-mode-toggle" aria-label="Toggle Light/Dark Theme">
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
                <h1 class="project-title">Update Your Credentials</h1>
                <p class="subtitle">Mandatory Security Protocol</p>
            </div>

            <div class="compliance-warning">
                <strong>Security Notice:</strong> You are currently using default institutional credentials. To proceed
                to the student portal, you must change your password.
            </div>

            <!-- Password Update Form -->
            <form id="change-password-form" class="login-form" novalidate>
                <div class="form-group">
                    <label for="current-password-input">Current Password (ZRPN)</label>
                    <div class="input-wrapper">
                        <input type="password" id="current-password-input" class="form-control"
                            placeholder="Enter current ZRPN" required>
                        <span class="error-msg" id="current-password-error" aria-live="polite"></span>
                    </div>
                </div>

                <div class="form-group">
                    <label for="new-password-input">New Password</label>
                    <div class="input-wrapper">
                        <input type="password" id="new-password-input" class="form-control"
                            placeholder="Minimum 6 characters" required>
                        <span class="error-msg" id="new-password-error" aria-live="polite"></span>
                    </div>
                </div>

                <div class="form-group">
                    <label for="confirm-password-input">Confirm New Password</label>
                    <div class="input-wrapper">
                        <input type="password" id="confirm-password-input" class="form-control"
                            placeholder="Repeat new password" required>
                        <span class="error-msg" id="confirm-password-error" aria-live="polite"></span>
                    </div>
                </div>

                <div id="status-message" class="status-alert hidden" role="alert"></div>

                <button type="submit" class="btn btn-login" id="btn-submit">
                    <span class="btn-text">Update Password</span>
                    <span class="spinner hidden"></span>
                </button>
            </form>
        </div>

        <footer class="login-footer">
            <p>&copy; 2026 CIE-2 Performance Management Portal. All rights reserved.</p>
        </footer>
    </div>

    <script src="../shared/config.js"></script>
    <script src="../shared/api-service.js"></script>
    <script src="change-password.js"></script>
    <script>
        // Theme Switcher implementation
        const toggleButton = document.getElementById('dark-mode-toggle');
        const themeIcon = document.getElementById('theme-icon');

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
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        `;
            } else {
                themeIcon.innerHTML = `
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