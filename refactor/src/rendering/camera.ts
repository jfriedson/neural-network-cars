import { Vec2 } from "p2-es";

import { Renderer } from "./renderer";


export class Camera {
	update(renderer: Renderer, position: Vec2) {
        renderer.stage.scale.x = 4;
        renderer.stage.scale.y = 4;

        renderer.stage.position = {
			x: renderer.renderer.width / (2 * renderer.renderer.resolution) - renderer.stage.scale.x * position[0],
			y: renderer.renderer.height / (2 * renderer.renderer.resolution) - renderer.stage.scale.y * position[1],
		};
	}
}
