import React, {Component} from 'react';
import { Route, Link } from 'react-router-dom';
import {connect} from 'react-redux';
import * as actions from '../../actions';
import Timer from '../common/timer';
import Player from './player';
import socket from '../../socket.js';
import '../css/war_and_peace.css';
import Game_result from '../game_result';
const moment = require('moment-timezone');

class War_and_peace extends Component{
  constructor(props){
    super(props);
    this.state = {
      roomID : '',
      chat_list : [],
      step : 0,  // 0 ~ 3
      round : 1, // 1 ~ 5
      timer : false,
      time : 10000,
      user_list : [],
      power_up : 0,
      result_mode : false,
      result : new Map(),
    }
  }
  getData = ()=>{
    fetch(`/room/id/${this.props.match.params.roomID}`)
    .then(res=>res.json())
    .then(data=>{
      var user_map = new Map();
      for(var user of data.userList){
        user_map.set(user.userID, {
          active : true,
          emoji : 0,
          point : 0,
          strength : 0,
          targeted : 0,
        });
      }
      for(var i=0;i<5-data.userNumber;i++){
        user_map.set(`empty${i}`, {
          active : false,
        });
      }
      this.setState({
        roomID : data.roomID,
        user_list : data.userList,
        room_owner : data.roomOwner,
        game_name : data.gameName,
        user_map : user_map,
      });
    });
  }
  gameEnd = ()=>{
    var result = new Map();
    for(let [key, value] of this.state.user_map){
      if(value.active) result.set(key, value.point);
    }
    this.setState({
      result : result,
      result_mode : true,
    });
    socket.emit('exit room', {roomID : this.state.roomID, userID : this.props.user_info.nickname});
    socket.emit('game result', {
      userID : this.props.user_info.nickname, 
      point : result.get(this.props.user_info.nickname),
      exp : 2000,
    });
  }
  componentDidMount = ()=>{
    // get room information
    setTimeout(this.getData, 500);
    //--------------GAME SIGNAL LISTEN-------------------------------------------//
    //---------------- game step process---------------------//
    // round start
    socket.on('round start', (data)=>{
      console.log('round start');
      var _user_map = this.state.user_map;
      for(let [key, value] of this.state.user_map){
        var info = _user_map.get(key);
        if(this.state.round===1) info.point = info.point+200;
        else info.point = info.point+100;
        _user_map.set(key, info);
      }
      this.setState({
        step : 1,
        user_map : _user_map,
      });
    });
    // timer1 start
    socket.on('timer1 start', (data)=>{
      console.log('timer1 start');
      this.setState({
        step : 2,
        timer : true,
      });
    });
    // timer1 end
    socket.on('timer1 end', (data)=>{
      console.log('timer1 end');
      socket.emit('power upgrade', {
        roomID : this.state.roomID,
        userID : this.props.user_info.nickname,
        point : this.state.power_up,
      });
      this.setState({
        step : 3,
        timer : false,
      });
    });
    // timer2 start
    socket.on('timer2 start', (data)=>{
      console.log('timer2 start');
      this.setState({
        step : 4,
        time : 15000,
        timer : true,
      });
    });
    // timer2 end
    socket.on('timer2 end', (data)=>{
      console.log('timer2 end');
      // result check
      // state update
      this.setState({
        step : 5,
        timer : false,
      });
    });
    // result announce
    socket.on('result announce', (data)=>{
      console.log('result announce');
      var _user_map = this.state.user_map;
      for(let [key, value] of this.state.user_map){
        // get reward
        if(key===this.state.confirmed_target){
          socket.emit('get reward', {
            roomID : this.state.roomID,
            userID : this.props.user_info.nickname,
            point : Math.round(value.point*0.4/value.targeted),
          });
        }
        // deduction
        var info = value;
        if(value.targeted>0) {
          info.point = Math.round(value.point*0.6); // -40%
          _user_map.set(key, info);
        }
      }
      this.setState({
          step : 6,
          user_map : _user_map,
      });
    });
    // round end
    socket.on('round end', (data)=>{
      console.log('round end');
      var _user_map = this.state.user_map;
      for(let [key, value] of this.state.user_map){
        var info = _user_map.get(key);
        info.targeted = 0;
        _user_map.set(key, info);
      }
      this.setState({
        step : 0,
        round : this.state.round+1,
        time : 10000,
        target : '',
        confirmed_target : '',
        user_map : _user_map,
        power_up : 0,
      });
      if(this.state.round!==6 && this.state.room_owner===this.props.user_info.nickname){
        socket.emit('game start', {
          roomID : this.state.roomID,
          gameName : this.state.game_name,
        });
      } else if (this.state.round===6){
        // if game ends
        this.gameEnd();
      }
    });
    //-------------game step process done----------------//
    //-------------game behavior-------------------------//
    // get new message
    socket.on('new message', (data)=>{
      var _chatlist = this.state.chat_list;
      _chatlist.push(data);
      this.setState({
        chat_list : _chatlist,
      });
      var target = document.getElementsByClassName('chatting')[0];
      this.makeScrollTop();
    });
    // emoji changed
    socket.on('emoji change', (data)=>{
      var _user_map = this.state.user_map;
      var _info = _user_map.get(data.userID);
      _info.emoji = data.emoji;
      _user_map.set(data.userID, _info);
      this.setState({
        user_map : _user_map
      });
    });
    // target selected
    socket.on('target selected', (data)=>{
      var _user_map = this.state.user_map;
      var info = _user_map.get(data.target);
      info.targeted = info.targeted+1;
      _user_map.set(data.target, info);
      this.setState({
        user_map : _user_map
      });
    });
    // power upgrade
    socket.on('power upgrade', (data)=>{
      if(data.userID!==this.props.user_info.nickname){
        var _user_map = this.state.user_map;
        var info = _user_map.get(data.userID);
        info.strength = info.strength+data.point;
        info.point = info.point-data.point;
        _user_map.set(data.userID, info);
        this.setState({
          user_map : _user_map,
        });
      }
    });
    // get reward
    socket.on('get reward', (data)=>{
      var _user_map = this.state.user_map;
      var info = _user_map.get(data.userID);
      info.point = info.point+data.point;
      _user_map.set(data.userID, info);
      this.setState({
        user_map : _user_map
      });
    });
  }
  makeScrollTop = ()=>{
    var target = document.getElementsByClassName('chatting')[0];
    target.scrollTop = target.scrollHeight;
  }
  onChange = e=>{
    this.setState({
      [e.target.name] : e.target.value,
    });
  }
  onKeyDown = e=>{
    if(e.key==='Enter'){
      this.onClick1();
      //this.makeScrollTop();
    }
  }
  // send chat
  onClick1 = e =>{
    if(this.state.chatting){
      socket.emit('send message', {roomID : this.state.roomID, userID : this.props.user_info.nickname, message : this.state.chatting});
      document.getElementById('chat').value = null;
      this.setState({chatting : null});
    }
  }

  onClick3 = e=>{
    socket.emit('exit room', {roomID : this.props.match.params.roomID, userID : this.props.user_info.nickname});
    this.props.gameEnd();
    this.props.history.push('/');
  }
  onClick4 = emoji=>{
    socket.emit('emoji change', {
      roomID : this.state.roomID,
      userID : this.props.user_info.nickname,
      emoji : emoji,
    });
  }
  // set target
  onClick5 = player=>{
    var info = player[1];
    var userID = player[0];
    console.log(player);
    if(this.state.step===4 && this.props.user_info.nickname!==userID && info.active && !this.state.confirmed_target){
      this.setState({
        target : userID
      });
    }
  }
  // plunder
  onClick6 = ()=>{
    if(this.state.target){
      var my_power = this.state.user_map.get(this.props.user_info.nickname).strength;
      var opponent_power = this.state.user_map.get(this.state.target).strength;
      if(this.state.step===4 && (my_power > opponent_power) && !this.state.confirmed_target){
        this.setState({
          confirmed_target : this.state.target,
        });
        socket.emit('target selected', {
          roomID : this.state.roomID,
          userID : this.props.user_info.nickname,
          target : this.state.target,
        });
      }
    }
  }
  // power upgrade
  onClick7 = ()=>{
    var strength = this.state.user_map.get(this.props.user_info.nickname).strength;
    if(this.state.step===2 && (strength + this.state.power_up < this.state.round*100)){
      var _user_map = this.state.user_map;
      var info = _user_map.get(this.props.user_info.nickname);
      info.strength = info.strength + 100;
      info.point = info.point - 100;
      _user_map.set(this.props.user_info.nickname, info);
      this.setState({
        power_up : this.state.power_up + 100,
        user_map : _user_map,
      });
    }
  }

  // set
  emoji_select = emoji=>{
    switch(emoji){
      case 0:
        return '😄';
      case 1:
        return '😅';
      case 2:
        return '😂';
      case 3:
        return '😜';
      case 4:
        return '😒';
      case 5:
        return '😓';
      case 6:
        return '😠';
      case 7:
        return '😤';
      case 8:
        return '😭';
      case 9:
        return '😱';
    }
  }
  render(){
    const {chat_list} = this.state;
    // chat
    var chat = [];
    if(chat_list){
      for(var i=0;i<chat_list.length;i++){
        const time = moment.tz(chat_list[i].time, "Asia/Seoul").format('A h:mm');
        // if it is announcement
        if(chat_list[i].isAlert){
          chat.push(<div className="alert">{chat_list[i].message}</div>);
        }
        // if it was written by myself
        else if(chat_list[i].userID===this.props.user_info.nickname){
          chat.push(
            <div className="mychat">
              <span>{time}</span>
              <span>{chat_list[i].message}</span>
            </div>
          );
        }
        // else
        else {
          chat.push(
            <div className="chat">
              <span>[{chat_list[i].userID}]</span>
              <span> : {chat_list[i].message}</span>
              <span>{time}</span>
            </div>
          );
        }
      }
    }
    // player array
    var players = [];
    if(this.state.user_map) players = Array.from(this.state.user_map);
    else {
      for(var i=0;i<5;i++){
        players.push([`empty${i}`, {active : false}]);
      }
    }
    // button
    var button;
    if(this.state.step===2) button = <button onClick={this.onClick7}>군사력 증강💪</button>;
    else if(this.state.step===4) button = <button onClick={this.onClick6}>약탈💣</button>;
    else button = <></>;

    if(!this.state.result_mode) return(
      <div className='war_and_peace'>
        <div className="row1">

          <Timer gameEnd={()=>{}} time={this.state.time} start={this.state.timer} width={1200} height={20} color={"#56AEFF"}/>

          <div className="round_info">
            <span>Round {this.state.round}</span>
          </div>

          <div className="contents">
            <div className="circle"></div>

            <div className="round_table">
              <div className="layer1">
                <Player player={players[0]} target={this.state.target} selected={this.state.target} onClick={()=>{this.onClick5(players[0])}}/>
              </div>
              <div className="layer2">
                <Player player={players[1]} target={this.state.target} onClick={()=>{this.onClick5(players[1])}}/>
                {button}
                <Player player={players[2]} target={this.state.target} onClick={()=>{this.onClick5(players[2])}}/>
              </div>
              <div className="layer3">
                <Player player={players[3]} target={this.state.target} onClick={()=>{this.onClick5(players[3])}}/>
                <Player player={players[4]} target={this.state.target} onClick={()=>{this.onClick5(players[4])}}/>
              </div>
            </div>

            <div className="emoji_select">
              <button onClick={()=>{this.onClick4(0)}}>😄</button>
              <button onClick={()=>{this.onClick4(1)}}>😅</button>
              <button onClick={()=>{this.onClick4(2)}}>😂</button>
              <button onClick={()=>{this.onClick4(3)}}>😜</button>
              <button onClick={()=>{this.onClick4(4)}}>😒</button>
              <button onClick={()=>{this.onClick4(5)}}>😓</button>
              <button onClick={()=>{this.onClick4(6)}}>😠</button>
              <button onClick={()=>{this.onClick4(7)}}>😤</button>
              <button onClick={()=>{this.onClick4(8)}}>😭</button>
              <button onClick={()=>{this.onClick4(9)}}>😱</button>
            </div>

          </div>
        </div>

        <div className="row2">

          <div className="chatting">
            <button onClick={this.onClick3}>게임 포기하기</button>
            {chat}
          </div>

          <div className="chatting_input">
            <input id="chat" type="text" name="chatting" required onChange={this.onChange} onKeyDown={this.onKeyDown}/>
            <button onClick={this.onClick1}>전송</button>
          </div>

        </div>
      </div>
    );
    else return(
      <Game_result roomID={this.state.roomID} data={this.state.result}/>
    );
  }
}


const mapStateToProps = (state) => {
  return {
    is_logined : state.login.is_logined,
    user_info : state.login.user_info,
  };
}

const mapDispatchToProps = (dispatch) => {
  //return bindActionCreators(actions, dispatch);
  return{
    gameEnd : ()=>{dispatch(actions.game_ended())},
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(War_and_peace);
