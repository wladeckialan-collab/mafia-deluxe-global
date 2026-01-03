const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

// Ścieżka do plików frontendu
const buildPath = path.join(__dirname, '..', 'client', 'build');
app.use(express.static(buildPath));

// Obsługa Socket.io (możesz tu później dopisać logikę gry)
io.on('connection', (socket) => {
    console.log('Gracz połączony:', socket.id);
});

// Serwowanie aplikacji React
app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'), (err) => {
        if (err) {
            res.status(200).send("Serwer działa! Gra się jeszcze ładuje... Odśwież za minutę.");
        }
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Serwer biega na porcie ${PORT}`);
});