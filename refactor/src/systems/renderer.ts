import PIXI from "pixi.js";

import { Renderable } from "../components/renderable";


export class Renderer extends PIXI.Application {
    private readonly renderCallbacks = Array<Renderable>();

    async init() {
        await super.init({
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: 0x444444,
            autoDensity: true,
            resolution: window.devicePixelRatio || 1,
            antialias: true,
            canvas: document.createElement("canvas"),
            resizeTo: window,
            autoStart: false,
        });

        document.body.appendChild(this.renderer.canvas);
    }

    addChild(child: Renderable) {
        this.renderCallbacks.push(child);
        this.stage.addChild(child.graphics);
    }

    render() {
        for (const renderCB of this.renderCallbacks) {
            renderCB.render();
        }

        super.render();
    }
}
