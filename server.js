const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const formatMessage = require('./utils/messages');
const { addUser, getUserById, removeUser, getRoomUsers, } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = addUser(socket.id, username, room);

    socket.join(user.room);

    socket.emit('message', formatMessage('ChatBot', 'Benvenuto!'));

    socket.broadcast.to(user.room).emit(
      'message',
      formatMessage('ChatBot', `${user.username} è entrato in chat`)
    );

    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });

  socket.on('chatMessage', (msg) => {
    const user = getUserById(socket.id);
    if (user) {
      io.to(user.room).emit('message', formatMessage(user.username, msg));
    }
  });

    socket.on('typing', () => {
        const user = getUserById(socket.id);
        if (user) {
            socket.broadcast.to(user.room).emit('typing', `${user.username} is writing...`);
        }
    });

    socket.on('stopTyping', () => {
        const user = getUserById(socket.id);
        if (user) {
            socket.broadcast.to(user.room).emit('stopTyping');
        }
    });


  socket.on('disconnect', () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit('message', formatMessage('ChatBot', `${user.username} ha lasciato la chat`));
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));