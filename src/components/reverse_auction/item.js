import React, {Component} from 'react';

import apple from './assets/apple.png';
import book from './assets/book.png';
import camera from './assets/camera.png';
import clip from './assets/clip.png';
import diamond from './assets/diamond.png';
import film from './assets/film.png';
import key from './assets/key.png';
import laptop from './assets/laptop.png';
import orb from './assets/orb.png';
import paint from './assets/paint.png';
import pill from './assets/pill.png';
import radio from './assets/radio.png';
import telescope from './assets/telescope.png';

class Item extends Component{
  constructor(props){
    super(props);
    this.state = {
    }
  }
  render(){
    let color;
    let src;
    switch(this.props.data.color){
      case 0:
        color = 'red';
        break;
      case 1:
        color = 'green';
        break;
      case 2:
        color = 'blue';
        break;
      case 3:
        color = 'yellow';
        break;
      default:
        color = 'red';
        break;
    }
    switch(this.props.data.body){
      case 'apple':
        src = apple;
        break;
      case 'book':
        src = book;
        break;
      case 'camera':
        src = camera;
        break;
      case 'clip':
        src = clip;
        break;
      case 'diamond':
        src = diamond;
        break;
      case 'film':
        src = film;
        break;
      case 'key':
        src = key;
        break;
      case 'laptop':
        src = laptop;
        break;
      case 'orb':
        src = orb;
        break;
      case 'paint':
        src = paint;
        break;
      case 'pill':
        src = pill;
        break;
      case 'radio':
        src = radio;
        break;
      case 'telescope':
        src = telescope;
        break;
    }
    return(
      <div className={"auction_item "+color}>
        <img src={src} />
      </div>
    );
  }
}

export default Item;
