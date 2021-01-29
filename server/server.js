const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const port1 = 5000;
const port2 = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ["GET", "POST"],
  }
});

var availableRooms = [];
var roomInfo = new Map();
var onlineUser = new Map();

io.on('connection', socket=>{
  console.log('connected');
  socket.on('logined', (data)=>{
    // 로그인 함.
  })

  socket.on('generate room', (data)=>{
    console.log('generated!');
    // 기존 방 퇴장
    socket.leave(data.roomID);
    // room info update
    roomInfo.set(data.roomID, data.info);
    // room list update
    var rooms = io.sockets.adapter.rooms;
    availableRooms = returnRooms(rooms);
    io.emit('new room', availableRooms);
  })


  socket.on('join room', (data) => {
    // 이전에 속해있던 방은 퇴장 처리

    // room join
    socket.join(data.roomID);
    // update onlineuser list
    onlineUser.set(socket.id, data.userID);
    // room user list update
    var rooms = io.sockets.adapter.rooms;
    availableRooms = returnRooms(rooms);   // [{roomID : , user : , info : }]
    io.emit('new room', availableRooms);
    var userlist = [];
    for(var user of Array.from(rooms.get(data.roomID))){
      userlist.push(onlineUser.get(user));
    }
    io.to(data.roomID).emit('new user', {user : userlist, newUser : data.userID});  // ['user1', 'user2']
  })

  socket.on('exit room', (data)=>{
    // delete user
    socket.leave(data.roomID);
    onlineUser.delete(data.roomID);
    // alert disconnect
    io.to(data.roomID).emit('client disconnect', {userID : data.userID});
    // update room list
    var rooms = io.sockets.adapter.rooms;
    availableRooms = returnRooms(rooms);
    io.emit('new room', availableRooms);
  })

  socket.on('send message', (data)=>{
    io.to(data.roomID).emit('new message', {isAlert : false, userID : data.userID, message : data.message, time : Date.now()});
  })

  socket.on('disconnect', ()=>{
    // alert disconnection
    io.emit('client disconnect', {userID : onlineUser.get(socket.id)});
    // 속해있던 방 퇴장처리
    // room list update
    var rooms = io.sockets.adapter.rooms;
    availableRooms = returnRooms(rooms);
    io.emit('new room', availableRooms);
    // onlineuser에서 delete
    onlineUser.delete(socket.id);
  });
});

function returnRooms(rooms){
  var roomlist = [];
  if(rooms){
    for(let [key, value] of rooms){
      if(key.includes('room')) {
        roomlist.push({roomID : key, user : Array.from(value), info : roomInfo.get(key)});
      }
    }
  }
  return roomlist;
}

app.get('/public/room_list', (req, res)=>{
  console.log('public room list');
  res.json({list : availableRooms});
});

app.get('/room/:roomID', (req, res)=>{
  console.log('get room id');
  res.json(roomInfo.get(req.params.roomID));
});



server.listen(port1, ()=>console.log(`listening on port ${port1}!`));
