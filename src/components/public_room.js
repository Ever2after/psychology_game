import React, {Component} from 'react';
import { Route, Link } from 'react-router-dom';
import './css/public_room.css';

class Public_room extends Component{
  constructor(props){
    super(props);
    this.state = {
    }
  }

  render(){
    const {data, onClick} = this.props;
    return(
      <div className="public_room">
        <div>
          <img src="./assets/2.jpg"/>
          <div>
            <span className="name">{data.info.name}</span>
            <span className="number">{data.user.length}/{data.info.max_number}명</span>
            <br/>
            <span>그 외 세부정보</span>
          </div>
        </div>
        <button name={data.roomID}
        onClick={onClick}>참가</button>
      </div>
    );
  }
}

export default Public_room;
