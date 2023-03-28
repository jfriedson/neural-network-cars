const SmartCarApp = class {
	constructor() {
		this.statTrackingVars = {
			start_time : performance.now(),		// used for printing length of time for new records
			sim_steps : 0,						// number of world steps since page load

			// best network achievements - used to adjust the learning rate
			record_chkpts : 0,
			record_chkpts_time : 0,
			record_score : 0,
			record_score_time : 0,

			// used for tracking and printing simulation and frame rates
			sim_times : [],
			render_times : []
		}

		// world and render interval timers
		this.sim_step_intv = null;
		this.animate_intv = null;

		// construct objects physical bodies and render objects
		initRenderer(this);
		initPhysWorld(this);
		initTrackData(this);
		initTrack(this);
		initCars(this)
		initGraph(this);
		initGenAlgo(this);
		initScoreboard(this);

		initWorldCollisionEvent(this);

		initSpeedToggle(this);

		setMouseZoomEvent(this);
		setResizeEvents(this);
		setCopyLoadEvents(this);

		canvasResize(this);

		setStepIntv(this);
		setAnimIntv(this);
	}

	// the below callback handlers forward event handling to global methods
	// just for the sake of readability
	toggleSimSpeedForwarder() { toggleSimSpeed(this); }

	canvasResizeForwarder() { canvasResize(this); }
	orientationChangeForwarder() { orientationChange(this); }
	
	saveNetForwarder(e) { saveNet(e, this); }
	loadNetForwarder(e) { loadNet(e, this); }
	loadPretrainedNetForwarder(e) { loadPretrainedNet(e, this); }

	stepAnimation() { animate(this, false); }
	stepPhysWorld(num_steps) { simStep(num_steps, this); }
}

new SmartCarApp();
