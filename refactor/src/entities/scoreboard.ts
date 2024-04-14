import PIXI from "pixi.js";

import { RenderNode } from "../rendering/render_node";


export class Scoreboard implements RenderNode {
	readonly graphics: PIXI.Text;
	private graphicsDirty = false;

	private speedToggleString = "click here to toggle training speed";
	private physicsIpsString = "physics 0ips";
	private renderIpsString = "rendering 0fps";
	private generationString = "Generation 1";
	private leaderboardString = "Leaderboard";
	private readonly leaderboard = Array<string>();

	private readonly perf_tracking = {
		rendering: {
			frame_count: 0,
			prev_frame_count: 0,
			last_update: performance.now(),
		},
		physics: {
			iter_count: 0,
			prev_iter_count: 0,
			last_update: performance.now(),
		},
	};

	constructor() {
		this.graphics = new PIXI.Text({
			text: "",
			style: {
				fontFamily: "Arial",
				fontSize: 30,
				fill: 0xffffff,
				align: "left",
			},
		});

		this.graphics.position = { x: 3, y: 3 };
		this.graphics.scale = 0.15;

		this.buildText();
	}

	render() {
		if (this.graphicsDirty) this.buildText();

		// TODO: scaling and positioning in the future
	}

	private buildText() {
		this.graphics.text =
			this.speedToggleString +
			"\n" +
			this.physicsIpsString +
			"\n" +
			this.renderIpsString +
			"\n\n" +
			this.generationString +
			"\n" +
			this.leaderboardString +
			"\n" +
			this.leaderboard.join("\n");

		this.graphicsDirty = false;
	}

	tickPhysics() {
		const now = performance.now();

		++this.perf_tracking.physics.iter_count;
		if (now - this.perf_tracking.physics.last_update > 1000) {
			this.perf_tracking.physics.last_update = now;

			if (
				this.perf_tracking.physics.iter_count !==
				this.perf_tracking.physics.prev_iter_count
			) {
				this.perf_tracking.physics.prev_iter_count =
					this.perf_tracking.physics.iter_count;

				this.physicsIpsString = `physics ${this.perf_tracking.physics.iter_count}ips`;
				this.graphicsDirty = true;
			}

			this.perf_tracking.physics.iter_count = 0;
		}
	}

	tickRender() {
		const now = performance.now();

		++this.perf_tracking.rendering.frame_count;
		if (now - this.perf_tracking.rendering.last_update > 1000) {
			this.perf_tracking.rendering.last_update = now;

			if (
				this.perf_tracking.rendering.frame_count !==
				this.perf_tracking.rendering.prev_frame_count
			) {
				this.perf_tracking.rendering.prev_frame_count =
					this.perf_tracking.rendering.frame_count;

				this.renderIpsString = `rendering ${this.perf_tracking.rendering.frame_count}fps`;
				this.graphicsDirty = true;
			}

			this.perf_tracking.rendering.frame_count = 0;
		}
	}
}
