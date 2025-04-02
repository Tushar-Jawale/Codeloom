import React, { useState } from 'react'
import Clients from '../components/Clients'
import Editor from '../components/Editor'
import './EditorPage.css'

const EditorPage = () => {
  const [connectedUsers, SetConnectedUsers] = useState([{socketId:'123',username:'John Doe'},{socketId:'12',username:'Jo D'}]);
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
                connectedUsers.map((user)=>(
                    <Clients key={user.socketId} username={user.username}/>
                ))
              }
            </div>
          </div>
          <button className='btn copyBtn'>Copy Room ID</button>
          <button className='btn leaveBtn'>Leave Room</button>
      </div>
      <div className='editorWrapper'>
        <Editor/>
      </div>
    </div>
  )
}

export default EditorPage
