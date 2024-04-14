import RAPIER from "@dimforge/rapier2d-compat";


export interface PhysicalNode {
	readonly rigid_body: RAPIER.RigidBody;

	step(): void;
}
