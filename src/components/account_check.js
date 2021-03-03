import React, {Component} from 'react';
import { Route, Link } from 'react-router-dom';
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';
import {connect} from 'react-redux';
import * as actions from '../actions';
import './css/account_check.css';
import Login from './login';

class Account_check extends Component{
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };
  constructor(props){
    super(props);
    const { cookies } = props;
    this.state = {
    }
  }
  onChange = e=>{
    this.setState({
      [e.target.name] : e.target.value
    });
  }
  onClick1 = ()=>{
    const guestNick = document.getElementById('guestNick').value;
    if(!guestNick) {
      alert('닉네임을 입력해주세요');
      return;
    }
    var {cookies} = this.props;
    if(!cookies) cookies = new Cookies();
    cookies.set('guest nickname', guestNick, {path:'/'});
    this.props.handleSuccess({nickname : guestNick});
  }
  render(){
    const mobile = window.innerWidth<768;
    // pc version
    if(!mobile) return(
      <div className='account_check'>
        <div className="logo">
          <span>
                GAME<br/>
                THEORY<br/>
                LABORATORY<br/>
          </span>
          <span>_게임이론 실험 플랫폼</span>
        </div>

        <label>회원이신가요?</label>
        <Login history={this.props.history}/>

        <label>나중에 할게요</label>
        <input id="guestNick" name="guestNick" type="text" placeholder="Nickname" defaultValue={this.props.user_info.nickname}/>
        <button onClick={this.onClick1}>Guest로 계속</button>

      </div>
    );
    // mobile version
    else return(
      <div className='account_check'>
        <div className="logo">
          <span>
                GAME<br/>
                THEORY<br/>
                LABORATORY<br/>
          </span>
          <span>_게임이론 실험 플랫폼</span>
        </div>

        <label>회원이신가요?</label>
        <Login toPrev={true}/>

        <label>나중에 할게요</label>
        <input id="guestNick" name="guestNick" type="text" placeholder="Nickname" defaultValue={this.props.user_info.nickname}/>
        <button onClick={this.onClick1}>Guest로 계속</button>
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
    setGuestMode : (info)=>{dispatch(actions.guest_mode(info))},
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withCookies(Account_check));
