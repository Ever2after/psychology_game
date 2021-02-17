import React, {Component} from 'react';
import { Route, Link } from 'react-router-dom';
import {connect} from 'react-redux';
import * as actions from '../actions';
import './css/ranking.css';

class Ranking extends Component{
  constructor(props){
    super(props);
    this.state = {
      type : 'point',
      users : [{}, {}, {}],
    }
  }
  componentDidMount = ()=>{
    fetch('/user/point')
    .then(res=>res.json())
    .then(data=>{
      this.setState({
        users : data,
      });
    });
  }
  onClick = type =>{
    this.setState({
      type : type,
    });
    if(type==='point'){
      fetch('/user/point')
      .then(res=>res.json())
      .then(data=>{
        this.setState({
          users : data,
        });
      });
    } else {
      fetch('/user/exp')
      .then(res=>res.json())
      .then(data=>{
        this.setState({
          users : data,
        });
      });
    }
  }
  render(){
    const {users} = this.state;
    var table = [];
    if(users){
      var cnt = 0;
      for(var user of users){
        cnt++;
        if(cnt>3){
          table.push(
            <tr className={cnt%2===0 ? "even" : "odd"}>
              <th className="table-rank">{cnt}</th>
              <td className="table-nickname">{user.nickname}</td>
              <td className="table-point">{user.point}</td>
              <td className="table-level">{calLevel(user.exp)}</td>
              <td className="table-game">{user.game}</td>
              <td className="table-ppg">{user.game===0 ? (0).toFixed(3) : (user.point/user.game).toFixed(3)}</td>
            </tr>
          );
        }
      }
    }
    return(
      <div className='ranking'>
        <div className="rank">
          <button onClick={()=>{this.onClick('point')}}
          className={this.state.type==='point' ? 'select' : ''}>포인트</button>
          <button onClick={()=>{this.onClick('level')}}
          className={this.state.type==='level' ? 'select' : ''}>레벨</button>
        </div>
        <hr/>
        <div className="ranker">
          <div className="sub">

            <div className="name">
              <span>#2 </span>
              <span>{users[1].nickname}</span>
            </div>

            <div className="status">
              <div>
                총 포인트<br/>
                레벨<br/>
                게임 수<br/>
                게임 당 포인트
              </div>
              <div>
                {users[1].point}<br/>
                {calLevel(users[1].exp)}<br/>
                {users[1].game}<br/>
                {users[1].game===0 ? (0).toFixed(3) : (users[1].point/users[1].game).toFixed(3)}<br/>
              </div>
            </div>

          </div>

          <div className="main">

            <div className="name">
              <span>#1 </span>
              <span>{users[0].nickname}</span>
            </div>

            <div className="status">
              <div>
                총 포인트<br/>
                레벨<br/>
                게임 수<br/>
                게임 당 포인트
              </div>
              <div>
                {users[0].point}<br/>
                {calLevel(users[0].exp)}<br/>
                {users[0].game}<br/>
                {users[0].game===0 ? (0).toFixed(3) : (users[0].point/users[0].game).toFixed(3)}<br/>
              </div>
            </div>

          </div>

          <div className="sub">

            <div className="name">
              <span>#3 </span>
              <span>{users[2].nickname}</span>
            </div>

            <div className="status">
              <div>
                총 포인트<br/>
                레벨<br/>
                게임 수<br/>
                게임 당 포인트
              </div>
              <div>
                {users[2].point}<br/>
                {calLevel(users[2].exp)}<br/>
                {users[2].game}<br/>
                {users[2].game===0 ? (0).toFixed(3) : (users[2].point/users[2].game).toFixed(3)}<br/>
              </div>
            </div>

          </div>
        </div>
        <table>
          <tr className="table-header">
            <th className="table-rank">#</th>
            <th className="table-nickname">닉네임</th>
            <th className="table-point">총 포인트</th>
            <th className="table-level">레벨</th>
            <th className="table-game">게임 수</th>
            <th className="table-ppg">게임 당 포인트</th>
          </tr>
          {table}
        </table>
      </div>
    );
  }
}

function calLevel(exp){
  return 1 + Math.floor(exp/300);
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
    handleSuccess : (info)=>{dispatch(actions.login_success(info))},
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Ranking);
