import React, {Component} from 'react';
import { Route, Link } from 'react-router-dom';
import {connect} from 'react-redux';
import './css/game_ready.css';
import socketIOClient from 'socket.io-client';
const moment = require('moment-timezone');
var socket = socketIOClient();

class Game_ready extends Component{
  constructor(props){
    super(props);
    this.state = {
      userset : [],
      chatlist : [],
      room_name : '',
      max_number : '',
    }
  }
  makeScrollTop = ()=>{
    var target = document.getElementsByClassName('chatting')[0];
    target.scrollTop = target.scrollHeight;
  }
  componentDidMount(){

    const roomID = this.props.match.params.roomID;
    // get roomInfo
    fetch(`/room/${roomID}`)
    .then(res=>res.json())
    .then(data=>{
      this.setState({
        room_name : data.name,
        max_number : data.max_number,
      });
    });

    // alert someone joined room
    socket.emit('join room', {
      roomID : roomID,
      userID : this.props.user_info.name,
    });
    // new user entered
    socket.on('new user', (data)=>{
      var _chatlist = this.state.chatlist;
      _chatlist.push({isAlert : true, userID : '', message : `${data.newUser}님이 입장했습니다.`, time : Date.now()});
      this.setState({
        userset : data.user,
      });
      //this.makeScrollTop();
    });

    socket.on('new message', (data)=>{
      var _chatlist = this.state.chatlist;
      _chatlist.push(data);
      this.setState({
        chatlist : _chatlist,
      });
      var target = document.getElementsByClassName('chatting')[0];
      this.makeScrollTop();
    });
    socket.on('client disconnect', (data)=>{
      if(this.state.userset.includes(data.userID)){
        var _userset = this.state.userset;
        _userset.splice(_userset.indexOf(data.userID), 1);
        var _chatlist = this.state.chatlist;
        _chatlist.push({isAlert : true, userID : '', message : `${data.userID}님이 방을 나가셨습니다.`});
        this.setState({
          userset : _userset,
          chatlist : _chatlist,
        });
        //this.makeScrollTop();
      }
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
  render(){
    const {userset, chatlist} = this.state;
    var user_list = [];
    if(userset){
      for(var i=0;i<userset.length;i++){
        user_list.push(
          <div>{userset[i]}</div>
        )
      }
    }
    var chat = [];
    if(chatlist){
      for(var i=0;i<chatlist.length;i++){
        const time = moment.tz(chatlist[i].time, "Asia/Seoul").format('A h:mm');
        // if it is announcement
        if(chatlist[i].isAlert){
          chat.push(<div className="alert">{chatlist[i].message}</div>);
        }
        // if it was written by myself
        else if(chatlist[i].userID===this.props.user_info.name){
          chat.push(
            <div className="mychat">
              <span>{time}</span>
              <span>{chatlist[i].message}</span>
            </div>
          );
        }
        // else
        else {
          chat.push(
            <div className="chat">
              <span>[{chatlist[i].userID}]</span>
              <span> : {chatlist[i].message}</span>
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
           {user_list}
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
              <button>게임 시작</button>
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

export default connect(mapStateToProps)(Game_ready);
