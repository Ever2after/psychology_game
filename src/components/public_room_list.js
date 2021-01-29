import React, {Component} from 'react';
import { Route, Link } from 'react-router-dom';
import './css/public_room_list.css';
import Generate_room from './generate_room';
import Public_room from './public_room';
import socketIOClient from 'socket.io-client';
var socket = socketIOClient();

class Public_room_list extends Component{
  constructor(props){
    super(props);
    this.state = {
      room_list : [],
      name : '전체',
    }
  }
  componentDidMount(){
    fetch('/public/room_list')
    .then(res=>res.json())
    .then(data=>{
        this.setState({
          room_list : data.list,
        });
        console.log(data);
    });
    // 실시간 방 정보 갱신이 필요하다면 소켓으로 update한다.
    socket.on('new room', (data)=>{
      this.setState({
        room_list : data,
      });
    });
  }
  onClick1 = ()=>{
    this.setState({
      making_mode : !this.state.making_mode,
    });
  }
  onClick2 = e => {
    this.props.history.push(`/game_ready/${e.target.name}`);
  }
  onClick4 = e =>{
    this.setState({
      name : e.target.name,
    })
  }
  render(){
    const {room_list} = this.state;
    var list = [];
    for (var i=0;i<room_list.length;i++){
      if(this.state.name==="전체" || this.state.name===room_list[i].info.name || room_list[i].user.length<room_list[i].max_number){
        list.push(<Public_room data={room_list[i]} onClick={this.onClick2}/>);
      }
    }
    return(
      <div className = 'public_room_list'>
        <div className="game_select">
          <button className={this.state.name==="전체" ? "select" : ""}
            name="전체" onClick={this.onClick4}>전체</button>
          <button className={this.state.name==="죄수의 딜레마" ? "select" : ""}
            name="죄수의 딜레마" onClick={this.onClick4}>죄수의 딜레마</button>
          <button className={this.state.name==="외로운 영웅" ? "select" : ""}
            name="외로운 영웅" onClick={this.onClick4}>외로운 영웅</button>
          <button className={this.state.name==="해적선" ? "select" : ""}
            name="해적선" onClick={this.onClick4}>해적선</button>
          <button className={this.state.name==="거꾸로 경매" ? "select" : ""}
            name="거꾸로 경매" onClick={this.onClick4}>거꾸로 경매</button>
        </div>
        <div className="room_list">
          {list}
        </div>
      </div>
    );
  }
}

/*
<div className="menu">
  <button className={this.state.making_mode ? 'cancle' : ''}
    onClick={this.onClick1}>
    {this.state.making_mode ? '취소' : '방 만들기'}
  </button>
  <Link to="/public_room_list">공개방 참여</Link>
  <button>코드로 참여</button>
  {this.state.making_mode ? <Generate_room history1={this.props.history}/> : <></>}
</div>
*/

export default Public_room_list;
