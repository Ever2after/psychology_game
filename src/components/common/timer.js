import React, {createRef, useEffect, Component} from 'react';
import { Route, Link } from 'react-router-dom';

class Timer extends Component{
  constructor(props) {
      super(props);
      this.canvasRef = React.createRef();
      this.timer = 0;
      this.state = {
        count : 0,
      };
    }
  componentDidMount = ()=>{
    var canvas = this.canvasRef.current;
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = this.props.color;
    ctx.fillRect(0,0,canvas.width, canvas.height);
    if(this.props.start) {
      clearInterval(this.timer);
      this.timer = setInterval(this.draw, 10);
    }
  }
  componentWillReceiveProps = (nextProps)=>{

    if(nextProps.start && !this.props.start) {
      clearInterval(this.timer);
      this.timer = setInterval(this.draw, 10);
      this.setState({count : 0});
    }
  }
  componentWillUnmount = ()=>{
    clearInterval(this.timer);
  }
  draw = ()=>{
    var canvas = this.canvasRef.current;
    if(canvas){
      var ctx = canvas.getContext('2d');

      // count time
      this.setState({
        count : this.state.count+1,
      });

      // check timer is done
      var ratio = this.state.count*10/this.props.time;
      if(ratio>=1) {
        clearInterval(this.timer);
        this.setState({count : 0});
        ctx.fillStyle = this.props.color;
        ctx.fillRect(0,0,canvas.width, canvas.height);
        this.props.gameEnd();
      }

      // time bar update
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = this.props.color;
      ctx.fillRect(0,0,canvas.width*(1-ratio), canvas.height);

      // check it's stopped
      if(!this.props.start){
        clearInterval(this.timer);
        this.setState({count : 0});
        ctx.fillStyle = this.props.color;
        ctx.fillRect(0,0,canvas.width, canvas.height);
      }
    }
  }
  render(){
    return (
      <>
        <canvas ref={this.canvasRef} width={this.props.width} height={this.props.height}/>
      </>
    );
  }
}


export default Timer;
