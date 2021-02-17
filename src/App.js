import React, {Component} from 'react';
import { Route, Switch, Link } from 'react-router-dom';
import {connect} from 'react-redux';

import Main from './components/main';
import Header from './components/header';
import Login from './components/login';
import Register from './components/register';
import Public_room_list from './components/public_room_list';
import Generate_room from './components/generate_room';
import Game_ready from './components/game_ready';
import Ranking from './components/ranking';

import Moving_dots from './components/moving_dots/moving_dots';

import Treasure_ship from './components/treasure_ship/treasure_ship';

import Hero from './components/hero/hero';

import Prisoner from './components/prisoner/prisoner';

import War_and_peace from './components/war_and_peace/war_and_peace';

class App extends Component{
  render(){
    const mobile = window.innerWidth<768;
    return (
        <div className="App">
          {this.props.game_started ? <></> : <Header/>}
          <Switch>
            <Route exact path="/" component={Main}/>
            <Route exact path="/login" component={Login}/>
            <Route exact path="/register" component={Register}/>
            <Route exact path="/public_room_list" component={Public_room_list}/>
            <Route exact path="/generate_room" component={Generate_room}/>
            <Route exact path="/ranking" component={Ranking}/>

            <Route path="/game_ready/:roomID" component={Game_ready}/>

            <Route path="/moving_dots/:roomID" component={Moving_dots}/>

            <Route path="/treasure_ship/:roomID" component={Treasure_ship}/>

            <Route path="/hero/:roomID" component={Hero}/>

            <Route path="/prisoner/:roomID" component={Prisoner}/>

            <Route path="/war_and_peace/:roomID" component={War_and_peace}/>
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
