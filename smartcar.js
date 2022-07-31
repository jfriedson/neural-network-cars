
var zoom = 20;
var m_start_time = performance.now(),
	m_sim_steps = 0;


// track data
var silverstone_reverse = {start : [-10,-50, 0],
							walls1 : [[0,0],[0,-279],[2,-294],[8,-310],[15,-320],[25,-329],[40,-336],[74,-347],[130,-358],[171,-362],[198,-365],[338,-359],[353,-361],[366,-363],[392,-373],[412,-382],[425,-385],[434,-384],[442,-381],[509,-353],[521,-349],[532,-350],[544,-351],[556,-355],[568,-363],[582,-372],[593,-378],[614,-380],[624,-379],[634,-374],[644,-367],[652,-357],[664,-339],[672,-315],[678,-306],[686,-293],[701,-281],[1076,-32],[1113,-2],[1131,17],[1141,34],[1143,41],[1145,58],[1143,70],[1137,85],[1126,99],[1114,108],[1097,115],[1065,126],[1038,141],[1012,159],[998,170],[985,182],[972,193],[964,196],[957,198],[907,228],[900,238],[899,248],[901,254],[914,272],[920,289],[915,299],[894,319],[868,333],[836,343],[821,342],[811,337],[561,111],[553,98],[550,87],[549,72],[551,61],[567,-8],[568,-23],[568,-41],[564,-61],[555,-82],[485,-187],[481,-195],[481,-202],[487,-212],[494,-217],[507,-219],[559,-230],[567,-234],[572,-243],[573,-251],[568,-259],[542,-275],[517,-284],[474,-292],[462,-294],[452,-293],[445,-289],[124,9],[113,24],[109,42],[110,63],[119,79],[130,85],[179,94],[191,99],[201,110],[205,121],[205,138],[200,149],[192,157],[178,165],[163,166],[148,160],[59,102],[31,72],[17,50],[4,18],[0,0]],
							walls2 : [[-20,6],[-17,20],[-2,58],[0,61],[16,86],[48,119],[137,177],[141,179],[156,185],[164,186],[179,185],[188,182],[202,174],[206,171],[214,163],[218,157],[223,146],[225,138],[225,121],[220,103],[216,97],[206,86],[199,81],[187,76],[183,74],[137,66],[134,64],[130,57],[129,44],[132,32],[139,22],[457,-273],[458,-274],[461,-274],[471,-272],[512,-265],[533,-257],[548,-248],[503,-239],[491,-237],[482,-233],[475,-228],[470,-222],[464,-212],[461,-202],[461,-195],[463,-186],[467,-178],[468,-176],[537,-72],[545,-55],[548,-39],[548,-24],[547,-11],[532,56],[531,57],[529,68],[529,73],[530,88],[531,92],[534,103],[536,108],[544,121],[548,126],[798,352],[802,355],[812,360],[820,362],[835,363],[842,362],[874,352],[877,351],[903,337],[908,333],[929,313],[933,308],[938,298],[939,282],[933,265],[930,260],[919,245],[919,245],[921,243],[965,217],[969,215],[971,215],[979,212],[985,208],[998,197],[999,197],[1011,185],[1024,175],[1049,158],[1073,144],[1104,134],[1105,133],[1122,126],[1126,124],[1138,115],[1142,111],[1153,97],[1156,92],[1162,77],[1163,73],[1165,61],[1165,56],[1163,39],[1162,36],[1160,29],[1158,24],[1148,7],[1146,3],[1128,-16],[1126,-18],[1089,-48],[1087,-49],[713,-297],[701,-305],[690,-324],[683,-345],[680,-351],[675,-358],[669,-367],[668,-369],[660,-379],[655,-383],[645,-390],[633,-397],[626,-399],[616,-400],[605,-400],[590,-398],[583,-396],[572,-390],[557,-380],[547,-373],[540,-371],[530,-370],[523,-369],[516,-372],[450,-399],[441,-403],[436,-404],[427,-405],[421,-404],[408,-401],[404,-400],[384,-391],[361,-382],[350,-381],[337,-379],[199,-385],[196,-385],[169,-382],[128,-378],[126,-378],[70,-367],[68,-366],[34,-355],[32,-354],[17,-347],[12,-344],[2,-335],[-1,-331],[-8,-321],[-11,-317],[-17,-301],[-18,-297],[-20,-282],[-20,-279],[-20,0],[-20,6]],
							miscWalls: [],
							chkpts : [[[-20,-25],[0,-25]],[[-17,20],[4,18]],[[-2,58],[17,50]],[[48,119],[59,102]],[[137,177],[148,160]],[[225,121],[205,121]],[[130,57],[110,63]],[[165,-29],[179,-15]],[[342,-194],[357,-180]]]};
var silverstone_demo = JSON.parse(JSON.stringify(silverstone_reverse));
	silverstone_demo.start = [200, -376, -1.52];
	//silverstone_demo.miscWalls = [[[260,-362],[261,-374]], [[281,-371],[280,-382]]];
	silverstone_demo.chkpts = [[[240,-363],[241,-383]],[[300,-361],[301,-380]],[[360,-362],[356,-382]],[[412,-382],[404,-400]],[[462,-373],[470,-391]],[[521,-349],[523,-369]],[[582,-372],[571,-389]],[[640,-370],[651,-386]],[[690,-324],[672,-315]],[[730,-262],[741,-279]],[[790,-222],[801,-239]],[[850,-182],[861,-199]],[[910,-142],[921,-159]],[[970,-102],[981,-119]],[[970,-102],[981,-119]],[[1030,-62],[1041,-79]],[[1088,-22],[1100,-39]],[[1137,27],[1155,18]],[[1139,79],[1158,85]],[[1111,109],[1119,127]],[[1064,127],[1072,144]],[[1012,159],[1025,174]],[[971,215],[963,197]],[[914,272],[933,265]],[[890,322],[900,339]],[[858,357],[851,339]],[[771,328],[786,314]],[[724,285],[738,271]],[[679,245],[694,231]],[[633,203],[647,189]],[[581,156],[595,142]],[[529,80],[549,80]],[[541,16],[560,20]],[[545,-54],[564,-61]],[[514,-108],[530,-119]],[[484,-152],[501,-162]],[[485,-210],[473,-226]],[[524,-223],[521,-242]],[[545,-250],[554,-267]],[[494,-268],[498,-287]],[[442,-259],[426,-272]],[[397,-218],[384,-232]],[[354,-178],[340,-192]],[[309,-136],[295,-150]],[[264,-94],[250,-108]],[[219,-52],[205,-66]],[[174,-10],[160,-24]],[[139,21],[124,9]],[[109,42],[129,44]],[[149,89],[152,69]],[[192,100],[207,87]],[[205,135],[225,137]],[[198,176],[188,159]],[[126,170],[138,154]],[[86,144],[98,128]],[[47,118],[59,102]],[[15,85],[31,72]],[[-8,42],[11,36]],[[-20,-13],[0,-13]],[[-20,-70],[0,-70]],[[-20,-130],[0,-130]],[[-20,-190],[0,-190]],[[-20,-250],[0,-250]],[[-18,-297],[2,-293]],[[27,-330],[18,-347]],[[71,-346],[65,-365]],[[122,-356],[119,-377]],[[183,-363],[182,-383]]];

var track_data = silverstone_demo;

var score_by_dist = true;

// drawing library
PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.LINEAR;
const app = new PIXI.Application({ width: 1600, height: 900, backgroundColor: 0x060f39, autoDensity: true, resolution: window.devicePixelRatio||1 });

document.body.appendChild(app.renderer.view);
app.renderer.view.oncontextmenu = function (e) {
	e.preventDefault();
};

// physics collision groups
var TRACKCG = Math.pow(2, 1),
	CKHPTCG = Math.pow(2, 2),
	CARCG = Math.pow(2, 3);

var world = new p2.World({gravity : [0,0]});

// create track graphics and collisions
var track = {walls : [], chkpts : [], graphics : new PIXI.Graphics()};
generateTrack();

// generate cars' graphics, collisions, and neural networks
var cars = [];
var scores = [];

const car_max_steer = 0.53;
const car_max_forward_accel = 12;
const car_max_reverse_accel = 5;
const car_max_std_brake = 5;
const car_max_e_brake = 7;

for(var i = m_car_amt - 1; i >= 0; i--) {
	var car = {body : null, vehicle : null, graphics : new PIXI.Graphics(), frontWheel : null, backWheel : null, rays : [], prevOutputs : []};
	cars.unshift(car);
	generateCar(car, i);
	scores.push({racing: true, chkpts : 0, times : [m_sim_steps], score : 0});
}

// create neural network graph
var graph = new PIXI.Graphics();
app.stage.addChild(graph);

var best_genome_actions = [];
var update_graph = true;


// these adjust the learning rate
var record_chkpts = 0;
var record_chkpts_time = 0;
var record_score = 0;
var record_score_time = 0;


var net_input_cnt = 12;
var net_output_cnt = 4;

// ensemble of genetic algorithms
var gen_algo = new GenAlgo(m_car_amt, net_input_cnt, m_hidden_layers, m_hidden_neurons, net_output_cnt);
gen_algo.GenerateNewPopulation();


var scoreboard = new PIXI.Text("click screen to toggle sim speed\nworld 0fps\nrenderer 0fps\n\nGeneration 1\nLeaderboard",{fontFamily : 'Arial', fontSize: 30, fill : 0xffffff, align : 'left'});
app.stage.addChild(scoreboard);

var sim_times = [];
var render_times = [];

function toggleSimSpeed() {
	if (m_sim_intv_fps == 60) {
		m_sim_intv_fps = 1000;
		m_render_fps = 5;
	}
	else {
		m_sim_intv_fps = 60;
		m_render_fps = 30;
	}

	setStepIntv(m_sim_intv_fps);
	setAnimIntv(m_render_fps);
}

function getCoord(event) {
	var rect = app.renderer.view.getBoundingClientRect();

	var x = event.clientX - rect.left + (app.renderer.view.width/2 - app.stage.position.x);
	var y = event.clientY - rect.top + (app.renderer.view.height/2 - app.stage.position.y);
	x = (x - app.renderer.view.width / 2) / app.stage.scale.x;
	y = (y - app.renderer.view.height / 2) / app.stage.scale.y;

	console.log(x +", " + y);
}

app.renderer.view.addEventListener('mousedown', toggleSimSpeed);// function(e) { getCoord(e); });
app.renderer.view.addEventListener('touchstart', toggleSimSpeed);


// 12 inputs: 7 rays, car speed, steerings angle, gas throttle, front and rear brakes
// 4 outputs: steerings angle, gas throttle, standard brakes pressure, handbrake pressure
// every car has a NN + score (# of chkpts, time between each chkpt)
// the genetical algo does mutation+crossover of NNs based on score; reset cars
function NetForward(idx, input) {
	const output = gen_algo.infer(idx, input);

	cars[idx].prevOutputs = output;

	cars[idx].frontWheel.steerValue = ((2*car_max_steer) * output[0] - car_max_steer);
	cars[idx].backWheel.engineForce = ((car_max_forward_accel + car_max_reverse_accel) * output[1] - car_max_reverse_accel);

	cars[idx].frontWheel.setBrakeForce(car_max_std_brake * output[2]);
	cars[idx].backWheel.setBrakeForce((car_max_std_brake * .8) * output[2] + (car_max_e_brake * output[3]));
}

world.on('impact', function(event) {
	var car, obj;
	if(event.bodyA.mass == 0.8) {
		car = event.bodyA;
		obj = event.bodyB;
	}
	else {
		car = event.bodyB;
		obj = event.bodyA;
	}

	var c = 0;
	for(c in cars)
		if (cars[c].body.id == car.id)
			break;

	// check if checkpoint collision, otherwise assume wall collision
	var get_pt = false;
	for (const cp in track.chkpts)
		if (obj.id == track.chkpts[cp].id) {
			get_pt = true;
			break;
		}

	// checkpoint
	if(get_pt  &&  scores[c].chkpts == obj.id - 1  &&  scores[c].racing) {
		++scores[c].chkpts;
		scores[c].times.push(m_sim_steps);
		scores[c].score += 100;

		// select quickest cars to improve training time
		if (record_chkpts <= 2 || record_chkpts >= 8)
			scores[c].score += time_limit - (scores[c].times[scores[c].times.length-1] - scores[c].times[scores[c].times.length-2])/m_sim_world_fps;
	}
	// crash
	else {
		if(!get_pt && scores[c].racing) {
			if(score_by_dist  &&  1 <= scores[c].chkpts  &&  scores[c].chkpts <= 8)
				scores[c].score += (cars[c].body.position[0] > track.chkpts[scores[c].chkpts-1].position[0] ? 1 : -1) * Math.sqrt((cars[c].body.position[0]-track.chkpts[scores[c].chkpts-1].position[0])**2 + (cars[c].body.position[1]-track.chkpts[scores[c].chkpts-1].position[1])**2);

			scores[c].racing = false;
			gen_algo.SetGenomeFitness(c, scores[c].score);

			cars[c].frontWheel.steerValue = 1.57;
			cars[c].body.angularVelocity = (2 * Math.random() - 1) * cars[c].body.velocity[0] * cars[c].body.velocity[1] / 10;
		}
	}
});


function sim_step(num_steps) {
	for(var s = 0; s < num_steps; ++s) {
		const now = performance.now();
		while (sim_times.length > 0 && sim_times[0] <= now - 1000)
			sim_times.shift();
		sim_times.push(now);
		var text = scoreboard.text.split("\n");
		text[1] = "world " + sim_times.length.toString() + "fps";
		scoreboard.text = text.join("\n");

		var racing = 0;
		for(const c in cars) {
			// did the car reach the checkpoint time limit
			if((m_sim_steps - scores[c].times[scores[c].times.length-1])/m_sim_world_fps >= time_limit) {
				if(scores[c].racing) {
					if(score_by_dist) {
						if(1 <= scores[c].chkpts)
							scores[c].score += (cars[c].body.position[0] > track.chkpts[scores[c].chkpts-1].position[0] ? 1 : -1) * Math.sqrt((cars[c].body.position[0]-track.chkpts[scores[c].chkpts-1].position[0])**2 + (cars[c].body.position[1]-track.chkpts[scores[c].chkpts-1].position[1])**2);
						else {
							sc = 40 - Math.sqrt((cars[c].body.position[0]-track.chkpts[0].position[0])**2 + (cars[c].body.position[1]-track.chkpts[0].position[1])**2);
							if(sc > 0)
								scores[c].score += sc;
						}
					}

					scores[c].racing = false;
					gen_algo.SetGenomeFitness(c, scores[c].score);

					cars[c].body.angularVelocity = (2 * Math.random() - 1) * cars[c].body.velocity[0] * cars[c].body.velocity[1] / 20;
				}
			}

			if(scores[c].racing) {
				var input = [];
				input.push( Math.sqrt(cars[c].body.velocity[0]**2 + cars[c].body.velocity[1]**2) / 50 );  // car speed
				input.push(cars[c].prevOutputs[0]);  // steering angle
				input.push(cars[c].prevOutputs[1]);  // gas throttle
				input.push(cars[c].prevOutputs[2]);  // standard brake
				input.push(cars[c].prevOutputs[3]);  // e-brake

				// 7 distance rays
				for(var i = 0; i < 7; ++i) {
					cars[c].rays[i].world.from = cars[c].body.position;
					cars[c].rays[i].world.to = [cars[c].body.position[0] - Math.sin(cars[c].body.angle+cars[c].rays[i].angle) * cars[c].rays[i].length,
												cars[c].body.position[1] + Math.cos(cars[c].body.angle+cars[c].rays[i].angle) * cars[c].rays[i].length];
					cars[c].rays[i].world.update();

					cars[c].rays[i].result.reset();
					world.raycast(cars[c].rays[i].result, cars[c].rays[i].world);

					const ray_dist = (cars[c].rays[i].result.fraction == -1) ? 1 : cars[c].rays[i].result.fraction;

					input.push(ray_dist);
				}
				NetForward(c, input);
				++racing;
			}
			else {
				cars[c].frontWheel.setBrakeForce(3);
				cars[c].backWheel.setBrakeForce(5);
				cars[c].frontWheel.steerValue = 1.57;
				cars[c].backWheel.engineForce = 0;
			}
		}

		// if all cars in a failure condition, reset track and NNs
		if(racing == 0) {
			m_mutation_chance = Math.min(Math.max(.05, m_mutation_chance - (gen_algo.generation/10000) + (record_score_time/10000) + (record_chkpts_time/10000)), .3)
			m_learning_rate = Math.min(Math.max(.05, m_learning_rate - (gen_algo.generation/10000) + (record_score_time/10000) + (record_chkpts_time/10000)), .25)

			gen_algo.BreedPopulation();

			var best_score = 0,
				best_chkpt = 0;
			for (c in cars) {
				if(scores[c].score > best_score) {
					best_score = scores[c].score;
					best_chkpt = scores[c].chkpts;
				}

				scores[c] = {racing: true, chkpts : 0, times : [m_sim_steps], score : 0};
				cars[c].body.position = [track_data.start[0], track_data.start[1]];
				cars[c].body.angle = track_data.start[2];
				cars[c].body.setZeroForce();
				cars[c].body.velocity = [0,0];
				cars[c].body.angularVelocity = 0;

				car.prevOutputs[0] = 0.5;
				car.prevOutputs[1] = car_max_reverse_accel/(car_max_forward_accel + car_max_reverse_accel);
				car.prevOutputs[2] = 0;
				car.prevOutputs[3] = 0;
			}

			if(best_score > record_score) {
				record_score = best_score;
				record_score_time = 0;

				if(best_chkpt > record_chkpts) {
					record_chkpts = best_chkpt;
					record_chkpts_time = 0;
				}
				else
					record_chkpts_time++;

				console.log("New record of " + record_score.toFixed(3) + " in gen " + (gen_algo.generation-1) + " at " + Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric'}).format(Date.now()) + " after " + Math.floor((performance.now()-m_start_time)/1440000) + "h " + Math.floor((performance.now()-m_start_time)/60000)%60 + "m " + Math.floor((performance.now()-m_start_time)/1000)%60 + "s");
				if (text.length == 11) {
					for(var i = 6; i < 11; ++i)
						text[i] = text[i+1];

					text[text.length-1] = record_score.toFixed(3) + " at gen " + (gen_algo.generation-1);
				}
				else
					text.push(record_score.toFixed(3) + " at gen " + (gen_algo.generation-1));
			}
			else {
				record_score_time++;
				record_chkpts_time++;
			}

			//var text = scoreboard.text.split("\n");
			text[4] = "Generation " + gen_algo.generation;
			scoreboard.text = text.join("\n");
		}

		++m_sim_steps;
		world.step(m_sim_step);
	}
};

var sim_step_intv = null;
function setStepIntv(sim_fps) {
	clearInterval(sim_step_intv);

	m_sim_intv_fps = sim_fps;
	m_sim_delay = 1000/m_sim_intv_fps;

	if (m_sim_intv_fps <= 200)
		sim_step_intv = setInterval(sim_step, m_sim_delay, 1);
	else
		sim_step_intv = setInterval(sim_step, m_sim_delay*10, 10);
}

setStepIntv(m_sim_intv_fps);


var last_update_ts = performance.now();
function animate() {
	const now = performance.now();
	while (render_times.length > 0 && render_times[0] <= now - 1000)
		render_times.shift();
	render_times.push(now);
	var text = scoreboard.text.split("\n");
	text[2] = "renderer " + render_times.length.toString() + "fps";
	scoreboard.text = text.join("\n");

	for(const c in cars) {
		cars[c].graphics.position.x = cars[c].body.position[0];
		cars[c].graphics.position.y = cars[c].body.position[1];
		cars[c].graphics.rotation   = cars[c].body.angle;

		for(var i = 0; i < 7; ++i) {
			cars[c].rays[i].graphic.clear();
			if(scores[c].racing) {
				if( cars[c].rays[i].result.hasHit() ) {
					var hitPoint = p2.vec2.create();
					cars[c].rays[i].result.getHitPoint(hitPoint, cars[c].rays[i].world);
					cars[c].rays[i].graphic.lineStyle(.25, 0xff0000, 1, .5, false);
					cars[c].rays[i].graphic.moveTo(cars[c].body.position[0], cars[c].body.position[1]);
					cars[c].rays[i].graphic.lineTo(hitPoint[0], hitPoint[1]);
				}
				else {
					cars[c].rays[i].graphic.lineStyle(.25, 0xff0000, 1, .5, false);
					cars[c].rays[i].graphic.moveTo(cars[c].body.position[0], cars[c].body.position[1]);
					cars[c].rays[i].graphic.lineTo(cars[c].body.position[0]-Math.sin(cars[c].body.angle+cars[c].rays[i].angle)*cars[c].rays[i].length,
													cars[c].body.position[1]+Math.cos(cars[c].body.angle+cars[c].rays[i].angle)*cars[c].rays[i].length);
				}
			}
		}
	}

	// scoreboard
	var best_score = 0,
		best_car = 0;
	for (const s in scores) {
		if (scores[s].score > best_score && scores[s].racing) {
			best_score = scores[s].score;
			best_car = s;
		}
	}

	// scoreboard and graph positioning
	const car_pos_x = app.renderer.width/(2 * app.renderer.resolution) - app.stage.scale.x * cars[best_car].graphics.position.x,
		  car_pos_y = app.renderer.height/(2 * app.renderer.resolution) - app.stage.scale.y * cars[best_car].graphics.position.y;
	if(Math.abs(car_pos_x - app.stage.position.x) > 10 || Math.abs(car_pos_y - app.stage.position.y) > 10) {
		app.stage.position.x += (car_pos_x - app.stage.position.x)/(m_render_fps/3);
		app.stage.position.y += (car_pos_y - app.stage.position.y)/(m_render_fps/3);

		scoreboard.x = (app.renderer.width/(2 * app.renderer.resolution) - app.stage.position.x)/app.stage.scale.x - 780/zoom;
		scoreboard.y = (app.renderer.height/(2 * app.renderer.resolution) - app.stage.position.y)/app.stage.scale.y + 430/zoom;
		scoreboard.scale.x = 1/zoom;
		scoreboard.scale.y = -1/zoom;

		graph.x = (app.renderer.width/(2 * app.renderer.resolution) - app.stage.position.x)/app.stage.scale.x + 240/zoom;
		graph.y = (app.renderer.height/(2 * app.renderer.resolution) - app.stage.position.y)/app.stage.scale.y + 430/zoom;
		graph.scale.x = 1/zoom;
		graph.scale.y = -1/zoom;
	}
	else {
		app.stage.position.x = car_pos_x;
		app.stage.position.y = car_pos_y;

		scoreboard.x = cars[best_car].graphics.position.x - 780/zoom;
		scoreboard.y = cars[best_car].graphics.position.y + 430/zoom;
		scoreboard.scale.x = 1/zoom;
		scoreboard.scale.y = -1/zoom;

		graph.x = cars[best_car].graphics.position.x + 240/zoom;
		graph.y = cars[best_car].graphics.position.y + 430/zoom;
		graph.scale.x = 1/zoom;
		graph.scale.y = -1/zoom;
	}


	// neural network graph
	// graph.clear();

	// // draw lines between neurons
	// // graph.lineStyle(.25, 0xff0000, 1, .5, false);
	// // graph.moveTo(cars[c].body.position[0], cars[c].body.position[1]);
	// // graph.lineTo(hitPoint[0], hitPoint[1]);

	// // draw neuron cells
	// var input = [];
	// input.push(Math.sqrt(cars[best_car].body.velocity[0]**2 + cars[best_car].body.velocity[1]**2) / 50);
	// for(var i = 0; i < 4; ++i)
	// 	input.push(cars[best_car].prevOutputs[i]);
	// for(var i = 0; i < 7; ++i) {
	// 	const ray_dist = (cars[best_car].rays[i].result.fraction == -1) ? 1 : cars[best_car].rays[i].result.fraction;
	// 	input.push(ray_dist);
	// }

	// const best_net = gen_algo.population[best_car].net;

	// graph.lineStyle(0, 0, 0, .5, false);
	// for(const i in input) {
	// 	//graph.lineStyle(2, 0x000000, 1, .5, false);
	// 	const gray = 0xff * input[i];
	// 	graph.beginFill((gray << 24) + (gray << 16) + gray, 1);
	// 	graph.drawCircle(5, 5 + i * 30, 10);
	// 	graph.endFill();
	// }

	// for(const hl in m_hidden_layers) {
	// 	//graph.lineStyle(2, 0x000000, 1, .5, false);
	// 	const gray = 0xff * input[i];
	// 	graph.beginFill((gray << 24) + (gray << 16) + gray, 1);
	// 	graph.drawCircle(5, 5 + i * 30, 10);
	// 	graph.endFill();
	// }

	app.renderer.render(app.stage);
}

var animate_intv = null;
function setAnimIntv(renderer_fps) {
	clearInterval(animate_intv);
	m_render_fps = renderer_fps;
	m_render_delay = 1000/m_render_fps;
	animate_intv = setInterval(animate, m_render_delay);
}

setAnimIntv(m_render_fps);


function renderUpdate() {
	const now = performance.now();
	while (render_times.length > 0 && render_times[0] <= now - 1000)
		render_times.shift();
	render_times.push(now);
	var text = scoreboard.text.split("\n");
	text[1] = "renderer " + render_times.length.toString() + "fps";
	scoreboard.text = text.join("\n");

	for(const c in cars) {
		cars[c].graphics.position.x = cars[c].body.position[0];
		cars[c].graphics.position.y = cars[c].body.position[1];
		cars[c].graphics.rotation   = cars[c].body.angle;

		for(var i = 0; i < 7; ++i) {
			cars[c].rays[i].graphic.clear();
			if(scores[c].racing) {
				if( cars[c].rays[i].result.hasHit() ) {
					var hitPoint = p2.vec2.create();
					cars[c].rays[i].result.getHitPoint(hitPoint, cars[c].rays[i].world);
					cars[c].rays[i].graphic.lineStyle(.25, 0xff0000, 1, .5, false);
					cars[c].rays[i].graphic.moveTo(cars[c].body.position[0], cars[c].body.position[1]);
					cars[c].rays[i].graphic.lineTo(hitPoint[0], hitPoint[1]);
				}
				else {
					cars[c].rays[i].graphic.lineStyle(.25, 0xff0000, 1, .5, false);
					cars[c].rays[i].graphic.moveTo(cars[c].body.position[0], cars[c].body.position[1]);
					cars[c].rays[i].graphic.lineTo(cars[c].body.position[0]-Math.sin(cars[c].body.angle+cars[c].rays[i].angle)*cars[c].rays[i].length,
													cars[c].body.position[1]+Math.cos(cars[c].body.angle+cars[c].rays[i].angle)*cars[c].rays[i].length);
				}
			}
		}
	}

	var best_score = 0,
		best_car = 0;
	for (const s in scores) {
		if (scores[s].score > best_score && scores[s].racing) {
			best_score = scores[s].score;
			best_car = s;
		}
	}

	app.stage.position.x = app.renderer.width/(2 * app.renderer.resolution) - app.stage.scale.x * cars[best_car].graphics.position.x;
	app.stage.position.y = app.renderer.height/(2 * app.renderer.resolution) - app.stage.scale.y * cars[best_car].graphics.position.y;

	scoreboard.x = cars[best_car].graphics.position.x - 780/zoom;
	scoreboard.y = cars[best_car].graphics.position.y + 430/zoom;
	scoreboard.scale.x = 1/zoom;
	scoreboard.scale.y = -1/zoom;

	graph.x = cars[best_car].graphics.position.x + 240/zoom;
	graph.y = cars[best_car].graphics.position.y + 430/zoom;
	graph.scale.x = 1/zoom;
	graph.scale.y = -1/zoom;

	app.renderer.render(app.stage);
}


/***********************************/


function generateTrack() {
	// checkpoints
	track.graphics.lineStyle(1, 0xffff00, 1, .5, false);
	for(var i = 0; i < track_data.chkpts.length; ++i) {
		var chkpt_dx = (track_data.chkpts[i][1][0]-track_data.chkpts[i][0][0]),
			chkpt_dy = (track_data.chkpts[i][1][1]-track_data.chkpts[i][0][1]),
			chkpt_length = Math.sqrt(chkpt_dx**2 + chkpt_dy**2),
			chkpt_angle = -Math.atan(chkpt_dx/chkpt_dy);

		var boxShape = new p2.Box({ width: 1, height: chkpt_length, collisionGroup: CKHPTCG, collisionMask: CARCG, collisionResponse: false });
		track.chkpts[i] = new p2.Body({
			mass: 0,
			position: [track_data.chkpts[i][0][0]+chkpt_dx/2, track_data.chkpts[i][0][1]+chkpt_dy/2],
			angle: chkpt_angle
		});
		track.chkpts[i].addShape(boxShape);
		world.addBody(track.chkpts[i]);

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

		var boxShape = new p2.Box({ width: 1, height: wall_length, collisionGroup: TRACKCG, collisionMask: CARCG });
		track.walls[i] = new p2.Body({
			mass: 0,
			position: [track_data.walls1[i][0]+wall_dx/2, track_data.walls1[i][1]+wall_dy/2],
			angle: wall_angle
		});
		track.walls[i].addShape(boxShape);
		world.addBody(track.walls[i]);

		track.graphics.lineTo(track_data.walls1[i+1][0], track_data.walls1[i+1][1])
	}

	track.graphics.moveTo(track_data.walls2[0][0], track_data.walls2[0][1]);
	for(var j = 0; j < track_data.walls2.length-1; ++j) {
		var wall_dx = (track_data.walls2[j+1][0]-track_data.walls2[j][0]),
			wall_dy = (track_data.walls2[j+1][1]-track_data.walls2[j][1]),
			wall_length = Math.sqrt(wall_dx**2 + wall_dy**2),
			wall_angle = -Math.atan(wall_dx/wall_dy);

		var boxShape = new p2.Box({ width: 1, height: wall_length, collisionGroup: TRACKCG, collisionMask: CARCG });
		track.walls[j+i] = new p2.Body({
			mass: 0,
			position: [track_data.walls2[j][0]+wall_dx/2, track_data.walls2[j][1]+wall_dy/2],
			angle: wall_angle
		});
		track.walls[j+i].addShape(boxShape);
		world.addBody(track.walls[j+i]);

		track.graphics.lineTo(track_data.walls2[j+1][0], track_data.walls2[j+1][1])
	}

	// miscWalls
	for(var i = 0; i < track_data.miscWalls.length; ++i) {
		var wall_dx = (track_data.miscWalls[i][1][0]-track_data.miscWalls[i][0][0]),
			wall_dy = (track_data.miscWalls[i][1][1]-track_data.miscWalls[i][0][1]),
			wall_length = Math.sqrt(wall_dx**2 + wall_dy**2),
			wall_angle = -Math.atan(wall_dx/wall_dy);

		var boxShape = new p2.Box({ width: 1, height: wall_length, collisionGroup: TRACKCG, collisionMask: CARCG});
		track.walls[i] = new p2.Body({
			mass: 0,
			position: [track_data.miscWalls[i][0][0]+wall_dx/2, track_data.miscWalls[i][0][1]+wall_dy/2],
			angle: wall_angle
		});
		track.walls[i].addShape(boxShape);
		world.addBody(track.walls[i]);

		track.graphics.moveTo(track_data.miscWalls[i][0][0], track_data.miscWalls[i][0][1]);
		track.graphics.lineTo(track_data.miscWalls[i][1][0], track_data.miscWalls[i][1][1]);
	}

	app.stage.addChild(track.graphics);
}

function generateCar(car, idx) {
	var carShape = new p2.Box({ width: 2, height: 4, collisionGroup: CARCG, collisionMask: TRACKCG | CKHPTCG});
	car.body = new p2.Body({
		mass: .8,
		position: [track_data.start[0], track_data.start[1]],
		angle: track_data.start[2]
	});
	car.body.addShape(carShape);
	car.body.shape = p2.Shape.BOX;
	world.addBody(car.body);

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
	car.vehicle.addToWorld(world);

	car.frontWheel.steerValue = 0;

	car.backWheel.engineForce = 0;
	car.backWheel.setBrakeForce(0);

	car.rays.push({length : 20, angle : -1.3962634016, world : new p2.Ray({mode: p2.Ray.CLOSEST, collisionMask : TRACKCG}), result : new p2.RaycastResult(), graphic : new PIXI.Graphics()});
	car.rays.push({length : 60, angle : -0.6981317008, world : new p2.Ray({mode: p2.Ray.CLOSEST, collisionMask : TRACKCG}), result : new p2.RaycastResult(), graphic : new PIXI.Graphics()});
	car.rays.push({length : 80, angle : -0.3490658504, world : new p2.Ray({mode: p2.Ray.CLOSEST, collisionMask : TRACKCG}), result : new p2.RaycastResult(), graphic : new PIXI.Graphics()});
	car.rays.push({length : 100, angle : 0, world : new p2.Ray({mode: p2.Ray.CLOSEST, collisionMask : TRACKCG}), result : new p2.RaycastResult(), graphic : new PIXI.Graphics()});
	car.rays.push({length : 80, angle : 0.3490658504, world : new p2.Ray({mode: p2.Ray.CLOSEST, collisionMask : TRACKCG}), result : new p2.RaycastResult(), graphic : new PIXI.Graphics()});
	car.rays.push({length : 60, angle : 0.6981317008, world : new p2.Ray({mode: p2.Ray.CLOSEST, collisionMask : TRACKCG}), result : new p2.RaycastResult(), graphic : new PIXI.Graphics()});
	car.rays.push({length : 20, angle : 1.3962634016, world : new p2.Ray({mode: p2.Ray.CLOSEST, collisionMask : TRACKCG}), result : new p2.RaycastResult(), graphic : new PIXI.Graphics()});

	// add car and rays to stage
	for(var i = 0; i < 7; ++i)
		app.stage.addChild(car.rays[i].graphic);

	app.stage.addChild(car.graphics);

	car.prevOutputs.push(0.5);  // set steering to neutral
	car.prevOutputs.push(car_max_reverse_accel/(car_max_forward_accel + car_max_reverse_accel));  // throttle to 0
	car.prevOutputs.push(0);  // standard brake to 0
	car.prevOutputs.push(0);  // e-brake to 0
}

// pixijs interaction
app.renderer.view.addEventListener('wheel', function(event) {
	event.preventDefault();

	if((event.deltaX + event.deltaY + event.deltaZ) > 0) {
		if(zoom > 1)
			zoom -= 1;
	} else
		zoom += 1;

	resize();
});


// Window resizing stuff
window.addEventListener('resize', resize);
window.addEventListener('orientationchange', orientationchange);

function resize() {
	var w = window.innerWidth;
	var h = window.innerHeight;

	app.renderer.resize(w, h);

	app.stage.scale.x = zoom*w/1600;
	app.stage.scale.y = -zoom*h/900;

	if(app.stage.scale.x > (-app.stage.scale.y))
		app.stage.scale.x = -app.stage.scale.y;
	else
		app.stage.scale.y = -app.stage.scale.x;

	renderUpdate();
}
resize();

function orientationchange() {
	window.scrollTo(0, 0);
	resize();
	window.scrollTo(0, 0);
	window.scrollTo(0, 0);
}


window.addEventListener("copy", e => {
	e.preventDefault();

	const net = gen_algo.population[0].net.save();

	console.log(net);
	e.clipboardData.setData('text/plain', net);
});

window.addEventListener("paste", e => {
	e.preventDefault();

	const net_obj = JSON.parse((e.clipboardData || window.clipboardData).getData("text"));

	scores[0].times[scores[0].times.length - 1] = m_sim_steps;
	scores[0].racing = true;

	gen_algo.population[0].net.load(net_obj);
	console.log("neural net restored");
});

parent.document.getElementById("pretrained").addEventListener("click", () => {
	const net_obj = JSON.parse('{"inputs":12,"hidden_layers":[{"inputs":12,"neurons":[{"weights":[-0.28413118213989424,-0.26557951773823524,1.104276160486788,-0.8589548990581757,0.48991922436662483,-0.690222365325193,0.36652248075373695,0.39730477616493504,0.6918015866461084,1.0628397551835156,-0.4529675883541771,-0.6097750440404699],"bias":0.21459496682080662},{"weights":[0.6027373658285836,-0.30412478884945787,0.07262153934791085,-0.03944678324816374,0.8069227792923274,-0.3905847129018902,-0.8541663438768914,-1.1469363665875885,0.7170934011488,0.7464663141031873,0.5691079168866573,0.26376229518848726],"bias":0},{"weights":[-0.9639905702638478,0.32312199319296,-0.025782737304205758,0.5548446344741808,-0.1302494716551864,-0.11828736437630277,-0.47587614715071824,-0.07218505768089588,-0.6864022907123851,-0.21759925711659447,0.7178203964867654,-0.7038717348730472],"bias":-0.10094409707457619},{"weights":[0.0997732154013404,-0.00590372554375114,0.6269711953331479,0.8893010674985276,-0.07018185522994734,0.4249680118302581,-0.3765323522652454,-0.4724600914909404,-0.8013600750382222,0.19513592607806096,-0.1471455992011507,-0.37529304961166954],"bias":-0.3139309341272317},{"weights":[0.42394643126398224,-0.16825197244401557,0.3432154302026682,0.6628225957555238,-0.09470677871833957,-0.9841031407871266,0.5073430850214387,-0.5919513967729014,0.11198362247193906,0.7759129683053332,0.07090654489095138,0.034897615106578],"bias":0.17171205220653274},{"weights":[-0.9159753720891365,0.5304664491434828,-0.07709680147813554,-0.6591530998680288,0.2085162482489457,0.056787022027929374,-0.5276230194573965,-0.5203319138950415,0.11834499616819523,0.4755629991926412,-0.14659536228030093,-0.8357053141014177],"bias":0.03710169677194509},{"weights":[-0.4661728826847559,-0.012557010778356172,-0.5290020890429895,0.6694465971103127,0.5722078817254714,0.09470976828637882,0.4572257666715487,-0.9789958602592923,1.0845179564516234,-0.6774675674085299,0.256725143303481,0.9052521501663232],"bias":-0.305494060535614},{"weights":[0.7141861172002517,0.7686205379634558,-0.3510821375390428,0.7483868993798253,0.539073742342631,0.8928507184723085,0.2582473225178215,-0.9530409528590851,0.996421404163776,-0.36142183934078437,0.8330805500290472,-0.4109898441376658],"bias":-0.0705174094962996},{"weights":[-0.12617007973884903,-0.8109975078843159,0.5596263819930322,0.5219633051447675,-0.8892333536203441,-0.38136654201266,-0.8386103328611775,-0.44271308211525046,-0.5780697864811786,-0.22412668041463926,-0.3714911142517509,0.03797855816229758],"bias":-0.11025374204794085},{"weights":[0.3911789844969765,0.25083219678290947,0.21900428711625786,0.7174156414890929,-0.21078255659598755,0.24216995375606998,-0.3951867214451557,-0.798036982327093,0.18772883143643176,0.9587028100477961,0.3927647923007322,-0.8621974939389171],"bias":-0.012036221181522767}]}],"output_layer":{"inputs":10,"neurons":[{"weights":[0.7530627545267151,0.34004393504179337,0.799211703217745,0.8574709737824384,0.6095436790407794,0.4656043879975161,-0.0549213721314219,-0.8631825631982207,0.4354930684609113,0.8248744652183063],"bias":-0.06917377782005064},{"weights":[1.032305985334006,-0.36641737125743074,-0.4693741622481235,0.9929647679183465,-0.07391433472952652,0.07055263563286394,-0.1470508367815206,-0.013399645165783437,0.54673714471659,-0.24662990716132333],"bias":-0.11488130267411228},{"weights":[-0.7326891906899162,-0.19989828823831068,-0.46486729202954463,-0.3185719980353725,0.8386073949269339,-0.9727273111664854,-0.6987544531184455,-0.7650487377296435,0.9001254261508083,0.4311303919975358],"bias":-0.028469936350350628},{"weights":[0.35724596044048174,-0.6005930133257734,0.7492985082081991,0.9232846626184497,-0.9545964004008525,-0.9964641322152803,-0.6217787046254284,-0.5294168234300058,1.0236607554070138,0.3047990238455073],"bias":0.19256076962343383}]}}');

	scores[0].times[scores[0].times.length - 1] = m_sim_steps;
	scores[0].racing = true;

	gen_algo.population[0].net.load(net_obj);
	console.log("neural net restored");
});
