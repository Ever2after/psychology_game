import React, {Component} from 'react';
import { Route, Link } from 'react-router-dom';
import {connect} from 'react-redux';
import * as actions from '../../actions';
import Timer from '../common/timer';
import socket from '../../socket.js';
import '../css/prisoner.css';


const moment = require('moment-timezone');

class Prisoner extends Component{
  constructor(props){
    super(props);
    this.state = {
      roomID : '',
      chat_list : [],
      step : 0,  // 0 ~ 3
      round : 1, // 1 ~ 5
      timer : false,
      user_list : [],
      opponent_name : '',
      my_sentence : 0,
      opponent_sentence : 0,
      my_choice : 'unknown', // confession, silence
      opponent_choice : 'unknown',
      my_emoji : 0,
      opponent_emoji : 0, // 0~9
    }
  }
  getData = ()=>{
    fetch(`/room/id/${this.props.match.params.roomID}`)
    .then(res=>res.json())
    .then(data=>{
      var opponent_name;
      if(data.userList[0].userID===this.props.user_info.nickname){
        opponent_name = data.userList[1].userID;
      } else {
        opponent_name = data.userList[0].userID;
      }
      this.setState({
        roomID : data.roomID,
        user_list : data.userList,
        room_owner : data.roomOwner,
        game_name : data.gameName,
        opponent_name : opponent_name,
      });
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
      this.setState({
        step : 1,
        timer : true,
      })
    });
    // time end
    socket.on('time end', (data)=>{
      console.log('time end');
      this.setState({
        step : 2,
        timer : false,
      });
      // send choice info to server
      socket.emit('choice', {
        roomID : this.state.roomID,
        userID : this.props.user_info.nickname,
        choice : (this.state.my_choice === 'unknown') ? 'silence' : this.state.my_choice,
      });
    });
    // result announce
    socket.on('result announce', (data)=>{
      console.log('result announce');
      // sentence decision
      var _my_sentence, _opponent_sentence;
      var my_choice = this.state.my_choice === 'confession';
      var opponent_choice = this.state.opponent_choice === 'confession';
      if(my_choice && opponent_choice) {
        _my_sentence = 3;
        _opponent_sentence = 3;
      } else if (my_choice && !opponent_choice){
        _my_sentence = 0;
        _opponent_sentence = 4;
      } else if (!my_choice && opponent_choice){
        _my_sentence = 4;
        _opponent_sentence = 0;
      } else {
        _my_sentence = 1;
        _opponent_sentence = 1;
      }
      // state update
      this.setState({
        step : 3,
        my_sentence : this.state.my_sentence+_my_sentence,
        opponent_sentence : this.state.opponent_sentence+_opponent_sentence,
      });
    });
    // end round
    socket.on('round end', (data)=>{
      console.log('round end');
      // start new round
      this.setState({
        step : 0,
        round : this.state.round+1,
        my_choice : 'unknown',
        opponent_choice : 'unknown',
      });
      if(this.state.round!==6 && this.state.room_owner===this.props.user_info.nickname){
        socket.emit('game start', {roomID : this.state.roomID, gameName : this.state.game_name});
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
    // get other user's choice
    socket.on('choice', (data)=>{
      if(data.userID!==this.props.user_info.nickname) this.setState({opponent_choice : data.choice});
      console.log(data.choice);
    });
    // get emoji change
    socket.on('emoji change', (data)=>{
      if(data.userID!==this.props.user_info.nickname) this.setState({opponent_emoji : data.emoji});
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
  // choice
  onClick2 = value=>{
    if(this.state.step===1){
      this.setState({
        choice : value,
      });
    }
  }
  onClick3 = e=>{
    socket.emit('exit room', {roomID : this.props.match.params.roomID, userID : this.props.user_info.nickname});
    this.props.gameEnd();
    this.props.history.push('/');
  }
  onClick4 = (choice)=>{
    if(this.state.step===1){
      this.setState({
        my_choice : choice,
      });
    }
  }
  onClick5 = emoji =>{
    this.setState({
      my_emoji : emoji
    });
    socket.emit('emoji change', {
      roomID : this.state.roomID,
      userID : this.props.user_info.nickname,
      emoji : emoji,
    });
  }
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
    var my_choice, opponent_choice;
    switch(this.state.my_choice){
      case 'unknown':
        my_choice = '🤔';
        break;
      case 'confession':
        my_choice = '🙏';
        break;
      case 'silence':
        my_choice = '💬';
        break;
    }
    switch(this.state.opponent_choice){
      case 'unknown':
        opponent_choice = '🤔';
        break;
      case 'confession':
        opponent_choice = '🙏';
        break;
      case 'silence':
        opponent_choice = '💬';
        break;
    }
    var my_emoji = this.emoji_select(this.state.my_emoji);
    var opponent_emoji = this.emoji_select(this.state.opponent_emoji);

    return(
      <div className='prisoner'>
        <div className="row1">

          <Timer gameEnd={()=>{}} time={10000} start={this.state.timer} width={1200} height={20} color={"#56AEFF"}/>

          <div className="round_info">
            <span>Round {this.state.round}</span>
          </div>

          <div className="contents">

            <div className="prison">
              <div>
                <div className="sentence">
                  🕓 : {this.state.my_sentence}년
                </div>
                <div className="emoji">
                  {my_emoji}
                </div>
                <div className="decision">
                  {my_choice}
                </div>
                <label>{this.props.user_info.nickname}</label>
              </div>

              <div>
                <div className="sentence">
                  🕓 : {this.state.opponent_sentence}년
                </div>
                <div className="emoji">
                  {opponent_emoji}
                </div>
                <div className="decision">
                  {opponent_choice}
                </div>
                <label>{this.state.opponent_name}</label>
              </div>
            </div>

            <div className="choice">
              <div>
                <button onClick={()=>{this.onClick4('confession')}}>🙏</button>
                <label>자백</label>
              </div>

              <div>
                <button onClick={()=>{this.onClick4('silence')}}>💬</button>
                <label>침묵</label>
              </div>
            </div>

            <div className="emoji_select">
              <button onClick={()=>{this.onClick5(0)}}>😄</button>
              <button onClick={()=>{this.onClick5(1)}}>😅</button>
              <button onClick={()=>{this.onClick5(2)}}>😂</button>
              <button onClick={()=>{this.onClick5(3)}}>😜</button>
              <button onClick={()=>{this.onClick5(4)}}>😒</button>
              <button onClick={()=>{this.onClick5(5)}}>😓</button>
              <button onClick={()=>{this.onClick5(6)}}>😠</button>
              <button onClick={()=>{this.onClick5(7)}}>😤</button>
              <button onClick={()=>{this.onClick5(8)}}>😭</button>
              <button onClick={()=>{this.onClick5(9)}}>😱</button>
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

export default connect(mapStateToProps, mapDispatchToProps)(Prisoner);
