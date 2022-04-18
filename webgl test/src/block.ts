import * as THREE from "three"

/**
 * Simple class that returns a ready to use object for the player to jump on
 */
export class Block extends THREE.Mesh{
    
    //Typescript is awesome
    hitbox: THREE.Box3;
    falling: boolean;

    constructor(x: number, y: number, z: number, texture: string){
        super(new THREE.BoxGeometry(20, 1, 20, 7), new THREE.MeshStandardMaterial({map: new THREE.TextureLoader().load(texture)}));
        this.hitbox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
        this.hitbox.setFromObject(this);
        this.position.set(x - 25,y,z - 25);
        this.receiveShadow = true; //This doesnt work lol idk why
        this.castShadow = true;
        this.falling = false;
    }
}