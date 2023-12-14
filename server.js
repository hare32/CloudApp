const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const app = express();
const path = require('path');
const db = new sqlite3.Database('usersDataBase.db');
const cors = require('cors');
app.use(cors());
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
            res.redirect('/?error=Błąd podczas rejestracji użytkownika.');
        } else {
            res.redirect('/?error=');
        }
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) {
            res.redirect('/?error=Błąd podczas logowania.');
        } else if (row && bcrypt.compareSync(password, row.password_hash)) {
            res.redirect(`/dashboard.html?username=${encodeURIComponent(username)}`);
        } else {
            res.redirect('/?error=Nieprawidłowa nazwa użytkownika lub hasło.');
        }
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

app.get('/download', async (req, res) => {
    const fullFilename = req.query.fullFilename; // Pełna ścieżka pliku, np. 'username/plan.jpg'

    if (!fullFilename) {
        return res.status(400).send('Filename is required');
    }

    // Rozdziel pełną ścieżkę pliku i użyj ostatniej części jako nazwy pliku do pobrania
    const parts = fullFilename.split('/');
    const filename = parts.pop(); // Pobiera ostatni element z tablicy parts

    const storageAccountName = "cloudapp123";
    const containerName = "aplikacja";
    const sasToken = "sp=racwdli&st=2023-12-14T21:08:15Z&se=2024-12-15T05:08:15Z&sv=2022-11-02&sr=c&sig=e3bXOrlqyuyxMpYN6Dm%2BVfSYyvw5rtjb3ZOJ71aNGvY%3D";
    const blobUrl = `https://${storageAccountName}.blob.core.windows.net/${containerName}/${fullFilename}?${sasToken}`;

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    const fetch = require('node-fetch');

    fetch(blobUrl)
        .then(blobRes => {
            if (blobRes.ok) {
                blobRes.body.pipe(res);
            } else {
                res.status(blobRes.status).send('File not found or accessible.');
            }
        })
        .catch(error => {
            console.error('Error fetching file:', error);
            res.status(500).send('Internal Server Error');
        });
});

