import React, { useState, useEffect, useRef } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import Avatarr from '../components/Avatar.jsx'
import Editor from '../components/Editor'
import { CodeEditorService } from '../services/CodeEdtiorService'
import { useClipboard } from '../hooks/useClipboard'
import toast from 'react-hot-toast'
import './EditorPage.css'
import { initSocket } from '../../socket.js';
import ACTIONS from '../Actions.js';


const EditorPage = () => {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { setRoomId, setUsername, theme } = CodeEditorService();
  const [connectedUsers, setConnectedUsers] = useState([]);
  const { copy } = useClipboard();
  const roomId = params.RoomId;
  const username = location.state?.username;
  const socketRef = useRef(null);
  const socketInitializedRef = useRef(false);
  const eventHandlersRegisteredRef = useRef(false);
  
  useEffect(() => {
    if (!roomId || !username) return;
    
    const init = async() => {
      try {
  
        if (!socketRef.current) {
          socketRef.current = await initSocket();
          socketInitializedRef.current = true;
          console.log('Socket initialized');
        }
        
        if (!eventHandlersRegisteredRef.current) {
          
          const handleErrors = (e) => {
            console.log('socket error', e);
            toast.error('Socket connection failed, try again later.');
            navigate('/');
          };
          
          socketRef.current.off('connect_error');
          socketRef.current.off('connect_failed');
          socketRef.current.off(ACTIONS.JOINED);
          socketRef.current.off(ACTIONS.DISCONNECTED);
          
          socketRef.current.on('connect_error', handleErrors);
          socketRef.current.on('connect_failed', handleErrors);
          
          socketRef.current.on(ACTIONS.JOINED, ({ clients, username: joinedUsername, socketId }) => {
            setConnectedUsers(clients);
          });
          
          socketRef.current.on(
            ACTIONS.DISCONNECTED,
            ({ socketId, username: disconnectedUsername }) => {
                setConnectedUsers((prev) => {
                    return prev.filter(
                        (client) => client.socketId !== socketId
                    );
                });
            }
          );
          
          eventHandlersRegisteredRef.current = true;
        }
        
        if (!socketRef.current._hasJoinedRoom) {
          socketRef.current.emit(ACTIONS.JOIN, { roomId, username });
          socketRef.current._hasJoinedRoom = true;
        }
       
      } catch (err) {
        toast.error('Failed to connect to the server');
        navigate('/');
      }
    };
    
    init();
    
    return () => {
      if (socketRef.current) {
        console.log('Cleaning up socket events');
        socketRef.current.off(ACTIONS.JOINED);
        socketRef.current.off('connect_error');
        socketRef.current.off('connect_failed');
        socketRef.current.off(ACTIONS.DISCONNECTED);   
        socketRef.current.emit(ACTIONS.LEAVE);
        socketRef.current._hasJoinedRoom = false;
        eventHandlersRegisteredRef.current = false;
      }
    };
  }, [roomId, username, navigate]);

  const copyRoomId = async () => {
    await copy(roomId);
    toast.success('Room ID copied to clipboard!');
  };

  const leaveRoom = () => {
    if (socketRef.current) {
      socketRef.current.emit(ACTIONS.LEAVE);
      socketRef.current._hasJoinedRoom = false;
      eventHandlersRegisteredRef.current = false;
    }
    navigate('/');
  };

  return (
    <div className='editorPage' data-theme={theme}>
        <div className='aside'>
          <div className='asideInnerContainer'>
            <div className='logoContainer'>
              <img className='logo' alt='logo'/>
            </div>
            <h3>Connected Users</h3>
            <div className='connectedUsersContainer'>
              {
                connectedUsers.map((user) => (
                    <Avatarr key={user.socketId} username={user.username}/>
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
