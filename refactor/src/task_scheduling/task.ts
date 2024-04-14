export class Task {
	readonly object: object;
	readonly callback: () => void;
	readonly interval: number;
	timeoutId: number | null;

	next_time = performance.now();

	constructor(object: object, callback: () => void, interval: number) {
		this.object = object;
		this.callback = callback;
		this.interval = interval;
		this.timeoutId = null;
	}
}
