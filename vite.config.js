import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { loadEnv } from 'vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  // Create an object with all NEXT_PUBLIC_ prefixed env variables
  const envWithKeys = {};
  Object.keys(env).forEach(key => {
    if (key.startsWith('NEXT_PUBLIC_')) {
      envWithKeys[`process.env.${key}`] = JSON.stringify(env[key]);
    }
  });

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})
