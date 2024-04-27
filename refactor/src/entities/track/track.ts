import PIXI from "pixi.js";

import { PhysicalWorld } from "../../physics/physical_world";

import { Checkpoint } from "./checkpoint";
import { Wall } from "./wall";

import silverstone_track from "./data/silverstone.json";


export class Track {
	readonly start: number[];
	readonly walls = new Array<Wall>();
	readonly checkpoints = new Array<Checkpoint>();
	readonly graphics = new PIXI.Graphics({
		zIndex: 1,
	});

	constructor(physicalWorld: PhysicalWorld) {
		this.start = silverstone_track.start;

		this.createCheckpoints(physicalWorld, silverstone_track.chkpts);
		this.createContinuousWalls(physicalWorld, silverstone_track.walls1);
		this.createContinuousWalls(physicalWorld, silverstone_track.walls2);
	}

	private createCheckpoints(physicalWorld: PhysicalWorld, checkpoints: number[][][]) {
		for (const checkpoint of checkpoints) {
			const position_delta = [
				checkpoint[1][0] - checkpoint[0][0],
				checkpoint[1][1] - checkpoint[0][1],
			];
			const length = Math.sqrt(
				position_delta[0]**2 + position_delta[1]**2
			);
			const angle = -Math.atan(position_delta[0] / position_delta[1]);
			const midpoint = [
				checkpoint[0][0] + position_delta[0] / 2,
				checkpoint[0][1] + position_delta[1] / 2,
			];
			this.checkpoints.push(
				new Checkpoint(physicalWorld, midpoint, angle, length)
			);

			this.graphics.moveTo(checkpoint[0][0], checkpoint[0][1]);
			this.graphics.lineTo(checkpoint[1][0], checkpoint[1][1]);
			this.graphics.stroke({
				width: 1,
				color: 0xffff00,
				alpha: 1,
				alignment: 0.5,
				cap: "square",
			});
		}
	}

	private createContinuousWalls(physicalWorld: PhysicalWorld, walls: number[][]) {
		this.graphics.moveTo(walls[0][0], walls[0][1]);
		for (let wall = 1; wall < walls.length; ++wall) {
			const position_delta = [
				walls[wall][0] - walls[wall - 1][0],
				walls[wall][1] - walls[wall - 1][1],
			];
			const length = Math.sqrt(
				position_delta[0]**2 + position_delta[1]**2
			);
			const angle = -Math.atan(position_delta[0] / position_delta[1]);
			const midpoint = [
				walls[wall - 1][0] + position_delta[0] / 2,
				walls[wall - 1][1] + position_delta[1] / 2,
			];

			this.walls.push(new Wall(physicalWorld, midpoint, angle, length));

			this.graphics.lineTo(walls[wall][0], walls[wall][1]);
		}
		this.graphics.stroke({
			width: 1,
			color: 0x0c1e70,
			alpha: 1,
			alignment: 0.5,
			cap: "round",
			join: "round",
		});
	}
}
