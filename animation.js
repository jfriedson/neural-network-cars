function setAnimIntv(app) {
	clearInterval(app.animate_intv);

	const m_render_delay = 1000/m_render_fps;

	app.animate_intv = setInterval(app.stepAnimation.bind(app), m_render_delay);
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
