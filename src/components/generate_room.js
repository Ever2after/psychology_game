import React, {Component} from 'react';
import { Route, Link } from 'react-router-dom';
import {connect} from 'react-redux';
import './css/generate_room.css';
import socket from '../socket.js';
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
      maxNumber : (this.state.name==='죄수의 딜레마' ? 2 : this.state.max_number),
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
    const mobile = window.innerWidth<768;
    if(!mobile) return(
      <div className='generate_room'>
        <div className="game_select">
          <button className={this.state.name==="죄수의 딜레마" ? "select" : ""}
            name="죄수의 딜레마" onClick={this.onClick4}>죄수의 딜레마</button>
          <button className={this.state.name==="외로운 영웅" ? "select" : ""}
            name="외로운 영웅" onClick={this.onClick4}>외로운 영웅</button>
          <button className={this.state.name==="보물선" ? "select" : ""}
            name="보물선" onClick={this.onClick4}>보물선</button>
          <button className={this.state.name==="전쟁과 평화" ? "select" : ""}
            name="전쟁과 평화" onClick={this.onClick4}>전쟁과 평화</button>
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
    )
    else return(
      <div className='generate_room'>
        <label>방 만들기</label>
        <span>원하는 방을 만드세요.</span>
        <select name="name" onChange={this.onChange}>
          <option value="죄수의 딜레마">죄수의 딜레마</option>
          <option value="외로운 영웅">외로운 영웅</option>
          <option value="보물선">보물선</option>
          <option value="전쟁과 평화">전쟁과 평화</option>
          <option value="거꾸로 경매">거꾸로 경매</option>
        </select>
        <div className="wrap1">
          <button className="circle" onClick={this.onClick3}>-</button>
          <button>{this.state.name==='죄수의 딜레마' ? "2인" : this.state.max_number+'인'}</button>
          <button className="circle" onClick={this.onClick2}>+</button>
        </div>
        <div className="wrap2">
          <button className={this.state.isPublic ? "select" : ""} onClick={()=>this.onClick5(true)}>공개</button>
          <button className={this.state.isPublic ? "" : "select"} onClick={()=>this.onClick5(false)}>비공개</button>
        </div>
        <button onClick={this.onClick1}>방 생성</button>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    is_logined : state.login.is_logined,
    user_info : state.login.user_info,
  };
}

export default connect(mapStateToProps)(Generate_room);
