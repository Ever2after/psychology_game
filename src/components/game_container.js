import React, {Component} from 'react';
import { Route, Link } from 'react-router-dom';
import './css/game_container.css';
import {connect} from 'react-redux';
import * as actions from '../actions';
class Game_container extends Component{
  constructor(props){
    super(props);
    this.state = {
    }
  }
  onClick = e=>{
    this.props.gameStart(this.props.name);
    this.props.history.push(this.props.link);
  }
  render(){
    return(
      <div className={'game_container'+(this.props.center ? ' center' : '')}>
        <img src="./assets/2.jpg"/>
        <div className="status">{this.props.name}</div>
        <div>
          <button onClick={this.onClick}>빠른 시작</button>
          <button>게임 방법</button>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  //return bindActionCreators(actions, dispatch);
  return{
    gameStart : (name)=>{dispatch(actions.game_started(name))},
  };
}

export default connect(null, mapDispatchToProps)(Game_container);
