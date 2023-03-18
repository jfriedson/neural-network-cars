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
		this.renderer = initRenderer();
		this.phys_world = initPhysWorld();
		this.track_data = initTrackData();
		this.track = initTrack(this.track_data, this.phys_world, this.renderer);
		this.cars = initCars(this.track_data, this.phys_world, this.renderer)
		this.graph = initGraph(this.renderer);
		this.gen_algo = initGenAlgo();
		this.scoreboard = initScoreboard(this.renderer);

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

	stepAnimation() { animate(this); }
	stepPhysWorld(num_steps) { simStep(num_steps, this); }
}

new SmartCarApp();



// 12 inputs: 7 rays, car speed, steerings angle, gas throttle, standard and emergency brakes
// 4 outputs: steerings angle, gas throttle, standard brakes pressure, handbrake pressure
// every car has a NN + score (# of chkpts, time between each chkpt)
// the genetical algo does mutation+crossover of NNs based on score; reset cars
function NetForward(idx, input, cars, gen_algo) {
	const output = gen_algo.infer(idx, input);

	cars[idx].prevOutputs = output;

	cars[idx].frontWheel.steerValue = ((2*car_max_steer) * output[0] - car_max_steer);
	cars[idx].backWheel.engineForce = ((car_max_forward_accel + car_max_reverse_accel) * output[1] - car_max_reverse_accel);

	cars[idx].frontWheel.setBrakeForce(car_max_std_brake * output[2]);
	cars[idx].backWheel.setBrakeForce((car_max_std_brake * .8) * output[2] + (car_max_e_brake * output[3]));
}

function initWorldCollisionEvent(app) {
	app.phys_world.on('impact', function(event) {
		var car, obj;

		// cars have mass of 0.8, walls and checkpoints are 0.0
		if(event.bodyA.mass == 0.8) {
			car = event.bodyA;
			obj = event.bodyB;
		}
		else {
			car = event.bodyB;
			obj = event.bodyA;
		}

		var c = 0;
		for(c in app.cars)
			if (app.cars[c].body.id == car.id)
				break;

		// check if checkpoint collision, otherwise assume wall collision
		var get_pt = false;
		for (const cp in app.track.chkpts)
			if (obj.id == app.track.chkpts[cp].id) {
				get_pt = true;
				break;
			}

		// checkpoint
		if(get_pt  &&  app.cars[c].score.chkpts == obj.id - 1  &&  app.cars[c].score.racing) {
			++app.cars[c].score.chkpts;
			app.cars[c].score.times.push(app.statTrackingVars.sim_steps);
			app.cars[c].score.score += 100;

			// reward for time after for first 2 checkpoints and after 9th ckpt to improve turning
			if (app.statTrackingVars.record_chkpts <= 2 || app.statTrackingVars.record_chkpts >= 8)
				app.cars[c].score.score += time_limit - (app.cars[c].score.times[app.cars[c].score.times.length-1] - app.cars[c].score.times[app.cars[c].score.times.length-2])/m_sim_world_fps;
		}
		// wall
		else {
			if(!get_pt && app.cars[c].score.racing) {
				if(score_by_dist  &&  1 <= app.cars[c].score.chkpts  &&  app.cars[c].score.chkpts <= 8)
					app.cars[c].score.score += (app.cars[c].body.position[0] > app.track.chkpts[app.cars[c].score.chkpts-1].position[0] ? 1 : -1) * Math.sqrt((app.cars[c].body.position[0] - app.track.chkpts[app.cars[c].score.chkpts-1].position[0])**2 + (app.cars[c].body.position[1] - app.track.chkpts[app.cars[c].score.chkpts-1].position[1])**2);

				app.cars[c].score.racing = false;
				app.gen_algo.SetGenomeFitness(c, app.cars[c].score.score);

				app.cars[c].frontWheel.steerValue = 1.57;
				app.cars[c].body.angularVelocity = (2 * Math.random() - 1) * app.cars[c].body.velocity[0] * app.cars[c].body.velocity[1] / 10;
			}
		}
	});
}

function resetCars(app) {
	for (c in app.cars) {
		app.cars[c].score = {racing: true, chkpts : 0, times : [app.statTrackingVars.sim_steps], score : 0};
		app.cars[c].body.position = [app.track_data.start[0], app.track_data.start[1] + Math.random() * 10 - 5];
		app.cars[c].body.angle = app.track_data.start[2];
		app.cars[c].body.setZeroForce();
		app.cars[c].body.velocity = [0,0];
		app.cars[c].body.angularVelocity = 0;

		app.cars[c].prevOutputs[0] = 0.5;
		app.cars[c].prevOutputs[1] = 0;
		app.cars[c].prevOutputs[2] = 0;
		app.cars[c].prevOutputs[3] = 0;
	}
}

function simStep(num_steps, app) {
	for(var s = 0; s < num_steps; ++s) {
		const now = performance.now();
		while (app.statTrackingVars.sim_times.length > 0 && app.statTrackingVars.sim_times[0] <= now - 1000)
			app.statTrackingVars.sim_times.shift();
		app.statTrackingVars.sim_times.push(now);
		var text = app.scoreboard.text.split("\n");
		text[1] = "world " + app.statTrackingVars.sim_times.length.toString() + "fps";
		app.scoreboard.text = text.join("\n");

		var racing = 0;
		for(const c in app.cars) {
			// check if car reached the checkpoint time limit
			if((app.statTrackingVars.sim_steps - app.cars[c].score.times[app.cars[c].score.times.length-1])/m_sim_world_fps >= time_limit) {
				if(app.cars[c].score.racing) {
					if(score_by_dist) {
						if(1 <= app.cars[c].score.chkpts)
						app.cars[c].score.score += (app.cars[c].body.position[0] > app.track.chkpts[app.cars[c].score.chkpts-1].position[0] ? 1 : -1) * Math.sqrt((app.cars[c].body.position[0] - app.track.chkpts[app.cars[c].score.chkpts-1].position[0])**2 + (app.cars[c].body.position[1] - app.track.chkpts[app.cars[c].score.chkpts-1].position[1])**2);
						else {
							sc = 40 - Math.sqrt((app.cars[c].body.position[0] - app.track.chkpts[0].position[0])**2 + (app.cars[c].body.position[1] - app.track.chkpts[0].position[1])**2);
							if(sc > 0)
								app.cars[c].score.score += sc;
						}
					}

					app.cars[c].score.racing = false;
					app.gen_algo.SetGenomeFitness(c, app.cars[c].score.score);

					app.cars[c].body.angularVelocity = (2 * Math.random() - 1) * app.cars[c].body.velocity[0] * app.cars[c].body.velocity[1] / 20;
				}
			}

			if(app.cars[c].score.racing) {
				var input = [];
				input.push( Math.sqrt(app.cars[c].body.velocity[0]**2 + app.cars[c].body.velocity[1]**2) / 50 );  // car speed
				input.push(app.cars[c].prevOutputs[0]);  // steering angle
				input.push(app.cars[c].prevOutputs[1]);  // gas throttle
				input.push(app.cars[c].prevOutputs[2]);  // standard brake
				input.push(app.cars[c].prevOutputs[3]);  // e-brake

				// 7 distance rays
				for(var i = 0; i < 7; ++i) {
					app.cars[c].rays[i].phys_world.from = app.cars[c].body.position;
					app.cars[c].rays[i].phys_world.to = [app.cars[c].body.position[0] - Math.sin(app.cars[c].body.angle + app.cars[c].rays[i].angle) * app.cars[c].rays[i].length,
														 app.cars[c].body.position[1] + Math.cos(app.cars[c].body.angle + app.cars[c].rays[i].angle) * app.cars[c].rays[i].length];
					app.cars[c].rays[i].phys_world.update();

					app.cars[c].rays[i].result.reset();
					app.phys_world.raycast(app.cars[c].rays[i].result, app.cars[c].rays[i].phys_world);

					const ray_dist = (app.cars[c].rays[i].result.fraction == -1) ? 1 : app.cars[c].rays[i].result.fraction;

					input.push(ray_dist);
				}

				NetForward(c, input, app.cars, app.gen_algo);
				++racing;
			}
			else {
				app.cars[c].frontWheel.setBrakeForce(3);
				app.cars[c].backWheel.setBrakeForce(5);
				app.cars[c].frontWheel.steerValue = 1.57;
				app.cars[c].backWheel.engineForce = 0;
			}
		}

		// if all cars in a failure condition, reset track and NNs
		if(racing == 0) {
			m_mutation_chance = Math.min(Math.max(.05, m_mutation_chance - (app.gen_algo.generation/10000) + (app.statTrackingVars.record_score_time/10000) + (app.statTrackingVars.record_chkpts_time/10000)), .3)
			m_learning_rate = Math.min(Math.max(.05, m_learning_rate - (app.gen_algo.generation/10000) + (app.statTrackingVars.record_score_time/10000) + (app.statTrackingVars.record_chkpts_time/10000)), .25)

			app.gen_algo.BreedPopulation();

			var best_score = 0,
				best_chkpt = 0;
			for (c in app.cars) {
				if(app.cars[c].score.score > best_score) {
					best_score = app.cars[c].score.score;
					best_chkpt = app.cars[c].score.chkpts;
				}

				resetCars(app);
			}

			if(best_score > app.statTrackingVars.record_score) {
				app.statTrackingVars.record_score = best_score;
				app.statTrackingVars.record_score_time = 0;

				if(best_chkpt > app.statTrackingVars.record_chkpts) {
					app.statTrackingVars.record_chkpts = best_chkpt;
					app.statTrackingVars.record_chkpts_time = 0;
				}
				else
					app.statTrackingVars.record_chkpts_time++;

				var time_diff = performance.now() - app.statTrackingVars.start_time;
				console.log("New record of " + app.statTrackingVars.record_score.toFixed(3) + " in gen " + (app.gen_algo.generation-1) + " at " + Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric'}).format(Date.now()) + " after " + Math.floor(time_diff/1440000) + "h " + Math.floor(time_diff/60000)%60 + "m " + Math.floor(time_diff/1000)%60 + "s");
				if (text.length == 11) {
					for(var i = 6; i < 11; ++i)
						text[i] = text[i+1];

					text[text.length-1] = app.statTrackingVars.record_score.toFixed(3) + " at gen " + (app.gen_algo.generation - 1);
				}
				else
					text.push(app.statTrackingVars.record_score.toFixed(3) + " at gen " + (app.gen_algo.generation-1));
			}
			else {
				app.statTrackingVars.record_score_time++;
				app.statTrackingVars.record_chkpts_time++;
			}

			//var text = scoreboard.text.split("\n");
			text[4] = "Generation " + app.gen_algo.generation;
			app.scoreboard.text = text.join("\n");
		}

		++app.statTrackingVars.sim_steps;
		app.phys_world.step(m_sim_step);
	}
};

function setStepIntv(app) {
	clearInterval(app.sim_step_intv);

	const m_sim_delay = 1000/m_sim_intv_fps;

	if (m_sim_intv_fps == 60)
		app.sim_step_intv = setInterval(app.stepPhysWorld.bind(app, 1), m_sim_delay);
	else
		app.sim_step_intv = setInterval(app.stepPhysWorld.bind(app, 10), m_sim_delay*10);
}


function animate(app) {
	const now = performance.now();
	while (app.statTrackingVars.render_times.length > 0 && app.statTrackingVars.render_times[0] <= now - 1000)
		app.statTrackingVars.render_times.shift();
	app.statTrackingVars.render_times.push(now);
	var text = app.scoreboard.text.split("\n");
	text[2] = "renderer " + app.statTrackingVars.render_times.length.toString() + "fps";
	app.scoreboard.text = text.join("\n");

	for(const c in app.cars) {
		app.cars[c].graphics.position.x = app.cars[c].body.position[0];
		app.cars[c].graphics.position.y = app.cars[c].body.position[1];
		app.cars[c].graphics.rotation   = app.cars[c].body.angle;

		for(var i = 0; i < 7; ++i) {
			app.cars[c].rays[i].graphic.clear();
			if(app.cars[c].score.racing) {
				if( app.cars[c].rays[i].result.hasHit() ) {
					var hitPoint = p2.vec2.create();
					app.cars[c].rays[i].result.getHitPoint(hitPoint, app.cars[c].rays[i].phys_world);
					app.cars[c].rays[i].graphic.lineStyle(.25, 0xff0000, 1, .5, false);
					app.cars[c].rays[i].graphic.moveTo(app.cars[c].body.position[0], app.cars[c].body.position[1]);
					app.cars[c].rays[i].graphic.lineTo(hitPoint[0], hitPoint[1]);
				}
				else {
					app.cars[c].rays[i].graphic.lineStyle(.25, 0xff0000, 1, .5, false);
					app.cars[c].rays[i].graphic.moveTo(app.cars[c].body.position[0], app.cars[c].body.position[1]);
					app.cars[c].rays[i].graphic.lineTo(app.cars[c].body.position[0] - Math.sin(app.cars[c].body.angle + app.cars[c].rays[i].angle) * app.cars[c].rays[i].length,
														app.cars[c].body.position[1] + Math.cos(app.cars[c].body.angle + app.cars[c].rays[i].angle) * app.cars[c].rays[i].length);
				}
			}
		}
	}

	// scoreboard
	var best_score = 0,
		best_car = 0;
	for (const c in app.cars) {
		if (app.cars[c].score.racing && app.cars[c].score.score > best_score) {
			best_score = app.cars[c].score.score;
			best_car = c;
		}
	}

	// scoreboard and graph positioning
	const car_pos_x = app.renderer.renderer.width/(2 * app.renderer.renderer.resolution) - app.renderer.stage.scale.x * app.cars[best_car].graphics.position.x,
		 car_pos_y = app.renderer.renderer.height/(2 * app.renderer.renderer.resolution) - app.renderer.stage.scale.y * app.cars[best_car].graphics.position.y;
	if (Math.abs(car_pos_x - app.renderer.stage.position.x) + Math.abs(car_pos_y - app.renderer.stage.position.y) > 150) {
		app.renderer.stage.position.x += (car_pos_x - app.renderer.stage.position.x)/(m_render_fps/3);
		app.renderer.stage.position.y += (car_pos_y - app.renderer.stage.position.y)/(m_render_fps/3);
	}
	else {
		app.renderer.stage.position.x = car_pos_x;
		app.renderer.stage.position.y = car_pos_y;
	}

	app.scoreboard.x =  (app.renderer.renderer.width/(2 * app.renderer.renderer.resolution) - app.renderer.stage.position.x)/app.renderer.stage.scale.x - 780/zoom;
	app.scoreboard.y = (app.renderer.renderer.height/(2 * app.renderer.renderer.resolution) - app.renderer.stage.position.y)/app.renderer.stage.scale.y + 430/zoom;
	app.scoreboard.scale.x = 1/zoom;
	app.scoreboard.scale.y = -1/zoom;

	app.graph.text.x =  (app.renderer.renderer.width/(2 * app.renderer.renderer.resolution) - app.renderer.stage.position.x)/app.renderer.stage.scale.x + 240/zoom;
	app.graph.text.y = (app.renderer.renderer.height/(2 * app.renderer.renderer.resolution) - app.renderer.stage.position.y)/app.renderer.stage.scale.y + 430/zoom;
	app.graph.text.scale.x = 1/zoom;
	app.graph.text.scale.y = -1/zoom;

	app.graph.graphics.x =  (app.renderer.renderer.width/(2 * app.renderer.renderer.resolution) - app.renderer.stage.position.x)/app.renderer.stage.scale.x + 240/zoom;
	app.graph.graphics.y = (app.renderer.renderer.height/(2 * app.renderer.renderer.resolution) - app.renderer.stage.position.y)/app.renderer.stage.scale.y + 390/zoom;
	app.graph.graphics.scale.x = 1/zoom;
	app.graph.graphics.scale.y = -1/zoom;


	// neural network graph - draw best performing car neural network activations
	app.graph.graphics.clear();

	// draw lines between neurons
	// graph.lineStyle(.25, 0xff0000, 1, .5, false);
	// graph.moveTo(cars[c].body.position[0], cars[c].body.position[1]);
	// graph.lineTo(hitPoint[0], hitPoint[1]);

	var input = [];
	input.push(Math.sqrt(app.cars[best_car].body.velocity[0]**2 + app.cars[best_car].body.velocity[1]**2) / 50);
	for(var i = 0; i < 4; ++i)
		input.push(app.cars[best_car].prevOutputs[i]);
	for(var i = 0; i < 7; ++i) {
		const ray_dist = (app.cars[best_car].rays[i].result.fraction == -1) ? 1 : app.cars[best_car].rays[i].result.fraction;
		input.push(ray_dist);
	}


	app.graph.graphics.lineStyle(0, 0, 0, .5, false);
	for(const i in input) {
		//graph.lineStyle(2, 0x000000, 1, .5, false);
		const gray = 0xff * Math.min(Math.max(0, input[i]), 1);
		app.graph.graphics.beginFill((gray << 24) + (gray << 16) + gray, 1);
		app.graph.graphics.drawCircle(5, 15 + i * 30, 10);
		app.graph.graphics.endFill();
	}

	const best_net = app.gen_algo.population[best_car].net;
	// for(const hl in m_hidden_layers) {
	// 	//graph.lineStyle(2, 0x000000, 1, .5, false);
	// 	const gray = 0xff * input[i];
	// 	graph.beginFill((gray << 24) + (gray << 16) + gray, 1);
	// 	graph.drawCircle(5, 15 + i * 30, 10);
	// 	graph.endFill();
	// }

	app.renderer.renderer.render(app.renderer.stage);
}

function setAnimIntv(app) {
	clearInterval(app.animate_intv);

	const m_render_delay = 1000/m_render_fps;

	app.animate_intv = setInterval(app.stepAnimation.bind(app), m_render_delay);
}


// on page load and resize events, used to immediately draw something to the screen
// in order to eliminate empty screen space
function renderUpdate(app) {
	animate(app);
	
	var best_score = 0,
		best_car = 0;
	for (const s in app.cars) {
		if (app.cars[s].score.score > best_score && app.cars[s].score.racing) {
			best_score = app.cars[s].score.score;
			best_car = s;
		}
	}

	app.renderer.stage.position.x =  app.renderer.renderer.width/(2 * app.renderer.renderer.resolution) - app.renderer.stage.scale.x * app.cars[best_car].graphics.position.x;
	app.renderer.stage.position.y = app.renderer.renderer.height/(2 * app.renderer.renderer.resolution) - app.renderer.stage.scale.y * app.cars[best_car].graphics.position.y;

	app.scoreboard.x = app.cars[best_car].graphics.position.x - 780/zoom;
	app.scoreboard.y = app.cars[best_car].graphics.position.y + 430/zoom;
	app.scoreboard.scale.x = 1/zoom;
	app.scoreboard.scale.y = -1/zoom;

	app.graph.text.x =  (app.renderer.renderer.width/(2 * app.renderer.renderer.resolution) - app.renderer.stage.position.x)/app.renderer.stage.scale.x + 240/zoom;
	app.graph.text.y = (app.renderer.renderer.height/(2 * app.renderer.renderer.resolution) - app.renderer.stage.position.y)/app.renderer.stage.scale.y + 430/zoom;
	app.graph.text.scale.x = 1/zoom;
	app.graph.text.scale.y = -1/zoom;

	app.graph.graphics.x =  (app.renderer.renderer.width/(2 * app.renderer.renderer.resolution) - app.renderer.stage.position.x)/app.renderer.stage.scale.x + 240/zoom;
	app.graph.graphics.y = (app.renderer.renderer.height/(2 * app.renderer.renderer.resolution) - app.renderer.stage.position.y)/app.renderer.stage.scale.y + 390/zoom;
	app.graph.graphics.scale.x = 1/zoom;
	app.graph.graphics.scale.y = -1/zoom;
}


/***** Initialize simulation objects and event callbacks *****/

function initRenderer() {
	PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.LINEAR;
	const renderer = new PIXI.Application({ width: 1600, height: 900, backgroundColor: 0x060f39, autoDensity: true, resolution: window.devicePixelRatio||1 });

	document.body.appendChild(renderer.renderer.view);
	renderer.renderer.view.oncontextmenu = function (e) {
		e.preventDefault();
	};

	return renderer;
}

function initPhysWorld() {
	var phys_world = new p2.World({gravity : [0,0]});

	phys_world.collisionGroups = class {
		static TRACK = Math.pow(2, 1);
		static CHKPT = Math.pow(2, 2);
		static CAR   = Math.pow(2, 3);
	}

	return phys_world;
}

function initTrackData() {
	const silverstone_reverse = {start : [-10,-50, 0],
		walls1 : [[0,0],[0,-279],[2,-294],[8,-310],[15,-320],[25,-329],[40,-336],[74,-347],[130,-358],[171,-362],[198,-365],[338,-359],[353,-361],[366,-363],[392,-373],[412,-382],[425,-385],[434,-384],[442,-381],[509,-353],[521,-349],[532,-350],[544,-351],[556,-355],[568,-363],[582,-372],[593,-378],[614,-380],[624,-379],[634,-374],[644,-367],[652,-357],[664,-339],[672,-315],[678,-306],[686,-293],[701,-281],[1076,-32],[1113,-2],[1131,17],[1141,34],[1143,41],[1145,58],[1143,70],[1137,85],[1126,99],[1114,108],[1097,115],[1065,126],[1038,141],[1012,159],[998,170],[985,182],[972,193],[964,196],[957,198],[907,228],[900,238],[899,248],[901,254],[914,272],[920,289],[915,299],[894,319],[868,333],[836,343],[821,342],[811,337],[561,111],[553,98],[550,87],[549,72],[551,61],[567,-8],[568,-23],[568,-41],[564,-61],[555,-82],[485,-187],[481,-195],[481,-202],[487,-212],[494,-217],[507,-219],[559,-230],[567,-234],[572,-243],[573,-251],[568,-259],[542,-275],[517,-284],[474,-292],[462,-294],[452,-293],[445,-289],[124,9],[113,24],[109,42],[110,63],[119,79],[130,85],[179,94],[191,99],[201,110],[205,121],[205,138],[200,149],[192,157],[178,165],[163,166],[148,160],[59,102],[31,72],[17,50],[4,18],[0,0]],
		walls2 : [[-20,6],[-17,20],[-2,58],[0,61],[16,86],[48,119],[137,177],[141,179],[156,185],[164,186],[179,185],[188,182],[202,174],[206,171],[214,163],[218,157],[223,146],[225,138],[225,121],[220,103],[216,97],[206,86],[199,81],[187,76],[183,74],[137,66],[134,64],[130,57],[129,44],[132,32],[139,22],[457,-273],[458,-274],[461,-274],[471,-272],[512,-265],[533,-257],[548,-248],[503,-239],[491,-237],[482,-233],[475,-228],[470,-222],[464,-212],[461,-202],[461,-195],[463,-186],[467,-178],[468,-176],[537,-72],[545,-55],[548,-39],[548,-24],[547,-11],[532,56],[531,57],[529,68],[529,73],[530,88],[531,92],[534,103],[536,108],[544,121],[548,126],[798,352],[802,355],[812,360],[820,362],[835,363],[842,362],[874,352],[877,351],[903,337],[908,333],[929,313],[933,308],[938,298],[939,282],[933,265],[930,260],[919,245],[919,245],[921,243],[965,217],[969,215],[971,215],[979,212],[985,208],[998,197],[999,197],[1011,185],[1024,175],[1049,158],[1073,144],[1104,134],[1105,133],[1122,126],[1126,124],[1138,115],[1142,111],[1153,97],[1156,92],[1162,77],[1163,73],[1165,61],[1165,56],[1163,39],[1162,36],[1160,29],[1158,24],[1148,7],[1146,3],[1128,-16],[1126,-18],[1089,-48],[1087,-49],[713,-297],[701,-305],[690,-324],[683,-345],[680,-351],[675,-358],[669,-367],[668,-369],[660,-379],[655,-383],[645,-390],[633,-397],[626,-399],[616,-400],[605,-400],[590,-398],[583,-396],[572,-390],[557,-380],[547,-373],[540,-371],[530,-370],[523,-369],[516,-372],[450,-399],[441,-403],[436,-404],[427,-405],[421,-404],[408,-401],[404,-400],[384,-391],[361,-382],[350,-381],[337,-379],[199,-385],[196,-385],[169,-382],[128,-378],[126,-378],[70,-367],[68,-366],[34,-355],[32,-354],[17,-347],[12,-344],[2,-335],[-1,-331],[-8,-321],[-11,-317],[-17,-301],[-18,-297],[-20,-282],[-20,-279],[-20,0],[-20,6]],
		miscWalls: [],
		chkpts : [[[-20,-25],[0,-25]],[[-17,20],[4,18]],[[-2,58],[17,50]],[[48,119],[59,102]],[[137,177],[148,160]],[[225,121],[205,121]],[[130,57],[110,63]],[[165,-29],[179,-15]],[[342,-194],[357,-180]]]};

	const silverstone_demo = JSON.parse(JSON.stringify(silverstone_reverse));
		  silverstone_demo.start = [200, -376, -1.52];
		  //silverstone_demo.miscWalls = [[[260,-362],[261,-374]], [[281,-371],[280,-382]]];
		  silverstone_demo.chkpts = [[[240,-363],[241,-383]],[[300,-361],[301,-380]],[[360,-362],[356,-382]],[[412,-382],[404,-400]],[[462,-373],[470,-391]],[[521,-349],[523,-369]],[[582,-372],[571,-389]],[[640,-370],[651,-386]],[[690,-324],[672,-315]],[[730,-262],[741,-279]],[[790,-222],[801,-239]],[[850,-182],[861,-199]],[[910,-142],[921,-159]],[[970,-102],[981,-119]],[[970,-102],[981,-119]],[[1030,-62],[1041,-79]],[[1088,-22],[1100,-39]],[[1137,27],[1155,18]],[[1139,79],[1158,85]],[[1111,109],[1119,127]],[[1064,127],[1072,144]],[[1012,159],[1025,174]],[[971,215],[963,197]],[[914,272],[933,265]],[[890,322],[900,339]],[[858,357],[851,339]],[[771,328],[786,314]],[[724,285],[738,271]],[[679,245],[694,231]],[[633,203],[647,189]],[[581,156],[595,142]],[[529,80],[549,80]],[[541,16],[560,20]],[[545,-54],[564,-61]],[[514,-108],[530,-119]],[[484,-152],[501,-162]],[[485,-210],[473,-226]],[[524,-223],[521,-242]],[[545,-250],[554,-267]],[[494,-268],[498,-287]],[[442,-259],[426,-272]],[[397,-218],[384,-232]],[[354,-178],[340,-192]],[[309,-136],[295,-150]],[[264,-94],[250,-108]],[[219,-52],[205,-66]],[[174,-10],[160,-24]],[[139,21],[124,9]],[[109,42],[129,44]],[[149,89],[152,69]],[[192,100],[207,87]],[[205,135],[225,137]],[[198,176],[188,159]],[[126,170],[138,154]],[[86,144],[98,128]],[[47,118],[59,102]],[[15,85],[31,72]],[[-8,42],[11,36]],[[-20,-13],[0,-13]],[[-20,-70],[0,-70]],[[-20,-130],[0,-130]],[[-20,-190],[0,-190]],[[-20,-250],[0,-250]],[[-18,-297],[2,-293]],[[27,-330],[18,-347]],[[71,-346],[65,-365]],[[122,-356],[119,-377]],[[183,-363],[182,-383]]];

	return silverstone_demo;
}

function initTrack(track_data, phys_world, renderer) {
	// create track graphics and collisions
	const track = {walls : [], chkpts : [], graphics : new PIXI.Graphics()};
	generateTrack(track, track_data, phys_world, renderer);

	return track;
}

function initCars(track_data, phys_world, renderer) {
	// generate cars' graphics, collisions, and neural networks
	var cars = [];

	// in this order for best networks drawn in front
	for(var i = m_car_amt - 1; i >= 0; --i) {
		var car = {body : null, vehicle : null, graphics : new PIXI.Graphics(), frontWheel : null, backWheel : null, rays : [], prevOutputs : [], score : {racing: true, chkpts : 0, times : [0], score : 0}};
		cars.unshift(car);
		generateCar(car, track_data, i, phys_world, renderer);
	}

	return cars;
}

function initGraph(renderer) {
	var graph = {graphics : new PIXI.Graphics(), text : new PIXI.Text("best performing network activations", {fontFamily : 'Arial', fontSize: 30, fill : 0xffffff, align : 'left'})};

	renderer.stage.addChild(graph.graphics);
	renderer.stage.addChild(graph.text);

	return graph;
}

function initGenAlgo() {
	var gen_algo = new GenAlgo(m_car_amt, net_input_cnt, m_hidden_layers, m_hidden_neurons, net_output_cnt);
	gen_algo.GenerateNewPopulation();

	return gen_algo;
}

function initScoreboard(renderer) {
	var scoreboard = new PIXI.Text("click canvas to toggle sim speed\nworld 0fps\nrenderer 0fps\n\nGeneration 1\nLeaderboard",{fontFamily : 'Arial', fontSize: 30, fill : 0xffffff, align : 'left'});
	
	renderer.stage.addChild(scoreboard);

	return scoreboard;
}

function initSpeedToggle(app) {
	app.renderer.renderer.view.addEventListener('mousedown', app.toggleSimSpeedForwarder.bind(app));
	app.renderer.renderer.view.addEventListener('touchstart', app.toggleSimSpeedForwarder.bind(app));
}

function toggleSimSpeed(app) {
	if (m_sim_intv_fps == 60) {
		m_sim_intv_fps = 1000;
		m_render_fps = 10;
	}
	else {
		m_sim_intv_fps = 60;
		m_render_fps = 30;
	}
	
	console.log("sim fps: " + m_sim_intv_fps)
	console.log("render fps: " + m_render_fps);

	setStepIntv(app);
	setAnimIntv(app);
}


// generate world physics and graphics for simulation objects
function generateTrack(track, track_data, phys_world, renderer) {
	// checkpoints
	track.graphics.lineStyle(1, 0xffff00, 1, .5, false);
	for(var i = 0; i < track_data.chkpts.length; ++i) {
		var chkpt_dx = (track_data.chkpts[i][1][0]-track_data.chkpts[i][0][0]),
			chkpt_dy = (track_data.chkpts[i][1][1]-track_data.chkpts[i][0][1]),
			chkpt_length = Math.sqrt(chkpt_dx**2 + chkpt_dy**2),
			chkpt_angle = -Math.atan(chkpt_dx/chkpt_dy);

		var boxShape = new p2.Box({ width: 1, height: chkpt_length, collisionGroup: phys_world.collisionGroups.CHKPT, collisionMask: phys_world.collisionGroups.CAR, collisionResponse: false });
		track.chkpts[i] = new p2.Body({
			mass: 0,
			position: [track_data.chkpts[i][0][0]+chkpt_dx/2, track_data.chkpts[i][0][1]+chkpt_dy/2],
			angle: chkpt_angle
		});
		track.chkpts[i].addShape(boxShape);
		phys_world.addBody(track.chkpts[i]);

		track.graphics.moveTo(track_data.chkpts[i][0][0], track_data.chkpts[i][0][1]);
		track.graphics.lineTo(track_data.chkpts[i][1][0], track_data.chkpts[i][1][1]);
	}

	// walls
	track.graphics.lineStyle(1, 0x0c1e70, 1, .5, false);

	track.graphics.moveTo(track_data.walls1[0][0], track_data.walls1[0][1]);
	var i = 0;
	for(; i < track_data.walls1.length-1; ++i) {
		var wall_dx = (track_data.walls1[i+1][0]-track_data.walls1[i][0]),
			wall_dy = (track_data.walls1[i+1][1]-track_data.walls1[i][1]),
			wall_length = Math.sqrt(wall_dx**2 + wall_dy**2),
			wall_angle = -Math.atan(wall_dx/wall_dy);

		var boxShape = new p2.Box({ width: 1, height: wall_length, collisionGroup: phys_world.collisionGroups.TRACK, collisionMask: phys_world.collisionGroups.CAR });
		track.walls[i] = new p2.Body({
			mass: 0,
			position: [track_data.walls1[i][0]+wall_dx/2, track_data.walls1[i][1]+wall_dy/2],
			angle: wall_angle
		});
		track.walls[i].addShape(boxShape);
		phys_world.addBody(track.walls[i]);

		track.graphics.lineTo(track_data.walls1[i+1][0], track_data.walls1[i+1][1])
	}

	track.graphics.moveTo(track_data.walls2[0][0], track_data.walls2[0][1]);
	for(var j = 0; j < track_data.walls2.length-1; ++j) {
		var wall_dx = (track_data.walls2[j+1][0]-track_data.walls2[j][0]),
			wall_dy = (track_data.walls2[j+1][1]-track_data.walls2[j][1]),
			wall_length = Math.sqrt(wall_dx**2 + wall_dy**2),
			wall_angle = -Math.atan(wall_dx/wall_dy);

		var boxShape = new p2.Box({ width: 1, height: wall_length, collisionGroup: phys_world.collisionGroups.TRACK, collisionMask: phys_world.collisionGroups.CAR });
		track.walls[j+i] = new p2.Body({
			mass: 0,
			position: [track_data.walls2[j][0]+wall_dx/2, track_data.walls2[j][1]+wall_dy/2],
			angle: wall_angle
		});
		track.walls[j+i].addShape(boxShape);
		phys_world.addBody(track.walls[j+i]);

		track.graphics.lineTo(track_data.walls2[j+1][0], track_data.walls2[j+1][1])
	}

	// miscWalls
	for(var i = 0; i < track_data.miscWalls.length; ++i) {
		var wall_dx = (track_data.miscWalls[i][1][0]-track_data.miscWalls[i][0][0]),
			wall_dy = (track_data.miscWalls[i][1][1]-track_data.miscWalls[i][0][1]),
			wall_length = Math.sqrt(wall_dx**2 + wall_dy**2),
			wall_angle = -Math.atan(wall_dx/wall_dy);

		var boxShape = new p2.Box({ width: 1, height: wall_length, collisionGroup: phys_world.collisionGroups.TRACK, collisionMask: phys_world.collisionGroups.CAR});
		track.walls[i] = new p2.Body({
			mass: 0,
			position: [track_data.miscWalls[i][0][0]+wall_dx/2, track_data.miscWalls[i][0][1]+wall_dy/2],
			angle: wall_angle
		});
		track.walls[i].addShape(boxShape);
		phys_world.addBody(track.walls[i]);

		track.graphics.moveTo(track_data.miscWalls[i][0][0], track_data.miscWalls[i][0][1]);
		track.graphics.lineTo(track_data.miscWalls[i][1][0], track_data.miscWalls[i][1][1]);
	}

	renderer.stage.addChild(track.graphics);
}

function generateCar(car, track_data, idx, phys_world, renderer) {
	var carShape = new p2.Box({ width: 2, height: 4, collisionGroup: phys_world.collisionGroups.CAR, collisionMask: phys_world.collisionGroups.TRACK | phys_world.collisionGroups.CHKPT});
	car.body = new p2.Body({
		mass: .8,
		position: [track_data.start[0], track_data.start[1] + Math.random() * 10 - 5],
		angle: track_data.start[2]
	});
	car.body.addShape(carShape);
	car.body.shape = p2.Shape.BOX;
	phys_world.addBody(car.body);

	// color champions orange, others blue
	if(idx == 0)
		car.graphics.beginFill(0xde8818);
	else if(idx < m_champions)
		car.graphics.beginFill(0xa35c0b);
	else
		car.graphics.beginFill(0x4f6910);

	car.graphics.drawRect(-1, -2, 2, 4);
	car.graphics.endFill();

	car.vehicle = new p2.TopDownVehicle(car.body);

	car.frontWheel = car.vehicle.addWheel({
		localPosition: [0, 1.5]
	});
	car.frontWheel.setSideFriction(6);

	car.backWheel = car.vehicle.addWheel({
		localPosition: [0, -1.5]
	});
	car.backWheel.setSideFriction(7);
	car.vehicle.addToWorld(phys_world);

	car.frontWheel.steerValue = 0;

	car.backWheel.engineForce = 0;
	car.backWheel.setBrakeForce(0);

	car.rays.push({length : 20, angle : -1.3962634016, phys_world : new p2.Ray({mode: p2.Ray.CLOSEST, collisionMask : phys_world.collisionGroups.TRACK}), result : new p2.RaycastResult(), graphic : new PIXI.Graphics()});
	car.rays.push({length : 60, angle : -0.6981317008, phys_world : new p2.Ray({mode: p2.Ray.CLOSEST, collisionMask : phys_world.collisionGroups.TRACK}), result : new p2.RaycastResult(), graphic : new PIXI.Graphics()});
	car.rays.push({length : 80, angle : -0.3490658504, phys_world : new p2.Ray({mode: p2.Ray.CLOSEST, collisionMask : phys_world.collisionGroups.TRACK}), result : new p2.RaycastResult(), graphic : new PIXI.Graphics()});
	car.rays.push({length : 100, angle : 0, phys_world : new p2.Ray({mode: p2.Ray.CLOSEST, collisionMask : phys_world.collisionGroups.TRACK}), result : new p2.RaycastResult(), graphic : new PIXI.Graphics()});
	car.rays.push({length : 80, angle : 0.3490658504, phys_world : new p2.Ray({mode: p2.Ray.CLOSEST, collisionMask : phys_world.collisionGroups.TRACK}), result : new p2.RaycastResult(), graphic : new PIXI.Graphics()});
	car.rays.push({length : 60, angle : 0.6981317008, phys_world : new p2.Ray({mode: p2.Ray.CLOSEST, collisionMask : phys_world.collisionGroups.TRACK}), result : new p2.RaycastResult(), graphic : new PIXI.Graphics()});
	car.rays.push({length : 20, angle : 1.3962634016, phys_world : new p2.Ray({mode: p2.Ray.CLOSEST, collisionMask : phys_world.collisionGroups.TRACK}), result : new p2.RaycastResult(), graphic : new PIXI.Graphics()});

	// add car and rays to stage
	for(var i = 0; i < 7; ++i)
		renderer.stage.addChild(car.rays[i].graphic);

	renderer.stage.addChild(car.graphics);

	car.prevOutputs.push(0.5);  // set steering to neutral
	car.prevOutputs.push(car_max_reverse_accel/(car_max_forward_accel + car_max_reverse_accel));  // throttle to 0
	car.prevOutputs.push(0);  // standard brake to 0
	car.prevOutputs.push(0);  // e-brake to 0
}


/***** event callback handlers *****/

// scroll wheel - zoom camera in and out
function setMouseZoomEvent(app) {
	app.renderer.renderer.view.addEventListener('wheel', function(event) {
		event.preventDefault();

		if((event.deltaX + event.deltaY + event.deltaZ) > 0) {
			if(zoom > 1)
				zoom -= 1;
		} else
			zoom += 1;

		canvasResize(app);
	});
}


// canvas resizing handler
function setResizeEvents(app) {
	window.addEventListener('resize', app.canvasResizeForwarder.bind(app));
	window.addEventListener('orientationchange', app.orientationChangeForwarder.bind(app));
}

function canvasResize(app) {
	var w = window.innerWidth;
	var h = window.innerHeight;

	app.renderer.renderer.resize(w, h);

	app.renderer.stage.scale.x = zoom*w/1600;
	app.renderer.stage.scale.y = -zoom*h/900;

	if(app.renderer.stage.scale.x > (-app.renderer.stage.scale.y))
		app.renderer.stage.scale.x = -app.renderer.stage.scale.y;
	else
		app.renderer.stage.scale.y = -app.renderer.stage.scale.x;

	renderUpdate(app);
}

function orientationChange(app) {
	window.scrollTo(0, 0);
	resize(app);
	window.scrollTo(0, 0);
	window.scrollTo(0, 0);
}


// save and load pretrained network
function setCopyLoadEvents(app) {
	window.addEventListener("copy", app.saveNetForwarder.bind(app));
	window.addEventListener("paste", app.loadNetForwarder.bind(app));
	parent.document.getElementById("pretrained").addEventListener("click", app.loadPretrainedNetForwarder.bind(app));
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
	const net_obj = JSON.parse('{"inputs":12,"hidden_layers":[{"inputs":12,"neurons":[{"weights":[-0.28413118213989424,-0.26557951773823524,1.104276160486788,-0.8589548990581757,0.48991922436662483,-0.690222365325193,0.36652248075373695,0.39730477616493504,0.6918015866461084,1.0628397551835156,-0.4529675883541771,-0.6097750440404699],"bias":0.21459496682080662},{"weights":[0.6027373658285836,-0.30412478884945787,0.07262153934791085,-0.03944678324816374,0.8069227792923274,-0.3905847129018902,-0.8541663438768914,-1.1469363665875885,0.7170934011488,0.7464663141031873,0.5691079168866573,0.26376229518848726],"bias":0},{"weights":[-0.9639905702638478,0.32312199319296,-0.025782737304205758,0.5548446344741808,-0.1302494716551864,-0.11828736437630277,-0.47587614715071824,-0.07218505768089588,-0.6864022907123851,-0.21759925711659447,0.7178203964867654,-0.7038717348730472],"bias":-0.10094409707457619},{"weights":[0.0997732154013404,-0.00590372554375114,0.6269711953331479,0.8893010674985276,-0.07018185522994734,0.4249680118302581,-0.3765323522652454,-0.4724600914909404,-0.8013600750382222,0.19513592607806096,-0.1471455992011507,-0.37529304961166954],"bias":-0.3139309341272317},{"weights":[0.42394643126398224,-0.16825197244401557,0.3432154302026682,0.6628225957555238,-0.09470677871833957,-0.9841031407871266,0.5073430850214387,-0.5919513967729014,0.11198362247193906,0.7759129683053332,0.07090654489095138,0.034897615106578],"bias":0.17171205220653274},{"weights":[-0.9159753720891365,0.5304664491434828,-0.07709680147813554,-0.6591530998680288,0.2085162482489457,0.056787022027929374,-0.5276230194573965,-0.5203319138950415,0.11834499616819523,0.4755629991926412,-0.14659536228030093,-0.8357053141014177],"bias":0.03710169677194509},{"weights":[-0.4661728826847559,-0.012557010778356172,-0.5290020890429895,0.6694465971103127,0.5722078817254714,0.09470976828637882,0.4572257666715487,-0.9789958602592923,1.0845179564516234,-0.6774675674085299,0.256725143303481,0.9052521501663232],"bias":-0.305494060535614},{"weights":[0.7141861172002517,0.7686205379634558,-0.3510821375390428,0.7483868993798253,0.539073742342631,0.8928507184723085,0.2582473225178215,-0.9530409528590851,0.996421404163776,-0.36142183934078437,0.8330805500290472,-0.4109898441376658],"bias":-0.0705174094962996},{"weights":[-0.12617007973884903,-0.8109975078843159,0.5596263819930322,0.5219633051447675,-0.8892333536203441,-0.38136654201266,-0.8386103328611775,-0.44271308211525046,-0.5780697864811786,-0.22412668041463926,-0.3714911142517509,0.03797855816229758],"bias":-0.11025374204794085},{"weights":[0.3911789844969765,0.25083219678290947,0.21900428711625786,0.7174156414890929,-0.21078255659598755,0.24216995375606998,-0.3951867214451557,-0.798036982327093,0.18772883143643176,0.9587028100477961,0.3927647923007322,-0.8621974939389171],"bias":-0.012036221181522767}]}],"output_layer":{"inputs":10,"neurons":[{"weights":[0.7530627545267151,0.34004393504179337,0.799211703217745,0.8574709737824384,0.6095436790407794,0.4656043879975161,-0.0549213721314219,-0.8631825631982207,0.4354930684609113,0.8248744652183063],"bias":-0.06917377782005064},{"weights":[1.032305985334006,-0.36641737125743074,-0.4693741622481235,0.9929647679183465,-0.07391433472952652,0.07055263563286394,-0.1470508367815206,-0.013399645165783437,0.54673714471659,-0.24662990716132333],"bias":-0.11488130267411228},{"weights":[-0.7326891906899162,-0.19989828823831068,-0.46486729202954463,-0.3185719980353725,0.8386073949269339,-0.9727273111664854,-0.6987544531184455,-0.7650487377296435,0.9001254261508083,0.4311303919975358],"bias":-0.028469936350350628},{"weights":[0.35724596044048174,-0.6005930133257734,0.7492985082081991,0.9232846626184497,-0.9545964004008525,-0.9964641322152803,-0.6217787046254284,-0.5294168234300058,1.0236607554070138,0.3047990238455073],"bias":0.19256076962343383}]}}');

	app.gen_algo.population[0].net.load(net_obj);

	resetCars(app);

	console.log("neural net restored");
};