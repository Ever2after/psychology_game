import React, {Component} from 'react';
import { Route, Link } from 'react-router-dom';
import {connect} from 'react-redux';
import './css/header.css';

class Header extends Component{
  constructor(props){
    super(props);
    this.state = {
    }
  }
  render(){
    return(
      <div className='header'>
        <Link to="/">심리게임 실험 플랫폼</Link>
        <div>
          <Link to="/ranking">랭킹</Link>
          {this.props.is_logined ?
            <span>{this.props.user_info.name}님 어서오세요</span>
            : <Link to="/login">Login</Link>}
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

export default connect(mapStateToProps)(Header);
