import * as THREE from "three"
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls"

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
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
scene.add(lightHelper,gridHelper, new THREE.AmbientLight(0xff0000, 0.3), new THREE.CameraHelper(camera))

const guy = new THREE.Mesh(new THREE.SphereGeometry(10, 20, 100, 7), new THREE.MeshStandardMaterial({color: 0xff0000}));

guy.add(camera);

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
document.addEventListener("mousemove", event => {
  guy.rotateY(-event.movementX / 100);
})

controls.target = guy.position;
controls.enablePan = false;
controls.enableZoom = false;
controls.enableRotate = false;

function animate(){

  controls.update();

  const orientationX = Math.sign(guy.position.x) - Math.sign(camera.position.x)
  const orientationZ = Math.sign(guy.position.z) - Math.sign(camera.position.z)

  const ab = Math.abs(guy.position.x - camera.position.x)
  const bc = Math.abs(guy.position.z - camera.position.z)
  const ca = Math.sqrt(ab * ab + bc * bc)

  const verticalAngle = (Math.acos(ab / ca) * 180 / Math.PI) / 90;
  const horizontalAngle = (Math.acos(bc / ca) * 180 / Math.PI) / 90;

  xsp = (horizontalAngle * (keyboard.w ? 1 : 0) * orientationX)
  zsp = (verticalAngle * (keyboard.w ? 1 : 0) * orientationZ)  

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
    case "W":
      keyboard.w = true;
      break;
    case "a":
    case "A":
      keyboard.a = true;
      break;
    case "s":
    case "S":
      keyboard.s = true;
      break;
    case "d":
    case "D":
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
    case "W":
      keyboard.w = false;
      break;
    case "a":
    case "A":
      keyboard.a = false;
      break;
    case "s":
    case "S":
      keyboard.s = false;
      break;
    case "d":
    case "D":
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
