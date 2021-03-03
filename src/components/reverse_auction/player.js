import React, {Component} from 'react';
import Item from './item';

class Player extends Component{
  constructor(props){
    super(props);
    this.state = {
    }
  }
  render(){
    const {data} = this.props;
    var items = [];
    if(data[1].items) for(var item of data[1].items){
      items.push(<Item data={item}/>);
    }
    if(data[1].active) return(
      <div className="auction_player">
        <span>{data[0]}</span>
        <div>
          <label>잔고</label>
          <span>{numberWithCommas(data[1].cash)}원</span>
        </div>
        <div>
          <label>현재 평가액</label>
          <span>{numberWithCommas(data[1].value)}원</span>
        </div>
        <label>구매 물품</label>
        <div className="item_container">
          {items}
        </div>
      </div>
    );
    else return(
      <div className="auction_player">
      </div>
    );
  }
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default Player;
