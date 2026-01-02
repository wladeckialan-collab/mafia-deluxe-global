import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = window.location.hostname === "localhost" 
    ? "http://localhost:3001" 
    : window.location.origin;

const socket = io(SOCKET_URL);

function App() {
  const [name, setName] = useState('');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [currentRoom, setCurrentRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [role, setRole] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    socket.on('roomCreated', (data) => {
      setCurrentRoom(data.roomCode);
      setPlayers(data.players);
    });
    socket.on('updatePlayerList', (list) => setPlayers(list));
    socket.on('joinSuccess', (data) => setCurrentRoom(data.roomCode));
    socket.on('yourRole', (r) => setRole(r));
    socket.on('error', (m) => { setError(m); setTimeout(() => setError(''), 3000); });

    return () => {
      socket.off('roomCreated');
      socket.off('updatePlayerList');
      socket.off('joinSuccess');
      socket.off('yourRole');
      socket.off('error');
    };
  }, []);

  const createRoom = () => name && socket.emit('createRoom', name);
  const joinRoom = () => name && roomCodeInput && socket.emit('joinRoom', { roomCode: roomCodeInput, username: name });
  const startGame = () => socket.emit('startGame', currentRoom);
  const isHost = players.find(p => p.id === socket.id)?.isHost;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🕵️‍♂️ MAFIA ONLINE</h1>
      {!currentRoom ? (
        <div style={styles.menu}>
          <input placeholder="Twoje imię..." style={styles.input} onChange={(e) => setName(e.target.value)} />
          <button onClick={createRoom} style={styles.btnHost}>STWÓRZ POKÓJ</button>
          <hr style={{width: '100%', borderColor: '#333'}} />
          <input placeholder="Kod pokoju..." style={styles.input} onChange={(e) => setRoomCodeInput(e.target.value)} />
          <button onClick={joinRoom} style={styles.btnJoin}>DOŁĄCZ DO GRY</button>
          {error && <p style={{color: 'red'}}>{error}</p>}
        </div>
      ) : (
        <div style={styles.lobby}>
          {role ? (
            <div style={{textAlign: 'center'}}>
              <h2>TWOJA ROLA:</h2>
              <h1 style={{color: '#e74c3c', fontSize: '3rem'}}>{role}</h1>
              <button onClick={() => setRole(null)} style={styles.btnReset}>ZAMKNIJ</button>
            </div>
          ) : (
            <div>
              <h2>KOD: <span style={{color: '#f1c40f'}}>{currentRoom}</span></h2>
              <h3>Gracze:</h3>
              {players.map(p => <div key={p.id} style={styles.playerTag}>👤 {p.name} {p.isHost ? '(LIDER)' : ''}</div>)}
              {isHost && players.length >= 3 && <button onClick={startGame} style={styles.btnStart}>ROZDAJ ROLE</button>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { backgroundColor: '#121212', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif', textAlign: 'center' },
  title: { color: '#e74c3c' },
  menu: { display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', margin: '0 auto' },
  input: { padding: '12px', borderRadius: '5px', border: '1px solid #444', background: '#222', color: 'white' },
  btnHost: { padding: '12px', background: '#e67e22', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  btnJoin: { padding: '12px', background: '#3498db', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  lobby: { background: '#1e1e1e', padding: '20px', borderRadius: '10px', display: 'inline-block', minWidth: '300px' },
  playerTag: { padding: '8px', background: '#333', margin: '5px 0', borderRadius: '4px' },
  btnStart: { marginTop: '20px', padding: '15px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', width: '100%', fontWeight: 'bold' },
  btnReset: { marginTop: '20px', padding: '10px', background: '#444', color: 'white', border: 'none', borderRadius: '5px' }
};

export default App;