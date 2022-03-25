import * as THREE from "three"
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls"

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#canvas")!
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth * 0.95, window.innerHeight * 0.95);
camera.position.set(10, 20, 40);

const light1 = new THREE.PointLight(0xff0000);
light1.position.set(20,20,20);
scene.add(light1);

const controls = new OrbitControls(camera, renderer.domElement)

const gridHelper = new THREE.GridHelper(200, 50); 
const lightHelper = new THREE.PointLightHelper(light1);
scene.add(lightHelper,gridHelper, new THREE.AmbientLight(0xff0000, 0.3))

const guy = new THREE.Mesh(new THREE.BoxGeometry(20, 20, 20), new THREE.MeshStandardMaterial({color: 0xff0000}));

const keyboard = {
  w: false,
  a: false,
  s: false,
  d: false,
  shift: false,
  space: false,
}

var xsp = 0;
var zsp = 0;
var ysp = 0;

scene.add(guy);

function animate(){

  controls.update();

  if(xsp < 0.5 || xsp > -0.5){ xsp += (keyboard.d ? 0.1 : 0) - (keyboard.a ? 0.1 : 0); }
  if(zsp < 0.5 || zsp > -0.5){ zsp += (keyboard.s ? 0.1 : 0) - (keyboard.w ? 0.1 : 0); }
  if(ysp < 0.5 || ysp > -0.5){ ysp += (keyboard.space ? 0.1 : 0) - (keyboard.shift ? 0.1 : 0); }
  xsp -= Math.sign(xsp) * 0.01;
  zsp -= Math.sign(zsp) * 0.01;
  ysp -= Math.sign(ysp) * 0.01;

  guy.position.set(
    guy.position.x + xsp,
    guy.position.y + ysp,
    guy.position.z + zsp,
  );

  window.requestAnimationFrame(animate);
  renderer.render(scene, camera)
}

animate();

document.addEventListener("keydown", (e) => {
  switch(e.key){
    case "w":
      keyboard.w = true;
      break;
    case "a":
      keyboard.a = true;
      break;
    case "s":
      keyboard.s = true;
      break;
    case "d":
      keyboard.d = true;
      break;
    case "Shift":
      keyboard.shift = true;
      break;
    case " ":
      keyboard.space = true;
      break;
  }
})
document.addEventListener("keyup", (e) => {
  switch(e.key){
    case "w":
      keyboard.w = false;
      break;
    case "a":
      keyboard.a = false;
      break;
    case "s":
      keyboard.s = false;
      break;
    case "d":
      keyboard.d = false;
      break;
    case "Shift":
      keyboard.shift = false;
      break;
    case " ":
      keyboard.space = false;
      break;
  }
})