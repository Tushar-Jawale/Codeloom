import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { loadEnv } from 'vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  const envWithKeys = {
    'process.env.VITE_RAPIDAPI_KEY': JSON.stringify('5732e8eddbmshfe8fbd2a72c48cfp17095ajsn837dfa94c3a1'),
    'process.env.VITE_RAPIDAPI_HOST': JSON.stringify('judge0-ce.p.rapidapi.com'),
    'process.env.VITE_BACKEND_URL': JSON.stringify('http://localhost:5000'),
    'process.env.VITE_JUDGE0_API_URL': JSON.stringify('https://judge0-ce.p.rapidapi.com')
  };

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: envWithKeys
  }
})
