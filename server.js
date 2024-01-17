const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const { BlobServiceClient } = require('@azure/storage-blob');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const app = express();
const fs = require('fs').promises;
const path = require('path');
const db = new sqlite3.Database('usersDataBase.db');
const cors = require('cors');
const { open } = require('sqlite');
const upload = multer({ dest: 'uploads/' });
const jwt = require('jsonwebtoken');
const winston = require('winston');
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, '')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '', 'index.html'));
});

app.get('/dashboard.html', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, '', 'dashboard.html'));
});

app.get('/uploud' ,authenticateToken, (req, res) => {

})
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
    logger.info(`Użytkownik ${username} zarejestrował się`);
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) {
            res.redirect('/?error=Błąd podczas logowania.');
        } else if (row && bcrypt.compareSync(password, row.password_hash)) {
            logger.info(`Użytkownik ${username} zalogował się`);
            const token = jwt.sign({ username: username }, 'tajny_klucz', { expiresIn: '1h' });
            res.redirect(`/dashboard.html?username=${encodeURIComponent(username)}&token=${token}`);
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
    const fullFilename = req.query.fullFilename;
    if (!fullFilename) {
        return res.status(400).send('Filename is required');
    }
    const parts = fullFilename.split('/');
    const filename = parts.pop();
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

app.post('/upload',  upload.single('file'), async (req, res) => {
    const file = req.file;
    const originalName = file.originalname;
    const username = req.body.username;
    const storageAccountName = "cloudapp123";
    const sasToken = "?sv=2022-11-02&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2024-12-06T20:52:46Z&st=2023-12-06T12:52:46Z&spr=https&sig=S3c1OckbFNcLEf42h3MVw%2FaZLldkVLpv5fniSpgE58M%3D";
    const containerName = "aplikacja";

    try {
        db.get('SELECT MAX(FileVersion) as maxVersion FROM FileVersions WHERE FileName = ? AND UserName = ?', [originalName, username], async (err, row) => {
            if (err) {
                return res.status(500).send('Error during file version check');
            }

            let newVersion = 1;
            if (row && row.maxVersion) {
                newVersion = row.maxVersion + 1;
            }

            let versionSuffix = newVersion > 1 ? `_v${newVersion}` : '';
            const blobName = `${username}/${originalName.split('.')[0]}${versionSuffix}.${originalName.split('.').pop()}`;
            const blobServiceClient = BlobServiceClient.fromConnectionString("DefaultEndpointsProtocol=https;AccountName=cloudapp123;AccountKey=UXeoymEZyr99Qrn4Fe9i0zeJbWYd9Be40vv5DMLYOSJwKmkudA8qrFjH8Ay5m6402q7j6RS5QD4f+AStBwCvXg==;EndpointSuffix=core.windows.net");
            const containerClient = blobServiceClient.getContainerClient('aplikacja');
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);

            await blockBlobClient.uploadFile(file.path);

            const filePathInDB = `https://${storageAccountName}.blob.core.windows.net/${containerName}/${blobName}`;

            db.run('INSERT INTO FileVersions (UserName, FileName, FileVersion, FileSize, LastModified, FilePath) VALUES (?, ?, ?, ?, datetime(\'now\', \'+1 hour\'), ?)',
                [username, originalName, newVersion, file.size, filePathInDB],
                (dbErr) => {
                    if (dbErr) {
                        console.error('Database error:', dbErr);
                        return res.status(500).send('Error during database update');
                    }
                    res.send('File uploaded and versioned successfully');
                    logger.info(`Użytkownik ${username} wysłał plik ${originalName}`);
                });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).send('Error during file upload');
    }
});


app.get('/api/files', authenticateToken, async (req, res) => {
    const username = req.query.username;
    db.all('SELECT FileName, MAX(FileVersion) as LatestVersion, MAX(LastModified) as LastModified FROM FileVersions WHERE UserName = ? GROUP BY FileName', [username], (err, rows) => {
        if (err) {
            console.error('Error fetching files:', err);
            return res.status(500).send('Error fetching files');
        }
        res.json(rows.map(row => {
            const fileParts = row.FileName.split('.');
            const fileNameWithoutExt = fileParts.slice(0, -1).join('.');
            const fileExtension = fileParts.slice(-1)[0];
            const fullName = row.LatestVersion > 1 ? `${fileNameWithoutExt}_v${row.LatestVersion}.${fileExtension}` : row.FileName;
            return {
                name: fullName,
                lastModified: row.LastModified
            };
        }));
    });
});


app.get('/api/versions/:fileName', authenticateToken, async (req, res) => {
    const fileName = req.params.fileName;
    const username = req.query.username;
    db.all('SELECT * FROM FileVersions WHERE FileName = ? AND UserName = ? ORDER BY FileVersion DESC', [fileName, username], (err, rows) => {
        if (err) {
            console.error('Error fetching file versions:', err);
            return res.status(500).send('Error fetching file versions');
        }
        res.json(rows.map(row => {
            return {
                version: row.FileVersion,
                size: row.FileSize,
                lastModified: row.LastModified,
                filePath: row.FilePath
            };
        }));
    });
});

function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
    if (token == null) return res.status(401).json({ error: 'No token provided' });

    jwt.verify(token, 'tajny_klucz', (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token, please log in again' });
        req.user = user;
        next();
    });
}

app.post('/log', (req, res) => {
    const { level, message } = req.body;
    logger.log(level, message);
    res.status(200).send('Log received');
});

const logFormat = winston.format.combine(
    winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
);
const logger = winston.createLogger({
    level: 'info',
    format: logFormat,
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ],
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
      format: winston.format.simple(),
    }));
}