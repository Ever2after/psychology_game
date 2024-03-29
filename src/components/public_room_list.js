import React, {Component} from 'react';
import { Route, Link } from 'react-router-dom';
import './css/public_room_list.css';
import Generate_room from './generate_room';
import Public_room from './public_room';

class Public_room_list extends Component{
  constructor(props){
    super(props);
    this.state = {
      room_list : [],
      name : '전체',
    }
  }
  componentDidMount = ()=>{
    fetch('/room')
    .then(res=>res.json())
    .then(data=>{
        this.setState({
          room_list : data,
        });
        console.log(data);
    });
  }
  onChange = e=>{
    this.setState({
      [e.target.name] : e.target.value,
    });
  }
  onClick2 = roomID => {
    this.props.history.push(`/game_ready/${roomID}`);
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
      if(this.state.name==="전체" || this.state.name===room_list[i].gameName){
        if(room_list[i].userList.length<room_list[i].maxNumber && room_list[i].userList.length>0){
          var data = room_list[i];
          list.push(<Public_room data={data} onClick={()=>{this.onClick2(data.roomID)}}/>);
        }
      }
    }
    const mobile = window.innerWidth<768;
    if(!mobile) return(
      <div className = 'public_room_list'>
        <div className="game_select">
          <button className={this.state.name==="전체" ? "select" : ""}
            name="전체" onClick={this.onClick4}>전체</button>
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
        <div className="room_list">
          {list}
        </div>
      </div>
    );
    else return(
      <div className = 'public_room_list'>
        <label>공개방 참여</label>
        <select name="name" onChange={this.onChange}>
          <option value="전체">전체</option>
          <option value="죄수의 딜레마">죄수의 딜레마</option>
          <option value="외로운 영웅">외로운 영웅</option>
          <option value="보물선">보물선</option>
          <option value="전쟁과 평화">전쟁과 평화</option>
          <option value="거꾸로 경매">거꾸로 경매</option>
        </select>
        <div className="room_list">
          {list}
        </div>
      </div>
    );
  }
}

export default Public_room_list;
