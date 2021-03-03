import React, {Component} from 'react';
import { Route, Link } from 'react-router-dom';
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';
import {connect} from 'react-redux';
import * as actions from '../actions';
import Game_container from './game_container';
import Login from './login';
import './css/account.css';

class Account extends Component{
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };
  constructor(props){
    super(props);
    const { cookies } = props;
    this.state = {

    }
  }
  onClick1 = e=>{
    e.preventDefault();
    const {cookies} = this.props;
    const nickname = document.getElementById('nickname').value;
    if(!nickname){
      alert('닉네임을 입력해주세요');
      return;
    }
    cookies.set('guest nickname', nickname, {path : '/'});
    this.props.setGuestMode({nickname : nickname});

  }
  onClick2 = ()=>{
    document.cookie = "token=";
    fetch('/auth/logout',{
      credentials : 'include'
    })
    .then(res=>res.json())
    .then(data=>{
      window.location.replace('/');
    });
  }
  render(){
    const mobile = window.innerWidth<768;
    // pc version
    if(!mobile) return(
      <div className="account">
      </div>
    );
    // mobile version
    else return(
      <div className='account'>
        <label>계정</label>
        <span>닉네임, 로그인 정보를 확인하세요.</span>
        {
            this.props.is_guest ?
            <div>
              <label>닉네임 변경</label>
              <input id="nickname" type="text" defaultValue={this.props.user_info.nickname}/>
              <button onClick={this.onClick1}>변경</button>
              <p>
                현재 <span className="hl">{this.props.user_info.nickname}</span>님은 '게스트'상태입니다.
                게임 결과 통계 및 랭킹 등 더 많은 정보를 확인하고 싶으시다면 로그인해주세요.
              </p>
              <Login history={this.props.history} toPrev={true}/>
            </div>
            :
            <div>
              <p>
                현재 <span className="hl">{this.props.user_info.nickname}</span>으로 로그인된 상태입니다.
              </p>
              <label>닉네임 변경</label>
              <input id="nickname" type="text" defaultValue={this.props.user_info.nickname}/>
              <button>변경</button>
              <label>Email : {this.props.user_info.email}</label>
              <label>총 point : {this.props.user_info.point}</label>
              <label>Game 수 : {this.props.user_info.game}</label>
              <button onClick={this.onClick2}>로그아웃</button>
            </div>
        }
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    is_guest : state.login.is_guest,
    is_logined : state.login.is_logined,
    user_info : state.login.user_info,
  };
}

const mapDispatchToProps = (dispatch) => {
  //return bindActionCreators(actions, dispatch);
  return{
    handleSuccess : (info)=>{dispatch(actions.login_success(info))},
    setGuestMode : (info)=>{dispatch(actions.guest_mode(info))},
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withCookies(Account));
