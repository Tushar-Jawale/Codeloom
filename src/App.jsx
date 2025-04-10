import { useState, useEffect } from 'react'
import './App.css'
import Home from './pages/Home'
import EditorPage from './pages/EditorPage'
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import {Toaster} from 'react-hot-toast'
import { CodeEditorService } from './services/CodeEdtiorService'

function App() {
  const { theme } = CodeEditorService();
  
  // Define theme colors for toast notifications
  const getToastTheme = () => {
    const themeColors = {
      'vs-dark': { primary: '#4aed88', background: '#333', text: '#fff' },
      'vs-light': { primary: '#0078d4', background: '#f0f0f0', text: '#333' }
    };
    
    return themeColors[theme] || themeColors['vs-dark'];
  };
  
  // Apply theme to document root 
  useEffect(() => {
    document.documentElement.setAttribute('data-editor-theme', theme);
  }, [theme]);
  
  const toastTheme = getToastTheme();
  
  return (
    <>
      <div>
        <Toaster 
          position='top-center'
          toastOptions={{
            success:{
              theme:{
                primary: toastTheme.primary,
              },
              style: {
                background: toastTheme.background,
                color: toastTheme.text
              }
            },
            error: {
              style: {
                background: toastTheme.background,
                color: toastTheme.text
              }
            }
          }}
        />
      </div>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home/>} />
          <Route path='/editor/:RoomId' element={<EditorPage/>} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
