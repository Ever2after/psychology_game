import React, {Component} from 'react';
import socket from '../../socket.js';
import '../css/player.css';

class Player extends Component{
  constructor(props){
    super(props);
    this.state = {
      //
    }
  }
  //
  emoji_select = emoji=>{
    switch(emoji){
      case 0:
        return '😄';
      case 1:
        return '😅';
      case 2:
        return '😂';
      case 3:
        return '😜';
      case 4:
        return '😒';
      case 5:
        return '😓';
      case 6:
        return '😠';
      case 7:
        return '😤';
      case 8:
        return '😭';
      case 9:
        return '😱';
      default :
        return '';
    }
  }
  render(){
    const info = this.props.player[1];
    const userID = this.props.player[0];
    const emoji = this.emoji_select(info.emoji);
    const is_selected = this.props.target===userID;
    if(info.active){
      return(
        <div className="player">
          <div className="targeted">
            💥{info.targeted}
          </div>
          <button onClick={this.props.onClick} className="emoji">
            {emoji}
          </button>
          <div className={"userinfo"+(is_selected ? " selected" : '')}>
            <div className="username">
              {userID}
            </div>
            <div className="status">
              <span>💎 {info.point}</span>
              <span>💪 {info.strength}</span>
            </div>
          </div>
        </div>
      );
    } else {
      return(
        <div className="player">
        </div>
      );
    }
  }
}

export default Player;
