import { BeginContactEvent, World } from "p2-es";

import { CollisionSubscriber } from "./collision_subscriber";


export class PhysicalWorld extends World {
	private readonly collisionCallbacks = new Map<
		number,
		CollisionSubscriber
	>();

	constructor() {
		super({
			gravity: [0, 0],
		});

		this.on("beginContact", (event) => {
			this.collisionCallback.bind(this, event);
		});
	}

	private collisionCallback(event: BeginContactEvent) {
		let subscriber = this.collisionCallbacks.get(event.bodyA.id);
		if (subscriber !== undefined)
			subscriber.collisionCallback(event.bodyB);

		subscriber = this.collisionCallbacks.get(event.bodyB.id);
		if (subscriber !== undefined)
			subscriber.collisionCallback(event.bodyA);
	}
}
