const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose    = require('mongoose');
const uri = "mongodb+srv://everafter:Jusang20@cluster0.srjln.mongodb.net/psychology?retryWrites=true&w=majority";
const port1 = 5000;

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

//db connect---------------
mongoose.connect(uri, {useUnifiedTopology: true, useNewUrlParser: true});

var db = mongoose.connection;
db.on('error', console.error);
db.once('open', function(){
    // CONNECTED TO MONGODB SERVER
    console.log("Connected to mongod server");
});

// define models
const Room = require('./models/room');

// set router
const router = require('./dbapis/roomapi')(app, Room);


io.on('connection', socket=>{

  socket.on('generate room', (data)=>{

  })

  socket.on('join room', (data) => {
    socket.join(data.roomID);
    io.to(data.roomID).emit('new user', {userID : data.userID});
    if(!data.isOnwer){
      Room.updateOne({roomID : data.roomID}, {$pull : {userList : {userID : data.userID}}}, (err)=>{
        Room.updateOne({roomID : data.roomID}, {$push : {userList : {userID : data.userID}}}, (err)=>{
          console.log(err);
        });
      });
    }
  })

  socket.on('exit room', (data)=>{
    socket.leave(data.roomID);
    io.to(data.roomID).emit('delete user', {userID : data.userID});
    Room.updateOne({roomID : data.roomID}, {$pull : {userList : {userID : data.userID}}}, (err)=>{
      Room.findOne({roomID : data.roomID}, (err, room)=>{
        console.log(room);
        if(room.userList.length===0) Room.deleteOne({roomID : data.roomID}, (err)=>{
          console.log(err);
        });
      });
    });
  })

  socket.on('send message', (data)=>{
    io.to(data.roomID).emit('new message', {isAlert : false, userID : data.userID, message : data.message, time : Date.now()});
  })

  socket.on('disconnect', ()=>{

  });
});


server.listen(port1, ()=>console.log(`listening on port ${port1}!`));
