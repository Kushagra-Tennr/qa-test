let db;
let currentSession = null;  // Server-side session state
const ADMIN_PASSWORD = "Admin123";

// API endpoints object
const API = {
    // Auth endpoints
    login: async (username, password) => {
        const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
        const result = db.exec(query);
        if (result.length > 0) {
            currentSession = {
                id: result[0].values[0][0],
                username: result[0].values[0][1]
            };
            return currentSession;
        }
        return null;
    },

    getCurrentSession: () => {
        return currentSession;
    },

    logout: () => {
        currentSession = null;
        return { success: true };
    },

    register: async (username, password) => {
        const query = `INSERT INTO users (username, password) VALUES ('${username}', '${password}')`;
        try {
            db.run(query);
            return { success: true };
        } catch (e) {
            return { success: false, error: e.toString() };
        }
    },

    // Notes endpoints
    addNote: async (userId, content) => {
        const query = `INSERT INTO notes (user_id, content) VALUES (${userId}, '${content}')`;
        try {
            db.run(query);
            return { success: true };
        } catch (e) {
            return { success: false, error: e.toString() };
        }
    },

    getNotes: async (userId) => {
        const query = `SELECT * FROM notes WHERE user_id = ${userId}`;
        const results = db.exec(query);
        return results.length > 0 ? results[0].values : [];
    },

    deleteNote: async (noteId) => {
        const query = `DELETE FROM notes WHERE id = ${noteId}`;
        try {
            db.run(query);
            return { success: true };
        } catch (e) {
            return { success: false, error: e.toString() };
        }
    },

    // Admin endpoints
    getAllUsers: async () => {
        const query = "SELECT * FROM users";
        const results = db.exec(query);
        return results.length > 0 ? results[0].values : [];
    },

    // Payment Info endpoints
    getPaymentInfo: async () => {
        const query = "SELECT * FROM paymentInfo";
        const results = db.exec(query);
        return results.length > 0 ? results[0].values : [];
    },

    addPaymentInfo: async (paymentData) => {
        const { userId, cardNumber, cardHolder, expiryDate, cvv, billingAddress } = paymentData;
        const query = `INSERT INTO paymentInfo (user_id, card_number, card_holder, expiry_date, cvv, billing_address)
                      VALUES (${userId}, '${cardNumber}', '${cardHolder}', '${expiryDate}', '${cvv}', '${billingAddress}')`;
        try {
            db.run(query);
            return { success: true };
        } catch (e) {
            return { success: false, error: e.toString() };
        }
    },

    deletePaymentInfo: async (id) => {
        const query = `DELETE FROM paymentInfo WHERE id = ${id}`;
        try {
            db.run(query);
            return { success: true };
        } catch (e) {
            return { success: false, error: e.toString() };
        }
    },

    populatePaymentInfo: async () => {
        for (let i = 0; i < 10; i++) {
            const randomUserId = Math.floor(Math.random() * 10) + 1;
            const paymentInfo = generateRandomPaymentInfo();

            const query = `INSERT OR IGNORE INTO paymentInfo (user_id, card_number, card_holder, expiry_date, cvv, billing_address)
                          VALUES (${randomUserId}, '${paymentInfo.card_number}', '${paymentInfo.card_holder}',
                                  '${paymentInfo.expiry_date}', '${paymentInfo.cvv}', '${paymentInfo.billing_address}')`;

            try {
                db.run(query);
            } catch (e) {
                console.error('Error populating payment info:', e);
            }
        }
        return { success: true };
    }
};

// Helper function for generating random payment info
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

// Initialize database
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

    db.run("INSERT OR IGNORE INTO users (id, username, password) VALUES (1, 'admin', 'Admin123')");

    // Pre-populate payment info using the API method
    await API.populatePaymentInfo();
}

// Expose API to window object
window.API = API;

// Initialize database
initDB().then(() => alert("Server Up")).catch(console.error);
