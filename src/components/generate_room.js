import React, {Component} from 'react';
import { Route, Link } from 'react-router-dom';
import {connect} from 'react-redux';
import './css/generate_room.css';
import socketIOClient from 'socket.io-client';
var socket = socketIOClient();
const crypto = require("crypto");

class Generate_room extends Component{
  constructor(props){
    super(props);
    this.state = {
      isPublic : true,
      name : "죄수의 딜레마",
      max_number : 3,
    }
  }
  onChange = e=>{
    this.setState({
      [e.target.name] : e.target.value,
    });
  }
  onClick1 = ()=>{
    socket.emit('generate room', null);
    var roomID = crypto.randomBytes(10).toString('hex');
    const room = {
      roomID : roomID,
      isPublic : this.state.isPublic,
      gameName : this.state.name,
      maxNumber : this.state.max_number,
      roomOwner : this.props.user_info.name,
      userList : [{userID : this.props.user_info.name}],
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
    this.props.history1.push(`/game_ready/${roomID}`);
  }
  // 1 증가
  onClick2 = ()=>{
    if(this.state.name!=='죄수의 딜레마' && this.state.max_number!==20){
      this.setState({
        max_number : this.state.max_number+1,
      });
    }
  }
  // 1 감소
  onClick3 = ()=>{
    if(this.state.name!=='죄수의 딜레마' && this.state.max_number!==3){
      this.setState({
        max_number : this.state.max_number-1,
      })
    }
  }
  onClick4 = e=>{
    this.setState({
      name : e.target.name,
    });
  }
  onClick5 = value =>{
    this.setState({
      isPublic : value,
    });
  }
  render(){
    return(
      <div className='generate_room'>
        <div className="game_select">
          <button className={this.state.name==="죄수의 딜레마" ? "select" : ""}
            name="죄수의 딜레마" onClick={this.onClick4}>죄수의 딜레마</button>
          <button className={this.state.name==="외로운 영웅" ? "select" : ""}
            name="외로운 영웅" onClick={this.onClick4}>외로운 영웅</button>
          <button className={this.state.name==="보물선" ? "select" : ""}
            name="보물선" onClick={this.onClick4}>보물선</button>
          <button className={this.state.name==="거꾸로 경매" ? "select" : ""}
            name="거꾸로 경매" onClick={this.onClick4}>거꾸로 경매</button>
        </div>
        <div className="max_select">
          <button className="circle" onClick={this.onClick3}>-</button>
          <button>{this.state.name==='죄수의 딜레마' ? "2인" : this.state.max_number+'인'}</button>
          <button className="circle" onClick={this.onClick2}>+</button>
          <button className={this.state.isPublic ? "select" : ""} onClick={()=>this.onClick5(true)}>공개</button>
          <button className={this.state.isPublic ? "" : "select"} onClick={()=>this.onClick5(false)}>비공개</button>
          <button onClick={this.onClick1}>방 생성</button>
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

export default connect(mapStateToProps)(Generate_room);
