import { Task } from "./task";


export class TaskScheduler {
	startTask(task: Task) {
		if (task.timeoutId === null)
			this.taskCallback(task);
	}

	stopTask(task: Task) {
		if (task.timeoutId === null)
			return;

		window.clearTimeout(task.timeoutId);
		task.timeoutId = null;
	}

	private taskCallback(task: Task) {
		const now = performance.now();
		const new_delay = Math.max(task.interval - (now - task.next_time), 0);

		task.timeoutId = window.setTimeout(
			this.taskCallback.bind(this),
			new_delay,
			task
		);

		task.next_time += task.interval;

		task.callback.call(task.object);
	}
}
