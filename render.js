function setAnimIntv(app) {
	clearInterval(app.animate_intv);

	const m_render_delay = 1000/m_render_fps;

	app.animate_intv = setInterval(app.stepAnimation.bind(app), m_render_delay);
}

function animate(app, recenter_camera) {
	const now = performance.now();

	// clear records older than a second to easily calculate FPS
	while (app.statTrackingVars.render_times.length > 0 && app.statTrackingVars.render_times[0] <= now - 1000)
		app.statTrackingVars.render_times.shift();
	app.statTrackingVars.render_times.push(now);

	// update render FPS on scoreboard
	var text = app.scoreboard.text.split("\n");
	text[2] = "renderer " + app.statTrackingVars.render_times.length.toString() + "fps";
	app.scoreboard.text = text.join("\n");

	// draw cars
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

	// calculate car with best score currently for camera and UI element positioning
	var best_score = Number.MIN_SAFE_INTEGER,
		best_car = 0;
	for (const c in app.cars) {
		if (app.cars[c].score.racing && (app.cars[c].score.score > best_score)) {
			best_score = app.cars[c].score.score;
			best_car = c;
		}
	}


	// camera positioning
	var target_changed = false;
	if(app.camera_target != best_car) {
		app.camera_target = best_car;
		app.camera_lerp_value = 0;
		target_changed = true;
	}

	const car_pos_x = app.renderer.renderer.width/(2 * app.renderer.renderer.resolution) - app.renderer.stage.scale.x * app.cars[best_car].graphics.position.x,
		  car_pos_y = app.renderer.renderer.height/(2 * app.renderer.renderer.resolution) - app.renderer.stage.scale.y * app.cars[best_car].graphics.position.y;

	if (!recenter_camera && (target_changed || (app.camera_lerp_value < 1))) {
		const cam_dist = Math.sqrt((car_pos_x - app.renderer.stage.position.x)**2 + (car_pos_y - app.renderer.stage.position.y)**2);

		app.camera_lerp_value += 1/m_render_fps + cam_dist/1000000;
		app.camera_lerp_value = Math.min(app.camera_lerp_value, 1);

		app.renderer.stage.position.x = (1 - app.camera_lerp_value) * app.renderer.stage.position.x + app.camera_lerp_value * car_pos_x;
		app.renderer.stage.position.y = (1 - app.camera_lerp_value) * app.renderer.stage.position.y + app.camera_lerp_value * car_pos_y;
	}
	else {
		app.renderer.stage.position.x = car_pos_x;
		app.renderer.stage.position.y = car_pos_y;
	}


	// scoreboard positioning
	app.scoreboard.x =  (app.renderer.renderer.width/(2 * app.renderer.renderer.resolution) - app.renderer.stage.position.x)/app.renderer.stage.scale.x - 780/zoom;
	app.scoreboard.y = (app.renderer.renderer.height/(2 * app.renderer.renderer.resolution) - app.renderer.stage.position.y)/app.renderer.stage.scale.y + 430/zoom;
	app.scoreboard.scale.x = 1/zoom;
	app.scoreboard.scale.y = -1/zoom;

	
	// draw neural net graph
	renderGraph(app, best_car);

	app.graph.text.x =  (app.renderer.renderer.width/(2 * app.renderer.renderer.resolution) - app.renderer.stage.position.x)/app.renderer.stage.scale.x + 240/zoom;
	app.graph.text.y = (app.renderer.renderer.height/(2 * app.renderer.renderer.resolution) - app.renderer.stage.position.y)/app.renderer.stage.scale.y + 430/zoom;
	app.graph.text.scale.x = 1/zoom;
	app.graph.text.scale.y = -1/zoom;

	app.graph.graphics.x =  (app.renderer.renderer.width/(2 * app.renderer.renderer.resolution) - app.renderer.stage.position.x)/app.renderer.stage.scale.x + 240/zoom;
	app.graph.graphics.y = (app.renderer.renderer.height/(2 * app.renderer.renderer.resolution) - app.renderer.stage.position.y)/app.renderer.stage.scale.y + 390/zoom;
	app.graph.graphics.scale.x = 1/zoom;
	app.graph.graphics.scale.y = -1/zoom;

	app.renderer.renderer.render(app.renderer.stage);
}


// on page load and resize events, used to immediately draw something to the screen
// in order to eliminate empty screen space
function renderUpdate(app) {
	animate(app, true);
}


// neural network graph - draw best performing car neural network activations
function renderGraph(app, best_car) {
	app.graph.graphics.clear();

	// calculate neural network inputs
	var input = [];
	input.push(Math.sqrt(app.cars[best_car].body.velocity[0]**2 + app.cars[best_car].body.velocity[1]**2) / 50);
	input.push(Activations.sigmoid(app.cars[best_car].body.angularVelocity));  // angular velocity
	for(var i = 0; i < 4; ++i)
		input.push(app.cars[best_car].prevOutputs[i]);
	for(var i = 0; i < 7; ++i) {
		const ray_dist = (app.cars[best_car].rays[i].result.fraction == -1) ? 1 : app.cars[best_car].rays[i].result.fraction;
		input.push(ray_dist);
	}


	const net = app.gen_algo.population[best_car].net;

	const x_offset = 30;
	const x_spacing = 200;
	const y_offset = 15;
	const y_spacing = 30;

	// draw weight activations between input and hidden layers
	var layer_in = input;
	for(const l in net.hidden_layers) {
		var layer_out = new Array(net.hidden_layers[l].neurons.length);

		for(const n in net.hidden_layers[l].neurons) {
			layer_out[n] = 0;
			
			for(const w in net.hidden_layers[l].neurons[n].weights) {
				const conn = layer_in[w] * net.hidden_layers[l].neurons[n].weights[w];
				layer_out[n] += conn;

				const gray = 0xff * Math.min(Math.max(0, conn), 1);
				app.graph.graphics.lineStyle(2, (gray << 24) + (gray << 16) + gray, 1, .5, true);
				app.graph.graphics.moveTo(x_offset + l * x_spacing, y_offset + w * y_spacing);
				app.graph.graphics.lineTo(x_offset + (l + 1) * x_spacing, y_offset + n * y_spacing);
			}

			const z = net.hidden_layers[l].activation;
			const b = net.hidden_layers[l].neurons[n].bias;
			layer_out[n] = z(layer_out[n] + b);
		}

		layer_in = layer_out;
	}

	//  draw output weights
	var output = Array(net.output_layer.neurons);
	for(const n in net.output_layer.neurons) {
		output[n] = 0;

		for(const w in net.output_layer.neurons[n].weights) {
			const conn = layer_in[w] * net.output_layer.neurons[n].weights[w];
			output[n] += conn;

			const gray = 0xff * Math.min(Math.max(0, conn), 1);
			app.graph.graphics.lineStyle(2, (gray << 24) + (gray << 16) + gray, 1, .5, true);
			app.graph.graphics.moveTo(x_offset + net.hidden_layers.length * x_spacing, y_offset + w * y_spacing);
			app.graph.graphics.lineTo(x_offset + (net.hidden_layers.length + 1) * x_spacing, y_offset + n * y_spacing);
		}

		const z = net.output_layer.activation;
		const b = net.output_layer.neurons[n].bias;
		output[n] = z(output[n] + b);
	}


	// input neurons
	app.graph.graphics.lineStyle(0, 0, 0, .5, false);
	for(const neuron in input) {
		const gray = 0xff * Math.min(Math.max(0, input[neuron]), 1);
		app.graph.graphics.beginFill((gray << 24) + (gray << 16) + gray, 1);
		app.graph.graphics.drawCircle(x_offset, y_offset + neuron * y_spacing, 10);
		app.graph.graphics.endFill();
	}

	// draw last hidden layer neurons
	for(const neuron in layer_in) {
		const gray = 0xff * Math.min(Math.max(0, layer_in[neuron]), 1);
		app.graph.graphics.beginFill((gray << 24) + (gray << 16) + gray, 1);
		app.graph.graphics.drawCircle(x_offset + x_spacing, y_offset + neuron * y_spacing, 10);
		app.graph.graphics.endFill();
	}

	for(const neuron in output) {
		//graph.lineStyle(2, 0x000000, 1, .5, false);
		const gray = 0xff * Math.min(Math.max(0, output[neuron]), 1);
		app.graph.graphics.beginFill((gray << 24) + (gray << 16) + gray, 1);
		app.graph.graphics.drawCircle(x_offset + 2 * x_spacing, y_offset + neuron * y_spacing, 10);
		app.graph.graphics.endFill();
	}
}