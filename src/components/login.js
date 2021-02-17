import React, {Component} from 'react';
import { Route, Link } from 'react-router-dom';
import {connect} from 'react-redux';
import * as actions from '../actions';
import './css/login.css';

class Login extends Component{
  constructor(props){
    super(props);
    this.state = {
    }
  }
  onChange = e=>{
    this.setState({
      [e.target.name] : e.target.value
    })
  }
  onClick1 = ()=>{
    const post = {   //전송하려는 post obj
      email:this.state.email,
      password :this.state.password,
    }
    fetch('/auth/login',{
      method :"POST",
      headers:{
        'content-type':'application/json'
      },
      credentials: 'include',
      body:JSON.stringify(post)    // post객체를 작성한 주소로 post방식으로 보내버린다.
    })
    .then(res=>res.json())
    .then(data=>{
      if(data.is_logined){
        this.props.handleSuccess(data.user);
        this.props.history.push('/');
      }
      else{
        alert('잘못된 Email 또는 비밀번호 입니다.');
      }
    });
  }
  render(){
    return(
      <div className='login'>
        <input type="email" name="email" onChange={this.onChange} required placeholder="Email"/>
        <input type="password" name="password" onChange={this.onChange} required placeholder="Password"/>
        <button onClick={this.onClick1}>Login</button>
        <Link to="/register">Sign Up</Link>
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

export default connect(mapStateToProps, mapDispatchToProps)(Login);
