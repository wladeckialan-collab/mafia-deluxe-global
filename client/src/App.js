import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io(window.location.origin);

function App() {
  const [name, setName] = useState('');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [currentRoom, setCurrentRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [role, setRole] = useState(null);

  useEffect(() => {
    socket.on('roomCreated', (data) => { setCurrentRoom(data.roomCode); setPlayers(data.players); });
    socket.on('updatePlayerList', (list) => setPlayers(list));
    socket.on('joinSuccess', (data) => setCurrentRoom(data.roomCode));
    socket.on('yourRole', (r) => setRole(r));
    return () => socket.disconnect();
  }, []);

  return (
    <div style={{textAlign: 'center', background: '#121212', color: 'white', minHeight: '100vh', padding: '20px'}}>
      <h1>🕵️‍♂️ MAFIA ONLINE</h1>
      {!currentRoom ? (
        <div>
          <input placeholder="Imię" onChange={(e) => setName(e.target.value)} />
          <button onClick={() => name && socket.emit('createRoom', name)}>STWÓRZ</button>
          <br/><br/>
          <input placeholder="Kod" onChange={(e) => setRoomCodeInput(e.target.value)} />
          <button onClick={() => name && socket.emit('joinRoom', {roomCode: roomCodeInput, username: name})}>DOŁĄCZ</button>
        </div>
      ) : (
        <div>
          {role ? <h2>Twoja rola: {role}</h2> : (
            <div>
              <h3>Kod: {currentRoom}</h3>
              {players.map(p => <p key={p.id}>{p.name}</p>)}
              {players.length >= 3 && <button onClick={() => socket.emit('startGame', currentRoom)}>START</button>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
export default App;