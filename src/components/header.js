import React, {Component} from 'react';
import { Route, Link } from 'react-router-dom';
import {connect} from 'react-redux';
import * as actions from '../actions';
import './css/header.css';

class Header extends Component{
  constructor(props){
    super(props);
    this.state = {
    }
  }
  componentDidMount = ()=>{
    if(!this.props.is_logined && document.cookie){
      fetch('/auth/jwt',{
        credentials : 'include',
        headers : {
          Authorization : document.cookie.split('; ')
          .find(row => row.startsWith('token'))
          .split('=')[1]
        }
      })
      .then(res=>res.json())
      .then(data=>{
        if(data.is_logined) this.props.handleSuccess(data.user);
      });
    }
  }
  onClick = ()=>{
    document.cookie = "token=";
    fetch('/auth/logout',{
      credentials : 'include'
    })
    .then(res=>res.json())
    .then(data=>{
      console.log(data);
      window.location.reload();
    });
  }
  render(){
    return(
      <div className='header'>
        <Link to="/">심리게임 실험 플랫폼</Link>
        <div>
          <Link to="/ranking"><i class="fas fa-trophy"></i> 랭킹</Link>
          {this.props.is_logined ?
            <>
              <button onClick={this.onClick}><i class="fas fa-sign-out-alt"></i> Logout</button>
            </>
            :
            <Link to="/login"><i class="fas fa-sign-in-alt"></i> Login</Link>}
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

const mapDispatchToProps = (dispatch) => {
  //return bindActionCreators(actions, dispatch);
  return{
    handleSuccess : (info)=>{dispatch(actions.login_success(info))},
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Header);
