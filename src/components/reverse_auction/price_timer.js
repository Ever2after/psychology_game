import React, {Component} from 'react';
import '../css/price_timer.css';

class Price_timer extends Component{
  constructor(props){
    super(props);
    this.canvasRef = React.createRef();
    this.timer = 0;
    this.state = {
      count : 0,
    };
  }
  canvasClear = (ratio, price)=>{
    var canvas = this.canvasRef.current;
    var ctx = canvas.getContext('2d');
    // clear
    ctx.clearRect(0,0,canvas.width, canvas.height);
    // set border
    ctx.strokeStyle = this.props.color;
    ctx.beginPath();
    ctx.arc(200, 200, 190, 2*Math.PI*(-0.25+ratio), -0.5*Math.PI );
    ctx.lineWidth = 10;
    ctx.stroke();
    // innter circle
    ctx.beginPath();
    ctx.arc(200, 200, 185, 0, 2*Math.PI);
    ctx.fillStyle = "#222b3d";
    ctx.fill();

    // set inner text
    ctx.beginPath();
    ctx.textAlign = "center";
    ctx.font = "50px Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText(numberWithCommas(Math.round(price*(1-ratio)))+'원', 200, 220);
    ctx.stroke();
  }
  stopCanvas = (ratio, price)=>{
    var canvas = this.canvasRef.current;
    var ctx = canvas.getContext('2d');
    // clear
    ctx.clearRect(0,0,canvas.width, canvas.height);
    // set border
    ctx.strokeStyle = this.props.color;
    ctx.beginPath();
    ctx.arc(200, 200, 190, 2*Math.PI*(-0.25+ratio), -0.5*Math.PI );
    ctx.lineWidth = 10;
    ctx.stroke();
    // innter circle
    ctx.beginPath();
    ctx.arc(200, 200, 185, 0, 2*Math.PI);
    ctx.fillStyle = "#222b3d";
    ctx.fill();

    // set inner text
    ctx.beginPath();
    ctx.textAlign = "center";
    ctx.font = "50px Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText(numberWithCommas(Math.round(price))+'원', 200, 220);
    ctx.stroke();
  }
  componentDidMount = ()=>{
    this.canvasClear(1, this.props.price);

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
    if(nextProps.step===1 && this.props.step===0){
      console.log('check');
      this.stopCanvas(1, this.props.price);
    }
  }
  componentWillUnmount = ()=>{
    clearInterval(this.timer);
  }
  draw = ()=>{
    var canvas = this.canvasRef.current;
    if(canvas){
      var ctx = canvas.getContext('2d');
      // check it's stopped
      if(!this.props.start){
        clearInterval(this.timer);
        this.stopCanvas(1, this.props.price);
      } else {
        // count time
        this.setState({
          count : this.state.count+1,
        });

        // check timer is done
        var ratio = this.state.count*10/this.props.time;
        if(ratio>=1) {
          clearInterval(this.timer);
          this.setState({count : 0});
          this.canvasClear(1, 0);
          this.props.gameEnd();
        }

        // time bar update
        this.canvasClear(ratio, this.props.price);
      }
    }
  }
  render(){
    return(
      <div className="price_timer">
       <canvas ref={this.canvasRef} width="400" height="400"/>
      </div>
    );
  }
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default Price_timer;
