import * as p2 from "p2-es";

import { CollisionGroup } from "../../../physics/collision_groups";

import { Car } from "../../car";
import { PhysicalWorld } from "../../../physics/physical_world";


export class Ray {
	readonly length: number;
	readonly angle: number;
	readonly physical = new p2.Ray({
		mode: p2.Ray.CLOSEST,
		collisionMask: CollisionGroup.WALL,
	});
	readonly cast_result = new p2.RaycastResult();

	constructor(length: number, angle: number) {
		this.length = length;
		this.angle = angle;
	}

	step(physicalWorld: PhysicalWorld, car: Car) {
		this.physical.from = car.chassisBody.position;
		this.physical.to = [
			car.chassisBody.position[0] -
				Math.sin(car.chassisBody.angle + this.angle) * this.length,
			car.chassisBody.position[1] +
				Math.cos(car.chassisBody.angle + this.angle) * this.length,
		];
        this.physical.update();
        
        this.cast_result.reset();
        physicalWorld.raycast(this.cast_result, this.physical);

        if (!this.cast_result.hasHit())
            this.cast_result.fraction = 1;
	}
}
