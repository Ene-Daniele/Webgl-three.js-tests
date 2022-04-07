import * as THREE from "three"

export class Block extends THREE.Mesh{
    hitbox: THREE.Box3;
    falling: boolean;

    constructor(x: number, y: number, z: number, texture: string){
        super(new THREE.BoxGeometry(20, 1, 20, 7), new THREE.MeshStandardMaterial({map: new THREE.TextureLoader().load(texture)}));
        this.hitbox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
        this.hitbox.setFromObject(this);
        this.position.set(x - 25,y,z - 25);
        this.receiveShadow = true;
        this.castShadow = true;
        this.falling = false;
    }
}