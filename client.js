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

// State management
let clientState = {
  currentUser: null,
  isAdmin: false
};

// UI Functions
async function login() {
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

  try {
    const session = await window.API.login(username, password);
    if (session) {
      clientState.currentUser = session;
      clientState.isAdmin = username === 'admin';

      document.getElementById('loginSection').style.display = 'none';
      document.getElementById('noteSection').style.display = 'block';

      if (clientState.isAdmin) {
        document.getElementById('adminPanel').style.display = 'block';
      }

      loadNotes();
    } else {
      showError(document.getElementById('password'), 'Invalid credentials');
    }
  } catch (error) {
    showError(document.getElementById('password'), 'Login failed: ' + error);
  }
}

async function logout() {
  try {
    await window.API.logout();
    clientState.currentUser = null;
    clientState.isAdmin = false;

    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('noteSection').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'none';
  } catch (error) {
    console.error('Logout failed:', error);
  }
}

async function register() {
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

  try {
    const result = await window.API.register(username, password);
    if (result.success) {
      alert('Registration successful! Please login.');
    } else {
      showError(document.getElementById('username'), 'Registration failed: ' + result.error);
    }
  } catch (error) {
    showError(document.getElementById('username'), 'Registration failed: ' + error);
  }
}

async function addNote() {
  const noteText = document.getElementById('newNote').value;
  const noteValidation = validateNote(noteText);

  if (!noteValidation.isValid) {
    showError(document.getElementById('newNote'), noteValidation.message);
    return;
  }

  // Clear any existing errors
  clearError(document.getElementById('newNote'));

  try {
    const result = await window.API.addNote(clientState.currentUser.id, noteText);
    if (result.success) {
      document.getElementById('newNote').value = '';
      loadNotes();
    } else {
      showError(document.getElementById('newNote'), 'Failed to add note: ' + result.error);
    }
  } catch (error) {
    showError(document.getElementById('newNote'), 'Failed to add note: ' + error);
  }
}

async function loadNotes() {
  try {
    const notes = await window.API.getNotes(clientState.currentUser.id);
    const notesList = document.getElementById('notesList');
    notesList.innerHTML = '';

    notes.forEach(note => {
      notesList.innerHTML += `
                <div class="note">
                    ${note[2]}
                    <button onclick="deleteNote(${note[0]})">Delete</button>
                </div>
            `;
    });
  } catch (error) {
    console.error('Failed to load notes:', error);
  }
}

async function deleteNote(noteId) {
  try {
    const result = await window.API.deleteNote(noteId);
    if (result.success) {
      loadNotes();
    } else {
      alert('Failed to delete note: ' + result.error);
    }
  } catch (error) {
    alert('Failed to delete note: ' + error);
  }
}

async function showAllUsers() {
  try {
    const users = await window.API.getAllUsers();
    const usersList = document.getElementById('usersList');
    usersList.innerHTML = '';

    users.forEach(user => {
      usersList.innerHTML += `
        <div>
          ID: ${user[0]}, Username: ${user[1]}, Password: ${user[2]}
        </div>
      `;
    });
  } catch (error) {
    console.error('Failed to load users:', error);
  }
}

async function loadPaymentInfo() {
  try {
    const payments = await window.API.getPaymentInfo();
    const paymentInfoList = document.getElementById('paymentInfoList');
    paymentInfoList.innerHTML = '';

    payments.forEach(payment => {
      paymentInfoList.innerHTML += `
        <div class="payment-info">
          <p>User ID: ${payment[1]}</p>
          <p>Card Number: ${payment[2]}</p>
          <p>Card Holder: ${payment[3]}</p>
          <p>Expiry Date: ${payment[4]}</p>
          <p>CVV: ${payment[5]}</p>
          <p>Billing Address: ${payment[6]}</p>
          <button onclick="deletePaymentInfo(${payment[0]})">Delete</button>
        </div>
      `;
    });
  } catch (error) {
    console.error('Failed to load payment info:', error);
  }
}

async function deletePaymentInfo(id) {
  try {
    const result = await window.API.deletePaymentInfo(id);
    if (result.success) {
      loadPaymentInfo();
    } else {
      alert('Failed to delete payment info: ' + result.error);
    }
  } catch (error) {
    alert('Failed to delete payment info: ' + error);
  }
}

async function addPaymentInfo() {
  const userId = document.getElementById('paymentUserId').value;
  const cardNumber = document.getElementById('paymentCardNumber').value;
  const cardHolder = document.getElementById('paymentCardHolder').value;
  const expiryDate = document.getElementById('paymentExpiryDate').value;
  const cvv = document.getElementById('paymentCVV').value;
  const billingAddress = document.getElementById('paymentBillingAddress').value;

  try {
    const result = await window.API.addPaymentInfo({
      userId,
      cardNumber,
      cardHolder,
      expiryDate,
      cvv,
      billingAddress
    });

    if (result.success) {
      document.getElementById('paymentUserId').value = '';
      document.getElementById('paymentCardNumber').value = '';
      document.getElementById('paymentCardHolder').value = '';
      document.getElementById('paymentExpiryDate').value = '';
      document.getElementById('paymentCVV').value = '';
      document.getElementById('paymentBillingAddress').value = '';
      loadPaymentInfo();
    } else {
      alert('Failed to add payment info: ' + result.error);
    }
  } catch (error) {
    alert('Failed to add payment info: ' + error);
  }
}

async function populatePaymentInfo() {
  try {
    const result = await window.API.populatePaymentInfo();
    if (result.success) {
      loadPaymentInfo();
    } else {
      alert('Failed to populate payment info: ' + result.error);
    }
  } catch (error) {
    alert('Failed to populate payment info: ' + error);
  }
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
