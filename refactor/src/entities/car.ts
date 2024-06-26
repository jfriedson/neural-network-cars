import PIXI from "pixi.js";
import { Body, Box, TopDownVehicle, WheelConstraint } from "p2-es";

import { Renderer } from "../rendering/renderer";
import { RenderNode } from "../rendering/render_node";

import { PhysicalWorld } from "../physics/physical_world";
import { CollisionGroup } from "../physics/collision_groups";

import { CarDriver } from "./car_driver/car_driver";


export class Car extends TopDownVehicle implements RenderNode {
	readonly graphics = new PIXI.Graphics({
		zIndex: 3,
	}).rect(-1, -2, 2, 4).fill(0xad6024);

	steering_angle = 0;
	engine_force_mag = 0;
	standard_brakes = 0;
	hand_brake = 0;

	private readonly front_wheel: WheelConstraint;
	private readonly rear_wheel: WheelConstraint;

	private readonly driver: CarDriver;

	constructor(physicalWorld: PhysicalWorld, renderer: Renderer) {
		super(
			new Body({
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

		renderer.addChild(this);

		this.driver = new CarDriver(renderer, this);
	}

	step(physicalWorld: PhysicalWorld) {
		this.driver.step(physicalWorld);

		this.front_wheel.steerValue = this.steering_angle;
		this.rear_wheel.engineForce = this.engine_force_mag;
	}

	render() {
		this.graphics.position = {
			x: this.chassisBody.position[0],
			y: this.chassisBody.position[1],
		};
		this.graphics.rotation = this.chassisBody.angle;
	}
}
