// Form validation functions
function validateUsername(username) {
  if (!username) {
    return { isValid: false, message: 'Username is required' };
  }
  if (username.length < 3) {
    return { isValid: false, message: 'Username must be at least 3 characters long' };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { isValid: false, message: 'Username can only contain letters, numbers, and underscores' };
  }
  return { isValid: true };
}

function validatePassword(password) {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters long' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  return { isValid: true };
}

function validateNote(note) {
  if (!note) {
    return { isValid: false, message: 'Note cannot be empty' };
  }
  if (note.length > 1000) {
    return { isValid: false, message: 'Note cannot exceed 1000 characters' };
  }
  return { isValid: true };
}

// Helper function to show error messages
function showError(element, message) {
  let errorElement = element.nextElementSibling;
  if (!errorElement || !errorElement.classList.contains('error-message')) {
    errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    element.parentNode.insertBefore(errorElement, element.nextSibling);
  }
  errorElement.textContent = message;
  element.style.borderColor = 'var(--error-color)';
}

// Helper function to clear error messages
function clearError(element) {
  const errorElement = element.nextElementSibling;
  if (errorElement && errorElement.classList.contains('error-message')) {
    errorElement.remove();
  }
  element.style.borderColor = '';
}

// Modified login function with validation
function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const usernameValidation = validateUsername(username);
  const passwordValidation = validatePassword(password);

  if (!usernameValidation.isValid) {
    showError(document.getElementById('username'), usernameValidation.message);
    return;
  }

  if (!passwordValidation.isValid) {
    showError(document.getElementById('password'), passwordValidation.message);
    return;
  }

  // Clear any existing errors
  clearError(document.getElementById('username'));
  clearError(document.getElementById('password'));

  // Proceed with login logic
  window.login(username, password);
}

// Modified register function with validation
function register() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const usernameValidation = validateUsername(username);
  const passwordValidation = validatePassword(password);

  if (!usernameValidation.isValid) {
    showError(document.getElementById('username'), usernameValidation.message);
    return;
  }

  if (!passwordValidation.isValid) {
    showError(document.getElementById('password'), passwordValidation.message);
    return;
  }

  // Clear any existing errors
  clearError(document.getElementById('username'));
  clearError(document.getElementById('password'));

  // Proceed with registration logic
  window.register(username, password);
}

// Modified addNote function with validation
function addNote() {
  const noteText = document.getElementById('newNote').value;
  const noteValidation = validateNote(noteText);

  if (!noteValidation.isValid) {
    showError(document.getElementById('newNote'), noteValidation.message);
    return;
  }

  // Clear any existing errors
  clearError(document.getElementById('newNote'));

  // Proceed with adding note
  window.addNote(noteText);
}

// Add event listeners for real-time validation
document.addEventListener('DOMContentLoaded', function () {
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const noteInput = document.getElementById('newNote');

  usernameInput.addEventListener('input', function () {
    const validation = validateUsername(this.value);
    if (!validation.isValid) {
      showError(this, validation.message);
    } else {
      clearError(this);
    }
  });

  passwordInput.addEventListener('input', function () {
    const validation = validatePassword(this.value);
    if (!validation.isValid) {
      showError(this, validation.message);
    } else {
      clearError(this);
    }
  });

  if (noteInput) {
    noteInput.addEventListener('input', function () {
      const validation = validateNote(this.value);
      if (!validation.isValid) {
        showError(this, validation.message);
      } else {
        clearError(this);
      }
    });
  }
});
