import PIXI from "pixi.js";
import RAPIER from "@dimforge/rapier2d-compat";

import { PhysicalWorld } from "../systems/physics";


export class Track {
    readonly rigidBody: RAPIER.RigidBody;
    readonly graphics: PIXI.Graphics;

    constructor(physicalWorld: PhysicalWorld) {
        const bodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(100, -75);
        const colliderDesc = RAPIER.ColliderDesc.cuboid(50, 2);

        this.rigidBody = physicalWorld.createRigidBody(bodyDesc);
        physicalWorld.createCollider(colliderDesc, this.rigidBody);

        this.graphics = new PIXI.Graphics().rect(-50, -2, 100, 4).fill(0x3460ad);
        this.graphics.position = this.rigidBody.translation();
        this.graphics.rotation = this.rigidBody.rotation();
    }
}
