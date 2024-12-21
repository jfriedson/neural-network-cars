// simulation speed toggling
function initSpeedToggle(app) {
	app.renderer.renderer.view.addEventListener('mousedown', app.toggleSimSpeedForwarder.bind(app));
	app.renderer.renderer.view.addEventListener('touchstart', app.toggleSimSpeedForwarder.bind(app));
}

function toggleSimSpeed(app) {
	app.loopControl.sim_fast_speed = !app.loopControl.sim_fast_speed;

	
	if (app.loopControl.sim_fast_speed) {
		app.loopControl.render.fps = app.loopControl.render.fps_fast;
		app.loopControl.phys.iter_per_sec = app.loopControl.phys.iter_per_sec_fast;
		app.loopControl.phys.steps_per_iter = app.loopControl.phys.steps_per_iter_fast;
	}
	else {
		app.loopControl.render.fps = app.loopControl.render.fps_normal;
		app.loopControl.phys.iter_per_sec = app.loopControl.phys.iter_per_sec_normal;
		app.loopControl.phys.steps_per_iter = app.loopControl.phys.steps_per_iter_normal;
	}

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
	const net_obj = JSON.parse('{"inputs":13,"hidden_layers":[{"inputs":13,"neurons":[{"weights":[-0.6984161728340766,-0.7810631280676641,0.2530888744421712,-0.13378256050062534,0.5177316439882242,-0.7564933541173734,-0.3541049217225144,-0.5103648296673807,0.47256303641166697,-0.26253575714675964,0.5187514054426065,0.7223455551031934,0.17395721053534252],"bias":0.01978907035312892},{"weights":[0.711356580077158,0.6784717891109663,0.706701237667409,0.3208944097832531,0.002885736009986574,-0.044425968818985744,-0.10965755038343893,-0.7545795492679533,-0.748063696368015,0.9373376711408895,-0.22892286670131426,0.7893793013316255,-0.7897878544321401],"bias":0.026184204627055147},{"weights":[0.6031495926769432,-0.7068906243805708,1.1075258151338032,-0.475179839466309,0.7943554313369585,-0.6164116350555734,-0.8734420596067618,0.3781359146154613,0.8795537686790451,0.08283756675129231,0.5297485381389655,-0.5518716075141943,0.6018391143436551],"bias":0.14079874924987132},{"weights":[0.44851775892400614,-0.07734187222508639,-0.34926205083547723,0.047848168739909346,0.43348389961764167,-0.49818959843503846,0.559145055873876,-0.4750067079696094,-0.44226110830021,0.20823103902717993,1.0935775514434642,0.2476300756284567,1.3029579176985666],"bias":0.4043956634422122},{"weights":[0.11725339929331426,-0.5348960381339755,-0.6050438899381069,0.9648157538654277,-1.0119078644902488,0.9920341553861491,0.8349359220025017,0.012037373351453662,-0.5158563923953885,0.663135327706495,-0.9245065639020511,0.8023045074901076,-0.24317949573502765],"bias":-0.010432603384118819},{"weights":[0.3982556655052803,-0.2759675509727877,0.13307190783326578,0.9528216429206268,-0.5046949316144521,-0.4341593146941926,0.675095137344859,0.6613026316990754,-0.5495965906878493,-0.3285332599596587,-0.36778104042336474,-0.6448402882807109,0.8855999072270162],"bias":0.103714459263491},{"weights":[0.5415519571840652,0.04463438458247522,-0.20424857558970447,-1.073472146832374,0.2380056199633287,-0.747919493960704,-0.3197649349275946,1.3469803059095353,0.6895231003779637,0.20822181009606078,0.8370079829438529,0.5132589869250006,-0.24551366172189987],"bias":0.04270212503610026},{"weights":[-0.8001946825460509,0.8281088951013486,-0.11779128712755901,0.8068386336866316,0.4988577499118223,-0.08263098272404085,0.737411423707717,0.6716107958838422,0.3663435153844735,1.19335804461109,0.950940848187608,-0.2582649506991139,-0.3053730460015024],"bias":0.1283667561577173},{"weights":[0.1489642782547081,-0.21748582509007489,0.4120917339775091,-0.6325034126606568,-0.18411306222250073,-0.43800888416458716,-0.3228492540576606,-0.6770047666418164,-0.12102251352315715,0.47466243387039064,0.8718566573825453,0.5544848347769218,-0.3464609699343192],"bias":0.45954417267992514},{"weights":[0.5797994495736921,-0.09305095421407539,0.8664863968134507,0.624317274592064,1.0026610145015693,0.20561917275310343,-0.752995633080875,-0.5632621315380938,-0.2661986357209281,-0.23764896269877556,-0.2861270726170216,-0.5595803774063886,-0.27848596996469044],"bias":0.025183950939679733}]}],"output_layer":{"inputs":10,"neurons":[{"weights":[-0.29201334123771255,0.5211555507009313,-0.41238741998268064,0.7916622327725352,-0.565443006948975,-0.8211053181896899,-0.1200752782460536,-0.1567465847687176,-0.08783837032675933,-0.10719195228132514],"bias":0.2115243459532687},{"weights":[0.9090289662832514,-0.5501978632302987,-0.1499993442540188,-0.4267108790199249,0.8469816250091554,-0.20079718432074664,-0.11899981664701231,0.5265326046089075,0.61581591995187,-0.4210759151304916],"bias":0.0641428286918146},{"weights":[0.43934185976512613,-0.6093603055009432,-0.34330010573905834,-0.37973905497524707,0.23327411666446668,-0.678318522715793,0.07939086883853927,-0.08892662981854155,-1.168206472180363,0.7361884153339144],"bias":0.15520883890220255},{"weights":[0.16832549362923577,0.08069284117056505,0.4921016526439384,-0.11955289276503761,0.43970033781115775,0.875745557268548,-0.5865300327627609,-0.7991813607460875,0.2620865655990099,-0.4438864562002211],"bias":-0.02679125177620715}]}}');

	app.gen_algo.population[0].net.load(net_obj);

	resetCars(app);

	console.log("neural net restored");
}
