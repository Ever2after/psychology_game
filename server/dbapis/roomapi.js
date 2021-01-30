module.exports = function(app, Room)
{
    // GET ALL public RoomS
    app.get('/room', function(req,res){
        Room.find({isPublic : true}, function(err, rooms){
          if(err) return res.status(500).send({error: 'database failure'});
          res.json(rooms);
        });
    });

    // GET SINGLE Room
    app.get('/room/id/:roomID', function(req, res){
      Room.findOne({roomID: req.params.roomID}, function(err, room){
        if(err) return res.status(500).json({error: err});
        if(!room) return res.status(404).json({error: 'Room not found'});
        res.json(room);
      });
    });

    // GET "public" room BY game gameName
    app.get('/room/game/:gameName', function(req, res){
        Room.find({gameName : req.params.gameName, isPublic : true}, function(err, rooms){ //author일치 Room 모두 find
          if(err) return res.status(500).json({error: err});
          if(rooms.length === 0) res.json({result : 0});
          else res.json(room);
        })
    });

    // get public single room whose user number is max
    app.get('/room/max/:gameName', function(req, res){
      Room.findOne({gameName : req.params.gameName, isPublic : true}).sort('-userNumber').exec((err, room)=>{
        res.json(room);
      });
    });

    // CREATE Room
    app.post('/room', function(req, res){
      var room = new Room();
      const {roomID, isPublic, gameName, maxNumber, roomOwner, userList, createdDate} = req.body;
      room.roomID = roomID;
      room.isPublic = isPublic;
      room.gameName = gameName;
      room.maxNumber = maxNumber;
      room.roomOwner = roomOwner;
      room.userList = userList;
      room.save((err)=>{
        if(err) return res.status(500).json({error : err});
        res.json({result : 1});
      });
    });

    // UPDATE THE Room
    app.put('/room/:room_id', function(req, res){
      Room.findById(req.params.room_id, function(err, room){
          if(err) return res.status(500).json({ error: 'database failure' });
          if(!room) return res.status(404).json({ error: 'Room not found' });
          if(req.body.gameName) room.gameName = req.body.gameName;
          if(req.body.maxNumber) room.maxNumber = req.body.maxNumber;
          if(req.body.roomOwner) room.roomOwner = req.body.roomOwner;
          if(req.body.deleteUser) room.userNumber = room.userNumber-1;
          if(req.body.addUser) room.userNumber = room.userNumber+1;
          room.save((err)=>{
            if(err) console.log(err);
            if(req.body.deleteUser) Room.updateOne({roomID : req.params.room_id}, {$pull : {userList : {userID : req.body.deleteUser}}}, (err)=>{
              if(err) console.log(err);
              if(req.body.addUser) Room.updateOne({roomID : req.params.room_id}, {$push : {userList : {userID : req.body.addUser}}}, (err)=>{
                if(err) console.log(err);
                res.json({result : 1});
              });
            });
          });
        });
    });

    // DELETE Room
    app.delete('/room/:room_id', function(req, res){
      Room.deleteOne({ roomID : req.params.room_id }, (err)=>{
        if(err) return res.status(500).json({ error: "database failure" });
        res.json({result : 1});
      });
    });
}
