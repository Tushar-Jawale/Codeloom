import { io } from 'socket.io-client';

let socket = null;

export const initSocket = async () => {
    if (socket) {
        if (!socket.connected) {
            console.log('Reconnecting existing socket...');
            socket.connect();
        } else {
            console.log('Reusing existing connected socket');
        }
        return socket;
    }
    const options = {
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 10000,
        transports: ['websocket'],
        autoConnect: true,
    };
    
    const BACKEND_URL = process.env.VITE_BACKEND_URL;
    socket = io(BACKEND_URL, options);
    
    socket.on('connect_error', (err) => {
        console.error('Socket connection error:', err);
    });
    
    socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
    });
    
    return socket;
};

export const getSocket = () => socket;

export const cleanupSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};