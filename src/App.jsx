import { useState } from 'react'
import './App.css'
import Home from './pages/Home'
import EditorPage from './pages/EditorPage'
import {BrowserRouter,Routes,Route} from 'react-router-dom'

function App() {
  return (
    <>
      <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home/>}></Route>
        <Route path='/editor/:RoomId' element={<EditorPage/>}></Route>
        </Routes>
        </BrowserRouter>
    </>
  )
}

export default App
