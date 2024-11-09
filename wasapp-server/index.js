import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { randomUUID } from "crypto";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const connectedUsers = new Map();
const groups = new Map();
app.get("/", (req, res) => {
  res.send("<h1>Hello world</h1>");
});

io.on("connection", (socket) => {
  const userId = socket.id;
  const username = socket.handshake.query.username;

  const newUser = {
    id: userId, //socketId
    name: username || `Usuario ${randomUUID().slice(0, 4)}`,
    socketId: socket.id,
  };

  connectedUsers.set(socket.id, newUser);

  socket.emit("self:info", newUser);

  io.emit("users:list", Array.from(connectedUsers.values()));

  socket.on("message:private", ({ to, content }) => {
    const fromUser = connectedUsers.get(socket.id);
    const toUser = Array.from(connectedUsers.values()).find(
      (user) => user.id === to
    );

    if (toUser && fromUser && toUser.id !== fromUser.id) {
      const messageId = randomUUID();
      io.to(toUser.socketId).emit("message:received", {
        content,
        from: fromUser.id,
        timestamp: new Date().toLocaleTimeString(),
        messageId,
      });

      socket.emit("message:sent", {
        messageId,
        content,
        to: toUser.id,
        timestamp: new Date().toLocaleTimeString(),
      });
    }
  });

  socket.on("group:create", ({ name, participants }) => {
    const groupId = randomUUID();
    const group = {
      id: groupId,
      name,
      participants: [...participants, socket.id],
      type: "group",
    };

    groups.set(groupId, group);

    group.participants.forEach((participantId) => {
      io.to(participantId).emit("group:created", group);
    });
  });
  socket.on("message:group", ({ groupId, content }) => {
    const group = groups.get(groupId);
    if (group && group.participants.includes(socket.id)) {
      const messageId = randomUUID();
      const timestamp = new Date().toLocaleTimeString();

      group.participants.forEach((participantId) => {
        io.to(participantId).emit("message:group:received", {
          messageId,
          groupId,
          content,
          from: socket.id,
          timestamp,
        });
      });
    }
  });
  socket.on("user:updateName", (newName) => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      user.name = newName;
      connectedUsers.set(socket.id, user);

      groups.forEach((group) => {
        if (group.participants.includes(socket.id)) {
          io.to(group.participants).emit("group:userUpdated", {
            userId: socket.id,
            newName,
          });
        }
      });

      io.emit("user:nameUpdated", {
        userId: socket.id,
        newName,
      });

      socket.emit("self:info", user);
    }
  });
  socket.on("message:delete", ({ messageId, chatId }) => {
    const group = groups.get(chatId);

    if (group) {
      group.participants.forEach((participantId) => {
        io.to(participantId).emit("message:deleted", {
          messageId,
          chatId,
        });
      });
    } else {
      const toUser = Array.from(connectedUsers.values()).find(
        (user) => user.id === chatId
      );
      if (toUser) {
        io.to(toUser.socketId).emit("message:deleted", {
          messageId,
          chatId: socket.id,
        });
        socket.emit("message:deleted", {
          messageId,
          chatId,
        });
      }
    }
  });

  socket.on("disconnect", () => {
    connectedUsers.delete(socket.id);
    io.emit("users:list", Array.from(connectedUsers.values()));
  });
});

server.listen(3000, () => {
  console.log("Servidor iniciado en http://localhost:3000");
});
