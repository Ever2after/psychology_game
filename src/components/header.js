import React, {Component} from 'react';
import { Route, Link } from 'react-router-dom';
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';
import {connect} from 'react-redux';
import * as actions from '../actions';
import calLevel from '../function/level';
import './css/header.css';

class Header extends Component{
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };
  constructor(props){
    super(props);
    const { cookies } = props;
    this.state = {
      //
    }
  }
  onClick = ()=>{
    document.cookie = "token=";
    fetch('/auth/logout',{
      credentials : 'include'
    })
    .then(res=>res.json())
    .then(data=>{
      window.location.reload();
    });
  }
  render(){
    const mobile = window.innerWidth<768;
    // pc version
    if(!mobile) return(
      <div className='header'>
        <Link to="/">심리게임 실험 플랫폼</Link>
        <div>
          <Link to="/ranking"><i className="fas fa-trophy"></i> 랭킹</Link>
          {this.props.is_guest ?
            <div>
              <span>{this.props.user_info.nickname} &nbsp;&nbsp;&nbsp;</span>
              <Link to="/account_check/main"><i className="fas fa-sign-in-alt"></i> Login</Link>
            </div>
            :
            (this.props.is_logined ?
              (
                <div>
                  <span>{this.props.user_info.nickname} &nbsp;&nbsp;&nbsp;</span>
                  <button onClick={this.onClick}><i className="fas fa-sign-out-alt"></i> Logout</button>
                </div>
              )
              :
              (
                <div>
                  <span>{this.props.user_info.nickname} &nbsp;&nbsp;&nbsp;</span>
                  <Link to="/login"><i className="fas fa-sign-in-alt"></i> Login</Link>
                </div>
              )
            )}
        </div>
      </div>
    );
    // mobile version
    else return(
      <div className="mobile_header">
        <Link to="/">심리게임 실험 플랫폼</Link>
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

export default connect(mapStateToProps, mapDispatchToProps)(withCookies(Header));
