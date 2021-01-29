/* Babylon JS is available as **npm** package.
You can easily build a simple `React` Component around a `canvas` and Babylon JS
I have created a minimal example with React+ Babylon:
 */
import React, { Component } from "react";
import * as BABYLON from '@babylonjs/core/Legacy/legacy';
import 'babylonjs-loaders';

var scene;
var car;
/**
 * Example temnplate of using Babylon JS with React
 */
class Ship_wreck extends Component {
  constructor(props) {
    super(props);
    this.state = { useWireFrame: false, shouldAnimate: false };
  }

  componentDidMount = () => {
    // start ENGINE
    this.engine = new BABYLON.Engine(this.canvas, true, {doNotHandleContextLost: true});

    this.engine.enableOfflineSupport = false;


    BABYLON.DefaultLoadingScreen.prototype.displayLoadingUI = function () {
      //alert('fuck');
    }
    //Create Scene
    scene = new BABYLON.Scene(this.engine);

    scene.clearCachedVertexData();

    scene.cleanCachedTextureBuffer();

    //--background settting---
    this.setBackground();

    //--Light---
    this.addLight();

    //--Camera---
    this.addCamera();

    //--Meshes---
    this.addModels();

    // Add Events
    window.addEventListener("resize", this.onWindowResize, false);

    // Render Loop
    this.engine.runRenderLoop(() => {
      scene.render();
    });

    //Animation
    scene.registerBeforeRender(() => {

    });
  };

  componentWillUnmount() {
    window.removeEventListener("resize", this.onWindowResize, false);
  }

  onWindowResize = event => {
    this.engine.resize();
  };

  setBackground = ()=>{
    scene.clearColor = new BABYLON.Color3(34/256, 43/256, 61/256);
  }

  /**
   * Add Lights
   */
  addLight = () => {
    //---------- LIGHT---------------------
    // Create a basic light, aiming 0,1,0 - meaning, to the sky.
    var light = new BABYLON.HemisphericLight(
      "light1",
      new BABYLON.Vector3(0, 10, 0),
      scene
    );
  };

  /**
   * Add Camera
   */
  addCamera = () => {
    // ---------------ArcRotateCamera or Orbit Control----------
    var camera = new BABYLON.ArcRotateCamera(
      "Camera",
      Math.PI / 2,
      Math.PI / 4,
      4,
      BABYLON.Vector3.Zero(),
      scene
    );
    camera.inertia = 0;
    camera.angularSensibilityX = 250;
    camera.angularSensibilityY = 250;

    // This attaches the camera to the canvas
    camera.attachControl(this.canvas, true);
    camera.setPosition(new BABYLON.Vector3(5, 5, 5));
  };


  /**
   * Add Models
   */
  addModels = () => {
    // Add BOX

    car = BABYLON.SceneLoader.Append("./assets/OBJ/", "ship_light.obj", scene, function(scene){
      for(var i=0;i<scene.meshes.length;i++){
        scene.meshes[i].scaling = scene.meshes[i].scaling.multiply(new BABYLON.Vector3(0.06, 0.06, 0.06));
        scene.meshes[i].position.y += -1;
      }
    });

  };

  render() {
    return (
      <canvas className="ship_wreck"
        style={{ width: this.props.width, height: this.props.height }}
        ref={canvas => {
          this.canvas = canvas;
        }}
      />
    );
  }
}
export default Ship_wreck;
