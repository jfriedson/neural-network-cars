const SmartCarApp = class {
    constructor() {
        this.statTrackingVars = {
            start_time : performance.now(),		// used for printing length of time for new records
            sim_steps : 0,						// number of world steps since page load

            // best network achievements - used to adjust the learning rate
            record_chkpts : 0,
            record_chkpts_time : 0,
            record_score : 0,
            record_score_time : 0
        }

        this.cameraVars = {
            camera_target : 0,
            pos_lerp_alpha : 1,
            zoom_lerp_alpha : 1,
            zoom_base : 0,
            zoom_mod : 10
        }

        // looping vars
        this.phys_iter_per_sec = 60;
        this.phys_steps_per_iter = 1;
        this.phys_delay = 1000/this.phys_iter_per_sec;
        this.phys_next_time = 0;
        this.phys_timeout = null;

        this.render_fps = 40;
        this.render_delay = 1000/this.render_fps;
        this.render_next_time = 0;
        this.render_timeout = null;

        // used for tracking and printing loop rates
        this.phys_ips_last_update = 0;
        this.phys_iter_cnt = 0;
        this.render_fps_last_update = 0;
        this.render_frame_cnt = 0;

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
}

new SmartCarApp();
