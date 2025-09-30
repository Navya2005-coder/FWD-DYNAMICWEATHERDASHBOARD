// Elements
const formTitle = document.getElementById('formTitle');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const toggleToSignup = document.getElementById('toggleToSignup');
const toggleToLogin = document.getElementById('toggleToLogin');

let isLoginMode = true; // start in login mode

// Toggle between Login and Signup views
toggleToSignup.addEventListener('click', () => {
  isLoginMode = false;
  updateForm();
});
toggleToLogin.addEventListener('click', () => {
  isLoginMode = true;
  updateForm();
});

function updateForm() {
  if (isLoginMode) {
    formTitle.innerText = 'Login';
    loginBtn.style.display = 'block';
    signupBtn.style.display = 'none';
    toggleToSignup.style.display = 'inline-block';
    toggleToLogin.style.display = 'none';
  } else {
    formTitle.innerText = 'Sign Up';
    loginBtn.style.display = 'none';
    signupBtn.style.display = 'block';
    toggleToSignup.style.display = 'none';
    toggleToLogin.style.display = 'inline-block';
  }
  usernameInput.value = '';
  passwordInput.value = '';
}

// Signup function
signupBtn.addEventListener('click', () => {
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username || !password) {
    alert('Please enter both username and password.');
    return;
  }

  // Get users array from localStorage or empty array
  const users = JSON.parse(localStorage.getItem('users')) || [];

  // Check if username already exists
  if (users.find(u => u.username === username)) {
    alert('Username already taken. Please choose another.');
    return;
  }

  // Save new user
  users.push({ username, password });
  localStorage.setItem('users', JSON.stringify(users));
  alert('Signup successful! Please login now.');

  // Switch to login mode
  isLoginMode = true;
  updateForm();
});

// Login function
loginBtn.addEventListener('click', () => {
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username || !password) {
    alert('Please enter both username and password.');
    return;
  }

  // Get users from localStorage
  const users = JSON.parse(localStorage.getItem('users')) || [];

  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    // Save logged in user
    localStorage.setItem('loggedInUser', JSON.stringify(user));
    // Redirect to dashboard
    window.location.href = 'dashboard.html';
  } else {
    alert('Invalid username or password.');
  }
});

// Initialize form view
updateForm();
