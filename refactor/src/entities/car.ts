import PIXI from "pixi.js";
import { Body, Box, TopDownVehicle, WheelConstraint } from "p2-es";

import { Renderer } from "../rendering/renderer";
import { RenderNode } from "../rendering/render_node";

import { PhysicalWorld } from "../physics/physical_world";
import { CollisionGroup } from "../physics/collision_groups";


export class Car extends TopDownVehicle implements RenderNode {
	readonly graphics: PIXI.Graphics;

	steering_angle = 0;
	engine_force_mag = 0;
	standard_brakes = 0;
	hand_brake = 0;

	private readonly front_wheel: WheelConstraint;
	private readonly rear_wheel: WheelConstraint;

	constructor(physicalWorld: PhysicalWorld, renderer: Renderer) {
		super(
			new Body({
				position: [100, 10],
				mass: 0.8,
			})
		);

		this.chassisBody.addShape(
			new Box({
				width: 2,
				height: 4,
				collisionGroup: CollisionGroup.CAR,
				collisionMask: CollisionGroup.WALL | CollisionGroup.CHECKPOINT,
			})
		);
		physicalWorld.addBody(this.chassisBody);

		this.front_wheel = this.addWheel({
			localPosition: [0, 1.5],
			sideFriction: 6,
		});
		this.rear_wheel = this.addWheel({
			localPosition: [0, -1.5],
			sideFriction: 7,
		});
		this.addToWorld(physicalWorld);

		this.graphics = new PIXI.Graphics().rect(-1, -2, 2, 4).fill(0xad6024);
		renderer.addChild(this);
	}

	render() {
		this.front_wheel.engineForce = 12;
		this.graphics.position = {
			x: this.chassisBody.position[0],
			y: this.chassisBody.position[1],
		};
		this.graphics.rotation = this.chassisBody.angle;
	}
}
