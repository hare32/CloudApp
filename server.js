const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const app = express();
const path = require('path');
const db = new sqlite3.Database('usersDataBase.db');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, '')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '', 'index.html'));
});

app.get('/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, '', 'dashboard.html'));
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    db.run('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, hashedPassword], (err) => {
        if (err) {
            res.status(500).send("Błąd podczas rejestracji użytkownika.");
        } else {
            res.send("Użytkownik zarejestrowany."); 
        }
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) {
            res.status(500).send("Błąd podczas logowania.");
        } else if (row && bcrypt.compareSync(password, row.password_hash)) {
            res.send("Zalogowano pomyślnie.");
        } else {
            res.send("Nieprawidłowa nazwa użytkownika lub hasło.");
        }
    });
});
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});