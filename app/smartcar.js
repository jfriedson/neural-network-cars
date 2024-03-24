const SmartCarApp = class {
	constructor() {
		this.timeTracking = {
			start_time: 0, // used for printing length of time for new records
			sim_steps: 0 // number of world steps since page load
		};

		this.recordKeeping = {
			chkpts: 0,
			chkpts_time: 0,
			score: 0,
			score_time: 0
		};

		this.cameraControl = {
			camera_target: 0,
			pos_lerp_alpha: 1,
			zoom_lerp_alpha: 1,
			zoom_base: 0,
			zoom_mod: 10
		};

		this.constant = {
			sim: {
				time_limit: 7,
				car_amt: 30,
				champions: 3
			},
			learningAlgo: {
				phys_step_per_infer: 10
			},
			neuralNet: {
				input_cnt: 13,
				output_cnt: 4,
				hidden_layers: 1,
				hidden_neurons: 10
			},
			carControl: {
				max_steer: 0.53,
				max_forward_accel: 12,
				max_reverse_accel: 5,
				max_std_brake: 15,
				max_e_brake: 8
			},
		};

		this.loopControl = {
			sim_fast_speed: false,

			phys: {
				iter_per_sec_normal: 60,
				steps_per_iter_normal: 1,
				iter_per_sec_fast: 100,
				steps_per_iter_fast: 10,
				iter_per_sec: 60,
				steps_per_iter: 1,
				delay: 1000 / 60,
				next_time: performance.now(),
				timeout: null,
				ips_last_update: 0,
				iter_cnt: 0
			},

			render: {
				fps_normal: 60,
				fps_fast: 30,
				fps: 60,
				delay: 1000 / 60,
				next_time: performance.now(),
				timeout: null,
				fps_last_update: 0,
				frame_cnt: 0
			},
		};

		// construct objects physical bodies and render objects
		initRenderer(this);
		initPhysWorld(this);
		initTrackData(this);
		initTrack(this);
		initCars(this);
		initGraph(this);
		initGenAlgo(this);
		initScoreboard(this);

		sortGraphics(this);

		initWorldCollisionEvent(this);

		initSpeedToggle(this);

		setMouseZoomEvent(this);
		setResizeEvents(this);
		setCopyLoadEvents(this);
		setFocusEvent(this);

		canvasResize(this);

		this.stepPhys(this.phys_steps_per_iter);
		this.render();
	}

	// the below callback handlers forward event handling to global methods
	// just for the sake of readability
	toggleSimSpeedForwarder() { toggleSimSpeed(this); }

	canvasResizeForwarder() { canvasResize(this); }
	orientationChangeForwarder() { orientationChange(this); }
	onFocusForwarder(e) { onFocus(e, this); }

	saveNetForwarder(e) { saveNet(e, this); }
	loadNetForwarder(e) { loadNet(e, this); }
	loadPretrainedNetForwarder(e) { loadPretrainedNet(e, this); }

	render() { render(this, true, false); }
	stepPhys(num_steps) { stepPhys(num_steps, this); }
};

new SmartCarApp();
