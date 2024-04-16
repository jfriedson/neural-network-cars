import PIXI from "pixi.js";
import RAPIER from "@dimforge/rapier2d-compat";

import { PhysicalWorld } from "../physics/physical_world";
import { CollisionGroup } from "../physics/collision_groups";


export class Track {
	readonly rigid_body: RAPIER.RigidBody;
	readonly graphics: PIXI.Graphics;

	constructor(physicalWorld: PhysicalWorld) {
		const bodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(100, 75);
		const colliderDesc = RAPIER.ColliderDesc.cuboid(50, 2)
			.setCollisionGroups(CollisionGroup.isWall | CollisionGroup.withCar);

		this.rigid_body = physicalWorld.createRigidBody(bodyDesc);
		physicalWorld.createCollider(colliderDesc, this.rigid_body);

		this.graphics = new PIXI.Graphics()
			.rect(-50, -2, 100, 4)
			.fill(0x3460ad);

		this.graphics.position = this.rigid_body.translation();
		this.graphics.rotation = this.rigid_body.rotation();
	}
}
