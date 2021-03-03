import React, {Component} from 'react';
import { Route, Link } from 'react-router-dom';
import {connect} from 'react-redux';
import * as actions from '../actions';
import './css/game_result.css';
import socket from '../socket.js';

class Game_result extends Component{
  constructor(props){
    super(props);
    this.state = {
    }
  }
  onClick1 = ()=>{
    window.location.replace('/');
  }

  render(){
    const { data } = this.props;
    var arr = Array.from(data).sort((a, b)=>{
      return b[1]-a[1];
    });
    var result = [];
    var cnt = 0;
    for(var el of arr){
      cnt++;
      result.push(<div className={this.props.user_info.nickname===el[0] ? 'mine' : ''}>
        <span>{cnt}. {el[0]}</span>
        <span>+ {el[1]} point</span>
      </div>);
    }
    return(
      <div className='game_result'>
        <div>
          <span>게임 결과</span>
        </div>
        <div className="result">
          {result}
        </div>
        <button onClick = {this.onClick1}>확인</button>
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
    handleSuccess : (info)=>{dispatch(actions.login_success(info))},
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Game_result);
