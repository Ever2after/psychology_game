const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Room = new Schema({
  roomID : {type : String},
  isPublic : {type : Boolean, default : false},
  gameName : {type : String},
  maxNumber : {type : Number},
  roomOwner : {type : String, default : null},
  userList : [{userID : {type : String}}],
  userNumber : {type : Number, default : 1},
  createdDate : { type : Date, default : Date.now }
});

//
module.exports = mongoose.model('room', Room);
