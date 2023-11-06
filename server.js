const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public')); // 'public' to katalog, w którym znajdują się Twoje pliki HTML

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html'); // Zastąp 'index.html' odpowiednim plikiem, jeśli ma inną nazwę
});

app.listen(port, () => {
    console.log(`Serwer uruchomiony na porcie ${port}`);
});
