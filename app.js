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

    db.run(`
        CREATE TABLE IF NOT EXISTS paymentInfo (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            card_number TEXT,
            card_holder TEXT,
            expiry_date TEXT,
            cvv TEXT,
            billing_address TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id)
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
            usersList.innerHTML += `
                <div>
                    ID: ${user[0]}, Username: ${user[1]}, Password: ${user[2]}
                </div>
            `;
        });
    }
}

function generateRandomPaymentInfo() {
    const cardTypes = ['Visa', 'Mastercard', 'American Express'];
    const streets = ['Main St', 'Oak Ave', 'Pine Rd', 'Maple Dr', 'Cedar Ln'];
    const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'];

    const cardType = cardTypes[Math.floor(Math.random() * cardTypes.length)];
    const cardNumber = Math.floor(1000000000000000 + Math.random() * 9000000000000000);
    const cardHolder = `User ${Math.floor(Math.random() * 1000)}`;
    const expiryDate = `${Math.floor(Math.random() * 12 + 1).toString().padStart(2, '0')}/${Math.floor(Math.random() * 5 + 23)}`;
    const cvv = Math.floor(Math.random() * 900 + 100);
    const billingAddress = `${Math.floor(Math.random() * 9999 + 1)} ${streets[Math.floor(Math.random() * streets.length)]}, ${cities[Math.floor(Math.random() * cities.length)]}`;

    return {
        card_number: cardNumber,
        card_holder: cardHolder,
        expiry_date: expiryDate,
        cvv: cvv,
        billing_address: billingAddress
    };
}

function populatePaymentInfo() {
    for (let i = 0; i < 10; i++) {
        const randomUserId = Math.floor(Math.random() * 10) + 1;
        const paymentInfo = generateRandomPaymentInfo();

        const query = `INSERT INTO paymentInfo (user_id, card_number, card_holder, expiry_date, cvv, billing_address)
                      VALUES (${randomUserId}, '${paymentInfo.card_number}', '${paymentInfo.card_holder}',
                              '${paymentInfo.expiry_date}', '${paymentInfo.cvv}', '${paymentInfo.billing_address}')`;

        try {
            db.run(query);
        } catch (e) {
            console.error('Error populating payment info:', e);
        }
    }
    loadPaymentInfo();
}

function loadPaymentInfo() {
    const query = "SELECT * FROM paymentInfo";
    const results = db.exec(query);

    const paymentInfoList = document.getElementById('paymentInfoList');
    paymentInfoList.innerHTML = '';

    if (results.length > 0) {
        results[0].values.forEach(payment => {
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
    }
}

function deletePaymentInfo(id) {
    const query = `DELETE FROM paymentInfo WHERE id = ${id}`;
    db.run(query);
    loadPaymentInfo();
}

function addPaymentInfo() {
    const userId = document.getElementById('paymentUserId').value;
    const cardNumber = document.getElementById('paymentCardNumber').value;
    const cardHolder = document.getElementById('paymentCardHolder').value;
    const expiryDate = document.getElementById('paymentExpiryDate').value;
    const cvv = document.getElementById('paymentCVV').value;
    const billingAddress = document.getElementById('paymentBillingAddress').value;

    const query = `INSERT INTO paymentInfo (user_id, card_number, card_holder, expiry_date, cvv, billing_address)
                  VALUES (${userId}, '${cardNumber}', '${cardHolder}', '${expiryDate}', '${cvv}', '${billingAddress}')`;

    try {
        db.run(query);
        loadPaymentInfo();
    } catch (e) {
        console.error('Error adding payment info:', e);
    }
}

initDB().catch(console.error);
