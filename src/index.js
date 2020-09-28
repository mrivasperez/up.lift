const http = require("http");
const path = require("path");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

const app = express();

// Refactoring app creation
const server = http.createServer(app);

// configure socket to work w/ server
const io = socketio(server);

// configure port;
const port = process.env.PORT || 3000;

// configure directory
const publicDirectoryPath = path.join(__dirname, "../public");
app.use(express.static(publicDirectoryPath));
console.log(publicDirectoryPath)

// print msg to terminal when client connects
io.on("connection", socket => {
  console.log("New WebSocket connection");

  socket.on('join', (info) => {
    const {error, user} = addUser(socket.id, info);

    if(error){
      socket.emit("acknowledgement", error)
      return
    } 
    console.log(user)
    socket.join(user.room);
    console.log(info);
    // send message whenever a new client connects
    socket.emit("message", `Welcome to up.lift! Keep it wholesome.`);
    // broacast that new usser has joined to all except user
    socket.broadcast.to(user.room).emit("message", `${user.username} has joined!`);
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(room)
    })
  });

  // listen for incoming messages
  socket.on("messageSent", (message, acknowledgement) => {
    const filter = new Filter();
    if(message === ''){
      return;
    }
    if (filter.isProfane(message)) {
      return socket.emit('message', "Profanity is not allowed.");
    }

    const userInfo = getUser(socket.id);
    const room = userInfo.room;
    username = userInfo.username
    io.to(room).emit('message', {message, username })
  });

  // listen for location sending
  socket.on("sendLocation", (currentPosition, acknowledgement) => {
    if (!currentPosition) {
      return acknowledgement("Your location could not be accessed.");
    }

    const userInfo = getUser(socket.id);
    const room = userInfo.room;
    const username = userInfo.username;

    socket.emit('message', "Location received.");
    io.to(room).emit("locationLink", {link: `https://google.com/maps?q=${currentPosition}`, username});
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if(user) {
      io.to(user.room).emit("message", `${user.username} has left.`);
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(room)
      })
    }
  });
});

// start up http server
server.listen(port, () => {
  console.log(`Live at port ${port}`);
});
