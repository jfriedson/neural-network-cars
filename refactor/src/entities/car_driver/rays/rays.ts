import PIXI from "pixi.js";
import { vec2 } from "p2-es";

import { Renderer } from "../../../rendering/renderer";
import { RenderNode } from "../../../rendering/render_node";

import { PhysicalWorld } from "../../../physics/physical_world";

import { Car } from "../../car";
import { Ray } from "./ray";


export class Rays implements RenderNode {
    readonly graphics = new PIXI.Graphics();
    private readonly car: Car;
	private readonly rays = new Array<Ray>();

    constructor(renderer: Renderer, car: Car) {
        this.car = car;

		this.rays.push(new Ray(40, -1.3962634016));
		this.rays.push(new Ray(60, -0.6981317008));
		this.rays.push(new Ray(80, -0.3490658504));
		this.rays.push(new Ray(100, 0));
		this.rays.push(new Ray(80, 0.3490658504));
		this.rays.push(new Ray(60, 0.6981317008));
		this.rays.push(new Ray(40, 1.3962634016));

        this.graphics.zIndex = 2;
        renderer.addChild(this);
    }
    
    step(physicalWorld: PhysicalWorld) {
        for (const ray of this.rays)
            ray.step(physicalWorld, this.car);
    }

	render() {
        this.graphics.clear();

        for (const ray of this.rays) {
            let hitPoint = vec2.create();
			ray.cast_result.getHitPoint(hitPoint, ray.physical);
            this.graphics.moveTo(
				this.car.chassisBody.position[0],
				this.car.chassisBody.position[1]
			);
            this.graphics.lineTo(hitPoint[0], hitPoint[1]);
            this.graphics.stroke({
				width: 0.25,
				color: 0xff0000,
				alpha: 1,
				alignment: 0.5,
				cap: "round",
			});
        }
	}
}
