// simulation speed toggling
function initSpeedToggle(app) {
    app.renderer.renderer.view.addEventListener('mousedown', app.toggleSimSpeedForwarder.bind(app));
    app.renderer.renderer.view.addEventListener('touchstart', app.toggleSimSpeedForwarder.bind(app));
}

function toggleSimSpeed(app) {
    app.loopControl.sim_fast_speed = !app.loopControl.sim_fast_speed;

    app.loopControl.render.fps = app.loopControl.sim_fast_speed ? app.loopControl.render.fps_fast : app.loopControl.render.fps_normal;
    app.loopControl.phys.iter_per_sec = app.loopControl.sim_fast_speed ? app.loopControl.phys.iter_per_sec_fast : app.loopControl.phys.iter_per_sec_normal;
    app.loopControl.phys.steps_per_iter = app.loopControl.sim_fast_speed ? app.loopControl.phys.steps_per_iter_fast : app.loopControl.phys.steps_per_iter_normal;

    app.loopControl.render.delay = 1000/app.loopControl.render.fps;
    app.loopControl.phys.delay = 1000/app.loopControl.phys.iter_per_sec;
}


// scroll wheel - zoom camera in and out
function setMouseZoomEvent(app) {
    app.renderer.renderer.view.addEventListener('wheel', function (event) {
        event.preventDefault();

        if ((event.deltaX + event.deltaY + event.deltaZ) > 0) {
            if (app.cameraControl.zoom_mod > 1) {
                app.cameraControl.zoom_mod -= 1;
                app.cameraControl.zoom_lerp_alpha = 0;
            }
        }
        else if (app.cameraControl.zoom_mod < 10) {
            app.cameraControl.zoom_mod += 1;
            app.cameraControl.zoom_lerp_alpha = 0;
        }
    });
}


// canvas resizing
function setResizeEvents(app) {
    window.addEventListener('resize', app.canvasResizeForwarder.bind(app));
    window.addEventListener('orientationchange', app.orientationChangeForwarder.bind(app));
}

function canvasResize(app) {
    var w = window.innerWidth;
    var h = window.innerHeight;

    app.renderer.renderer.resize(w, h);

    scale_x = w/1600;
    scale_y = h/900;

    app.cameraControl.zoom_base = (scale_x < scale_y) ? scale_x : scale_y;

    zoom_lerp_alpha = 0;
    renderUpdate(app);
}

function orientationChange(app) {
    window.scrollTo(0, 0);
    canvasResize(app);
    window.scrollTo(0, 0);
    window.scrollTo(0, 0);
}


// reset timers when tab regains focus
function setFocusEvent(app) {
    document.addEventListener("visibilitychange", app.onFocusForwarder.bind(app));
}

function onFocus(e, app) {
    if (document.visibilityState == "visible") {
        app.loopControl.phys.next_time = performance.now();
        app.loopControl.render.next_time = performance.now();
    }
}


// save and load pretrained network
function setCopyLoadEvents(app) {
    window.addEventListener("copy", app.saveNetForwarder.bind(app));
    window.addEventListener("paste", app.loadNetForwarder.bind(app));
    var pretrainedButton = parent.document.getElementById("pretrained");
    if (pretrainedButton !== null)
        pretrainedButton.addEventListener("click", app.loadPretrainedNetForwarder.bind(app));
}

function saveNet(e, app) {
    e.preventDefault();

    const net = app.gen_algo.population[0].net.save();

    console.log(net);
    e.clipboardData.setData('text/plain', net);
}

function loadNet(e, app) {
    e.preventDefault();

    const net_obj = JSON.parse((e.clipboardData || window.clipboardData).getData("text"));

    resetCars(app);

    app.gen_algo.population[0].net.load(net_obj);
    console.log("neural net restored");
}

function loadPretrainedNet(e, app) {
    const net_obj = JSON.parse('{"inputs":13,"hidden_layers":[{"inputs":13,"neurons":[{"weights":[0.3080496466531555,0.9202445118915275,0.6870112947075626,1.1819115520098529,-0.03249122443818066,0.6104326395792529,0.2825410877711758,-0.4737825279193642,1.0674552228304066,0.41897026740915533,-0.8096220103989225,0.7490739609262126,-1.3605657189172387],"bias":-0.17250976732992107},{"weights":[-1.8350847116511486,0.790315383439103,0.48858489200624006,0.39470354164520066,-0.4839445552184249,0.5413658892616161,0.08166463381243183,0.05246174363155309,-0.6027472025229548,-0.48430380257005173,-0.5231388888045876,-0.2160792043660839,0.7058521149305631],"bias":0.3119576922559236},{"weights":[0.6781404778005973,0.35324235690220923,-0.06334445746496617,-0.6110258193362992,0.8780787553881272,-0.5039374515834376,0.3172168870027055,-0.055967015140373944,-0.5550504481345773,-0.010008413265278376,0.4143277880412672,0.8093069950903388,1.3388957592790687],"bias":-0.1886180162590821},{"weights":[-0.45426007744264013,-0.04682520998922798,-0.9091741878290902,-1.083370928299678,-0.24354316474503568,0.3381633453116671,1.3656507851531465,-0.3654135497395189,-0.7934416820936877,0.03945184321617899,-0.6927861099393955,-0.07153561025424261,0.45886579288835777],"bias":0.09590330988877749},{"weights":[-1.181999975032287,-0.5068150811970589,0.8474850235904965,0.3251157318166397,0.5652965742774303,-0.10449863559933137,-0.2372419212265015,-1.0645919714734147,-0.7109523049145144,-0.9627232028704692,-0.6497542167417152,-0.007432592175678668,0.564319516804785],"bias":-0.04604509839238633},{"weights":[0.05825158385393503,0.10127684270480077,-0.6060604656043338,-0.17950432841983616,0.9449946309377802,-0.5006520170099789,0.30690151231253227,0.5951746826051959,-0.40520583742157346,0.3139513431071228,-1.0906858349233393,-0.8982119273552924,0.4588157870195245],"bias":0.9292320987871898},{"weights":[0.3562447368014757,0.3043854983048735,1.0525323638427029,0.33416330754975254,0.22880042153100275,0.05799802593004341,0.5794637546703335,-0.6464960415478253,1.0833601066733503,-1.1148915037354814,-0.3695048360006437,0.04009577028463837,-0.8784482022924676],"bias":0.39084968878278115},{"weights":[-1.124581863526774,0.6350151992419059,0.4240566798054186,-0.6654247950641566,0.8881256938926096,0.15529217451496596,-0.8574151474281151,0.04840154380582545,0.8897218920883265,1.0462070825482168,-0.22015469827944845,0.28994696335208797,-0.007834885619646903],"bias":-0.04639013556264559},{"weights":[-0.7324128380359696,0.655598749830521,0.825194817996159,-0.35491349326358274,0.0008147813256581954,-0.003549862301850712,-0.466406826596361,-0.24917374747757765,-0.23494047712563537,1.0482201945767373,1.2300512347708326,0.632343359315414,-0.6173435750887615],"bias":0.24356672241913974},{"weights":[-0.7346952864132629,0.3349588136812244,0.8111287757388197,-0.21318786413900237,0.2956190568024508,0.7622475634168184,1.2153354049784135,-0.3279427097493991,0.12771755346577168,-1.2236332019054585,0.9276119956317672,0.07561639299213227,0.09317828905290874],"bias":0.1329534400735449}]}],"output_layer":{"inputs":10,"neurons":[{"weights":[0.5040163325421406,-0.6794678284910222,0.0760243632109475,0.04461193601909417,0.3962186942794824,-1.334215904197526,-0.8978597496695676,0.07107800906408518,0.9672489148884394,0.2792320292073663],"bias":0.14268116520654572},{"weights":[0.6067382272234965,0.7656000640394431,-1.2701891478331604,0.3587190912883502,-0.412355621413209,0.001969140333494178,-0.803140700680166,0.27359162153479044,0.6723944827232077,0.21571883419558496],"bias":0},{"weights":[-0.9984549962626804,-1.1000589879367948,-0.0779230567256391,0.05021794531283118,0.16588479839471712,-0.5033579648238424,-0.25017778527016715,-1.122384281044737,0.12954725473703801,-0.29920530124578476],"bias":-0.26954136619775715},{"weights":[-0.8238905130559906,-0.2631043736358033,0.804471360171708,0.7261398132609787,0.699150056528163,-0.3222876389337159,-0.7229702473388813,-1.3263449860541086,-0.5788247399746888,0.24563889855321525],"bias":0.08839047514399866}]}}');

    app.gen_algo.population[0].net.load(net_obj);

    resetCars(app);

    console.log("neural net restored");
}
