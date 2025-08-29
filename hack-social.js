// Global variables
let timerInterval;
let trackerInterval;
let currentTimer = 25 * 60; // 25 minutes in seconds
let originalTimer = 25 * 60;
let isTimerRunning = false;
let tasks = [];
let stats = {
  completedTasks: 0,
  focusTime: 0,
  pomodoroSessions: 0,
  productivity: 0
};

// Initialize app
document.addEventListener('DOMContentLoaded', function () {
  updateCurrentTime();
  setInterval(updateCurrentTime, 1000);
  loadTasks();
  updateStats();
});

// Current time display
function updateCurrentTime() {
  const now = new Date();
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  };
  document.getElementById('currentTime').textContent = now.toLocaleDateString('en-US', options);
}

// Pomodoro Timer Functions
function setTimer(minutes) {
  if (isTimerRunning) return;

  // Update active preset button
  document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');

  currentTimer = minutes * 60;
  originalTimer = minutes * 60;
  updateTimerDisplay();
  updateTimerProgress();
}

function startTimer() {
  if (isTimerRunning) return;

  isTimerRunning = true;
  document.getElementById('timerProgress').classList.add('pulse');

  timerInterval = setInterval(() => {
    currentTimer--;
    updateTimerDisplay();
    updateTimerProgress();

    if (currentTimer <= 0) {
      timerComplete();
    }
  }, 1000);
}

function pauseTimer() {
  isTimerRunning = false;
  clearInterval(timerInterval);
  document.getElementById('timerProgress').classList.remove('pulse');
}

function resetTimer() {
  isTimerRunning = false;
  clearInterval(timerInterval);
  currentTimer = originalTimer;
  updateTimerDisplay();
  updateTimerProgress();
  document.getElementById('timerProgress').classList.remove('pulse');
}

function updateTimerDisplay() {
  const minutes = Math.floor(currentTimer / 60);
  const seconds = currentTimer % 60;
  document.getElementById('timerDisplay').textContent =
    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateTimerProgress() {
  const progress = ((originalTimer - currentTimer) / originalTimer) * 360;
  document.getElementById('timerProgress').style.background =
    `conic-gradient(#667eea ${progress}deg, #e2e8f0 ${progress}deg)`;
}

function timerComplete() {
  isTimerRunning = false;
  clearInterval(timerInterval);
  document.getElementById('timerProgress').classList.remove('pulse');

  // Update stats
  stats.pomodoroSessions++;
  stats.focusTime += Math.floor(originalTimer / 60);
  updateStats();

  alert('🎉 Pomodoro session complete! Great work!');
  resetTimer();
}

// Task Manager Functions
function addTask() {
  const taskInput = document.getElementById('taskInput');
  const taskText = taskInput.value.trim();

  if (taskText === '') return;

  const task = {
    id: Date.now(),
    text: taskText,
    completed: false,
    createdAt: new Date()
  };

  tasks.push(task);
  taskInput.value = '';
  renderTasks();
  saveTasks();
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    if (task.completed) {
      stats.completedTasks++;
    } else {
      stats.completedTasks--;
    }
    renderTasks();
    saveTasks();
    updateStats();
  }
}

function deleteTask(id) {
  const taskIndex = tasks.findIndex(t => t.id === id);
  if (taskIndex > -1) {
    if (tasks[taskIndex].completed) {
      stats.completedTasks--;
    }
    tasks.splice(taskIndex, 1);
    renderTasks();
    saveTasks();
    updateStats();
  }
}

function renderTasks() {
  const taskList = document.getElementById('taskList');
  taskList.innerHTML = '';

  tasks.forEach(task => {
    const taskItem = document.createElement('div');
    taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
    taskItem.innerHTML = `
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                           onchange="toggleTask(${task.id})">
                    <div class="task-text">${task.text}</div>
                    <div class="task-time">${formatTime(task.createdAt)}</div>
                    <button class="delete-btn" onclick="deleteTask(${task.id})">×</button>
                `;
    taskList.appendChild(taskItem);
  });
}

function saveTasks() {
  localStorage.setItem('timeTasks', JSON.stringify(tasks));
}

function loadTasks() {
  const savedTasks = localStorage.getItem('timeTasks');
  if (savedTasks) {
    tasks = JSON.parse(savedTasks);
    tasks.forEach(task => {
      task.createdAt = new Date(task.createdAt);
      if (task.completed) stats.completedTasks++;
    });
    renderTasks();
  }
}



// Statistics Functions
function updateStats() {
  document.getElementById('completedTasks').textContent = stats.completedTasks;
  document.getElementById('focusTime').textContent = `${stats.focusTime}m`;
  document.getElementById('pomodoroSessions').textContent = stats.pomodoroSessions;

  // Calculate productivity (completed tasks / total tasks * 100)
  const productivity = tasks.length > 0 ? Math.round((stats.completedTasks / tasks.length) * 100) : 0;
  stats.productivity = productivity;
  document.getElementById('productivity').textContent = `${productivity}%`;
}

// Utility Functions
function formatTime(date) {
  return date.toLocaleTimeString('en-US', {
    hour12: true,
    hour: 'numeric',
    minute: '2-digit'
  });
}

// Keyboard shortcuts
document.addEventListener('keydown', function (e) {
  if (e.key === 'Enter' && document.activeElement.id === 'taskInput') {
    addTask();
  }

  // Space to start/pause timer (when not in input field)
  if (e.key === ' ' && document.activeElement.tagName !== 'INPUT') {
    e.preventDefault();
    if (isTimerRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  }
});
