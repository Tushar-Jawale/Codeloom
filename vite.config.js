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
    define: {
      // Provide fallbacks for each environment variable
      'process.env.NEXT_PUBLIC_RAPIDAPI_KEY': JSON.stringify(env.NEXT_PUBLIC_RAPIDAPI_KEY || ''),
      'process.env.NEXT_PUBLIC_RAPIDAPI_HOST': JSON.stringify(env.NEXT_PUBLIC_RAPIDAPI_HOST || ''),
      'process.env.NEXT_PUBLIC_JUDGE0_API_URL': JSON.stringify(env.NEXT_PUBLIC_JUDGE0_API_URL || ''),
      'process.env.NEXT_PUBLIC_CPU_TIME_LIMIT': JSON.stringify(env.NEXT_PUBLIC_CPU_TIME_LIMIT || '5'),
      'process.env.NEXT_PUBLIC_MEMORY_LIMIT': JSON.stringify(env.NEXT_PUBLIC_MEMORY_LIMIT || '128000'),
      ...envWithKeys
    }
  }
})
