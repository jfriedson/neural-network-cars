import PIXI from "pixi.js";
import RAPIER from "@dimforge/rapier2d-compat";

import { Renderer } from "../rendering/renderer";
import { RenderNode } from "../rendering/render_node";

import { PhysicalWorld } from "../physics/physical_world";


export class Car implements RenderNode {
	readonly rigidBody: RAPIER.RigidBody;
	readonly graphics: PIXI.Graphics;

	constructor(physicalWorld: PhysicalWorld, renderer: Renderer) {
		const bodyDesc = RAPIER.RigidBodyDesc.dynamic();
		const colliderDesc = RAPIER.ColliderDesc.cuboid(4, 4);

		this.rigidBody = physicalWorld.createRigidBody(bodyDesc);
		physicalWorld.createCollider(colliderDesc, this.rigidBody);

		this.graphics = new PIXI.Graphics().rect(-4, -4, 8, 8).fill(0xad6024);
		renderer.addChild(this);
	}

	render() {
		this.graphics.position = this.rigidBody.translation();
		this.graphics.rotation = this.rigidBody.rotation();
	}
}
