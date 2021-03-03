import React, {Component} from 'react';
import { Route, Link } from 'react-router-dom';
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';
import {connect} from 'react-redux';
import * as actions from '../actions';
import Game_container from './game_container';
import './css/private_room.css';

class Private_room extends Component{
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
      [e.target.name] : e.target.value,
    });
  }
  onSubmit = e=>{
    e.preventDefault();
    fetch(`/room/id/${this.state.code}`)
    .then(res=>res.json())
    .then(data=>{
      if(data.error) alert('코드에 해당하는 방이 존재하지 않습니다');
      else {
        if(data.maxNumber<=data.userNumber) alert('정원이 모두 찬 방입니다');
        else this.props.history.replace(`/game_ready/${data.roomID}`);
      }
    });
  }
  render(){
    const mobile = window.innerWidth<768;
    // pc version
    if(!mobile) return(
      <div className="private_room">
      </div>
    );
    // mobile version
    else return(
      <div className='private_room'>
        <form onSubmit={this.onSubmit}>
          <label>비공개방 참여</label>
          <span>방 참가 코드를 입력하세요.</span>
          <input type="text" name="code" required placeholder="Enter private room code"/>
          <button type="submit">참여</button>
        </form>
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

export default connect(mapStateToProps, mapDispatchToProps)(withCookies(Private_room));
