const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const User = new Schema({
  email : String,
  nickname : String,
  point : {type : Number, default : 0},
  exp : {type : Number, default : 0},
  game : {type : Number, default : 0},
  registered_date : {type : Date, default : Date.now},
});

User.plugin(passportLocalMongoose, {usernameField: 'email'});

//
module.exports = mongoose.model('User', User);
