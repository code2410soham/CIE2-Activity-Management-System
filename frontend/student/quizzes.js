/**
 * CIE-2 Activity Tracking
 * File: frontend/student/quizzes.js
 */

let allQuizzes = [];
let currentQuizId = null;
let currentQuestions = [];
let timerInterval = null;

document.addEventListener('DOMContentLoaded', () => {
    fetchQuizzes();

    // Auto-launch if URL has act_id
    const urlParams = new URLSearchParams(window.location.search);
    const actId = urlParams.get('act_id');
    if (actId) {
        startQuiz(actId, "Attempting Quiz...");
    }
});

async function fetchQuizzes() {
    try {
        const result = await apiService.get('/api/v1/student/student-quizzes');
        if (!result.success) {
            Swal.fire('Error', result.error || 'Failed to load quizzes', 'error');
            return;
        }

        allQuizzes = result.quizzes || [];
        renderQuizzes();

    } catch (err) {
        console.error(err);
        document.getElementById('quizzes-deck').innerHTML = `<p style="grid-column:1/-1;">Error loading data.</p>`;
    }
}

function renderQuizzes() {
    const deck = document.getElementById('quizzes-deck');

    if (allQuizzes.length === 0) {
        deck.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 40px; color: var(--text-muted); font-size:1.1rem;">No quizzes assigned to you.</div>`;
        return;
    }

    deck.innerHTML = allQuizzes.map(q => {
        let badgeType = 'badge-info';
        if (q.submission_status === 'pending') badgeType = 'badge-pending';
        if (q.submission_status === 'submitted') badgeType = 'badge-success';

        let actionBtn = '';
        if (q.submission_status === 'pending') {
            actionBtn = `<button class="btn btn-primary" style="width:100%" onclick="startQuiz('${q.activity_id}', '${q.title}')">Start Quiz</button>`;
        } else {
            actionBtn = `<button class="btn btn-outline" style="width:100%" disabled>Completed</button>`;
        }

        return `
            <div class="glass-panel" style="display:flex; flex-direction:column; justify-content:space-between; gap:16px;">
                <div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
                        <span class="badge ${badgeType}">QUIZ</span>
                        <span style="font-size:0.8rem; color:var(--text-muted); font-weight:600;">${q.max_marks} Marks</span>
                    </div>
                    <h3 style="font-weight:700; font-size:1.2rem; margin-bottom:8px;">${q.title}</h3>
                    <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:16px;">${q.subject}</p>
                    <div style="display:flex; align-items:center; gap:6px; color:var(--text-muted); font-size:0.8rem; margin-bottom:4px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        Deadline: ${q.deadline}
                    </div>
                </div>
                <div>
                    ${actionBtn}
                </div>
            </div>
        `;
    }).join('');
}

async function startQuiz(activityId, title) {
    // 1. Ask for confirmation
    const res = await Swal.fire({
        title: 'Start Quiz?',
        text: 'Once started, you cannot pause the timer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#4338ca',
        confirmButtonText: 'Yes, start!'
    });

    if (!res.isConfirmed) return;

    // 2. Fetch questions
    try {
        Swal.showLoading();
        const apiRes = await apiService.get(`/api/v1/student/student-quizzes?activity_id=${activityId}`);
        Swal.close();

        if (!apiRes.success) {
            Swal.fire('Error', apiRes.error || 'Could not fetch quiz', 'error');
            return;
        }

        const questions = apiRes.questions || [];
        if (questions.length === 0) {
            Swal.fire('Empty Quiz', 'Your teacher hasn\'t added questions to this quiz yet.', 'info');
            return;
        }

        currentQuizId = activityId;
        currentQuestions = questions;

        // 3. Render Attempt View
        document.getElementById('quiz-list-view').style.display = 'none';
        document.getElementById('quiz-attempt-view').style.display = 'block';
        document.getElementById('active-quiz-title').textContent = title || "Quiz Attempt";

        const qCont = document.getElementById('questions-container');
        qCont.innerHTML = questions.map((q, idx) => `
            <div class="question-block" style="padding:20px; background:var(--bg-glass-card); border-radius:12px; border:1px solid var(--border-glass);">
                <h4 style="margin-bottom:16px;">${idx + 1}. ${q.text} <span style="color:var(--brand-amber); font-size:0.8rem; font-weight:normal; margin-left:8px;">(${q.points} pt)</span></h4>
                <div style="display:flex; flex-direction:column; gap:10px;">
                    ${q.options.map(opt => `
                        <label style="display:flex; align-items:center; gap:10px; cursor:pointer; padding:10px; background:rgba(0,0,0,0.1); border-radius:8px;">
                            <input type="radio" name="q_${q.id}" value="${opt.id}" />
                            <span>${opt.text}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
        `).join('');

        // 4. Start Timer (Hardcoded 15 mins for example natively)
        let timeRemaining = 15 * 60;
        const timerEl = document.getElementById('quiz-timer');
        timerInterval = setInterval(() => {
            timeRemaining--;
            let m = Math.floor(timeRemaining / 60);
            let s = timeRemaining % 60;
            timerEl.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                Swal.fire('Time Up!', 'Your quiz will be submitted automatically.', 'warning').then(() => submitQuiz());
            }
        }, 1000);

    } catch (err) {
        console.error(err);
        Swal.fire('Error', 'Failed to start quiz.', 'error');
    }
}

function cancelQuiz() {
    Swal.fire({
        title: 'Cancel Quiz?',
        text: 'Your progress will be lost!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, quit',
        confirmButtonColor: '#e11d48'
    }).then(r => {
        if (r.isConfirmed) {
            clearInterval(timerInterval);
            document.getElementById('quiz-list-view').style.display = 'block';
            document.getElementById('quiz-attempt-view').style.display = 'none';
        }
    });
}

async function submitQuiz() {
    clearInterval(timerInterval);

    // Collect answers
    let answers = {};
    let allAnswered = true;
    for (let q of currentQuestions) {
        let selected = document.querySelector(`input[name="q_${q.id}"]:checked`);
        if (selected) {
            answers[q.id] = selected.value;
        } else {
            allAnswered = false;
        }
    }

    if (!allAnswered) {
        const conf = await Swal.fire({
            title: 'Unanswered Questions',
            text: 'You have left some questions blank. Are you sure you want to submit?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Submit Anyway'
        });
        if (!conf.isConfirmed) {
            // resume timer (oversimplified)
            return;
        }
    }

    Swal.fire({ title: 'Evaluating...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
        const payload = {
            activity_id: currentQuizId,
            answers: answers
        };
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const res = await fetch(apiService.baseUrl + '/student-quizzes.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify(payload)
        }).then(r => r.json());

        if (res.success) {
            Swal.fire('Submitted!', `Your score: ${res.score} points`, 'success').then(() => {
                window.location.href = 'quizzes.php'; // reload page
            });
        } else {
            Swal.fire('Error', res.error, 'error');
        }

    } catch (err) {
        console.error(err);
        Swal.fire('Error', 'Submission failed due to network error.', 'error');
    }
}
