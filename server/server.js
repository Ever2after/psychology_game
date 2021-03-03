// load dependencies
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');
const passport = require('./passport.js');
const jwt = require('jsonwebtoken');
const request = require('request');

// load config
const port1 = 5000;
const config = require('./config');

// express configuration
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// print the request log on console
app.use(morgan('dev'));

// set the secret key variable for jwt
app.set('jwt-secret', config.secret);

// initialize passport
app.use(passport.initialize());

const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ["GET", "POST"],
  }
});

//db connect---------------
mongoose.connect(config.uri, {useUnifiedTopology: true, useNewUrlParser: true});

var db = mongoose.connection;
db.on('error', console.error);
db.once('open', function(){
    // CONNECTED TO MONGODB SERVER
    console.log("Connected to mongod server");
});

// define models
const Room = require('./models/room');
const User = require('./models/user');

// set router
const router = require('./dbapis/roomapi')(app, Room);

// socket.io
io.on('connection', socket=>{

  socket.on('generate room', (data)=>{

  })

  socket.on('join room', (data) => {
    if(data.userID){
      var room_list = io.sockets.adapter.rooms.get(socket.id);
      if(room_list) for(let room of room_list){
        socket.leave(room);
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
    }
  });

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
    io.to(data.roomID).emit('new message', {isAlert : false, userID : data.userID, message : data.message, time : Date.now()});
  });

  // game result
  socket.on('game result', (data)=>{
    User.findOne({nickname : data.userID}, (err, user)=>{
      if(err) return err;
      if(user){
        user.point = user.point + data.point;
        user.exp = user.exp + data.exp;
        user.game = user.game + 1;
        user.save((err)=>{
          if(err) return err;
        });
      }
    });
  });

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
        break;
      case '죄수의 딜레마' :
        var time = [3000, 13000, 16000, 21000];
        // round start (0~3)
        setTimeout(()=>{
          io.to(data.roomID).emit('round start', {});
        }, time[0]);
        // time end (3~13)
        setTimeout(()=>{
          io.to(data.roomID).emit('time end', {});
        }, time[1]);
        // result announce  (13~16)
        setTimeout(()=>{
          io.to(data.roomID).emit('result announce', {});
        }, time[2]);
        // end round  (16~21)
        setTimeout(()=>{
          io.to(data.roomID).emit('round end', {});
        }, time[3]);
        break;
      case '전쟁과 평화' :
        var time = [3000, 6000, 16000, 23000, 38000, 41000, 46000];
        // round start (3~)
        setTimeout(()=>{
          io.to(data.roomID).emit('round start', {});
        }, time[0]);
        // timer1 start (6~)
        setTimeout(()=>{
          io.to(data.roomID).emit('timer1 start', {});
        }, time[1]);
        // timer1 end  (16~)
        setTimeout(()=>{
          io.to(data.roomID).emit('timer1 end', {});
        }, time[2]);
        // timer2 start (23~)
        setTimeout(()=>{
          io.to(data.roomID).emit('timer2 start', {});
        }, time[3]);
        // timer2 end (38~)
        setTimeout(()=>{
          io.to(data.roomID).emit('timer2 end', {});
        }, time[4]);
        // result announce (41~)
        setTimeout(()=>{
          io.to(data.roomID).emit('result announce', {});
        }, time[5]);
        // round end (46~)
        setTimeout(()=>{
          io.to(data.roomID).emit('round end', {});
        }, time[6]);
        break;
      case '거꾸로 경매' :
        var time = [3000, 8000];
        // round start (3~)
        setTimeout(()=>{
          io.to(data.roomID).emit('round start', {});
        }, time[0]);
        // auction start (8~)
        setTimeout(()=>{
          io.to(data.roomID).emit('auction start', {});
        }, time[1]);
        break;
    }
  });

  //-------------------HERO----------------------------------//
  socket.on('hero appear', (data)=>{
    io.to(data.roomID).emit('hero appear', {userID : data.userID});
  });

  //-------------------TREASURE SHIP, PRISONER'S DILEMMA------------------------//
  socket.on('choice', (data)=>{
    io.to(data.roomID).emit('choice', {userID : data.userID, choice : data.choice});
    console.log(data);
  });

  //------------------PRISONER'S DILEMMA------------------------------//
  socket.on('emoji change', (data)=>{
    io.to(data.roomID).emit('emoji change', {userID : data.userID, emoji : data.emoji});
  });

  //------------------WAR_AND_PEACE---------------------------------//
  socket.on('power upgrade', (data)=>{
    io.to(data.roomID).emit('power upgrade', {userID : data.userID, point : data.point});
  });

  socket.on('target selected', (data)=>{
    io.to(data.roomID).emit('target selected', {userID : data.userID, target : data.target});
  });

  socket.on('get reward', (data)=>{
    setTimeout(()=>{
      io.to(data.roomID).emit('get reward', {userID : data.userID, point : data.point});
    }, 500);
  });

  //--------------------REVERSE_AUCTION------------//
  socket.on('auction end', (data)=>{
    io.to(data.roomID).emit('auction end', {
      userID : data.userID,
      price : data.price,
    });
  });

  socket.on('auction skip', (data)=>{
    setTimeout(()=>{
      io.to(data.roomID).emit('round end', {});
    }, 5000);
  });

  socket.on('get items', (data)=>{
    io.to(data.roomID).emit('get items', {
      items : getRandomItem(),
    });
  });

  socket.on('disconnect', ()=>{

  });
});

//------------------------ moving dots data api---------------------------
app.get('/movingdot', (req, res)=>{
  request('https://maestro-gtl-dots.herokuapp.com/get_game_data/?final_group_num=3', function(error, response, body){
    res.json(JSON.parse(body));
  });
});

app.post('/movingdot/result', (req, res)=>{
  const body = req.body;
  console.log(body);
  const options = {
    uri : 'https://maestro-gtl-dots.herokuapp.com/get_cluster_result/',
    qs : body,
  }
  request(options, function(err, response, body){
    console.log(body);
    res.json(JSON.parse(body));
  });
})


//------------------------- reverse auction get item----------------------
function getRandomItem(){
  // item : apple, clip, radio, film, paint, telescope, orb, diamond
  // color : 0(red), 1(green), 2(blue), 3(yellow)
  var items = [
    {body : 'apple', name : '사과', value : 150000, color : 0},
    {body : 'apple', name : '사과', value : 150000, color : 1},
    {body : 'apple', name : '사과', value : 150000, color : 2},
    {body : 'apple', name : '사과', value : 150000, color : 3},
    {body : 'clip', name : '클립', value : 200000, color : 0},
    {body : 'clip', name : '클립', value : 200000, color : 1},
    {body : 'clip', name : '클립', value : 200000, color : 2},
    {body : 'clip', name : '클립', value : 200000, color : 3},
    {body : 'radio', name : '라디오', value : 500000, color : 0},
    {body : 'radio', name : '라디오', value : 500000, color : 1},
    {body : 'radio', name : '라디오', value : 500000, color : 2},
    {body : 'film', name : '필름', value : 1500000, color : 0},
    {body : 'film', name : '필름', value : 1500000, color : 1},
    {body : 'film', name : '필름', value : 1500000, color : 2},
    {body : 'paint', name : '페인트', value : 2300000, color : 0},
    {body : 'paint', name : '페인트', value : 2300000, color : 1},
    {body : 'telescope', name : '망원경', value : 3500000, color : 0},
    {body : 'telescope', name : '망원경', value : 3500000, color : 1},
    {body : 'orb', name : '오브', value : 5300000, color : 0},
    {body : 'diamond', name : '다이아몬드', value : 13500000, color : 0},
  ];
  items = shuffleArray(items);
  return items;
}

function shuffleArray(arr){
  for(let k = 0;k<10;k++){
    for(let i = 0;i<arr.length;i++){
      var j = Math.floor(Math.random()*arr.length);
      var temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
  }
  return arr;
}


//------------------------ user ----------------------
// get all user sort by registered_date
app.get('/user', (req, res)=>{
  User.find({}, (err, users)=>{
    if(err) return res.status(500).json({error : err});
    res.json(users);
  });
});

// get all user sort by point
app.get('/user/point', (req, res)=>{
  User.find().sort('-point').exec((err, users)=>{
    if(err) return res.status(500).json({error : err});
    res.json(users);
  });
});

// get all user sort by exp
app.get('/user/exp', (req, res)=>{
  User.find().sort('-exp').exec((err, users)=>{
    if(err) return res.status(500).json({error : err});
    res.json(users);
  });
});

//-----------------guest-------------------
app.get('/guest', (req, res)=>{
  const user = {
      nickname : 'guest1',
      type : 'guest',
  };
  const token = jwt.sign(
    { user : user },
    'jusang'
  );
  res.cookie('token', token, {maxAge : 24*3600*1000});
  res.json({
    is_logined : false,
    user : user,
  });
});

app.get('/guest/jwt', (req, res)=>{

});

//-----------------auth--------------------
// login process
app.post('/auth/login', (req, res)=> {
  passport.authenticate('local', (err, user, info) => {
    if(err) {
      return res.json({is_logined : false});
    }
    if(!user) {
      return res.json({is_logined : false});
    }
    req.logIn(user, (err) => {
      if(err) {
        return res.json({is_logined : false});
      }
      // login success
      const token = jwt.sign(
        { user : user },
        'jusang'
      );
      //
      res.cookie('token',token,{ maxAge : 24*3600*1000 });
      res.json({
        is_logined : true,
        user : user,
      });
    });
  })(req, res);
});

// jwt check process
app.get('/auth/jwt', passport.authenticate('jwt', {session : false}),
  (req, res, next)=>{
    try{
      res.json({ is_logined : true, user : req.user });
    }catch(e){
      console.log(e);
    }
  }
);
// register process
app.post('/auth/register', async (req, res) => {
  const { email, password, nickname } = req.body;
  const user = await User({ email, nickname });
  User.register(user, password, (err, user)=>{
    if(err){
      console.log(err);
      res.json({result : 0});
    }
    else{
      const token = jwt.sign(
        { user : user },
        'jusang'
      );
      //
      res.cookie('token',token,{ maxAge : 24*3600*1000 });
      res.json({result : 1, user : user});
    }
  });
});

// update user info process

// logout process
app.get('/auth/logout', (req, res)=>{
  req.logout();
  res.json({result : 1});
});


// delete user process

server.listen(port1, ()=>console.log(`listening on port ${port1}!`));
