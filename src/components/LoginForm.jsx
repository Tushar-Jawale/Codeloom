import React, { useState, useEffect } from 'react';
import { CodeEditorService } from '../services/CodeEdtiorService';
import './LoginForm.css';

const LoginForm = ({ onLogin }) => {
  const { roomId: savedRoomId, username: savedUsername, setRoomId, setUsername } = CodeEditorService();
  const [roomId, setLocalRoomId] = useState(savedRoomId || '');
  const [username, setLocalUsername] = useState(savedUsername || '');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (savedRoomId && savedUsername) {
      setIsLoggedIn(true);
      if (onLogin) onLogin({ roomId: savedRoomId, username: savedUsername });
    }
  }, [savedRoomId, savedUsername, onLogin]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (roomId.trim() && username.trim()) {
      setRoomId(roomId.trim());
      setUsername(username.trim());
      setIsLoggedIn(true);
      if (onLogin) onLogin({ roomId, username });
    }
  };

  const handleLogout = () => {
    setRoomId('');
    setUsername('');
    setLocalRoomId('');
    setLocalUsername('');
    setIsLoggedIn(false);
    localStorage.removeItem('room-id');
    localStorage.removeItem('username');
  };

  if (isLoggedIn) {
    return (
      <div className="login-info">
        <span>Room: {savedRoomId || roomId}</span>
        <span>User: {savedUsername || username}</span>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>
    );
  }

  return (
    <div className="login-form-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Join a Coding Room</h2>
        
        <div className="form-group">
          <label htmlFor="roomId">Room ID</label>
          <input
            type="text"
            id="roomId"
            value={roomId}
            onChange={(e) => setLocalRoomId(e.target.value)}
            placeholder="Enter room ID"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setLocalUsername(e.target.value)}
            placeholder="Enter your username"
            required
          />
        </div>
        
        <button type="submit" className="login-button">Join Room</button>
      </form>
    </div>
  );
};

export default LoginForm; 