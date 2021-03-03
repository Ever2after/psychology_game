import React, {Component} from 'react';
import { Route, Link } from 'react-router-dom';
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';
import {connect} from 'react-redux';
import * as actions from '../actions';
import './css/fast_start.css';

class Fast_start extends Component{
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };
  constructor(props){
    super(props);
    const { cookies } = props;
    this.state = {

    }
  }
  render(){
    const mobile = window.innerWidth<768;
    // pc version
    if(!mobile) return(
      <div className="fast_start">
      </div>
    );
    // mobile version
    else return(
      <div className='fast_start'>
        <label>게임 소개</label>
        <div>
          <label>경쟁형</label>
          <p>
            개개인이 모두 경쟁상대가 되는 게임.<br/>
            상대의 심리를 예측하여 최대의 포인트를 따내라.
          </p>
          <div>
            <Link to="/game_intro/treasure_ship">보물선</Link>
            <Link to="/game_intro/reverse_auction">거꾸로 경매</Link>
          </div>
        </div>
        <div>
          <label>단합형</label>
          <p>
            모두가 협력하면 더 많은 포인트 획득이 가능한
            게임. 단, 누군가가 배신하면 나머지는 모두 손해
            를 보게 된다. 게임 결과를 통해 '단합 지수'를
            측정 가능.
          </p>
          <div>
            <Link to="/game_intro/prisoner">죄수의 딜레마</Link>
            <Link to="/game_intro/war_and_peace">전쟁과 평화</Link>
          </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(withCookies(Fast_start));
