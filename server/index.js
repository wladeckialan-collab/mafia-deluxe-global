const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const rooms = {};

// --- SERWOWANIE PLIKÓW GRY ---
const __dirname_resolved = path.resolve();
app.use(express.static(path.join(__dirname_resolved, 'client', 'build')));

io.on('connection', (socket) => {
    socket.on('createRoom', (username) => {
        const roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
        rooms[roomCode] = {
            players: [{ id: socket.id, name: username, isHost: true }]
        };
        socket.join(roomCode);
        socket.emit('roomCreated', { roomCode, players: rooms[roomCode].players });
    });

    socket.on('joinRoom', ({ roomCode, username }) => {
        const code = roomCode.toUpperCase();
        if (rooms[code]) {
            const newPlayer = { id: socket.id, name: username, isHost: false };
            rooms[code].players.push(newPlayer);
            socket.join(code);
            io.to(code).emit('updatePlayerList', rooms[code].players);
            socket.emit('joinSuccess', { roomCode: code });
        } else {
            socket.emit('error', 'Pokój nie istnieje!');
        }
    });

    socket.on('startGame', (roomCode) => {
        const code = roomCode.toUpperCase();
        if (rooms[code]) {
            let roles = ['Mafia', 'Policjant', 'Lekarz', 'Obywatel', 'Obywatel'];
            const roomPlayers = rooms[code].players;
            const shuffledRoles = roles.slice(0, roomPlayers.length).sort(() => Math.random() - 0.5);
            roomPlayers.forEach((player, index) => {
                io.to(player.id).emit('yourRole', shuffledRoles[index]);
            });
        }
    });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname_resolved, 'client', 'build', 'index.html'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Serwer działa na porcie ${PORT}`);
});