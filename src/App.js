import React, {Component} from 'react';
import { Route, Switch, Link } from 'react-router-dom';
import {connect} from 'react-redux';
import * as actions from './actions';
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';
// Component import
import Main from './components/main';
import Header from './components/header';
import Login from './components/login';
import Register from './components/register';
import Account_check from './components/account_check';

import Fast_start from './components/fast_start';
import Game_intro from './components/game_intro';
import Private_room from './components/private_room';
import Account from './components/account';
import Public_room_list from './components/public_room_list';
import Generate_room from './components/generate_room';
import Game_ready from './components/game_ready';
import Ranking from './components/ranking';
import Game_result from './components/game_result';

import Moving_dots from './components/moving_dots/moving_dots';

import Treasure_ship from './components/treasure_ship/treasure_ship';

import Hero from './components/hero/hero';

import Prisoner from './components/prisoner/prisoner';

import War_and_peace from './components/war_and_peace/war_and_peace';

import Reverse_auction from './components/reverse_auction/reverse_auction';

// ----------
const crypto = require("crypto");

class App extends Component{
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
  componentDidMount = ()=>{
    var token = document.cookie.split('; ')
    .find(row => row.startsWith('token'));
    if(!this.props.is_logined && token){
      fetch('/auth/jwt',{
        credentials : 'include',
        headers : {
          Authorization : token.split('=')[1],
        }
      })
      .then(res=>{
        // if there isn't login info
        if(res.status===401){
          const {cookies} = this.props;
          // if guest info exist
          if(cookies && cookies.get('guest nickname')){
              this.props.setGuestMode({nickname : cookies.get('guest nickname')});
          }
          // if it's first guest mode set guest info
          else{
            const nickname = 'guest_'+crypto.randomBytes(4).toString('hex');
            const info = {nickname : nickname};
            this.props.setGuestMode(info);
            const cookies = new Cookies();
            cookies.set('guest nickname', nickname, {path:'/'});
          }
        }
        else {
          res.json().then(data=>{
            if(data.is_logined) this.props.handleSuccess(data.user);
          })
        }
      });
    // if there aren't any login info
    } else {
      const {cookies} = this.props;
      // if guest info exist
      if(cookies && cookies.get('guest nickname')){
        this.props.setGuestMode({nickname : cookies.get('guest nickname')});
      }
      // if it's first guest mode set guest info
      else{
        const nickname = 'guest_'+crypto.randomBytes(4).toString('hex');
        const info = {nickname : nickname};
        //this.props.setGuestMode(info);
        const cookies = new Cookies();
        cookies.set('guest nickname', nickname, {path:'/'});
        this.props.setGuestMode({nickname : nickname});
      }
    }
  }
  render(){
    const mobile = window.innerWidth<768;
    if(this.props.is_logined) return (
        <div className="App">
          {this.props.game_started ? <></> : <Header/>}
          <Switch>
            <Route exact path="/" component={Main}/>
            <Route exact path="/login" component={Login}/>
            <Route exact path="/register" component={Register}/>
            <Route path="/account_check/:roomID" component={Account_check}/>

            <Route exact path="/fast_start" component={Fast_start}/>
            <Route path="/game_intro/:name" component={Game_intro}/>
            <Route exact path="/private_room" component={Private_room}/>
            <Route exact path="/account" component={Account}/>

            <Route exact path="/public_room_list" component={Public_room_list}/>
            <Route exact path="/generate_room" component={Generate_room}/>
            <Route exact path="/ranking" component={Ranking}/>
            <Route exact path="/game_result" component={Game_result}/>

            <Route path="/game_ready/:roomID" component={Game_ready}/>

            <Route path="/moving_dots/:roomID" component={Moving_dots}/>

            <Route path="/treasure_ship/:roomID" component={Treasure_ship}/>

            <Route path="/hero/:roomID" component={Hero}/>

            <Route path="/prisoner/:roomID" component={Prisoner}/>

            <Route path="/war_and_peace/:roomID" component={War_and_peace}/>

            <Route path="/reverse_auction/:roomID" component={Reverse_auction}/>
          </Switch>
        </div>
    );
    else return(
      <Switch>
        <Route exact path="/register" component={Register}/>
        <Route path="/" component={Account_check}/>
      </Switch>
    )
  }
}


const mapStateToProps = (state) => {
  return {
    is_guest : state.login.is_guest,
    is_logined : state.login.is_logined,
    user_info : state.login.user_info,
    game_started : state.game.game_started,
  };
}

const mapDispatchToProps = (dispatch) => {
  //return bindActionCreators(actions, dispatch);
  return{
    handleSuccess : (info)=>{dispatch(actions.login_success(info))},
    setGuestMode : (info)=>{dispatch(actions.guest_mode(info))},
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withCookies(App));
