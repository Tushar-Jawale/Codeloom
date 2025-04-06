import React, { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import Clients from '../components/Clients'
import Editor from '../components/Editor'
import { CodeEditorService } from '../services/CodeEdtiorService'
import { useClipboard } from '../hooks/useClipboard'
import toast from 'react-hot-toast'
import './EditorPage.css'

const EditorPage = () => {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { setRoomId, setUsername } = CodeEditorService();
  const [connectedUsers, setConnectedUsers] = useState([]);
  const { copy } = useClipboard();

  // Get roomId from URL parameter (note: the URL param is RoomId, but we use roomId in our Convex functions)
  const roomId = params.RoomId;
  const username = location.state?.username;

  useEffect(() => {
    if (!roomId || !username) {
      toast.error('Room ID and username are required!');
      navigate('/');
      return;
    }

    console.log('Setting room data:', { roomId, username });

    // Set the room ID and username in the CodeEditorService
    setRoomId(roomId);
    setUsername(username);

    // Add the current user to the connected users list
    setConnectedUsers([{ socketId: 'self', username }]);

    // This will be expanded when you implement Socket.io for real-time collaboration
  }, [roomId, username, navigate, setRoomId, setUsername]);

  const copyRoomId = async () => {
    await copy(roomId);
    toast.success('Room ID copied to clipboard!');
  };

  const leaveRoom = () => {
    navigate('/');
  };

  return (
    <div className='editorPage'>
        <div className='aside'>
          <div className='asideInnerContainer'>
            <div className='logoContainer'>
              <img className='logo' alt='logo'/>
            </div>
            <h3>Connected Users</h3>
            <div className='connectedUsersContainer'>
              {
                connectedUsers.map((user) => (
                    <Clients key={user.socketId} username={user.username}/>
                ))
              }
            </div>
          </div>
          <button className='btn copyBtn' onClick={copyRoomId}>Copy Room ID</button>
          <button className='btn leaveBtn' onClick={leaveRoom}>Leave Room</button>
      </div>
      <div className='editorWrapper'>
        <Editor/>
      </div>
    </div>
  )
}

export default EditorPage
