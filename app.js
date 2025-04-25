let db;
let currentUser = null;
const ADMIN_PASSWORD = "admin123";

window.onerror = function (_msg, _url, _lineNo, _columnNo, error) {
    alert('Error: ' + error.stack);
    return false;
};

async function initDB() {
    const SQL = await initSqlJs({
        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
    });

    db = new SQL.Database();

    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
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

    db.run("INSERT OR IGNORE INTO users (id, username, password) VALUES (1, 'admin', 'admin123')");
}

function register() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const query = `INSERT INTO users (username, password) VALUES ('${username}', '${password}')`;

    try {
        db.run(query);
        alert('Registration successful!');
    } catch (e) {
        alert('Registration failed: ' + e.toString());
    }
}

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    const result = db.exec(query);

    if (result.length > 0) {
        currentUser = {
            id: result[0].values[0][0],
            username: result[0].values[0][1]
        };

        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('noteSection').style.display = 'block';

        if (username === 'admin') {
            document.getElementById('adminPanel').style.display = 'block';
        }

        loadNotes();
    } else {
        alert('Invalid credentials!');
    }
}

function addNote() {
    const content = document.getElementById('newNote').value;

    const query = `INSERT INTO notes (user_id, content) VALUES (${currentUser.id}, '${content}')`;

    try {
        db.run(query);
        loadNotes();
    } catch (e) {
        console.error(e);
    }
}

function loadNotes() {
    const query = `SELECT * FROM notes WHERE user_id = ${currentUser.id}`;
    const results = db.exec(query);

    const notesList = document.getElementById('notesList');
    notesList.innerHTML = '';

    if (results.length > 0) {
        results[0].values.forEach(note => {
            notesList.innerHTML += `
                <div class="note">
                    ${note[2]}
                    <button onclick="deleteNote(${note[0]})">Delete</button>
                </div>
            `;
        });
    }
}

function deleteNote(noteId) {
    const query = `DELETE FROM notes WHERE id = ${noteId}`;
    db.run(query);
    loadNotes();
}

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

initDB().catch(console.error);
