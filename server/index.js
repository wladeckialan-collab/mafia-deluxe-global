const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Ważne dla gry przez internet
        methods: ["GET", "POST"]
    }
});

const rooms = {};

io.on('connection', (socket) => {
    console.log('Połączono z ID:', socket.id);

    // TWORZENIE POKOJU
    socket.on('createRoom', (username) => {
        const roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
        rooms[roomCode] = {
            players: [{ id: socket.id, name: username, isHost: true }]
        };
        socket.join(roomCode);
        socket.emit('roomCreated', { roomCode, players: rooms[roomCode].players });
        console.log(`Pokój ${roomCode} stworzony przez ${username}`);
    });

    // DOŁĄCZANIE DO POKOJU
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

    // START GRY (Rozdawanie ról)
    socket.on('startGame', (roomCode) => {
        const code = roomCode.toUpperCase();
        if (rooms[code]) {
            let roles = ['Mafia', 'Policjant', 'Lekarz', 'Obywatel', 'Obywatel', 'Obywatel'];
            const roomPlayers = rooms[code].players;
            
            // Losowanie ról
            const shuffledRoles = roles.slice(0, roomPlayers.length).sort(() => Math.random() - 0.5);
            
            roomPlayers.forEach((player, index) => {
                io.to(player.id).emit('yourRole', shuffledRoles[index]);
            });
        }
    });

    socket.on('disconnect', () => {
        console.log('Gracz rozłączony');
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Serwer działa na porcie ${PORT}`);
});