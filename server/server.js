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
    var room_list = io.sockets.adapter.rooms.get(socket.id);
    if(room_list) for(let room of room_list){
      socket.leave(room);
      console.log(room);
    }
    socket.join(data.roomID);
    Room.updateOne({roomID : data.roomID}, {$pull : {userList : {userID : data.userID}}}, (err)=>{
      Room.updateOne({roomID : data.roomID}, {$push : {userList : {userID : data.userID}}}, (err)=>{
        Room.findOne({roomID : data.roomID}, (err, room)=>{
          room.userNumber = room.userList.length;
          room.save((err)=>{
            io.to(data.roomID).emit('new user', {userID : data.userID});
          })
        })
      });
    });
  })

  socket.on('exit room', (data)=>{
    socket.leave(data.roomID);
    Room.updateOne({roomID : data.roomID}, {$pull : {userList : {userID : data.userID}}}, (err)=>{
      Room.findOne({roomID : data.roomID}, (err, room)=>{
        room.userNumber = room.userList.length;
        room.save((err)=>{
          if(room.userList.length===0) Room.deleteOne({roomID : data.roomID}, (err)=>{
          });
          io.to(data.roomID).emit('delete user', {userID : data.userID});
        })
      });
    });
  })

  socket.on('send message', (data)=>{
    console.log(data);
    io.to(data.roomID).emit('new message', {isAlert : false, userID : data.userID, message : data.message, time : Date.now()});
  })

  socket.on('game start', (data)=>{
    io.to(data.roomID).emit('game start', {});
    switch(data.gameName){
      case '외로운 영웅' :
        break;
      case '보물선' :
        var time = [3000, 23000, 26000, 33000];
        // round start (0~3)
        setTimeout(()=>{
          io.to(data.roomID).emit('round start', {});
        }, time[0]);
        // time end (3~23)
        setTimeout(()=>{
          io.to(data.roomID).emit('time end', {});
        }, time[1]);
        // result announce  (23~26)
        setTimeout(()=>{
          io.to(data.roomID).emit('result announce', {});
        }, time[2]);
        // end round  (26~33)
        setTimeout(()=>{
          io.to(data.roomID).emit('round end', {});
        }, time[3]);
    }
  });

  //-------------------HERO----------------------------------//
  socket.on('hero appear', (data)=>{
    io.to(data.roomID).emit('hero appear', {userID : data.userID});
  });

  //-------------------TREASURE SHIP------------------------//
  socket.on('choice', (data)=>{
    io.to(data.roomID).emit('choice', {userID : data.userID, choice : data.choice});
  });

  socket.on('disconnect', ()=>{

  });
});


server.listen(port1, ()=>console.log(`listening on port ${port1}!`));
