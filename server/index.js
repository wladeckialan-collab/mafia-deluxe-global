const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

const rooms = {};

// OBSŁUGA PLIKÓW - PANCERNA ŚCIEŻKA
const buildPath = path.join(__dirname, '..', 'client', 'build');
app.use(express.static(buildPath));

io.on('connection', (socket) => {
    socket.on('createRoom', (username) => {
        const roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
        rooms[roomCode] = { players: [{ id: socket.id, name: username, isHost: true }] };
        socket.join(roomCode);
        socket.emit('roomCreated', { roomCode, players: rooms[roomCode].players });
    });

    socket.on('joinRoom', ({ roomCode, username }) => {
        const code = roomCode.toUpperCase();
        if (rooms[code]) {
            rooms[code].players.push({ id: socket.id, name: username, isHost: false });
            socket.join(code);
            io.to(code).emit('updatePlayerList', rooms[code].players);
            socket.emit('joinSuccess', { roomCode: code });
        }
    });

    socket.on('startGame', (roomCode) => {
        const code = roomCode.toUpperCase();
        if (rooms[code]) {
            let roles = ['Mafia', 'Policjant', 'Lekarz', 'Obywatel', 'Obywatel'];
            const roomPlayers = rooms[code].players;
            const shuffledRoles = roles.slice(0, roomPlayers.length).sort(() => Math.random() - 0.5);
            roomPlayers.forEach((p, i) => io.to(p.id).emit('yourRole', shuffledRoles[i]));
        }
    });
});

// Jeśli nie znajdzie pliku, zawsze wysyłaj index.html gry
app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Serwer biega na porcie ${PORT}`);
});