const express = require('express');

const app = express();
app.use(express.json())
const cors = require('cors');
app.use(cors());

const path = require('path');
app.use(express.json());

app.use(express.static(path.join(__dirname, '')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '', 'index.html'));
});



const port = process.env.PORT || 63342;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});