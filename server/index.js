const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

// TYMCZASOWE: Zamiast szukać plików, po prostu wyświetlamy tekst
app.get('/', (req, res) => {
    res.send('<h1>Serwer działa poprawnie!</h1><p>Jeśli to widzisz, to znaczy, że backend jest gotowy.</p>');
});

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

io.on('connection', (socket) => {
    console.log('Ktoś się połączył!');
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Serwer biega na porcie ${PORT}`);
});