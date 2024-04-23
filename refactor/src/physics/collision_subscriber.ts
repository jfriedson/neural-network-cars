import { Body } from "p2-es";


export interface CollisionSubscriber {
    collisionCallback(other: Body): void;
}
