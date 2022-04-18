import * as THREE from "three"
import { Box3 } from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls"
import { Block } from "./block";

//* Scene setup
const scene = new THREE.Scene();
const world = new THREE.Mesh(new THREE.SphereGeometry(500, 100, 250, 100), new THREE.MeshStandardMaterial());

//Didnt know you could just call functions like this, awesome
new THREE.TextureLoader().load("src/textures/netherbg.png", texture => {
  world.material.map = texture;
  world.material.wireframe = true;
  world.material.transparent = true
  scene.add(world);
});

//Essential objects for rendering
const camera = new THREE.PerspectiveCamera(110 /* Max fov gang */, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#canvas") as HTMLCanvasElement //? Typescript has this thing where you put "as", i guess forcing javascript behavior onto typescript defeats the whole purpose
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.set(10, 41, 40);

//Setting up lighting
const light1 = new THREE.PointLight(0xffffff);
light1.position.set(0,90,0);
light1.intensity = 1.5
scene.add(new THREE.AmbientLight(0xff0000, 0.2), light1, new THREE.AmbientLight(0xffffff, 0.5))

const controls = new OrbitControls(camera, renderer.domElement)

const grv = 0.01; //I guess it wouldve been good practice to capitalize this, oh well too late

//* Player object
const player = {
  mesh : new THREE.Mesh(new THREE.BoxGeometry(20 , 20, 20, 7), new THREE.MeshStandardMaterial({color: "cyan"})),
  hitbox: new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()),
  maxYPos: 0,
  speed : {
    x : 0,
    y : 0,
    z : 0
  },
  /**
   * Initializes the player
   */
  init : function(){
    player.mesh.material.map = new THREE.TextureLoader().load("src/textures/slime.jpg");
    this.mesh.position.y = 21;
    this.hitbox.setFromObject(this.mesh);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    scene.add(this.mesh);
  },
  /**
   * Updates the player
   */
  update : function(){

    light1.position.y = this.mesh.position.y + 20 //Keep the light above the player
    this.speed.y -= grv; //Gravitational acceleration
    if (this.mesh.position.y > this.maxYPos) this.maxYPos = this.mesh.position.y; //Update the max position
    
    //Moving away from the camera proportionally, this algorithm is amazing
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
        
        if(this.mesh.position.y > block.position.y && !block.falling){
          this.speed.y = 0.5;
          this.speed.x = 0;
          this.speed.z = 0;
          canJump = true;
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

const blocks: Block[] = []; //Making an array or Block type

//Adding the starting block for the player to stand on
const temp = new Block(25, 0, 25, "src/textures/piston.png");
blocks.push(temp)
scene.add(temp)

//Keyboard object to help manage user inputs
const keyboard = {
  w: false,
  s: false,
  space: false,
  alt: false,
}

//* Setting up orbiting, this was quite a clever workaround for an issue i was facing, the camera rotation was inconsistent and ugly
document.addEventListener("mousemove", event => {
  if (!keyboard.alt){ //If the user isnt holding shift (i was too lazy to change some stuff and the attribute managing the shift button is called alt)
    
    //* Enabling auto camera rotation and setting the x speed at wich is rotates to the mouse movement event (times 2 because it was too slow)
    controls.autoRotateSpeed = event.movementX * 2
    controls.autoRotate = true;
  }
})
//* Then we disable atuo camera rotation (with some help from stackoverflow)
var timeout = 0;
document.onmousemove = function(){
  clearTimeout(timeout);
  timeout = setTimeout(function(){ //? It basically disables auo camera rotation some time after picking up mouse movements, wich results in exactly what i want
    controls.autoRotate = false;
  }, 0);
}
/*
* 1: On a mouse movement auto camera rotation is enabled and its rotation speed is set to the mouse movement speed
* 2: On a mouse movement a timer with a delay of 0ms is set and when it ends (wich should be when the mouse stops) it executes a function that disables auto camera rotation
? 3: idk im just kinda proud of this thing, its not the most elegant solution but i think its neat 
*/

//Setting up camera system
controls.target = player.mesh.position; //Target the player
controls.enablePan = false; //Disable Panning, zooming, and manual rotation
controls.enableZoom = false; 
controls.enableRotate = false;

//Main update function
function animate(){

  controls.update();

  world.rotateY(0.001); //Rotating the world a little bit, to give a sense of immersion
 
  player.update();

  //* If the rounded y position of the player is divisable by 25
  if (Math.round(player.maxYPos) % 25 == 0) {
    
    //Make the blocks that are too low fall
    for (let i = 0; i < blocks.length - 2; i++){
      blocks[i].falling = true;
    }

    //Add a new block around the position of the player
    const temp = new Block(getRandomInt(100), player.maxYPos - 20, getRandomInt(100), "src/textures/piston.png");
    blocks.push(temp)
    scene.add(temp)
  }

  //For each block that is supposed to be falling, push it down
  blocks.forEach(block => {
    if (block.falling) {
      block.position.y -= 1; //I was too lazy to make an actual vertical speed, gravity and all that
      block.material = new THREE.MeshStandardMaterial({color: "red"}); //Changing its color to telegraph that its falling
    }
  })

  //* Change the background based on the height of the player, this is supposed to be the progression, pretty lazy i know but it does the job
  if (Math.round(player.maxYPos) == 300){
    world.material.map = new THREE.TextureLoader().load("src/textures/cavebg.png")
  } else if (Math.round(player.maxYPos) == 600){
    world.material.map = new THREE.TextureLoader().load("src/textures/hillsbg.png")
  } else if (Math.round(player.maxYPos) == 900){
    world.material.map = new THREE.TextureLoader().load("src/textures/spacebg.jpg")
    for (let i = 0; i < 500; i++){ //Spawn stars because this is in space
      const star = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 24), new THREE.MeshStandardMaterial({color: 0xffffff}))
      star.position.set(THREE.MathUtils.randFloatSpread(1000),THREE.MathUtils.randFloatSpread(3000),THREE.MathUtils.randFloatSpread(1000))
      scene.add(star)
    }    
  } else if (Math.round(player.maxYPos) == 1200){
    world.material.map = new THREE.TextureLoader().load("src/textures/end.png")
  } else if (Math.round(player.maxYPos) == 2000){
    world.material.map = new THREE.TextureLoader().load("src/textures/wib.png")
  }

  //? If the player is falling behind his max height of 100, he must have fallen off the blocks so make him lose, else keep updating
  if (!(player.mesh.position.y < player.maxYPos - 100)){
    world.position.y = player.mesh.position.y; //Make the bg follow the player so he doesnt exit out of it if he gets too high
    window.requestAnimationFrame(animate); //Request an animation frame again
    renderer.render(scene, camera) //Render everything
  } else if (player.mesh.position.y < 0){
    alert("You lost! Your score was: " + Math.round(player.maxYPos))
    window.location.reload();
  } else { //* Even if the player is losing, keep animating until the condition above is met
    window.requestAnimationFrame(animate);
    renderer.render(scene, camera)
  }
}

animate(); //Begin the loop

/**
 * Just a utility function i made
 * @param max bound
 * @returns a random number
 */
function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

//Adding even listeners for user input
document.addEventListener("keydown", (e) => {
  
  switch(e.key){
    case "w":
    case "W":
      keyboard.w = true;
      break;
    case "s":
    case "S":
      keyboard.s = true;
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
    case "s":
    case "S":
      keyboard.s = false;
      break;
    case " ":
      keyboard.space = false;
      break;
    case "Shift":
      keyboard.alt = false;
      break;
  }
})

//! <Ev/>