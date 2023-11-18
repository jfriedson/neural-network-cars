const SmartCarApp = class {
    constructor() {
        this.statTrackingVars = {
            start_time : performance.now(),		// used for printing length of time for new records
            sim_steps : 0,						// number of world steps since page load

            // best network achievements - used to adjust the learning rate
            record_chkpts : 0,
            record_chkpts_time : 0,
            record_score : Number.MIN_SAFE_INTEGER,
            record_score_time : 0,

            // used for tracking and printing simulation and frame rates
            sim_times : [],
            render_times : []
        }

        this.cameraVars = {
            camera_target : 0,
            camera_lerp_alpha : 1,
            zoom_base : 0,
            zoom_mod : 18
        }

        // phys and render interval timers
        this.phys_intv = null;
        this.render_intv = null;

        // construct objects physical bodies and render objects
        initRenderer(this);
        initPhysWorld(this);
        initTrackData(this);
        initTrack(this);
        initCars(this)
        initGraph(this);
        initGenAlgo(this);
        initScoreboard(this);
        
        sortGraphics(this);

        initWorldCollisionEvent(this);

        initSpeedToggle(this);

        setMouseZoomEvent(this);
        setResizeEvents(this);
        setCopyLoadEvents(this);

        canvasResize(this);

        setPhysIntv(this);
        setRenderIntv(this);
    }

    // the below callback handlers forward event handling to global methods
    // just for the sake of readability
    toggleSimSpeedForwarder() { toggleSimSpeed(this); }

    canvasResizeForwarder() { canvasResize(this); }
    orientationChangeForwarder() { orientationChange(this); }
    
    saveNetForwarder(e) { saveNet(e, this); }
    loadNetForwarder(e) { loadNet(e, this); }
    loadPretrainedNetForwarder(e) { loadPretrainedNet(e, this); }

    render() { render(this, false); }
    stepPhys(num_steps) { stepPhys(num_steps, this); }
}

new SmartCarApp();
