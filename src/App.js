import React, {Component} from 'react';
import { Route, Switch, Link } from 'react-router-dom';
import {connect} from 'react-redux';

import Main from './components/main';
import Header from './components/header';
import Login from './components/login';
import Public_room_list from './components/public_room_list';
import Generate_room from './components/generate_room';
import Game_ready from './components/game_ready';

import Moving_dots from './components/moving_dots/moving_dots';

import Treasure_ship from './components/treasure_ship/treasure_ship';

import Hero from './components/hero/hero';

class App extends Component{
  render(){
    const mobile = window.innerWidth<768;
    return (
        <div className="App">
          {this.props.game_started ? <></> : <Header/>}
          <Switch>
            <Route exact path="/" component={Main}/>
            <Route exact path="/ranking" component={Main}/>
            <Route exact path="/login" component={Login}/>
            <Route exact path="/public_room_list" component={Public_room_list}/>
            <Route exact path="/generate_room" component={Generate_room}/>
            <Route path="/game_ready/:roomID" component={Game_ready}/>

            <Route exact path="/moving_dots" component={Moving_dots}/>

            <Route exact path="/treasure_ship" component={Treasure_ship}/>

            <Route exact path="/hero" component={Hero}/>
          </Switch>
        </div>
    );
  }
}


const mapStateToProps = (state) => {
  return {
    user_info : state.login.user_info,
    game_started : state.game.game_started,
  };
}

export default connect(mapStateToProps)(App);
