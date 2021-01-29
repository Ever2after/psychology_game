import React, {Component} from 'react';
import { Route, Link } from 'react-router-dom';
import {connect} from 'react-redux';
import '../css/hero.css';
import Timer from '../common/timer';
import socketIOClient from 'socket.io-client';
var socket = socketIOClient();

class Hero extends Component{
  constructor(props){
    super(props);
    this.state = {
    }
  }
  componentDidMount = ()=>{
  }
  render(){
    return(
      <div className='hero'>
        <div className="row1">
          <Timer start={false} width={1000} time={10000}/>
          <div className="hero_button">
            <button>영웅 출현</button>
          </div>
        </div>
        <div className="row2">
        </div>
      </div>
    );
  }
}


export default Hero;
