import React, {Component} from 'react';
import { Route, Link } from 'react-router-dom';
import {connect} from 'react-redux';
import * as actions from '../../actions';
import Timer from '../common/timer';
import '../css/treasure_ship.css';
import Game_result from '../game_result';
import socket from '../../socket.js';
import src1 from './assets/ship1.png';
import src2 from './assets/ship2.png';

const moment = require('moment-timezone');

class Treasure_ship extends Component{
  constructor(props){
    super(props);
    this.state = {
      roomID : '',
      chat_list : [],
      step : 0,  // 0 ~ 3
      round : 1, // 1 ~ 5
      timer : false,
      user_list : [],
      on_board_user : [],
      left_user : [],
      choice : '',  // on_board / left
      gold : [1000, 2000, 3000, 4000, 5000],
      user_gold : new Map(),  // {{user1=>gold1}, {user2=>gold2}, ...}
      on_board_gold : 0,
      left_gold : 0,
      ranking : 1, // 1 ~ user.length
      result_mode : false,
      result : new Map(),
    }
  }
  getData = ()=>{
    fetch(`/room/id/${this.props.match.params.roomID}`)
    .then(res=>res.json())
    .then(data=>{
      //  initialize user gold by 0
      var userGold = new Map();
      for(var i=0;i<data.userList.length;i++){
          userGold.set(data.userList[i].userID, 0);
      }
      //userGold = Array.from(userGold);
      this.setState({
        roomID : data.roomID,
        user_list : data.userList,
        room_owner : data.roomOwner,
        game_name : data.gameName,
        user_gold : userGold,
      });
    });
  }
  gameEnd = ()=>{
    var result = new Map();
    for(let [key, value] of this.state.user_gold){
      result.set(key, Math.floor(value/10));
    }
    this.setState({
      result : result,
      result_mode : true,
    });
    socket.emit('exit room', {roomID : this.state.roomID, userID : this.props.user_info.nickname});
    socket.emit('game result', {
      userID : this.props.user_info.nickname,
      point : result.get(this.props.user_info.nickname),
      exp : 1500,
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
      });
    });
    // time end
    socket.on('time end', (data)=>{
      console.log('time end');
      this.setState({
        step : 2,
        timer : false,
      });
      // send choie info to server
      socket.emit('choice', {
        roomID : this.state.roomID,
        userID : this.props.user_info.nickname,
        choice : (this.state.choice ? this.state.choice : 'left')
      });
    });
    // result announce
    socket.on('result announce', (data)=>{
      console.log('result announce');
      // winner decision
      var _winner = this.whoIsWinner(this.state.on_board_user.length, this.state.left_user.length);
      // point reward decision
      var user_gold = this.state.user_gold;
      var _gold1, _gold2;
      if(_winner==='on_board') {
        _gold1 = this.state.gold[this.state.round-1]/(this.state.on_board_user.length);
        _gold2 = 0;
      } else {
        _gold1 = this.state.gold[this.state.round-1]*(-0.05);
        _gold2 = this.state.gold[this.state.round-1]*0.5/(this.state.left_user.length);
      }
      // give reward
      for(var i=0;i<this.state.on_board_user.length;i++){
        var _gold = user_gold.get(this.state.on_board_user[i]);
        _gold += _gold1;
        user_gold.set(this.state.on_board_user[i], _gold);
      }
      for(var i=0;i<this.state.left_user.length;i++){
        var _gold = user_gold.get(this.state.left_user[i]);
        _gold += _gold2;
        user_gold.set(this.state.left_user[i], _gold);
      }
      user_gold = new Map([...user_gold.entries()].sort((a,b)=>b[1]-a[1]));
      var cnt = 1;
      user_gold.forEach((value, key)=>{
        if(key===this.props.user_info.nickname) {
          this.setState({ranking : cnt});
        }
        cnt++;
      });
      // change state
      this.setState({
        on_board_gold : _gold1,
        left_gold : _gold2,
        user_gold : user_gold,
        step : 3,
        winner : _winner,
      });

    });
    // end round
    socket.on('round end', (data)=>{
      console.log('round end');
      this.setState({
        step : 0,
        round : this.state.round+1,
        on_board_user : [],
        left_user : [],
        choice : '',
        winner : '',
      });
      // start new round
      if(this.state.round!==6 &&
        this.props.user_info.nickname===this.state.room_owner){
        socket.emit('game start', {roomID : this.state.roomID, gameName : this.state.game_name});
      }
      else if(this.state.round===6) this.gameEnd();
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
      if(data.choice==='on_board'){
        var on_board = this.state.on_board_user;
        on_board.push(data.userID);
        this.setState({
          on_board_user : on_board,
        });
      }
      else {
        var left = this.state.left_user;
        left.push(data.userID);
        this.setState({
          left_user : left,
        });
      }
    })
  }
  // n : on_board, m : left,
  whoIsWinner = (n, m)=>{
    switch(n+m){
      case 3:
        if(n<=1) return 'on_board';
        else return 'left';
        break;
      case 4:
        if(n<=2) return 'on_board';
        else return 'left';
        break;
      case 5:
        if(n<=2) return 'on_board';
        else return 'left';
        break;
      case 6:
        if(n<=3) return 'on_board';
        else return 'left';
        break;
      case 7:
        if(n<=3) return 'on_board';
        else return 'left';
        break;
      case 8:
        if(n<=3) return 'on_board';
        else return 'left';
        break;
      default:
        return 'on_board';
        break;
    }
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
  render(){
    const {chat_list, on_board_user, left_user, winner, user_gold} = this.state;
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
    // on_board list
    var on_board = [];
    for(var i=0;i<on_board_user.length;i++){
      on_board.push(<span>{on_board_user[i]}</span>);
    }
    // left list
    var left = [];
    for(var i=0;i<left_user.length;i++){
      left.push(<span>{left_user[i]}</span>);
    }
    // user gold leader board
    var leader_board = [];
    var cnt = 1;
    user_gold.forEach((value, key)=>{
      leader_board.push(<span>{cnt}. {key} - {value}G</span>);
      cnt++;
    });
    if(!this.state.result_mode) return(
      <div className='treasure_ship'>
        <div className="row1">

          <Timer gameEnd={()=>{}} time={20000} start={this.state.timer} width={1200} height={20} color={"#56AEFF"}/>

          <div className="round_info">
            <span>#{this.state.ranking}</span>
            <span>{this.state.user_gold.get(this.props.user_info.nickname)}G</span>
            <span>ROUND {this.state.round}</span>
          </div>

          <div className="contents">

            <div className="ship">
              <img src={src1}/>
              <div>{this.state.gold[this.state.round-1]}G</div>
              <button className={this.state.choice==='on_board' ? 'select' : ''} onClick={()=>{this.onClick2('on_board');}}>탑승</button>
              <button className={this.state.choice==='left' ? 'select' : ''} onClick={()=>{this.onClick2('left');}}>잔류</button>
            </div>

            <div className="result">
              <div className={(winner ? (winner==='on_board' ? 'winner' : '') : '')}>
                <label>탑승</label>
                <br/>
                {on_board}
              </div>
              <div className={(winner ? (winner==='left' ? 'winner' : '') : '')}>
                <label>잔류</label>
                <br/>
                {left}
              </div>
            </div>

          </div>

          <div className="leader_board">
            {leader_board}
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
      <Game_result data = {this.state.result}/>
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

export default connect(mapStateToProps, mapDispatchToProps)(Treasure_ship);
