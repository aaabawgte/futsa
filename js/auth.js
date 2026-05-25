const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'futsa123';

const loginForm = document.querySelector('.login-form');
const usernameInput = document.querySelector('input[type="text"]');
const passwordInput = document.querySelector('input[type="password"]');
const guestButton = document.querySelector('.secondary-btn');

function setSession(role) {
  sessionStorage.setItem('futsa_role', role);
}

function goToDashboard() {
  window.location.href = 'dashboard.html';
}

function goToAdmin() {
  window.location.href = 'admin.html';
}

function showLoginError(message) {
  let errorElement = document.querySelector('.login-error');

  if (!errorElement) {
    errorElement = document.createElement('p');
    errorElement.className = 'login-error';
    loginForm.prepend(errorElement);
  }

  errorElement.textContent = message;
}

if (loginForm) {
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setSession('admin');
      goToAdmin();
      return;
    }

    showLoginError('Krivi username ili password.');
  });
}

if (guestButton) {
  guestButton.addEventListener('click', () => {
    setSession('guest');
    goToDashboard();
  });
}

function requireAdmin() {
  const role = sessionStorage.getItem('futsa_role');

  if (role !== 'admin') {
    window.location.href = 'index.html';
  }
}

function logout() {
  sessionStorage.removeItem('futsa_role');
  window.location.href = 'index.html';
}