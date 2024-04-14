import RAPIER from "@dimforge/rapier2d-compat";


export class PhysicalWorld extends RAPIER.World {
	static async init() {
		await RAPIER.init();
	}

	constructor() {
		super({ x: 0, y: 50 });
	}
}
