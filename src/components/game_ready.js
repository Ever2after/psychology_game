import React, {Component} from 'react';
import { Route, Link } from 'react-router-dom';
import {connect} from 'react-redux';
import * as actions from '../actions';
import './css/game_ready.css';
import socket from '../socket.js';
const moment = require('moment-timezone');

class Game_ready extends Component{
  constructor(props){
    super(props);
    this.state = {
      user_list : [],
      chat_list : [],
      game_name : '',
      max_number : '',
      roomOwner : false,
    }
  }

  makeScrollTop = ()=>{
    var target = document.getElementsByClassName('chatting')[0];
    target.scrollTop = target.scrollHeight;
  }

  componentDidMount = () => {
    const roomID = this.props.match.params.roomID;

    // alert someone joined room
    setTimeout(()=>{
      socket.emit('join room', {
          roomID : roomID,
          userID : this.props.user_info.nickname,
      });
    }, 500);

    // new user entered
    socket.on('new user', (data)=>{
      var _chatlist = this.state.chat_list;
      _chatlist.push({isAlert : true, userID : '', message : `${data.userID}님이 입장했습니다.`, time : Date.now()});

      fetch(`/room/id/${roomID}`)
      .then(res=>res.json())
      .then(data=>{
        this.setState({
          game_name : data.gameName,
          max_number : data.maxNumber,
          roomOwner : data.roomOwner,
          user_list : data.userList,
          chat_list : _chatlist,
        });
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
      var _chatlist = this.state.chat_list;
      _chatlist.push({isAlert : true, userID : '', message : `${data.userID}님이 방을 나가셨습니다.`});
      fetch(`/room/id/${roomID}`)
      .then(res=>res.json())
      .then(data=>{
        this.setState({
          user_list : data.userList,
          chat_list : _chatlist,
        });
      });
    });

    socket.on('game start', (data)=>{
      this.gameStart();
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
      socket.emit('send message', {roomID : this.props.match.params.roomID, userID : this.props.user_info.nickname, message : this.state.chatting});
    }
    document.getElementById('chat').value = null;
    this.setState({chatting : null});
  }
  onClick2 = e=>{
    socket.emit('exit room', {roomID : this.props.match.params.roomID, userID : this.props.user_info.nickname});
    this.props.history.push('/public_room_list');
  }
  // start game
  onClick3 = e=>{
    socket.emit('game start', {roomID : this.props.match.params.roomID, gameName : this.state.game_name});
  }
  onClick4 = e=>{
    e.preventDefault();
    const el = document.createElement('textarea');
    el.value = this.props.match.params.roomID;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }
  gameStart = ()=>{
    this.props.gameStart(this.state.game_name, this.props.match.params.roomID, this.state.user_list);
    switch(this.state.game_name){
      case '외로운 영웅' :
        this.props.history.replace(`/hero/${this.props.match.params.roomID}`);
        break;
      case '보물선' :
        this.props.history.replace(`/treasure_ship/${this.props.match.params.roomID}`);
        break;
      case '죄수의 딜레마' :
        this.props.history.replace(`/prisoner/${this.props.match.params.roomID}`);
        break;
      case '전쟁과 평화' :
        this.props.history.replace(`/war_and_peace/${this.props.match.params.roomID}`);
      default :
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
    const isOwner = this.state.roomOwner == this.props.user_info.nickname;
    return(
      <div className = 'game_ready'>
        <div className="row1">
          <div className="dummy1"></div>
          <div className="info">
            <span>대기실</span>
            <span>{this.state.game_name}</span>
            <button onClick={this.onClick4}>입장 코드 복사</button>
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
              '나가기' 버튼을 눌러야 정상적으로 퇴장처리가 됩니다.
              <button onClick={this.onClick2}>나가기</button>
              {isOwner ? <button onClick={this.onClick3}>게임 시작</button> : <></>}
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
