import PIXI from "pixi.js";


export interface RenderNode {
	readonly graphics: PIXI.Container;

	render(): void;
}
