import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

// Gdy testujesz na komputerze: http://localhost:3001
// Gdy wrzucasz do sieci: wklej tutaj link od Render (np. https://mafia.onrender.com)
const SOCKET_URL = "https://mafia-gra.onrender.com"; // Tutaj wklej SWÓJ link
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

    socket.on('updatePlayerList', (playersList) => {
      setPlayers(playersList);
    });

    socket.on('joinSuccess', (data) => {
      setCurrentRoom(data.roomCode);
    });

    socket.on('yourRole', (assignedRole) => {
      setRole(assignedRole);
    });

    socket.on('error', (msg) => {
      setError(msg);
      setTimeout(() => setError(''), 3000);
    });

    return () => {
      socket.off('roomCreated');
      socket.off('updatePlayerList');
      socket.off('joinSuccess');
      socket.off('yourRole');
      socket.off('error');
    };
  }, []);

  const createRoom = () => {
    if (name) socket.emit('createRoom', name);
  };

  const joinRoom = () => {
    if (name && roomCodeInput) {
      socket.emit('joinRoom', { roomCode: roomCodeInput, username: name });
    }
  };

  const startGame = () => {
    socket.emit('startGame', currentRoom);
  };

  const isHost = players.find(p => p.id === socket.id)?.isHost;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🕵️‍♂️ MAFIA DELUXE</h1>
      
      {!currentRoom ? (
        <div style={styles.menu}>
          <input 
            placeholder="Twoje imię..." 
            style={styles.input} 
            onChange={(e) => setName(e.target.value)} 
          />
          <div style={styles.divider} />
          <button onClick={createRoom} style={styles.btnHost}>STWÓRZ POKÓJ</button>
          <p>LUB</p>
          <input 
            placeholder="Kod pokoju (np. ABCD)" 
            style={styles.input} 
            onChange={(e) => setRoomCodeInput(e.target.value)} 
          />
          <button onClick={joinRoom} style={styles.btnJoin}>DOŁĄCZ DO GRY</button>
          {error && <p style={{color: '#ff4d4d'}}>{error}</p>}
        </div>
      ) : (
        <div style={styles.lobby}>
          {role ? (
            <div style={styles.roleBox}>
              <h2>TWOJA ROLA:</h2>
              <h1 style={styles.roleText}>{role}</h1>
              <button onClick={() => setRole(null)} style={styles.btnReset}>OK</button>
            </div>
          ) : (
            <div>
              <div style={styles.roomHeader}>
                <h2>KOD POKOJU: <span style={styles.code}>{currentRoom}</span></h2>
                <p>Udostępnij ten kod rodzinie</p>
              </div>
              <h3>Gracze w lobby ({players.length}):</h3>
              <div style={styles.playerList}>
                {players.map(p => (
                  <div key={p.id} style={styles.playerTag}>
                    👤 {p.name} {p.isHost ? '(LIDER)' : ''}
                  </div>
                ))}
              </div>
              {isHost && players.length >= 3 && (
                <button onClick={startGame} style={styles.btnStart}>ROZDAJ ROLE</button>
              )}
              {isHost && players.length < 3 && (
                <p style={styles.info}>Potrzeba min. 3 osób, aby zacząć</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { backgroundColor: '#121212', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: 'Arial, sans-serif' },
  title: { fontSize: '2.5rem', marginBottom: '30px', color: '#e74c3c' },
  menu: { display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '350px', margin: '0 auto' },
  input: { padding: '15px', borderRadius: '8px', border: '1px solid #444', backgroundColor: '#222', color: 'white', fontSize: '1rem' },
  btnHost: { padding: '15px', backgroundColor: '#e67e22', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 'bold', cursor: 'pointer' },
  btnJoin: { padding: '15px', backgroundColor: '#3498db', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 'bold', cursor: 'pointer' },
  lobby: { maxWidth: '500px', margin: '0 auto', background: '#1e1e1e', padding: '30px', borderRadius: '15px' },
  roomHeader: { borderBottom: '1px solid #444', marginBottom: '20px', paddingBottom: '10px' },
  code: { color: '#f1c40f', fontSize: '2rem', letterSpacing: '2px' },
  playerList: { textAlign: 'left', marginBottom: '20px' },
  playerTag: { padding: '10px', background: '#2c3e50', marginBottom: '5px', borderRadius: '5px' },
  btnStart: { width: '100%', padding: '15px', backgroundColor: '#27ae60', border: 'none', borderRadius: '8px', color: 'white', fontSize: '1.2rem', fontWeight: 'bold' },
  roleBox: { padding: '40px', border: '3px solid #e74c3c', borderRadius: '20px' },
  roleText: { fontSize: '4rem', color: '#e74c3c', margin: '20px 0' },
  btnReset: { padding: '10px 20px', background: '#444', color: 'white', border: 'none', borderRadius: '5px' },
  info: { color: '#888', fontStyle: 'italic' },
  divider: { height: '1px', backgroundColor: '#333', margin: '10px 0' }
};

export default App;