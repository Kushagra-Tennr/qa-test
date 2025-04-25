let db;
let currentUser = null;
const ADMIN_PASSWORD = "admin123"; // Vulnerability: Hardcoded credentials

// Vulnerability: Global error handler exposes internal details
window.onerror = function(msg, url, lineNo, columnNo, error) {
    alert('Error: ' + error.stack);
    return false;
};

async function initDB() {
    const SQL = await initSqlJs({
        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
    });

    // Vulnerability: No error handling for database initialization
    db = new SQL.Database();

    // Vulnerability: Raw string concatenation in SQL
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            password TEXT
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            content TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Vulnerability: Hardcoded admin account
    db.run("INSERT OR IGNORE INTO users (id, username, password) VALUES (1, 'admin', 'admin123')");
}

// Vulnerability: No input validation
function register() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Vulnerability: SQL injection possible
    const query = `INSERT INTO users (username, password) VALUES ('${username}', '${password}')`;

    try {
        db.run(query);
        alert('Registration successful!');
    } catch (e) {
        // Vulnerability: Exposing error details to user
        alert('Registration failed: ' + e.toString());
    }
}

// Vulnerability: Insecure login implementation
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Vulnerability: SQL injection possible
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    const result = db.exec(query);

    if (result.length > 0) {
        currentUser = {
            id: result[0].values[0][0],
            username: result[0].values[0][1]
        };

        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('noteSection').style.display = 'block';

        // Vulnerability: Showing admin panel based on client-side check
        if (username === 'admin') {
            document.getElementById('adminPanel').style.display = 'block';
        }

        loadNotes();
    } else {
        alert('Invalid credentials!');
    }
}

function addNote() {
    // Vulnerability: No authentication check
    const content = document.getElementById('newNote').value;

    // Vulnerability: XSS possible through notes
    const query = `INSERT INTO notes (user_id, content) VALUES (${currentUser.id}, '${content}')`;

    try {
        db.run(query);
        loadNotes();
    } catch (e) {
        console.error(e);
    }
}

function loadNotes() {
    // Vulnerability: SQL injection possible
    const query = `SELECT * FROM notes WHERE user_id = ${currentUser.id}`;
    const results = db.exec(query);

    const notesList = document.getElementById('notesList');
    notesList.innerHTML = ''; // Vulnerability: innerHTML usage

    if (results.length > 0) {
        results[0].values.forEach(note => {
            // Vulnerability: XSS through note content
            notesList.innerHTML += `
                <div class="note">
                    ${note[2]}
                    <button onclick="deleteNote(${note[0]})">Delete</button>
                </div>
            `;
        });
    }
}

// Vulnerability: No authentication check, allows unauthorized deletion
function deleteNote(noteId) {
    // Vulnerability: No validation if note belongs to user
    const query = `DELETE FROM notes WHERE id = ${noteId}`;
    db.run(query);
    loadNotes();
}

// Vulnerability: No admin authentication check
function showAllUsers() {
    const query = "SELECT * FROM users";
    const results = db.exec(query);

    const usersList = document.getElementById('usersList');
    usersList.innerHTML = '';

    if (results.length > 0) {
        results[0].values.forEach(user => {
            // Vulnerability: Exposing all user data including passwords
            usersList.innerHTML += `
                <div>
                    ID: ${user[0]}, Username: ${user[1]}, Password: ${user[2]}
                </div>
            `;
        });
    }
}

// Memory leak: Event listeners never removed
document.addEventListener('mousemove', function(e) {
    // Vulnerability: Unnecessary tracking of all mouse movements
    console.log('Mouse position:', e.clientX, e.clientY);
});

// Initialize database on page load
initDB().catch(console.error);
