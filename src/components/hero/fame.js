import React, {Component} from 'react';
import '../css/fame.css';

class Fame extends Component{
  constructor(props){
    super(props);
    this.state = {
    }
  }

  render(){
    return(
      <div className='fame' style={{backgroundImage : 'url(/assets/fame.png)'}}>
        <span>HERO<br/>{this.props.hero}</span>
      </div>
    );
  }
}


export default Fame;
