import React, {Component} from 'react';
import { Route, Link } from 'react-router-dom';
import {connect} from 'react-redux';
import * as actions from '../../actions';
import Timer from '../common/timer';
import socket from '../../socket.js';
import '../css/reverse_auction.css';
import Player from './player';
import Item from './item';
import Price_timer from './price_timer';
import Game_result from '../game_result';
const moment = require('moment-timezone');

class Reverse_auction extends Component{
  constructor(props){
    super(props);
    this.timer = 0;
    this.state = {
      roomID : '',
      chat_list : [],
      step : 0,  // 0 ~ 3
      round : 1, // 1 ~ 20,
      timer : false,
      time : 10000,
      user_list : [],
      count : 0,
      display_price : 0,
      result_mode : false,
      result : new Map(),
    }
  }
  getData = ()=>{
    fetch(`/room/id/${this.props.match.params.roomID}`)
    .then(res=>res.json())
    .then(data=>{
      // initialize user_map
      var user_map = new Map();
      for(var user of data.userList){
        user_map.set(user.userID, {
          active : true,
          cash : 10000000, // 잔고
          value : 0, // 평가액
          items : [],
        });
      }
      for(var i = 0;i<8-data.userList.length;i++){
        user_map.set(`dummy${i}`, {
          active : false,
        });
      }
      // set state
      this.setState({
        roomID : data.roomID,
        user_list : data.userList,
        room_owner : data.roomOwner,
        game_name : data.gameName,
        user_map : user_map,
      });
      // get items info
      if(this.props.user_info.nickname===data.roomOwner){
        socket.emit('get items', {
          roomID : data.roomID
        });
      }
    });
  }
  gameEnd = ()=>{
    var result = new Map();
    for(let [key, value] of this.state.user_map){
      if(value.active) result.set(key, value.value/100);
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
  timerEnd = ()=>{
    clearInterval(this.timer);
    this.setState({
      step : 3,
      count : 0,
      timer : false,
    });
    if(this.state.room_owner === this.props.user_info.nickname){
      socket.emit('auction skip', {
        roomID : this.state.roomID,
      });
    }
  }
  componentDidMount = ()=>{
    // get room information
    setTimeout(this.getData, 500);
    //--------------GAME SIGNAL LISTEN-------------------------------------------//
    //---------------- game step process---------------------//
    // round start
    socket.on('round start', (data)=>{
      console.log('round start');
      // update display price first
      this.setState({
        display_price : this.state.items[this.state.round-1].value*2,
      });
      // then update step
      setTimeout(()=>{
        this.setState({
          step : 1,
          // set random item
          item : this.state.items[this.state.round-1]
        });
      }, 200);
    });
    // auction start
    socket.on('auction start', (data)=>{
      console.log('auction start');
      this.setState({
        step : 2,
        timer : true,
      });
      this.timer = setInterval(()=>{
        this.setState({count : this.state.count+1});
      }, 10);
    });
    // auction end
    socket.on('auction end', (data)=>{
      if(this.state.step===2){
        console.log('auction end');
        // clear timer
        clearInterval(this.timer);
        // update user_map
        var user_map = this.state.user_map;
        var info = user_map.get(data.userID);
        info.items.push(this.state.item);
        info.cash -= data.price;
        info.value += this.state.item.value;
        user_map.set(data.userID, info);
        this.setState({
          user_map : user_map,
          step : 3,
          timer : false,
          display_price : data.price,
          count : 0,
        });
        //
        if(this.state.room_owner === this.props.user_info.nickname){
          socket.emit('auction skip', {roomID : this.state.roomID});
        }
      }
    });
    // round end
    socket.on('round end', (data)=>{
      console.log('round end');
      this.setState({
        step : 0,
        round : this.state.round+1,
        item : {},
        display_price : 0,
      });
      if(this.state.round!==21 && this.state.room_owner===this.props.user_info.nickname){
        socket.emit('game start', {
          roomID : this.state.roomID,
          gameName : this.state.game_name,
        });
      } else if (this.state.round===21){
        // if game ends
        this.gameEnd();
      }
    });
    //-------------game step process done----------------//
    //-------------game behavior-------------------------//
    socket.on('get items', (data)=>{
      this.setState({
        items : data.items,
      });
    });
  }
  onChange = e=>{
    this.setState({
      [e.target.name] : e.target.value,
    });
  }
  onClick2 = e=>{
    if(this.state.step===2){
      // check whether i can buy this item
      var ratio = this.state.count*10/this.state.time;
      var price = this.state.item.value*2*(1-ratio);
      var cash = this.state.user_map.get(this.props.user_info.nickname).cash;
      if(price <= cash){
        socket.emit('auction end', {
          roomID : this.state.roomID,
          userID : this.props.user_info.nickname,
          price : price,
        });
        this.setState({
          timer : false,
          display_price : price,
        });
      }
    }
  }
  onClick3 = e=>{
    socket.emit('exit room', {roomID : this.props.match.params.roomID, userID : this.props.user_info.nickname});
    this.props.gameEnd();
    this.props.history.push('/');
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
    // player data
    var players = [];
    if(this.state.user_map) players = Array.from(this.state.user_map);
    else {
      for(var i=0;i<8;i++){
        players.push([`empty${i}`, {active : false}]);
      }
    }
    if(!this.state.result_mode) return(
      <div className='reverse_auction'>

        <div className="row1">
          <Player data={players[0]}/>
          <Player data={players[2]}/>
          <Player data={players[4]}/>
          <Player data={players[6]}/>
        </div>

        <div className="row2">
          <div>{this.state.step!==0 ?
            <><Item data={this.state.item}/> {this.state.item.name}</>
            : '?'}
          </div>
          <Price_timer gameEnd={this.timerEnd}
            start={this.state.timer}
            color="#56aeff"
            time={this.state.time}
            price={this.state.display_price}
            step={this.state.step}
          />
          <button onClick={this.onClick2}>구매하기</button>
        </div>

        <div className="row3">
          <Player data={players[1]}/>
          <Player data={players[3]}/>
          <Player data={players[5]}/>
          <Player data={players[7]}/>
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

export default connect(mapStateToProps, mapDispatchToProps)(Reverse_auction);
