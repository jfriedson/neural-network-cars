import PIXI from "pixi.js";
import RAPIER from "@dimforge/rapier2d-compat";

import { LinAlg } from "../../math/lin_alg";

import { Renderer } from "../../rendering/renderer";
import { RenderNode } from "../../rendering/render_node";

import { PhysicalWorld } from "../../physics/physical_world";
import { PhysicalNode } from "../../physics/physical_node";
import { CollisionGroup } from "../../physics/collision_groups";

import { Wheel } from "./wheel";


export class Car implements PhysicalNode, RenderNode {
	readonly rigid_body: RAPIER.RigidBody;
	readonly graphics: PIXI.Graphics;

	private readonly front_wheel: Wheel;
	private readonly rear_wheel: Wheel;

	private front_wheel_joint: RAPIER.ImpulseJoint;
	private rear_wheel_joint: RAPIER.ImpulseJoint;

	steering_angle = 0;
	engine_force_mag = 0;

	constructor(physicalWorld: PhysicalWorld, renderer: Renderer) {
		// create physical car body
		const bodyDesc = RAPIER.RigidBodyDesc.dynamic();
		const colliderDesc = RAPIER.ColliderDesc.cuboid(8, 4)
			.setCollisionGroups(CollisionGroup.isCar | CollisionGroup.withWall)
			.setSolverGroups(
				CollisionGroup.isCar |
				CollisionGroup.withWall | CollisionGroup.withCheckpoint
			);
		this.rigid_body = physicalWorld.createRigidBody(bodyDesc);
		physicalWorld.createCollider(colliderDesc, this.rigid_body);
		physicalWorld.addNode(this);

		this.graphics = new PIXI.Graphics().rect(-8, -4, 16, 8).fill(0xad6024);
		renderer.addChild(this);

		// create wheels
		this.front_wheel = new Wheel(physicalWorld, renderer);
		this.rear_wheel = new Wheel(physicalWorld, renderer);

		this.front_wheel_joint = physicalWorld.createImpulseJoint(
			RAPIER.JointData.revolute({ x: -4, y: 0 }, { x: 0, y: 0 }),
			this.rigid_body,
			this.front_wheel.rigid_body,
			true
		);

		this.rear_wheel_joint = physicalWorld.createImpulseJoint(
			RAPIER.JointData.revolute({ x: 4, y: 0 }, { x: 0, y: 0 }),
			this.rigid_body,
			this.rear_wheel.rigid_body,
			true
		);

		window.addEventListener("keydown", (e) => {
			if (e.repeat) return;

			switch (e.key.toUpperCase()) {
				case "W": this.engine_force_mag += 5000; break;
				case "S": this.engine_force_mag -= 5000; break;
				case "A": this.steering_angle -= 500; break;
				case "D": this.steering_angle += 500;
			}
		});

		window.addEventListener("keyup", (e) => {
			if (e.repeat) return;

			switch (e.key.toUpperCase()) {
				case "W": this.engine_force_mag -= 5000; break;
				case "S": this.engine_force_mag += 5000; break;
				case "A": this.steering_angle += 500; break;
				case "D": this.steering_angle -= 500;
			}
		});
	}

	step() {
		this.rigid_body.resetForces(false);
		this.rigid_body.resetTorques(false);

		const forward_normal = new RAPIER.Vector2(
			Math.cos(this.rigid_body.rotation()),
			Math.sin(this.rigid_body.rotation())
		);

		const foward_vel_mag = LinAlg.v2dot(forward_normal, this.rigid_body.linvel());

		const right_normal = new RAPIER.Vector2(-forward_normal.y, forward_normal.x);
		const lat_vel_mag = LinAlg.v2dot(right_normal, this.rigid_body.linvel());
		const lat_vel = LinAlg.v2mul(right_normal, -lat_vel_mag);

		const lat_impulse = LinAlg.v2mul(lat_vel, 0.8 * this.rigid_body.mass());
		this.rigid_body.applyImpulse(lat_impulse, true);

		this.rigid_body.setAngularDamping(10);

		const steering_torque = this.steering_angle * foward_vel_mag;
		this.rigid_body.addTorque(steering_torque, true);

		const drag_force_mag = LinAlg.v2mul(forward_normal, -50 * foward_vel_mag);
		this.rigid_body.addForce(drag_force_mag, true);

		this.front_wheel.steering_angle = this.steering_angle;
		this.rear_wheel.engine_force_mag = this.engine_force_mag;
	}

	render() {
		this.graphics.position = this.rigid_body.translation();
		this.graphics.rotation = this.rigid_body.rotation();
	}
}
