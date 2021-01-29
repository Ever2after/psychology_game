import React, {Component} from 'react';
import { Route, Link } from 'react-router-dom';
import {connect} from 'react-redux';
import './css/main.css';
import Generate_room from './generate_room';
import Game_container from './game_container';

class Main extends Component{
  constructor(props){
    super(props);
    this.state = {
    }
  }
  onChange = e=>{
    this.setState({
      [e.target.name] : e.target.value
    });
  }
  onClick1 = ()=>{
    this.setState({
      making_mode : !this.state.making_mode,
    });
  }
  render(){
    return(
      <div className='main'>
        <div className="menu">
          <button className={this.state.making_mode ? 'cancle' : ''}
            onClick={this.onClick1}>
            {this.state.making_mode ? '취소' : '방 만들기'}
          </button>
          <Link to="/public_room_list">공개방 참여</Link>
          <button>코드로 참여</button>
          {this.state.making_mode ? <Generate_room history1={this.props.history}/> : <></>}
        </div>
        <div className="games">
          <Game_container history={this.props.history} link={"/moving_dots"} name={"동전 던지기 (1인)"} center={false}/>
          <Game_container history={this.props.history} link={"/moving_dots"} name={"점 움직이기 (1인)"} center={true}/>
          <Game_container history={this.props.history} link={"/moving_dots"} name={"죄수의 딜레마 (2인)"} center={false}/>
          <Game_container history={this.props.history} link={"/moving_dots"} name={"외로운 영웅 (3~20인)"} center={false}/>
          <Game_container history={this.props.history} link={"/treasure_ship"} name={"보물선 (3~20인)"} center={true}/>
          <Game_container history={this.props.history} link={"/moving_dots"} name={"거꾸로 경매 (3~20인)"} center={false}/>
        </div>
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

export default connect(mapStateToProps)(Main);
