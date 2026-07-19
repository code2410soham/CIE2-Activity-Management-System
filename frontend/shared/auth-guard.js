/**
 * CIE-2 Activity Tracking, Evaluation and Performance Management System
 * File: frontend/shared/auth-guard.js
 * Purpose: Client-side routing guard to prevent unauthorized dashboard access,
 *          automatically redirect unauthenticated users to login, and properly
 *          route authenticated users to their respective role-based dashboards.
 */

(function () {
    // 1. Helper to decode JWT token without external libraries
    function parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    }

    // 2. Retrieve token from localStorage or cookies
    function getToken() {
        let token = localStorage.getItem('authToken');
        if (!token) {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.startsWith('token=') || cookie.startsWith('authToken=')) {
                    token = cookie.split('=')[1];
                    break;
                }
            }
        }
        return token;
    }

    const token = getToken();
    let user = null;
    let isTokenValid = false;

    if (token) {
        user = parseJwt(token);
        if (user && user.exp) {
            // Check expiry: token.exp is in seconds, Date.now() is in ms
            const currentTimestamp = Math.floor(Date.now() / 1000);
            if (user.exp > currentTimestamp) {
                isTokenValid = true;
            } else {
                // Clear expired tokens
                localStorage.removeItem('authToken');
                document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            }
        }
    }

    // 3. Determine base paths dynamically based on current page location
    const pathname = window.location.pathname;

    // Determine the root directory relative prefix
    let rootPrefix = "./";
    if (pathname.includes('/frontend/student/') ||
        pathname.includes('/frontend/teacher/') ||
        pathname.includes('/frontend/admin/') ||
        pathname.includes('/frontend/auth/')) {
        rootPrefix = "../../";
    }

    const loginPath = rootPrefix + "frontend/auth/login.php";
    const studentDashPath = rootPrefix + "frontend/student/dashboard.php";
    const teacherDashPath = rootPrefix + "frontend/teacher/dashboard.php";
    const adminDashPath = rootPrefix + "frontend/admin/dashboard.php";

    // 4. Handle Redirection and Route Guards
    if (pathname.endsWith('/') || pathname.endsWith('index.php') || pathname.endsWith('index.html') ||
        (!pathname.includes('/frontend/'))) {
        // We are on the root index entry page
        if (!isTokenValid) {
            window.location.href = loginPath;
        } else {
            // Redirect logged-in user to their respective dashboard
            if (user.role === 'student') {
                window.location.href = studentDashPath;
            } else if (user.role === 'teacher') {
                window.location.href = teacherDashPath;
            } else if (user.role === 'admin') {
                window.location.href = adminDashPath;
            } else {
                window.location.href = loginPath;
            }
        }
    } else if (pathname.includes('/frontend/auth/login.php') || pathname.includes('/frontend/auth/login.html')) {
        // We are on the login page. If already authenticated, redirect to respective dashboard.
        if (isTokenValid && user && user.role) {
            if (user.role === 'student') {
                window.location.href = studentDashPath;
            } else if (user.role === 'teacher') {
                window.location.href = teacherDashPath;
            } else if (user.role === 'admin') {
                window.location.href = adminDashPath;
            }
        }
    } else {
        // We are on a protected dashboard or action page
        if (!isTokenValid) {
            // Unauthenticated guest -> redirect to Login
            window.location.href = loginPath;
        } else {
            // Authenticated user path-guard comparison
            const role = user.role;
            let expectedRole = null;

            if (pathname.includes('/frontend/student/')) {
                expectedRole = 'student';
            } else if (pathname.includes('/frontend/teacher/')) {
                expectedRole = 'teacher';
            } else if (pathname.includes('/frontend/admin/')) {
                expectedRole = 'admin';
            }

            // Redirect if role is invalid/unauthorized for the current folder
            if (expectedRole && role !== expectedRole) {
                if (role === 'student') {
                    window.location.href = studentDashPath;
                } else if (role === 'teacher') {
                    window.location.href = teacherDashPath;
                } else if (role === 'admin') {
                    window.location.href = adminDashPath;
                } else {
                    window.location.href = loginPath;
                }
            }
        }
    }
})();
