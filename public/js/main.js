const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const typingIndicator = document.getElementById('typing-indicator');
const msgInput = document.getElementById('msg');

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

msgInput.addEventListener('keypress', () => {
  socket.emit('typing');

  clearTimeout(window.typingTimeout);
  window.typingTimeout = setTimeout(() => {
    socket.emit('stopTyping');
  }, 3000);
});

socket.emit('joinRoom', { username, room });

socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

socket.on('message', (message) => {
  console.log(message);
  outputMessage(message);

  chatMessages.scrollTop = chatMessages.scrollHeight;
});

socket.on('typing', (msg) => {
  typingIndicator.innerText = msg;
});

socket.on('stopTyping', () => {
  typingIndicator.innerText = '';
});

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  let msg = e.target.elements.msg.value;

  msg = msg.trim();

  if (!msg) {
    return false;
  }

  socket.emit('chatMessage', msg);
  socket.emit('stopTyping');
  clearTimeout(window.typingTimeout);

  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');

  const p = document.createElement('p');
  p.classList.add('meta');
  
  p.innerHTML = `${message.username} <span>${message.time}</span>`;
  
  div.appendChild(p);

  const para = document.createElement('p');
  para.classList.add('text');
  para.innerText = message.text;
  
  div.appendChild(para);
  document.querySelector('.chat-messages').appendChild(div);
}

function outputRoomName(room) {
  roomName.innerText = room;
}

function outputUsers(users) {
  userList.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('li');
    li.innerText = user.username;
    userList.appendChild(li);
  });
}

document.getElementById('leave-btn').addEventListener('click', () => {
  const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
  if (leaveRoom) {
    window.location = '../index.html';
  } else {
  }
});