import React, { useState } from 'react'
import {v4} from 'uuid';
import toast from 'react-hot-toast';
import {useNavigate} from 'react-router-dom';
import Avatar from '../components/Avatar';

const Home = () => {
  const navigate = useNavigate();
  const [RoomID, SetRoomId] = useState('');
  const [username, SetUsername] = useState('');
  const Create=(e)=>{
    e.preventDefault();
    const id=v4();
    SetRoomId(id);
    toast.success('Room Created Successfully');
  }
  const JoinRoom=()=>{
    if(!RoomID || !username){
      toast.error('ROOM ID AND USERNAME IS REQUIRED');
      return;
    }
    navigate(`/editor/${RoomID}`,{state:{username}});
  };
  const handleKeyUp=(e)=>{
    if(e.code === 'Enter'){
      JoinRoom();
    }
  }
  return (
    <div className='HomeWrapper'>
        <div className='FormWrapper'>
          {username && <Avatar username={username} size={50} />}
          <h4 className='mainLabel'>Paste Invitation ROOM ID</h4>
          <div className='inputGroup'>
              <input 
                type='text' 
                className='inputField' 
                placeholder='ROOM ID'  
                onChange={(e)=>SetRoomId(e.target.value)} 
                value={RoomID}  
                onKeyUp={handleKeyUp}
              />
            <input 
              type='text' 
              className='inputBox' 
              placeholder='USERNAME' 
              onChange={(e)=>SetUsername(e.target.value)} 
              value={username}
              onKeyUp={handleKeyUp}
            />
            <button className='btn joinButton' onClick={JoinRoom}>Join</button>
            <span className='createInfo'>
                If you don't have an invite then create &nbsp;
                <a onClick={Create} href='' className='createNewBtn'>New Room</a>
            </span>
          </div>
        </div>
      
    </div>
  )
}

export default Home
