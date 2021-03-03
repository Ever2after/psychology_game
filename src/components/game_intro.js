import React, {Component} from 'react';
import { Route, Link } from 'react-router-dom';
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';
import {connect} from 'react-redux';
import * as actions from '../actions';
import './css/game_intro.css';

class Game_intro extends Component{
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
    const {name} = this.props.match.params;
    var game = '';
    switch(name){
      case 'treasure_ship':
        game = '보물선';
        break;
      case 'reverse_auction':
        game = '거꾸로 경매';
        break;
      case 'prisoner':
        game = '죄수의 딜레마';
        break;
      case 'war_and_peace':
        game = '전쟁과 평화';
        break;
      default :
        break;
    }
    const mobile = window.innerWidth<768;
    // pc version
    if(!mobile) return(
      <div className="game_intro">
      </div>
    );
    // mobile version
    else return(
      <div className='game_intro'>
        <label>{game}</label>
        <span>인원수 : 3~8인</span>
        <p>
          설명설명설명....
        </p>
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

export default connect(mapStateToProps, mapDispatchToProps)(withCookies(Game_intro));
