const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const {
  generateMessgae,
  generateLocationMessage,
} = require("./utils/messages");
const {
    addUsers,
    removeuser,
    getUsers,
    getusersInRoom
} = require("./utils/users")

const app = express();
const Filters = require("bad-words");

const server = http.createServer(app);

const port = process.env.PORT || 3000;
const publicPath = path.join(__dirname, "../public");
const io = socketio(server);

app.use(express.static(publicPath));

let count = 0;

io.on("connection", (socket) => {
  console.log("new web socket connection");

  socket.on("join", (options,callback) => {
    const { error, user } = addUsers({ id: socket.id, ...options});

    if(error) return callback(error)
    socket.join(user.room);
    socket.emit("message", generateMessgae("Welcome!"));
    socket.broadcast
      .to(user.room)
      .emit("message", generateMessgae(`${user.username} has joined!`));
    io.to(user.room).emit('roomData',{
      room:user.room,
      users:getusersInRoom(user.room)
    })
    callback()
  });

  socket.on("sendMessage", (message, callback) => {
    const filter = new Filters();
    const user=getUsers(socket.id)

    if (filter.isProfane(message)) {
      return callback(generateMessgae("Profanity is not allowed"));
    }

    io.to(user.room).emit("message", generateMessgae(message,user.username));
    callback();
  });

  socket.on("sendlocation", (coords, callback) => {
    const user = getUsers(socket.id);

    io.to(user.room).emit(
      "locationmessage",
      generateLocationMessage(
        `https://www.google.com/maps/@${coords.latitude},${coords.longitude}`,
        user.username
      )
    );
    callback();
  });

  socket.on("disconnect", () => {
    const user= removeuser(socket.id)
    if(user) {
        io.to(user.room).emit(
          "message",
          generateMessgae(`${user.username} has left`)
        );
        io.to(user.room).emit("roomdata", {
          room: user.room,
          users: getusersInRoom(user.room),
        });
    }
    
    
  });
});

server.listen(port, () => {
  console.log("listening on port " + port);
});
