import React, {Component} from 'react';
import { Route, Link } from 'react-router-dom';
import {connect} from 'react-redux';
import '../css/Hero.css';

class Hero extends Component{
  constructor(props){
    super(props);
    this.state = {
    }
  }

  render(){
    return(
      <div className='hero'>

      </div>
    );
  }
}


export default Hero;
