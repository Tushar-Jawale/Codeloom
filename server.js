import http from "http";
import express from "express";
import ACTIONS from "./src/Actions.js";
import cors from "cors";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.static("dist"));
app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const userSocketMap = {};
const getAllConnectedClients = (roomId) => {
  const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => {
    return {
      socketId,
      username: userSocketMap[socketId]?.username || 'Unknown User'
    };
  });
  return clients;
};

io.on("connection", (socket) => {
  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    userSocketMap[socket.id] = { username, roomId };
    socket.join(roomId);

    const clients = getAllConnectedClients(roomId);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        username,
        socketId: socket.id
      });
    });
  });

  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code, language }) => {
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, {
      code,
      language,
      socketId: socket.id
    });
  });

  socket.on(ACTIONS.SYNC_CODE, ({ code, language, socketId }) => {
    console.log(`User ${socket.id} syncing code to ${socketId}`, {
      language,
      codePreview: code ? (code.substring(0, 50) + '...') : 'No code'
    });
    
    if (socketId && io.sockets.sockets.has(socketId)) {
      io.to(socketId).emit(ACTIONS.SYNC_CODE, {
        code,
        language,
        socketId: socket.id
      });
      // console.log(`Successfully sent sync to ${socketId}`);
    } 
  });

  socket.on('disconnecting', () => {
    const userData = userSocketMap[socket.id];
    if (!userData) return;
    const { username, roomId } = userData;
    socket.to(roomId).emit(ACTIONS.DISCONNECTED, {
      socketId: socket.id,
      username
    });
  });

  socket.on('disconnect', () => {
    delete userSocketMap[socket.id];
  });

  socket.on(ACTIONS.LEAVE, () => {
    const userData = userSocketMap[socket.id];
    if (!userData) return;
    const { username, roomId } = userData;
    socket.leave(roomId);
    socket.to(roomId).emit(ACTIONS.DISCONNECTED, {
      socketId: socket.id,
      username
    });
    delete userSocketMap[socket.id];
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});