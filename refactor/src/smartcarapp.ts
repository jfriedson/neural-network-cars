import "./style.css";

import { Renderer } from "./rendering/renderer";
import { PhysicalWorld } from "./physics/physical_world";

import { Task } from "./task_scheduling/task";
import { TaskScheduler } from "./task_scheduling/task_scheduler";

import { Car } from "./entities/car";
import { Track } from "./entities/track/track";
import { Scoreboard } from "./rendering/scoreboard";


export class SmartCarApp {
	private readonly renderer = new Renderer();
	private readonly physicalWorld = new PhysicalWorld();

	private readonly scoreboard = new Scoreboard();

	private readonly taskScheduler = new TaskScheduler();
	private readonly renderTask = new Task(this, this.renderLoop, 16);
	private readonly physicsTask = new Task(this, this.physicsLoop, 16);

	private readonly track = new Track(this.physicalWorld);
	private readonly cars = new Array<Car>();

	async init() {
		await this.renderer.init();

		this.renderer.addChild(this.scoreboard);

		this.renderer.stage.addChild(this.track.graphics);

		for (let i = 0; i < 1; i++) {
			const car = new Car(this.physicalWorld, this.renderer);

			this.cars.push(car);
		}
	}

	physicsLoop() {
		this.scoreboard.tickPhysics();
		this.physicalWorld.step(.0167);
	}

	renderLoop() {
		this.scoreboard.tickRender();
		this.renderer.render();
	}

	run() {
		this.taskScheduler.startTask(this.renderTask);
		this.taskScheduler.startTask(this.physicsTask);
	}
}
