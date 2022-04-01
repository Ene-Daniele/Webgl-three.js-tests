import * as THREE from "three"
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls"

//* Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#canvas") as HTMLCanvasElement 
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth * 0.95, window.innerHeight * 0.95);
camera.position.set(10, 20, 40);

const light1 = new THREE.PointLight(0xff0000);
light1.position.set(0,30,0);

const gridHelper = new THREE.GridHelper(200, 50); 
const lightHelper = new THREE.PointLightHelper(light1);
scene.add(lightHelper,gridHelper, new THREE.AmbientLight(0xff0000, 0.3), light1)

const controls = new OrbitControls(camera, renderer.domElement)

const player = {
  mesh : new THREE.Mesh(new THREE.BoxGeometry(20 , 20, 20, 7), new THREE.MeshStandardMaterial({color: 0xff0000})),
  speed : {
    x : 0,
    y : 0,
    z : 0
  },
  init : function(){
    scene.add(this.mesh);
  },
  update : function(){
    
    //Moving away from the camera proportionally
    var orientationX = -Math.sign(camera.position.x - this.mesh.position.x)
    var orientationZ = -Math.sign(camera.position.z - this.mesh.position.z)

    var ab = Math.abs(this.mesh.position.x - camera.position.x)
    var bc = Math.abs(this.mesh.position.z - camera.position.z)
    var ca = Math.sqrt(ab * ab + bc * bc)

    var verticalAngle = (Math.acos(ab / ca) * 180 / Math.PI) / 90;
    var horizontalAngle = (Math.acos(bc / ca) * 180 / Math.PI) / 90;
    
    if (Math.abs(this.speed.x) + Math.abs(this.speed.z) + 0.1 < 1){
      this.speed.x += horizontalAngle * orientationX * (keyboard.w ? 0.1 : 0)
      this.speed.z += verticalAngle * orientationZ * (keyboard.w ? 0.1 : 0)
      
      this.speed.x += horizontalAngle * -orientationX * (keyboard.s ? 0.1 : 0)
      this.speed.z += verticalAngle * -orientationZ * (keyboard.s ? 0.1 : 0)

      //? I tried my best to make it move to the sides but that screws everything up for some reason
    }

    //Friction and rounding
    this.speed.x = Math.round((this.speed.x - Math.sign(this.speed.x) * 0.01) * 100) / 100;
    this.speed.z = Math.round((this.speed.z - Math.sign(this.speed.z) * 0.01) * 100) / 100;

    this.mesh.position.set(
      this.mesh.position.x + this.speed.x,
      this.mesh.position.y + this.speed.y,
      this.mesh.position.z + this.speed.z,
    );
    camera.position.set(
      camera.position.x + this.speed.x,
      camera.position.y + this.speed.y,
      camera.position.z + this.speed.z,
    )
  }
}
player.init();

const keyboard = {
  w: false,
  a: false,
  s: false,
  d: false,
  shift: false,
  space: false,
  alt: false,
}

//Setting up orbiting
document.addEventListener("mousemove", event => {
  if (!keyboard.alt){
    controls.autoRotateSpeed = event.movementX * 2
    controls.autoRotate = true;
  }
})
var timeout = 0;
document.onmousemove = function(){
  clearTimeout(timeout);
  timeout = setTimeout(function(){
    controls.autoRotate = false;
  }, 0);
}
controls.target = player.mesh.position;
controls.enablePan = false;
controls.enableZoom = false;
controls.enableRotate = false;

//Main update function
function animate(){

  controls.update();
 
  player.update();

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
    case " ":
      keyboard.space = true;
      break;
    case "Shift":
      keyboard.alt = true;
      break;
  }
  console.log(e.key);
  
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
    case " ":
      keyboard.space = false;
      break;
    case "Shift":
      keyboard.alt = false;
      break;
  }
})
