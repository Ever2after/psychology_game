import React, {Component} from 'react';
import { Route, Link } from 'react-router-dom';
import {connect} from 'react-redux';
import '../css/treasure_ship.css';

class Treasure_ship extends Component{
  constructor(props){
    super(props);
    this.state = {
    }
  }

  render(){
    return(
      <div className='treasure_ship'>
      </div>
    );
  }
}


export default Treasure_ship;
