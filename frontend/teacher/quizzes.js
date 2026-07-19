/**
 * CIE-2 Activity Tracking
 * File: frontend/teacher/quizzes.js
 */

let questions = [];

document.addEventListener('DOMContentLoaded', () => {
    // Add initial empty question
    addQuestion();
    renderBuilder();
});

function addQuestion() {
    questions.push({ text: '', points: 1, options: [{ text: '', is_correct: true }, { text: '', is_correct: false }] });
    renderBuilder();
}

function removeQuestion(index) {
    questions.splice(index, 1);
    renderBuilder();
}

function addOption(qIndex) {
    questions[qIndex].options.push({ text: '', is_correct: false });
    renderBuilder();
}

function removeOption(qIndex, oIndex) {
    questions[qIndex].options.splice(oIndex, 1);
    renderBuilder();
}

function updateQuestionText(index, val) {
    questions[index].text = val;
}

function updateQuestionPoints(index, val) {
    questions[index].points = parseInt(val) || 1;
}

function updateOptionText(qIndex, oIndex, val) {
    questions[qIndex].options[oIndex].text = val;
}

function updateOptionCorrect(qIndex, oIndex) {
    // Single correct answer logic
    questions[qIndex].options.forEach((o, i) => o.is_correct = (i === oIndex));
}

function renderBuilder() {
    const builder = document.getElementById('quiz-builder');
    if (!builder) return;

    let html = `
        <div style="margin-bottom: 20px;">
            <label style="display:block; margin-bottom:8px; color:var(--text-secondary);">Activity ID to attach Quiz to:</label>
            <input type="number" id="quiz-activity-id" class="swal2-input" placeholder="e.g. 5" style="margin:0; width:100%; max-width:300px; font-size:1rem; padding:8px;" />
        </div>
        <div style="display:flex; flex-direction:column; gap:24px;">
    `;

    questions.forEach((q, idx) => {
        html += `
            <div style="background:var(--bg-glass-card); border:1px solid var(--border-glass); border-radius:12px; padding:20px;">
                <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
                    <h4>Question ${idx + 1}</h4>
                    <button class="btn btn-sm btn-outline" style="border-color:var(--brand-rose); color:var(--brand-rose);" onclick="removeQuestion(${idx})">Remove</button>
                </div>
                
                <div style="display:flex; gap:16px; margin-bottom:16px;">
                    <input type="text" value="${q.text}" onchange="updateQuestionText(${idx}, this.value)" placeholder="Enter question..." style="flex:1; padding:10px; border-radius:8px; border:1px solid var(--border-color); background:transparent; color:inherit;" />
                    <input type="number" value="${q.points}" onchange="updateQuestionPoints(${idx}, this.value)" placeholder="Points" style="width:80px; padding:10px; border-radius:8px; border:1px solid var(--border-color); background:transparent; color:inherit;" />
                </div>
                
                <div style="padding-left: 20px; display:flex; flex-direction:column; gap:8px;">
                    ${q.options.map((opt, oIdx) => `
                        <div style="display:flex; align-items:center; gap:12px;">
                            <input type="radio" name="correct_${idx}" ${opt.is_correct ? 'checked' : ''} onchange="updateOptionCorrect(${idx}, ${oIdx})" />
                            <input type="text" value="${opt.text}" onchange="updateOptionText(${idx}, ${oIdx}, this.value)" placeholder="Option text..." style="flex:1; padding:8px; border-radius:6px; border:1px solid var(--border-color); background:rgba(0,0,0,0.1); color:inherit;" />
                            <button class="btn btn-sm" style="padding:4px 8px; font-size:0.8rem;" onclick="removeOption(${idx}, ${oIdx})">&times;</button>
                        </div>
                    `).join('')}
                    <button class="btn btn-sm btn-outline" style="align-self:flex-start; margin-top:8px;" onclick="addOption(${idx})">+ Add Option</button>
                </div>
            </div>
        `;
    });

    html += `
        </div>
        <div style="margin-top:24px; display:flex; justify-content:space-between;">
            <button class="btn btn-outline" onclick="addQuestion()">+ Add Question</button>
            <button class="btn btn-primary" onclick="submitQuizParams()">Save & Publish Quiz</button>
        </div>
    `;

    builder.innerHTML = html;
}

async function submitQuizParams() {
    const actId = document.getElementById('quiz-activity-id').value;
    if (!actId) {
        Swal.fire('Validation Error', 'Please specify an Activity ID', 'error');
        return;
    }

    if (questions.length === 0) {
        Swal.fire('Validation Error', 'Please add at least one question', 'error');
        return;
    }

    // Basic validation
    for (let i = 0; i < questions.length; i++) {
        if (!questions[i].text.trim()) { Swal.fire('Error', `Question ${i + 1} text is empty.`, 'error'); return; }
        if (questions[i].options.length < 2) { Swal.fire('Error', `Question ${i + 1} needs at least 2 options.`, 'error'); return; }

        let hasCorrect = false;
        for (let o of questions[i].options) {
            if (!o.text.trim()) { Swal.fire('Error', `An option in Question ${i + 1} is empty.`, 'error'); return; }
            if (o.is_correct) hasCorrect = true;
        }
        if (!hasCorrect) { Swal.fire('Error', `Question ${i + 1} must have a correct option selected.`, 'error'); return; }
    }

    Swal.fire({ title: 'Saving...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
        const payload = { activity_id: parseInt(actId), questions: questions };
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');

        const res = await fetch(apiService.baseUrl + '/teacher-quiz-builder.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify(payload)
        }).then(r => r.json());

        if (res.success) {
            Swal.fire('Success', res.message, 'success').then(() => {
                questions = []; addQuestion(); renderBuilder();
            });
        } else {
            Swal.fire('Error', res.error, 'error');
        }
    } catch (err) {
        console.error(err);
        Swal.fire('Error', 'Network request failed', 'error');
    }
}
