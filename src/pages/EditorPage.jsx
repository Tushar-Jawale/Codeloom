import React, { useState, useEffect, useRef } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import Avatarr from '../components/Avatar.jsx'
import logo from '../assets/logo.png'
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
  const { 
    setRoomId, 
    setUsername, 
    theme,
    setCode,
    setLanguage,
  } = CodeEditorService();
  const [connectedUsers, setConnectedUsers] = useState([]);
  const { copy } = useClipboard();
  const roomId = params.RoomId;
  const username = location.state?.username;
  const socketRef = useRef(null);
  const socketInitializedRef = useRef(false);
  const eventHandlersRegisteredRef = useRef(false);
  
  useEffect(() => {
    if (roomId) {
      console.log("Setting room ID in store:", roomId);
      setRoomId(roomId);
    }
    
    if (username) {
      console.log("Setting username in store:", username);
      setUsername(username);
    }
    
    if (!roomId || !username) {
      console.log("Missing roomId or username", { roomId, username });
      navigate('/');
    }
  }, [roomId, username, setRoomId, setUsername, navigate]);
  
  useEffect(() => {
    if (!roomId || !username) return;
    
    console.log(`Initializing connection for ${username} to room ${roomId}`);
    
    const init = async() => {
      try {
        if (!socketRef.current) {
          socketRef.current = await initSocket();
          socketInitializedRef.current = true;
          console.log('Socket initialized with ID:', socketRef.current.id);
        }
        
        if (!eventHandlersRegisteredRef.current) {
          console.log('Registering socket event handlers');
          
          const handleErrors = (e) => {
            console.log('Socket error:', e);
            toast.error('Socket connection failed, try again later.');
            navigate('/');
          };
          
          socketRef.current.off('connect_error');
          socketRef.current.off('connect_failed');
          socketRef.current.off(ACTIONS.JOINED);
          socketRef.current.off(ACTIONS.DISCONNECTED);
          socketRef.current.off(ACTIONS.CODE_CHANGE);
          socketRef.current.off(ACTIONS.SYNC_CODE);
          
          socketRef.current.on('connect_error', handleErrors);
          socketRef.current.on('connect_failed', handleErrors);
          
          socketRef.current.on(ACTIONS.JOINED, ({ clients, username: joinedUsername, socketId }) => {
            console.log(`JOINED event received: ${joinedUsername}`, clients);
            setConnectedUsers(clients);
            
            if (socketId !== socketRef.current.id) {
              console.log(`Sending sync data to new user ${joinedUsername}`);
              setTimeout(() => {
                socketRef.current.emit(ACTIONS.SYNC_CODE, {
                  code: CodeEditorService.getState().code,
                  language: CodeEditorService.getState().language,
                  socketId
                });
              }, 300);
            }
          });
          
          socketRef.current.on(
            ACTIONS.DISCONNECTED,
            ({ socketId, username: disconnectedUsername }) => {
              console.log(`User disconnected: ${disconnectedUsername}`);
              setConnectedUsers((prev) => {
                return prev.filter(
                  (client) => client.socketId !== socketId
                );
              });
            }
          );
          
          socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code: newCode, language: newLanguage, socketId }) => {
            if (socketId !== socketRef.current.id) {
              console.log(`Received code changes from ${socketId}`);
              if (newCode !== undefined) {
                setCode(newCode);
              }
              
              if (newLanguage !== undefined && newLanguage !== CodeEditorService.getState().language) {
                setLanguage(newLanguage);
              }
            }
          });
          
          eventHandlersRegisteredRef.current = true;
        }
        
        if (!socketRef.current._hasJoinedRoom) {
          console.log(`Emitting JOIN for ${username} in room ${roomId}`);
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
        socketRef.current.off(ACTIONS.CODE_CHANGE);
        socketRef.current.off(ACTIONS.SYNC_CODE);
        
        if (socketRef.current._hasJoinedRoom) {
          console.log(`Emitting LEAVE from room ${roomId}`);
          socketRef.current.emit(ACTIONS.LEAVE);
          socketRef.current._hasJoinedRoom = false;
        }
        
        eventHandlersRegisteredRef.current = false;
      }
    };
  }, [roomId, username, navigate, setCode, setLanguage]);
  
  const copyRoomId = async () => {
    await copy(roomId);
    toast.success('Room ID copied to clipboard!');
  };

  const leaveRoom = () => {
    if (socketRef.current) {
      console.log(`Leaving room ${roomId}`);
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
              <img className='logo' src={logo} alt='logo'/>
            </div>
            <h3>
              {connectedUsers.length > 1 
                ? `Connected Users (${connectedUsers.length})`
                : 'Connected Users'}
            </h3>
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
        <Editor socketRef={socketRef} roomId={roomId} connectedUsers={connectedUsers} />
      </div>
    </div>
  )
}

export default EditorPage;