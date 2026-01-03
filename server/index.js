const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Prosty komunikat, żeby sprawdzić czy serwer w ogóle żyje
app.get('/test', (req, res) => {
    res.send('Serwer żyje i odpowiada!');
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, '0.0.0.0', () => {
    console.log(`SUKCES! Serwer ruszył na porcie ${PORT}`);
});