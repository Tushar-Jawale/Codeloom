import React from 'react'
import Avatar from './Avatar'

const Clients = ({username}) => {
  return (
    <div className='client'>
      <Avatar username={username}/>
      <span className='userName'>{username}</span>
    </div>
  )
}

export default Clients
