import PIXI from "pixi.js";
import { Body, Box } from "p2-es";

import { PhysicalWorld } from "../../physics/physical_world";
import { CollisionGroup } from "../../physics/collision_groups";

import silverstone_track from "./data/silverstone.json";


export class Track {
	readonly body: Body;
	readonly graphics: PIXI.Graphics;

	constructor(physicalWorld: PhysicalWorld) {
		this.body = new Body({
			mass: 0,
			position: [100, 100],
			angle: 0,
			
		});
		this.body.addShape(
			new Box({
				width: 50,
				height: 4,
				collisionGroup: CollisionGroup.WALL,
				collisionMask: CollisionGroup.CAR,
			})
		);
		physicalWorld.addBody(this.body);

		this.graphics = new PIXI.Graphics().rect(-25, -2, 50, 4).fill(0x3460ad);

		this.graphics.position = {
			x: this.body.position[0],
			y: this.body.position[1]
		};
		this.graphics.rotation = this.body.angle;
	}
}
