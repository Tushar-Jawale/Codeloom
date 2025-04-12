import http from "http";
import express from "express";
import ACTIONS from "./src/Actions.js";
import cors from "cors";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const userSocketMap = {};
const getAllConnectedClients = (roomId) => {
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) =>{
        return {
            socketId,
            username: userSocketMap[socketId].username
        }
    });
}

io.on("connection", (socket) => {
    console.log("user connected", socket.id);

    socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
        userSocketMap[socket.id] = {username};
        socket.join(roomId);
        const clients = getAllConnectedClients(roomId);
        clients.forEach(({socketId}) => {
            io.to(socketId).emit(ACTIONS.JOINED, {
                clients,
                username,
                socketId: socket.id
            });
        });
    });

    socket.on('disconnecting', () => {
        const rooms = [...socket.rooms];
        rooms.forEach((roomId) => {
            if (roomId !== socket.id) { 
                socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                    socketId: socket.id,
                    username: userSocketMap[socket.id]?.username || 'Unknown User',
                });
            }
        });
    });
    
    socket.on('disconnect', () => {
        console.log("User disconnected:", socket.id);
        delete userSocketMap[socket.id];
    });

    socket.on(ACTIONS.LEAVE, () => {
        const rooms = [...socket.rooms];
        rooms.forEach((roomId) => {
            if (roomId !== socket.id) { 
                socket.leave(roomId);
                socket.to(roomId).emit(ACTIONS.DISCONNECTED, {
                    socketId: socket.id,
                    username: userSocketMap[socket.id]?.username || 'Unknown User',
                });
            }
        });
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
