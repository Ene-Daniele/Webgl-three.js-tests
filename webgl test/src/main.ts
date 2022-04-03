import * as THREE from "three"
import { Box3 } from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls"
import { Block } from "./block";

//* Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.TextureLoader().load("");
const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#canvas") as HTMLCanvasElement 
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth * 0.95, window.innerHeight * 0.95);
camera.position.set(10, 41, 40);

const light1 = new THREE.PointLight(0xffffff);
light1.position.set(0,90,0);
light1.intensity = 1.5

const gridHelper = new THREE.GridHelper(100, 25); 
const lightHelper = new THREE.PointLightHelper(light1);
scene.add(lightHelper,gridHelper, new THREE.AmbientLight(0xff0000, 1.7), light1)

const controls = new OrbitControls(camera, renderer.domElement)

const grv = 0.01

const player = {
  mesh : new THREE.Mesh(new THREE.BoxGeometry(20 , 20, 20, 7), new THREE.MeshStandardMaterial({color: "cyan"})),
  hitbox: new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()),
  maxYPos: 0,
  speed : {
    x : 0,
    y : 0,
    z : 0
  },
  init : function(){
    this.mesh.position.y = 21;
    this.hitbox.setFromObject(this.mesh);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    scene.add(this.mesh);
  },
  update : function(){

    light1.position.y = this.mesh.position.y + 20
    this.speed.y -= grv;
    if (this.mesh.position.y > this.maxYPos) this.maxYPos = this.mesh.position.y;
    
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

    //* Updating position
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
    
    //* Updating position of hitbox
    this.hitbox.copy(this.mesh.geometry.boundingBox as Box3).applyMatrix4(this.mesh.matrixWorld);

    blocks.forEach(block => {
      
      //* Updating position of block hitbox
      block.hitbox.copy(block.geometry.boundingBox as Box3).applyMatrix4(block.matrixWorld);

      let canJump = false;
      if (this.hitbox.intersectsBox(block.hitbox)){
        
        if(this.mesh.position.y > block.position.y){
          this.speed.y = 0.5;
          this.speed.x = 0;
          this.speed.z = 0;
          canJump = true
        } else {
          canJump = false
        }
        //* Revert the position change
        this.hitbox.copy(this.mesh.geometry.boundingBox as Box3).applyMatrix4(this.mesh.matrixWorld);
      }
      if (keyboard.space && canJump) this.speed.y = 1
    })
  }
}
player.init();

const blocks: Block[] = [];

const temp = new Block(25, 0, 25);
blocks.push(temp)
scene.add(temp)

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

  if (Math.round(player.maxYPos) % 25 == 0) {
    
    for (let i = 0; i < blocks.length - 2; i++){
      blocks[i].falling = true;
    }
    
    const temp = new Block(getRandomInt(100), player.maxYPos - 20, getRandomInt(100));
    blocks.push(temp)
    scene.add(temp)
  }

  blocks.forEach(block => {
    if (block.falling) {
      block.position.y -= 1;
      block.material = new THREE.MeshStandardMaterial({color: "red"})
    }
  })

  window.requestAnimationFrame(animate);
  renderer.render(scene, camera)
}

animate();

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

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