import React, {createRef, useEffect, useState, Component} from 'react';
import { Route, Link } from 'react-router-dom';
import Timer from '../common/timer';
import {connect} from 'react-redux';
import * as actions from '../../actions';
import '../css/moving_dots.css';

function Moving_dots(props){
  let canvas;
  let canvasRef = createRef();
  const height = 800;
  const width = 1800;
  let pos = {
    drawable : false,
    X : Math.random()*width,
    Y : Math.random()*height,
  };
  let origin = {
    X : Math.random()*width,
    Y : Math.random()*height,
  };
  let ctx;

  //------------game status---------------------//
  // game state : ready, timerRun, updateDots, showCluster, gameResult
  let gameState = "ready";
  // decide whether dots should be shown
  let showDots = false;
  // which round it is : 0~8
  let round = 0;
  // distance which dots will move
  let length = [100, 120, 140, 200, 250, 200, 140, 120, 100];
  // whether timer should run
  const [timer, setTimer] = useState(false);
  // define works after 10 sec
  let timer1;
  // define background messages
  let backgroundMsg;
  // set other dots' positions {X : .., Y : ..}
  let positions = [];

  useEffect(()=>{
    // use full screen
    window.document.documentElement.requestFullscreen();
    //---------initialize----------------------------//
    // canvas initialize
    canvas = canvasRef.current;
    ctx = canvas.getContext("2d");
    ctx.fillStyle = "#384050";
    ctx.fillRect(0,0,canvas.width, canvas.height);
    // draw background text
    backgroundMsg = "Ready";
    setBackgroundMsg(backgroundMsg);
    // draw positions of other Moving_dots
    setPositions();
    //---------initialize done----------------------------//
    // countDown
    setTimeout(()=>{
      clearCanvas();
      backgroundMsg = "3";
      setBackgroundMsg(backgroundMsg);
    }, 1000);
    setTimeout(()=>{
      clearCanvas();
      backgroundMsg = "2";
      setBackgroundMsg(backgroundMsg);
    }, 2000);
    setTimeout(()=>{
      clearCanvas();
      backgroundMsg = "1";
      setBackgroundMsg(backgroundMsg);
    }, 3000);
    setTimeout(()=>{
      clearCanvas();
      backgroundMsg = "Round 1";
      setBackgroundMsg(backgroundMsg);
      drawDots();
      showDots = true;
      setTimer(true);
      gameState = "timerRun";
    }, 4000);
    timer1 = setTimeout(()=>{
      var e = {offsetX : Math.random()*width, offsetY : Math.random()*height};
      initDraw(e);
    }, 14000);
    // evenlistener
    canvas.addEventListener("mousedown", initDraw);
    canvas.addEventListener("mousemove", draw);
  }, []);

  function setBackgroundMsg(msg){
    // draw background text
    ctx.beginPath();
    ctx.textAlign = "center";
    ctx.font = "150px Arial";
    ctx.fillStyle = "rgba(112, 112, 112, 1)";
    ctx.fillText(msg, width/2, height/2);
    ctx.stroke();
  }

  function initDraw(e){
    if(gameState==="timerRun"){
      // game is end
      if(round===8){
        // set new origin
        pos = {...pos, ...getPosition(e)};
        const d_x = pos.X-origin.X;
        const d_y = pos.Y-origin.Y;
        const _r = Math.sqrt(d_x*d_x+d_y*d_y);
        const len_x = length[round]*d_x/_r;
        const len_y = length[round]*d_y/_r;
        var end_x = len_x+origin.X;
        var end_y = len_y+origin.Y;
        if(end_x<0) end_x = width+end_x;
        if(end_x>width) end_x = end_x-width;
        if(end_y<0) end_y = height+end_y;
        if(end_y>height) end_y = end_y-height;
        origin = {X : end_x, Y : end_y};
        //--------------------- game status update ----------------------//
        gameState = "gameResult";
        // timer stop
        setTimer(false);
        // canvas update
        backgroundMsg = "Game End";
        draw(e);
      }
      // round is not yet 9
      else{
        // set new origin
        pos = {...pos, ...getPosition(e)};
        const d_x = pos.X-origin.X;
        const d_y = pos.Y-origin.Y;
        const _r = Math.sqrt(d_x*d_x+d_y*d_y);
        const len_x = length[round]*d_x/_r;
        const len_y = length[round]*d_y/_r;
        var end_x = len_x+origin.X;
        var end_y = len_y+origin.Y;
        if(end_x<0) end_x = width+end_x;
        if(end_x>width) end_x = end_x-width;
        if(end_y<0) end_y = height+end_y;
        if(end_y>height) end_y = end_y-height;
        origin = {X : end_x, Y : end_y};
        //--------------------- game status update ----------------------//
        gameState = "updateDots";
        // timer stop
        setTimer(false);
        // round ++
        round++;
        // canvas update
        backgroundMsg = "moving dots";
        draw(e);

        // after 1sec, update dots position and canvas
        setTimeout(()=>{
          updatePositions();
          draw(e);

        }, 1000);

        // after 2 sec, new round start
        setTimeout(()=>{
          gameState= "timerRun";
          backgroundMsg = "Round "+(round+1);
          draw(e);
          setTimer(true);
        }, 2000);

        // after 10sec initDraw
        clearInterval(timer1);
        timer1 = setTimeout(()=>{
          var e = {offsetX : Math.random()*width, offsetY : Math.random()*height};
          initDraw(e);
        }, 12000);
      }
    }
  }

  function setPositions(){
    for(var i=0;i<20;i++){
      positions.push({X : Math.random()*width, Y : Math.random()*height});
    }
  }

  function updatePositions(){
    for(var i=0;i<20;i++){
      positions[i].X = positions[i].X+(2*Math.random()-1)*length[round];
      positions[i].Y = positions[i].Y+(2*Math.random()-1)*length[round];
    }
  }

  function drawDots(){
    for(var i=0;i<20;i++){
      ctx.beginPath();
      ctx.arc(positions[i].X, positions[i].Y, 10, 0, 2*Math.PI, true);
      ctx.fillStyle="#FFCF24";
      ctx.fill();
    }
  }

  function draw(e){
    // claer canvas
    clearCanvas();
    // draw background text
    setBackgroundMsg(backgroundMsg);
    // draw other dots
    if(showDots) drawDots();
    // draw mydot
    ctx.beginPath();
    ctx.arc(origin.X, origin.Y, 10, 0, 2*Math.PI, true);
    ctx.fillStyle="#56AEFF";
    ctx.fill();
    // draw support line
    drawSupportLine(origin, getPosition(e));
  }

  function getPosition(e){
    return {X: e.offsetX, Y: e.offsetY};
  }

  function clearCanvas(){
    // canvas reset
    ctx.clearRect(0,0,canvas.width, canvas.height);
    ctx.fillStyle = "#384050";
    ctx.fillRect(0,0,canvas.width, canvas.height);
  }

  function drawSupportLine(_origin, _pos){
    // draw line to origin to pos
    //ctx.beginPath();
    //ctx.moveTo(_origin.X, _origin.Y);
    const d_x = _pos.X-_origin.X;
    const d_y = _pos.Y-_origin.Y;
    const _r = Math.sqrt(d_x*d_x+d_y*d_y);
    const len_x = length[round]*d_x/_r;
    const len_y = length[round]*d_y/_r;
    var end_x = len_x+_origin.X;
    var end_y = len_y+_origin.Y;
    if(end_x<0) end_x = width+end_x;
    if(end_x>width) end_x = end_x-width;
    if(end_y<0) end_y = height+end_y;
    if(end_y>height) end_y = end_y-height;
    //ctx.lineTo(end_x, end_y);
    //ctx.stroke();
    // draw circle at pos
    ctx.beginPath();
    ctx.arc(end_x, end_y, 10, 0, 2*Math.PI, true);
    ctx.fillStyle="rgba(86, 174, 255, 0.5)";
    ctx.fill();
  }

  function onClick1(){
    props.gameEnd();
    props.history.push('/');
  }

  return(
    <div className="moving_dots">
      <Timer start={timer} time={10000} width={width} height={20} color="#FFCF24"/>
      <canvas ref={canvasRef} width={width} height={height}/>
      <button onClick={onClick1}>게임 포기</button>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    user_info : state.login.user_info,
  };
}

const mapDispatchToProps = (dispatch) => {
  //return bindActionCreators(actions, dispatch);
  return{
    gameEnd : ()=>{dispatch(actions.game_ended())},
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Moving_dots);
