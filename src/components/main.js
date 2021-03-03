import React, {Component} from 'react';
import { Route, Link } from 'react-router-dom';
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';
import {connect} from 'react-redux';
import * as actions from '../actions';
import './css/main.css';
import Generate_room from './generate_room';
import Game_container from './game_container';
import Login from './login';

class Main extends Component{
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };
  constructor(props){
    super(props);
    const { cookies } = props;
    this.state = {
      making_mode : false,
      private_mode : false,
    }
  }
  onChange = e=>{
    this.setState({
      [e.target.name] : e.target.value
    });
  }
  onClick1 = ()=>{
    this.setState({
      making_mode : !this.state.making_mode,
      private_mode : false,
    });
  }
  onClick2 = ()=>{
    this.setState({
      making_mode : false,
      private_mode : !this.state.private_mode,
    });
  }
  onClick3 = ()=>{
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
      <div className='main'>
        <div className="menu">
          <button className={this.state.making_mode ? 'cancle' : ''}
            onClick={this.onClick1}>
            {this.state.making_mode ? '취소' : '방 만들기'}
          </button>

          <Link to="/public_room_list">공개방 참여</Link>

          <button className={this.state.private_mode ? 'cancle' : ''}
            onClick={this.onClick2}>
            코드로 참여
          </button>

          {this.state.making_mode ? <Generate_room history={this.props.history}/> : <></>}

          {this.state.private_mode ?
            <div className="code_input">
              <input name="code" onChange={this.onChange} type="text" placeholder="private room code"></input>
              <button onClick={this.onClick3}>참여</button>
            </div>
          : <></>}
        </div>
        <div className="games">
          <Game_container history={this.props.history} link={"/moving_dots"} multiple={false} name={"무리짓기"}/>
          <Game_container history={this.props.history} link={"/prisoner's_dilemma"} multiple={true} name={"죄수의 딜레마"}/>
          <Game_container history={this.props.history} link={"/war_and_peace"} multiple={true} name={"전쟁과 평화"}/>
          <Game_container history={this.props.history} link={"/hero"} multiple={true} name={"외로운 영웅"}/>
          <Game_container history={this.props.history} link={"/treasure_ship"} multiple={true} name={"보물선"}/>
          <Game_container history={this.props.history} link={"/moving_dots"} multiple={true} name={"거꾸로 경매"}/>
        </div>
      </div>
    );
    // mobile version
    else return(
      <div className='mobile_main'>
        <div className="logo">
          <span>
                GAME<br/>
                THEORY<br/>
                LABORATORY<br/>
          </span>
          <span>_게임이론 실험 플랫폼</span>
        </div>
        <div className="blocks">
          <Link to="/fast_start">게임 소개</Link>
          <Link to="/generate_room">방 만들기</Link>
          <Link to="/public_room_list">공개방 참여</Link>
          <Link to="/private_room">비공개방 참여</Link>
          <Link to="/ranking">랭킹</Link>
          <Link to="/account">계정</Link>
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
    setGuestMode : (info)=>{dispatch(actions.guest_mode(info))},
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withCookies(Main));
