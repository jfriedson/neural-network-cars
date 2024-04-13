import PIXI from "pixi.js";


export interface Renderable {
    readonly graphics: PIXI.Graphics;

    render(): void;
}
