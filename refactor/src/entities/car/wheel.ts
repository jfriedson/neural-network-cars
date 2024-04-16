import PIXI from "pixi.js";
import RAPIER from "@dimforge/rapier2d-compat";

import { LinAlg } from "../../math/lin_alg";

import { Renderer } from "../../rendering/renderer";
import { RenderNode } from "../../rendering/render_node";

import { PhysicalWorld } from "../../physics/physical_world";
import { PhysicalNode } from "../../physics/physical_node";
import { CollisionGroup } from "../../physics/collision_groups";


export class Wheel implements PhysicalNode, RenderNode {
	readonly rigid_body: RAPIER.RigidBody;
	readonly graphics: PIXI.Graphics;

	steering_angle = 0;
	engine_force_mag = 0;
	brake_force = 0;

    constructor(physicalWorld: PhysicalWorld, renderer: Renderer) {
        const bodyDesc = RAPIER.RigidBodyDesc.dynamic();
        const colliderDesc = RAPIER.ColliderDesc.cuboid(2, 1)
            .setCollisionGroups(CollisionGroup.none);
        
		this.rigid_body = physicalWorld.createRigidBody(bodyDesc);
		physicalWorld.createCollider(colliderDesc, this.rigid_body);
		physicalWorld.addNode(this);

		this.graphics = new PIXI.Graphics().rect(-2, -1, 4, 2).fill(0x222222);
		renderer.addChild(this);
    }

	step() {
		this.rigid_body.resetForces(false);
        this.rigid_body.resetTorques(false);
        
        const forward_normal = new RAPIER.Vector2(
			Math.cos(this.rigid_body.rotation()),
			Math.sin(this.rigid_body.rotation())
		);

		const engine_force = LinAlg.v2mul(forward_normal, this.engine_force_mag);
        this.rigid_body.addForce(engine_force, true);
	}

	render() {
		this.graphics.position = this.rigid_body.translation();
		this.graphics.rotation = this.rigid_body.rotation();
	}
}
