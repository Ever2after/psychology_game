import React, {Component} from 'react';
import { Route, Link } from 'react-router-dom';
import {connect} from 'react-redux';
import * as actions from '../actions';
import './css/game_ready.css';
import socketIOClient from 'socket.io-client';
const moment = require('moment-timezone');
var socket = socketIOClient();

class Game_ready extends Component{
  constructor(props){
    super(props);
    this.state = {
      user_list : [],
      chat_list : [],
      room_name : '',
      max_number : '',
    }
  }
  makeScrollTop = ()=>{
    var target = document.getElementsByClassName('chatting')[0];
    target.scrollTop = target.scrollHeight;
  }
  componentDidMount = () => {
    const roomID = this.props.match.params.roomID;
    // get roomInfo
    fetch(`/room/id/${roomID}`)
    .then(res=>res.json())
    .then(data=>{
      console.log(data);
      this.setState({
        room_name : data.gameName,
        max_number : data.maxNumber,
        user_list : data.userList,
        roomOwner : data.roomOwner,
      });
      // alert someone joined room
      socket.emit('join room', {
        roomID : roomID,
        userID : this.props.user_info.name,
        isOwner : data.roomOwner===this.props.user_info.name,
      });
    });
    // new user entered
    socket.on('new user', (data)=>{
      var _chatlist = this.state.chat_list;
      _chatlist.push({isAlert : true, userID : '', message : `${data.userID}님이 입장했습니다.`, time : Date.now()});

      var _userlist = this.state.user_list;
      if(this.state.roomOwner!==this.props.user_info.name){
        _userlist.push({userID : data.userID});
      }
      this.setState({
        user_list : _userlist,
        chat_list : _chatlist,
      });
    });

    socket.on('new message', (data)=>{
      var _chatlist = this.state.chat_list;
      _chatlist.push(data);
      this.setState({
        chat_list : _chatlist,
      });
      var target = document.getElementsByClassName('chatting')[0];
      this.makeScrollTop();
    });

    socket.on('delete user', (data)=>{
      var _userlist = this.state.user_list;
      _userlist.splice(_userlist.indexOf(data.userID), 1);
      var _chatlist = this.state.chat_list;
      _chatlist.push({isAlert : true, userID : '', message : `${data.userID}님이 방을 나가셨습니다.`});
      this.setState({
        user_list : _userlist,
        chat_list : _chatlist,
      });
    });
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
  onClick1 = e =>{
    if(this.state.chatting){
      socket.emit('send message', {roomID : this.props.match.params.roomID, userID : this.props.user_info.name, message : this.state.chatting});
    }
    document.getElementById('chat').value = null;
    this.setState({chatting : null});
  }
  onClick2 = e=>{
    socket.emit('exit room', {roomID : this.props.match.params.roomID, userID : this.props.user_info.name});
    this.props.history.push('/public_room_list');
  }
  onClick3 = e=>{
    var link_list =
    this.props.gameStart(this.state.room_name, this.props.match.params.roomID, [this.props.user_info.name]);
    switch(this.state.room_name){
      case '외로운 영웅' :
        this.props.history.push('/hero');
        break;
      case '보물선' :
        this.props.history.push('/treasure_ship');
        break;
      default :
        this.props.history.push('/main');
        break;
    }
  }
  render(){
    const {user_list, chat_list} = this.state;
    var users = [];
    if(user_list){
      for(var i=0;i<user_list.length;i++){
        users.push(
          <div>{user_list[i].userID}</div>
        )
      }
    }
    var chat = [];
    if(chat_list){
      for(var i=0;i<chat_list.length;i++){
        const time = moment.tz(chat_list[i].time, "Asia/Seoul").format('A h:mm');
        // if it is announcement
        if(chat_list[i].isAlert){
          chat.push(<div className="alert">{chat_list[i].message}</div>);
        }
        // if it was written by myself
        else if(chat_list[i].userID===this.props.user_info.name){
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
    return(
      <div className = 'game_ready'>
        <div className="row1">
          <div className="dummy1"></div>
          <div className="info">
          <span>대기실</span>
          <span>{this.state.room_name}</span>
          <span>{user_list.length}/{this.state.max_number}인</span>
          </div>
          <div className="dummy2"></div>
        </div>
        <div className="row2">
          <div className="user_container">
           <div>참여자 목록</div>
           {users}
          </div>
          <div className="chatting_container">
            <div className="chatting">
              {chat}
            </div>
            <div className="chatting_input">
              <input id="chat" type="text" name="chatting" required onChange={this.onChange} onKeyDown={this.onKeyDown}/>
              <button className={this.state.chatting ? "active" : "nonactivate"} type="submit" onClick={this.onClick1}>전송</button>
            </div>
            <div className="button_container">
              <button onClick={this.onClick2}>나가기</button>
              <button onClick={this.onClick3}>게임 시작</button>
            </div>
          </div>
          <div className="dummy"></div>
        </div>
      </div>
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
    gameStart : (name, roomID, user_list)=>{dispatch(actions.game_started(name, roomID, user_list))},
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Game_ready);
