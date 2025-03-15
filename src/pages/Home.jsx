import React from 'react'

const Home = () => {
  return (
    <div className='HomeWrapper'>
        <div className='FormWrapper'>
          <img className='logo' src='' alt=''/>
          <h4 className='mainLabel'>Paste Invitation ROOM ID</h4>
          <div className='inputGroup'>
            <input type='text' className='inputField' placeholder='ROOM ID' />
            <input type='text' className='inputBox' placeholder='USERNAME'/>
            <button className=' btn joinButton'>Join</button>
            <span className='createInfo'>
                If you don't have an invite then create &nbsp;
                <a href='' className='createNewBtn'>New Room</a>
            </span>
          </div>
        </div>
      
    </div>
  )
}

export default Home
