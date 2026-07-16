/*
  CIE2-Activity-Management-System
  File: frontend/shared/scripts.js
  Purpose: Basic DOM interactions, routing, client-side simulations, and user-state management.
  Scalability: Scalable logic utilizing local storage to preserve state across pages for mock demo purposes.
*/

document.addEventListener('DOMContentLoaded', () => {
  console.log('CIE-2 Activity Management Portal Loaded');
  initializeNavigationHighlight();
  setupEventListeners();
});

/**
 * Highlights the current active navigation item in the sidebar.
 */
function initializeNavigationHighlight() {
  const currentPath = window.location.pathname;
  const menuItems = document.querySelectorAll('.menu-item');
  
  menuItems.forEach(item => {
    const href = item.getAttribute('href');
    if (href && currentPath.includes(href)) {
      menuItems.forEach(mi => mi.classList.remove('active'));
      item.classList.add('active');
    }
  });
}

/**
 * Attaches handlers to standard forms and triggers throughout the pages.
 */
function setupEventListeners() {
  // Mock Submission Form
  const submissionForm = document.getElementById('submission-form');
  if (submissionForm) {
    submissionForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const activity = document.getElementById('activity-select').value;
      const fileInput = document.getElementById('file-upload');
      const filename = fileInput.files[0] ? fileInput.files[0].name : 'unknown.zip';
      
      alert(`Success! File "${filename}" submitted for activity "${activity}". \nIt is now placed in the evaluation queue.`);
      submissionForm.reset();
    });
  }

  // Mock Activity Builder Form
  const activityForm = document.getElementById('create-activity-form');
  if (activityForm) {
    activityForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('act-title').value;
      alert(`Success! "${title}" has been published to students.`);
      activityForm.reset();
    });
  }

  // Mock Evaluation Form
  const evaluationForm = document.getElementById('evaluation-form');
  if (evaluationForm) {
    evaluationForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const marks = document.getElementById('marks-given').value;
      alert(`Evaluation Saved! Student scored ${marks} marks.`);
      evaluationForm.reset();
    });
  }

  // Mock User Creation Form
  const userForm = document.getElementById('create-user-form');
  if (userForm) {
    userForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const fullname = document.getElementById('user-fullname').value;
      alert(`Account created successfully for ${fullname}!`);
      userForm.reset();
    });
  }

  // Quiz Starter Simulation
  const startQuizBtn = document.getElementById('start-quiz-btn');
  if (startQuizBtn) {
    startQuizBtn.addEventListener('click', () => {
      const confirmStart = confirm('Are you sure you want to begin the Quiz? The timer will start immediately.');
      if (confirmStart) {
        alert('Quiz started! Mock timer running (10 minutes remaining).');
      }
    });
  }
}
