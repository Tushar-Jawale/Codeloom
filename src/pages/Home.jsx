import React, { useState, useEffect } from 'react'
import {v4} from 'uuid';
import toast from 'react-hot-toast';
import {useNavigate} from 'react-router-dom';
import Avatar from '../components/Avatar';
import { CodeEditorService } from '../services/CodeEdtiorService';

const Home = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const { 
    setRoomId: storeRoomId, 
    setUsername: storeUsername,
    theme 
  } = CodeEditorService();

  useEffect(() => {
    storeRoomId('');
    storeUsername('');
  }, [storeRoomId, storeUsername]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-editor-theme', theme);
  }, [theme]);

  const createRoom = (e) => {
    e.preventDefault();
    const id = v4();
    setRoomId(id);
    toast.success('Room Created Successfully');
  }

  const joinRoom = () => {
    if (!roomId || !username) {
      toast.error('ROOM ID AND USERNAME IS REQUIRED');
      return;
    }
    
    navigate(`/editor/${roomId}`, { state: { username } });
  };

  const handleKeyUp = (e) => {
    if (e.code === 'Enter') {
      joinRoom();
    }
  }

  return (
    <div className='HomeWrapper' data-theme={theme}>
        <div className='FormWrapper'>
          {username && <Avatar username={username} size={50} />}
          <h4 className='mainLabel'>Paste Invitation ROOM ID</h4>
          <div className='inputGroup'>
              <input 
                type='text' 
                className='inputField' 
                placeholder='ROOM ID'  
                onChange={(e) => setRoomId(e.target.value)} 
                value={roomId}  
                onKeyUp={handleKeyUp}
              />
            <input 
              type='text' 
              className='inputBox' 
              placeholder='USERNAME' 
              onChange={(e) => setUsername(e.target.value)} 
              value={username}
              onKeyUp={handleKeyUp}
            />
            <button className='btn joinButton' onClick={joinRoom}>Join</button>
            <span className='createInfo'>
                If you don't have an invite then create &nbsp;
                <a onClick={createRoom} href='' className='createNewBtn'>New Room</a>
            </span>
          </div>
        </div>
    </div>
  )
}

export default Home
