import React, {Component} from 'react';
import { Route, Link } from 'react-router-dom';
import {connect} from 'react-redux';
import * as actions from '../../actions';
import '../css/hero.css';
import Timer from '../common/timer';
import Fame from './fame';
import No_more_hero from './no_more_hero';
import Game_result from '../game_result';
import socket from '../../socket.js';

const moment = require('moment-timezone');

class Hero extends Component{
  constructor(props){
    super(props);
    this.state = {
      timer_run : true,
      chat_list : [],
      result_mode : false,
      result : new Map(),
    }
  }
  getData = ()=>{
    fetch(`/room/id/${this.props.match.params.roomID}`)
    .then(res=>res.json())
    .then(data=>{
      this.setState({
        roomID : data.roomID,
        user_list : data.userList,
        room_owner : data.roomOwner,
        game_name : data.gameName,
      });
    });
  }
  componentDidMount = ()=>{
    // get room information
    setTimeout(this.getData, 500);

    // game behavior listen----------------------

     socket.on('new message', (data)=>{
       var _chatlist = this.state.chat_list;
       _chatlist.push(data);
       this.setState({
         chat_list : _chatlist,
       });
       var target = document.getElementsByClassName('chatting')[0];
       this.makeScrollTop();
     });

     // game end
     socket.on('hero appear', (data)=>{
       if(!this.state.hero){
         this.setState({
           hero : data.userID
         });
         // set result
         var result = new Map();
         for(var user of this.state.user_list){
           if(data.userID !== user.userID) result.set(user.userID, 150);
           else result.set(user.userID, 0);
         }
         this.setState({
           result : result,
         });
         // exit room
         socket.emit('exit room', {roomID : this.state.roomID, userID : this.props.user_info.nickname});
         socket.emit('game result', {
           userID : this.props.user_info.nickname,
           point : result.get(this.props.user_info.nickname),
           exp : 200,
         });
       }
     });
  }

  // after 10sec, game ends
  gameEnd = ()=>{
    this.setState({
      timer_run : false,
    });
    // set result
    var result = new Map();
    for(var user of this.state.user_list){
      result.set(user.userID, 50);
    }
    this.setState({
      result : result,
    });
    // exit room
    socket.emit('exit room', {roomID : this.state.roomID, userID : this.props.user_info.nickname});
    socket.emit('game result', {
      userID : this.props.user_info.nickname,
      point : result.get(this.props.user_info.nickname),
      exp : 200,
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
      socket.emit('send message', {roomID : this.props.match.params.roomID, userID : this.props.user_info.nickname, message : this.state.chatting});
      document.getElementById('chat').value = null;
      this.setState({chatting : null});
    }
  }
  // hero appeared
  onClick2 = e=>{
    socket.emit('hero appear', {roomID : this.props.match.params.roomID, userID : this.props.user_info.nickname});
  }
  onClick3 = e=>{
    this.setState({
      result_mode : true,
    });
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
    if(!this.state.result_mode) return(
      <div className='hero'>
        <div className="row1">
        {this.state.hero
          ?
            <>
              <Fame hero={this.state.hero}/>
              <button className="exit" onClick={this.onClick3}>결과 확인</button>
            </>
          :
          (this.state.timer_run
           ?
             <>
               <Timer gameEnd={this.gameEnd} start={true} width={1000} time={10000} height={20} color="#56AEFF"/>
               <div className="hero_button">
                 <button onClick={this.onClick2}>영웅 출현</button>
               </div>
             </>
           :
            <>
              <No_more_hero/>
              <button className="exit" onClick={this.onClick3}>결과 확인</button>
            </>
          )
        }
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

export default connect(mapStateToProps, mapDispatchToProps)(Hero);
