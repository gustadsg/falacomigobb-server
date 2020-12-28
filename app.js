const express = require("express");
const router = require("./router");
const cors = require("cors");
const http = require("http");

const { addUser, getUser, removeUser, getUsersInRoom } = require("./users");
const socketio = require("socket.io");
const { get } = require("./router");

const PORT = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());
app.use(router);

io.on("connection", (socket) => {
  console.log("usuario conectado");

  socket.on("join", ({ room, name }) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    if (error) return error;
    socket.join(user.room);
    socket.emit("message", {
      message: `Seja bem vindo, ${user.name}`,
      name: "admin",
    });

    socket.broadcast.to(user.room).emit("message", {
      message: `${user.name} entrou na sala`,
      name: "admin",
    });
  });

  socket.on("message", ({ message, name }) => {
    const user = getUser(socket.id);
    socket.broadcast
      .to(user.room)
      .emit("message", { message, name: user.name });
  });

  socket.on("typing", ({ name }) => {
    const user = getUser(socket.id);
    socket.to(user.room).emit("typing", { name: user.name });
  });

  socket.on("stop typing", () => {
    const user = getUser(socket.id);
    socket.to(user.room).emit("stop typing");
  });

  socket.on("disconnect", () => {
    const user = getUser(socket.id);
    if (user) {
      removeUser(socket.id);
      socket.broadcast.to(user.room).emit("message", {
        message: `${user.name} se desconectou`,
        name: "admin",
      });
    }
  });
});

server.listen(PORT, () => console.log(`server up and running on port ${PORT}`));
