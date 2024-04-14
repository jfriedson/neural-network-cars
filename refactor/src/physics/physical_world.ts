import RAPIER from "@dimforge/rapier2d-compat";

import { PhysicalNode } from "./physical_node"


export class PhysicalWorld extends RAPIER.World {
	private readonly stepCallbacks = Array<PhysicalNode>();

	static async init() {
		await RAPIER.init();
	}

	constructor() {
		super({ x: 0, y: 0 });
	}

	addNode(node: PhysicalNode) {
		this.stepCallbacks.push(node);
	}

	step() {
		for (const stepCB of this.stepCallbacks)
			stepCB.step();

		super.step();
	}
}
