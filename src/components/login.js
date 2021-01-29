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
    this.props.handleSuccess({name : this.state.name});
    //window.location.replace('/');
  }
  render(){
    return(
      <div className='login'>
        <input type="text" name="name" onChange={this.onChange} placeholder="ID"/>
        <button onClick={this.onClick1}>로그인</button>
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
