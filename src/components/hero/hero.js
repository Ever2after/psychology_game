import React, {Component} from 'react';
import { Route, Link } from 'react-router-dom';
import {connect} from 'react-redux';
import '../css/hero.css';
import Timer from '../common/timer';
import socket from '../../socket.js';

const moment = require('moment-timezone');

class Hero extends Component{
  constructor(props){
    super(props);
    this.state = {
      chat_list : [],
    }
  }
  componentDidMount = ()=>{


     this.setState({
       roomID : window.location.href.split('/')[5],
     });

     socket.on('new message', (data)=>{
       console.log(data);
       var _chatlist = this.state.chat_list;
       _chatlist.push(data);
       this.setState({
         chat_list : _chatlist,
       });
       var target = document.getElementsByClassName('chatting')[0];
       this.makeScrollTop();
     });

     socket.on('hero appear', (data)=>{
       this.setState({
         hero : data.userID
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
  onClick1 = e =>{
    if(this.state.chatting){
      socket.emit('send message', {roomID : this.state.roomID, userID : this.props.user_info.name, message : this.state.chatting});
    }
    document.getElementById('chat').value = null;
    this.setState({chatting : null});
  }
  onClick2 = e=>{
    socket.emit('hero appear', {roomID : this.state.roomID, userID : this.props.user_info.name});
  }
  onClick3 = e=>{
    socket.emit('exit room', {roomID : this.props.match.params.roomID, userID : this.props.user_info.name});
    this.props.history.push('/public_room_list');
  }
  render(){
    const {chat_list} = this.state;
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
      <div className='hero'>
        <div className="row1">
        {this.state.hero ? <span>{this.state.hero}</span> : <>
          <Timer start={false} width={1000} time={10000} height={20} color="#56AEFF"/>
          <div className="hero_button">
            <button onClick={this.onClick2}>영웅 출현</button>
          </div>
        </>}
          <button onClick={this.onClick3}>나가기</button>
        </div>
        <div className="row2">
          <div className="chatting">
            {chat}
          </div>
          <div className="chatting_input">
            <input id="chat" type="text" name="chatting" required onChange={this.onChange} onKeyDown={this.onKeyDown}/>
            <button onClick={this.onClick1}>전송</button>
          </div>
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
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Hero);
