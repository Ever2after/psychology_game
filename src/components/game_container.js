import React, {Component} from 'react';
import { Route, Link } from 'react-router-dom';
import './css/game_container.css';
import {connect} from 'react-redux';
import * as actions from '../actions';
import socket from '../socket.js';
const crypto = require("crypto");

class Game_container extends Component{
  constructor(props){
    super(props);
    this.state = {
    }
  }
  onClick = e=>{
    // if it is solo player game
    if(!this.props.multiple){
      this.props.gameStart(this.props.name);
      this.props.history.push(this.props.link+'/solo');
    }
    // else if it is multiplayer game
    else {
      fetch(`/room/max/${this.props.name}`)
      .then(res=>res.json())
      .then(data=>{
        // if room doesn't exist, generate new room
        if(!data){
          socket.emit('generate room', null);
          var roomID = crypto.randomBytes(10).toString('hex');
          const room = {
            roomID : roomID,
            isPublic : true,
            gameName : this.props.name,
            maxNumber : 5,   // default : 5
            roomOwner : this.props.user_info.nickname,
            userList : [{userID : this.props.user_info.nickname}],
          }
          fetch('/room', {
              method :"POST",
              headers:{
                'content-type':'application/json'
              },
              body:JSON.stringify(room)    // post객체를 작성한 주소로 post방식으로 보내버린다.
            })
            .then(res=>res.json())
            .then(data=>{
              console.log(data);
            });
          this.props.history.push(`/game_ready/${roomID}`);
        }
        // if room exist
        else{
          this.props.history.push(`/game_ready/${data.roomID}`);
        }
      });
    }
  }
  render(){
    return(
      <div className={'game_container'+(this.props.center ? ' center' : '')}>
        <img src="./assets/2.jpg"/>
        <div className="status">{this.props.name}</div>
        <div>
          <button onClick={this.onClick}>빠른 시작</button>
          <button>게임 방법</button>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    user_info : state.login.user_info,
  };
}

const mapDispatchToProps = (dispatch) => {
  //return bindActionCreators(actions, dispatch);
  return{
    gameStart : (name)=>{dispatch(actions.game_started(name, null, null))},
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Game_container);
