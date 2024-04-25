import "./style.css";

import { Renderer } from "./rendering/renderer";
import { PhysicalWorld } from "./physics/physical_world";

import { Task } from "./task_scheduling/task";
import { TaskScheduler } from "./task_scheduling/task_scheduler";


import { Camera } from "./rendering/camera";
import { Scoreboard } from "./rendering/scoreboard";

import { Car } from "./entities/car";
import { Track } from "./entities/track/track";


export class SmartCarApp {
	private readonly renderer = new Renderer();
	private readonly physicalWorld = new PhysicalWorld();

	private readonly taskScheduler = new TaskScheduler();
	private readonly renderTask = new Task(this, this.renderLoop, 16);
	private readonly physicsTask = new Task(this, this.physicsLoop, 16);

	private readonly camera = new Camera();
	private readonly scoreboard = new Scoreboard();

	private readonly track = new Track(this.physicalWorld);
	private readonly cars = new Array<Car>();

	async init() {
		await this.renderer.init();

		this.renderer.addChild(this.scoreboard);

		this.renderer.stage.addChild(this.track.graphics);

		for (let i = 0; i < 1; i++) {
			const car = new Car(this.physicalWorld, this.renderer);
			car.chassisBody.position = this.track.start.slice(0, 2);
			car.chassisBody.angle = this.track.start[2];

			this.cars.push(car);
		}
	}

	physicsLoop() {
		for (const car of this.cars)
			car.step(this.physicalWorld);

		this.scoreboard.tickPhysics();
		this.physicalWorld.step(0.02);
	}

	renderLoop() {
		this.camera.update(this.renderer, this.cars[0]!.chassisBody.position);

		this.scoreboard.tickRender();
		this.renderer.render();
	}

	run() {
		this.taskScheduler.startTask(this.renderTask);
		this.taskScheduler.startTask(this.physicsTask);
	}
}
