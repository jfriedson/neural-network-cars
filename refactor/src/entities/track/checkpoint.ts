import { Body, Box, Vec2 } from "p2-es";

import { PhysicalWorld } from "../../physics/physical_world";
import { CollisionGroup } from "../../physics/collision_groups";


export class Checkpoint {
	readonly body: Body;

	constructor(physicalWorld: PhysicalWorld, position: Vec2, angle: number, length: number) {
		this.body = new Body({
			mass: 0,
			position: position,
			angle: angle,
		});
		this.body.addShape(
			new Box({
				width: 1,
				height: length,
				collisionGroup: CollisionGroup.CHECKPOINT,
				collisionMask: CollisionGroup.CAR,
			})
		);
		physicalWorld.addBody(this.body);
	}
}
