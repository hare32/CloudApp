const express = require('express');
const { BlobServiceClient } = require('@azure/storage-blob');

const app = express();
app.use(express.json())
const cors = require('cors');
app.use(cors());
;

const connection_string = "DefaultEndpointsProtocol=https;AccountName=spcabmktz;AccountKey=F1yxe7nId/HSeDOYW5o6L6Z+aB+kxyTxO2Vl6ZP77ffkUhtVWExTlWi8IDEL+Ih++PNSYcrAF/rl+AStpkWFzA==;EndpointSuffix=core.windows.net"
const blobServiceClient = BlobServiceClient.fromConnectionString(connection_string);

async function createContainerIfNotExists(username) {
    try {
        const containerClient = blobServiceClient.getContainerClient(username);
        const exists = await containerClient.exists();
        if (!exists) {
            await containerClient.create();
            console.log(`Kontener ${username} został utworzony.`);
        } else {
            console.log(`Kontener ${username} już istnieje.`);
        }
        return containerClient.url;
    } catch (error) {
        console.error("Błąd przy tworzeniu kontenera: ", error);
        throw error; // Rzucić błąd dalej, aby obsłużyć go w middleware
    }
}


app.post('/create-container', async (req, res) => {
    try {
        const username = req.body.username; // Pobierz login użytkownika z żądania
        const containerUrl = await createContainerIfNotExists(username);
        res.status(200).send({ containerUrl });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

app.get('/user-files', async (req, res) => {
    try {
        const username = req.query.username; // Pobierz nazwę użytkownika z parametrów zapytania
        const containerClient = blobServiceClient.getContainerClient(username);
        const blobs = [];
        for await (const blob of containerClient.listBlobsFlat()) {
            if(blob.name.startsWith(username + '/')) {
                blobs.push(blob.name);
            }
        }
        res.status(200).send(blobs);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
