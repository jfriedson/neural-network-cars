// initialize physical collision callbacks
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

			// reward for time during relatively straight sections of track to
			// improve learning of tight turns
			if (app.statTrackingVars.record_chkpts == app.track.chkpts.length ||
					((app.cars[c].score.chkpts <= 2 || app.cars[c].score.chkpts >= 8) &&
				 	(app.cars[c].score.chkpts <= 20 || app.cars[c].score.chkpts >= 40)))
			{
				app.cars[c].score.score += time_limit - (app.cars[c].score.times[app.cars[c].score.times.length-1] - app.cars[c].score.times[app.cars[c].score.times.length-2])/m_sim_world_fps;
			}
		}
		// wall
		else if(!get_pt && app.cars[c].score.racing) {
			app.cars[c].score.score -= 10 * app.cars[c].score.chkpts;

			// reward - distance from previous checkpoint
			if (app.cars[c].score.chkpts >= 1) {
				app.cars[c].score.score += Math.sqrt((app.cars[c].body.position[0] - app.track.chkpts[app.cars[c].score.chkpts-1].position[0])**2 + (app.cars[c].body.position[1] - app.track.chkpts[app.cars[c].score.chkpts-1].position[1])**2);
			}

			// penalize - distance to next checkpoint
			if (app.cars[c].score.chkpts < app.track.chkpts.length) {
				app.cars[c].score.score -= Math.sqrt((app.cars[c].body.position[0] - app.track.chkpts[app.cars[c].score.chkpts].position[0])**2 + (app.cars[c].body.position[1] - app.track.chkpts[app.cars[c].score.chkpts].position[1])**2);
			}

			app.cars[c].score.racing = false;

			// perpendicular wheels & random angular velocity for comedic effect
			app.cars[c].frontWheel.steerValue = 1.57;
			app.cars[c].body.angularVelocity = (2 * Math.random() - 1) * app.cars[c].body.velocity[0] * app.cars[c].body.velocity[1] / 10;
		}
	});
}


// initialize simulation objects

function initRenderer(app) {
	PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.LINEAR;
	app.renderer = new PIXI.Application({ width: 1600, height: 900, backgroundColor: 0x060f39, autoDensity: true, resolution: window.devicePixelRatio||1 });

	document.body.appendChild(app.renderer.renderer.view);
	app.renderer.renderer.view.oncontextmenu = function (e) {
		e.preventDefault();
	};

	app.camera_target = 0;
	app.camera_lerp_alpha = 1;
}

function initPhysWorld(app) {
	app.phys_world = new p2.World({gravity : [0,0]});

	app.phys_world.collisionGroups = class {
		static TRACK = Math.pow(2, 1);
		static CHKPT = Math.pow(2, 2);
		static CAR   = Math.pow(2, 3);
	}
}

function initTrackData(app) {
	const silverstone_reverse = {start : [-10,-50, 0],
		walls1 : [[0,0],[0,-279],[2,-294],[8,-310],[15,-320],[25,-329],[40,-336],[74,-347],[130,-358],[171,-362],[198,-365],[338,-359],[353,-361],[366,-363],[392,-373],[412,-382],[425,-385],[434,-384],[442,-381],[509,-353],[521,-349],[532,-350],[544,-351],[556,-355],[568,-363],[582,-372],[593,-378],[614,-380],[624,-379],[634,-374],[644,-367],[652,-357],[664,-339],[672,-315],[678,-306],[686,-293],[701,-281],[1076,-32],[1113,-2],[1131,17],[1141,34],[1143,41],[1145,58],[1143,70],[1137,85],[1126,99],[1114,108],[1097,115],[1065,126],[1038,141],[1012,159],[998,170],[985,182],[972,193],[964,196],[957,198],[907,228],[900,238],[899,248],[901,254],[914,272],[920,289],[915,299],[894,319],[868,333],[836,343],[821,342],[811,337],[561,111],[553,98],[550,87],[549,72],[551,61],[567,-8],[568,-23],[568,-41],[564,-61],[555,-82],[485,-187],[481,-195],[481,-202],[487,-212],[494,-217],[507,-219],[559,-230],[567,-234],[572,-243],[573,-251],[568,-259],[542,-275],[517,-284],[474,-292],[462,-294],[452,-293],[445,-289],[124,9],[113,24],[109,42],[110,63],[119,79],[130,85],[179,94],[191,99],[201,110],[205,121],[205,138],[200,149],[192,157],[178,165],[163,166],[148,160],[59,102],[31,72],[17,50],[4,18],[0,0]],
		walls2 : [[-20,6],[-17,20],[-2,58],[0,61],[16,86],[48,119],[137,177],[141,179],[156,185],[164,186],[179,185],[188,182],[202,174],[206,171],[214,163],[218,157],[223,146],[225,138],[225,121],[220,103],[216,97],[206,86],[199,81],[187,76],[183,74],[137,66],[134,64],[130,57],[129,44],[132,32],[139,22],[457,-273],[458,-274],[461,-274],[471,-272],[512,-265],[533,-257],[548,-248],[503,-239],[491,-237],[482,-233],[475,-228],[470,-222],[464,-212],[461,-202],[461,-195],[463,-186],[467,-178],[468,-176],[537,-72],[545,-55],[548,-39],[548,-24],[547,-11],[532,56],[531,57],[529,68],[529,73],[530,88],[531,92],[534,103],[536,108],[544,121],[548,126],[798,352],[802,355],[812,360],[820,362],[835,363],[842,362],[874,352],[877,351],[903,337],[908,333],[929,313],[933,308],[938,298],[939,282],[933,265],[930,260],[919,245],[919,245],[921,243],[965,217],[969,215],[971,215],[979,212],[985,208],[998,197],[999,197],[1011,185],[1024,175],[1049,158],[1073,144],[1104,134],[1105,133],[1122,126],[1126,124],[1138,115],[1142,111],[1153,97],[1156,92],[1162,77],[1163,73],[1165,61],[1165,56],[1163,39],[1162,36],[1160,29],[1158,24],[1148,7],[1146,3],[1128,-16],[1126,-18],[1089,-48],[1087,-49],[713,-297],[701,-305],[690,-324],[683,-345],[680,-351],[675,-358],[669,-367],[668,-369],[660,-379],[655,-383],[645,-390],[633,-397],[626,-399],[616,-400],[605,-400],[590,-398],[583,-396],[572,-390],[557,-380],[547,-373],[540,-371],[530,-370],[523,-369],[516,-372],[450,-399],[441,-403],[436,-404],[427,-405],[421,-404],[408,-401],[404,-400],[384,-391],[361,-382],[350,-381],[337,-379],[199,-385],[196,-385],[169,-382],[128,-378],[126,-378],[70,-367],[68,-366],[34,-355],[32,-354],[17,-347],[12,-344],[2,-335],[-1,-331],[-8,-321],[-11,-317],[-17,-301],[-18,-297],[-20,-282],[-20,-279],[-20,0],[-20,6]],
		miscWalls: [],
		chkpts : [[[-20,-25],[0,-25]],[[-17,20],[4,18]],[[-2,58],[17,50]],[[48,119],[59,102]],[[137,177],[148,160]],[[225,121],[205,121]],[[130,57],[110,63]],[[165,-29],[179,-15]],[[342,-194],[357,-180]]]};

	app.track_data = JSON.parse(JSON.stringify(silverstone_reverse));
    app.track_data.start = [200, -376, -1.52];
    //app.track_datasilverstone_demo.miscWalls = [[[260,-362],[261,-374]], [[281,-371],[280,-382]]];
	app.track_data.chkpts = [[[240,-363],[241,-383]],[[300,-361],[301,-380]],[[360,-362],[356,-382]],[[412,-382],[404,-400]],[[462,-373],[470,-391]],[[521,-349],[523,-369]],[[582,-372],[571,-389]],[[640,-370],[651,-386]],[[690,-324],[672,-315]],[[730,-262],[741,-279]],[[790,-222],[801,-239]],[[850,-182],[861,-199]],[[910,-142],[921,-159]],[[970,-102],[981,-119]],[[970,-102],[981,-119]],[[1030,-62],[1041,-79]],[[1088,-22],[1100,-39]],[[1137,27],[1155,18]],[[1139,79],[1158,85]],[[1111,109],[1119,127]],[[1064,127],[1072,144]],[[1012,159],[1025,174]],[[971,215],[963,197]],[[914,272],[933,265]],[[890,322],[900,339]],[[858,357],[851,339]],[[771,328],[786,314]],[[724,285],[738,271]],[[679,245],[694,231]],[[633,203],[647,189]],[[581,156],[595,142]],[[529,80],[549,80]],[[541,16],[560,20]],[[545,-54],[564,-61]],[[514,-108],[530,-119]],[[484,-152],[501,-162]],[[485,-210],[473,-226]],[[524,-223],[521,-242]],[[545,-250],[554,-267]],[[494,-268],[498,-287]],[[442,-259],[426,-272]],[[397,-218],[384,-232]],[[354,-178],[340,-192]],[[309,-136],[295,-150]],[[264,-94],[250,-108]],[[219,-52],[205,-66]],[[174,-10],[160,-24]],[[139,21],[124,9]],[[109,42],[129,44]],[[149,89],[152,69]],[[192,100],[207,87]],[[205,135],[225,137]],[[198,176],[188,159]],[[126,170],[138,154]],[[86,144],[98,128]],[[47,118],[59,102]],[[15,85],[31,72]],[[-8,42],[11,36]],[[-20,-13],[0,-13]],[[-20,-70],[0,-70]],[[-20,-130],[0,-130]],[[-20,-190],[0,-190]],[[-20,-250],[0,-250]],[[-18,-297],[2,-293]],[[27,-330],[18,-347]],[[71,-346],[65,-365]],[[122,-356],[119,-377]],[[183,-363],[182,-383]]];
}

function initTrack(app) {
	// create track graphics and collisions
	app.track = {walls : [], chkpts : [], graphics : new PIXI.Graphics()};
	generateTrack(app.track, app.track_data, app.phys_world, app.renderer);
}

function initCars(app) {
	// generate cars' graphics, collisions, and neural networks
	app.cars = [];

	// in this order for best networks drawn in front
	for(var i = m_car_amt - 1; i >= 0; --i) {
		var car = {body : null, vehicle : null, graphics : new PIXI.Graphics(), frontWheel : null, backWheel : null, rays : [], prevOutputs : [], score : {racing: true, chkpts : 0, times : [0], score : 0}};
		app.cars.unshift(car);
		generateCar(car, app.track_data, i, app.phys_world, app.renderer);
	}
}

function initGraph(app) {
	app.graph = {graphics : new PIXI.Graphics(), text : new PIXI.Text("best performing network activations", {fontFamily : 'Arial', fontSize: 30, fill : 0xffffff, align : 'left'})};

	app.renderer.stage.addChild(app.graph.graphics);
	app.renderer.stage.addChild(app.graph.text);
}

function initGenAlgo(app) {
	app.gen_algo = new GenAlgo(m_car_amt, net_input_cnt, m_hidden_layers, m_hidden_neurons, net_output_cnt);
	app.gen_algo.GenerateNewPopulation();
}

function initScoreboard(app) {
	app.scoreboard = new PIXI.Text("click canvas to toggle sim speed\nworld 0fps\nrenderer 0fps\n\nGeneration 1\nLeaderboard",{fontFamily : 'Arial', fontSize: 30, fill : 0xffffff, align : 'left'});
	
	app.renderer.stage.addChild(app.scoreboard);
}