import PIXI from "pixi.js";

import { RenderNode } from "./render_node";


export class Renderer extends PIXI.Application {
	private readonly renderCallbacks = Array<RenderNode>();

	async init() {
		await super.init({
			width: window.innerWidth,
			height: window.innerHeight,
			backgroundColor: 0x060f39,
			autoDensity: true,
			resolution: window.devicePixelRatio || 1,
			antialias: true,
			canvas: document.createElement("canvas"),
			resizeTo: window,
		});

		document.body.appendChild(this.renderer.canvas);
	}

	addChild(child: RenderNode) {
		this.renderCallbacks.push(child);
		this.stage.addChild(child.graphics);
	}

	render() {
		for (const renderCB of this.renderCallbacks)
			renderCB.render();

		super.render();
	}
}
