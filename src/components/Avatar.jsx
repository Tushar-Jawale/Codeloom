import React from 'react';
import Avatar from 'react-avatar'
import './Avatar.css';

const Avatarr = ({ username}) => {
    return (
    <div className='avatar-wrapper'>
        <Avatar name={username} size={50} round='14px'/>
        <span className='userName'>{username}</span>
    </div>
   );
};

export default Avatarr; 