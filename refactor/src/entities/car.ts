import PIXI from "pixi.js";
import RAPIER from "@dimforge/rapier2d-compat";

import { Renderer } from "../rendering/renderer";
import { RenderNode } from "../rendering/render_node";

import { PhysicalWorld } from "../physics/physical_world";
import { PhysicalNode } from "../physics/physical_node";


export class Car implements PhysicalNode, RenderNode {
	readonly rigid_body: RAPIER.RigidBody;
	readonly graphics: PIXI.Graphics;

	steering_angle = 0;
	engine_force_mag = 0;

	constructor(physicalWorld: PhysicalWorld, renderer: Renderer) {
		const bodyDesc = RAPIER.RigidBodyDesc.dynamic();
		const colliderDesc = RAPIER.ColliderDesc.cuboid(8, 4);
		this.rigid_body = physicalWorld.createRigidBody(bodyDesc);
		physicalWorld.createCollider(colliderDesc, this.rigid_body);
		physicalWorld.addNode(this);

		this.graphics = new PIXI.Graphics().rect(-8, -4, 16, 8).fill(0xad6024);
		renderer.addChild(this);

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
		// TODO: get linalg lib, organize
		this.rigid_body.resetForces(false);
		this.rigid_body.resetTorques(false);

		const forward_normal = new RAPIER.Vector2(
			Math.cos(this.rigid_body.rotation()),
			Math.sin(this.rigid_body.rotation())
		);

		const engine_force = new RAPIER.Vector2(
			this.engine_force_mag * forward_normal.x,
			this.engine_force_mag * forward_normal.y
		);
		this.rigid_body.addForce(engine_force, true);

		const foward_vel_mag = v2dot(forward_normal, this.rigid_body.linvel());

		const steering_torque = this.steering_angle * foward_vel_mag;
		this.rigid_body.addTorque(steering_torque, true);

		const right_normal = new RAPIER.Vector2(-forward_normal.y, forward_normal.x);
		const lat_vel_mag = v2dot(right_normal, this.rigid_body.linvel());
		const lat_vel = new RAPIER.Vector2(
			right_normal.x * -lat_vel_mag,
			right_normal.y * -lat_vel_mag
		);

		const lat_impulse = new RAPIER.Vector2(
			.8 * this.rigid_body.mass() * lat_vel.x,
			.8 * this.rigid_body.mass() * lat_vel.y
		);
		this.rigid_body.applyImpulse(lat_impulse, true);

		this.rigid_body.setAngularDamping(10);

		const drag_force_mag = new RAPIER.Vector2(
			-50 * foward_vel_mag * forward_normal.x,
			-50 * foward_vel_mag * forward_normal.y
		);
		this.rigid_body.addForce(drag_force_mag, true);
	}

	render() {
		this.graphics.position = this.rigid_body.translation();
		this.graphics.rotation = this.rigid_body.rotation();
	}
}

function v2dot(vecA: RAPIER.Vector, vecB: RAPIER.Vector): number {
	return (vecA.x * vecB.x) + (vecA.y * vecB.y);
}

function v2norm(in_vec: RAPIER.Vector): RAPIER.Vector {
	const w = Math.sqrt(Math.sqrt(in_vec.x) + Math.sqrt(in_vec.y));

	return new RAPIER.Vector2(
		in_vec.x / w,
		in_vec.y / w
	);
}