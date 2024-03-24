function render(app, spawn_new_timer, recenter_camera) {
	const now = performance.now();

	if (spawn_new_timer) {
		const new_delay = Math.max(app.loopControl.render.delay - (now - app.loopControl.render.next_time), 0);
		app.loopControl.render.timeout = setTimeout(app.render.bind(app), new_delay);
		app.loopControl.render.next_time += app.loopControl.render.delay;
	}

	// fps calculation
	++app.loopControl.render.frame_cnt;
	if ((now - app.loopControl.render.fps_last_update) > 1000) {
		app.loopControl.render.fps_last_update = now;

		// update render fps on scoreboard
		var text = app.scoreboard.text.split("\n");
		text[2] = "renderer " + app.loopControl.render.frame_cnt + "fps";
		app.scoreboard.text = text.join("\n");

		app.loopControl.render.frame_cnt = 0;
	}

	// draw cars
	for (const c in app.cars) {
		app.cars[c].graphics.position.x = app.cars[c].body.position[0];
		app.cars[c].graphics.position.y = app.cars[c].body.position[1];
		app.cars[c].graphics.rotation   = app.cars[c].body.angle;

		for (var i = 0; i < 7; ++i) {
			app.cars[c].rays[i].graphic.clear();
			if (app.cars[c].score.racing) {
				if (app.cars[c].rays[i].result.hasHit()) {
					var hitPoint = p2.vec2.create();
					app.cars[c].rays[i].result.getHitPoint(hitPoint, app.cars[c].rays[i].phys_world);
					app.cars[c].rays[i].graphic.lineStyle(.25, 0xff0000, 1, .5, false);
					app.cars[c].rays[i].graphic.moveTo(app.cars[c].body.position[0], app.cars[c].body.position[1]);
					app.cars[c].rays[i].graphic.lineTo(hitPoint[0], hitPoint[1]);
				}
				else {
					app.cars[c].rays[i].graphic.lineStyle(.25, 0xff0000, 1, .5, false);
					app.cars[c].rays[i].graphic.moveTo(app.cars[c].body.position[0], app.cars[c].body.position[1]);
					app.cars[c].rays[i].graphic.lineTo(
						app.cars[c].body.position[0] - Math.sin(app.cars[c].body.angle + app.cars[c].rays[i].angle) * app.cars[c].rays[i].length,
						app.cars[c].body.position[1] + Math.cos(app.cars[c].body.angle + app.cars[c].rays[i].angle) * app.cars[c].rays[i].length
					);
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

	updateCamera(app, recenter_camera, best_car);

	// UI
	const UI_res = 2 * app.renderer.renderer.resolution;
	const UI_center_x =  (app.renderer.renderer.width/UI_res - app.renderer.stage.position.x)/app.renderer.stage.scale.x;
	const UI_center_y = (app.renderer.renderer.height/UI_res - app.renderer.stage.position.y)/app.renderer.stage.scale.y;
	const UI_scale_x = 1/(app.renderer.stage.scale.x/app.cameraControl.zoom_base);
	const UI_scale_y = 1/(app.renderer.stage.scale.y/app.cameraControl.zoom_base);

	// scoreboard positioning
	app.scoreboard.x = UI_center_x - (780 * UI_scale_x);
	app.scoreboard.y = UI_center_y - (430 * UI_scale_y);
	app.scoreboard.scale.x = UI_scale_x;
	app.scoreboard.scale.y = UI_scale_y;

	
	// draw neural net graph
	renderGraph(app, best_car);

	app.graph.text.x = UI_center_x + (240 * UI_scale_x);
	app.graph.text.y = UI_center_y - (430 * UI_scale_y);
	app.graph.text.scale.x = UI_scale_x;
	app.graph.text.scale.y = UI_scale_y;

	app.graph.graphics.x = UI_center_x + (240 * UI_scale_x);
	app.graph.graphics.y = UI_center_y - (390 * UI_scale_y);
	app.graph.graphics.scale.x = UI_scale_x;
	app.graph.graphics.scale.y = UI_scale_y;

	app.renderer.renderer.render(app.renderer.stage);
}


// on page load and resize events, used to immediately draw something to the screen
// in order to eliminate empty screen space
function renderUpdate(app) {
	render(app, false, true);
}

// update camera position and zoom
function updateCamera(app, recenter_camera, best_car) {
	if (recenter_camera)
		app.cameraControl.pos_lerp_alpha = 1;

	if (app.cameraControl.camera_target != best_car) {
		app.cameraControl.camera_target = best_car;
		app.cameraControl.pos_lerp_alpha = 0;
		app.cameraControl.zoom_lerp_alpha = 0;
	}
	
	// camera zoom based on best car speed
	const car_speed = Math.sqrt(app.cars[best_car].body.velocity[0]**2 + app.cars[best_car].body.velocity[1]**2) / 10;
	const new_scale = Math.max(1, (-1/app.cameraControl.zoom_base) + app.cameraControl.zoom_mod - (car_speed*app.cameraControl.zoom_base));

	const old_scale_x = app.renderer.stage.scale.x;
	const old_scale_y = app.renderer.stage.scale.y;

	if (app.cameraControl.zoom_lerp_alpha == 1) {
		app.renderer.stage.scale.x =  new_scale;
		app.renderer.stage.scale.y = -new_scale;
	}
	else {
		app.renderer.stage.scale.x = (1 - app.cameraControl.zoom_lerp_alpha) * app.renderer.stage.scale.x + app.cameraControl.zoom_lerp_alpha * new_scale;
		app.renderer.stage.scale.y = (1 - app.cameraControl.zoom_lerp_alpha) * app.renderer.stage.scale.y - app.cameraControl.zoom_lerp_alpha * new_scale;
	
		app.cameraControl.zoom_lerp_alpha += (app.loopControl.phys.iter_per_sec * app.loopControl.phys.steps_per_iter)/(app.loopControl.render.fps*200);
		app.cameraControl.zoom_lerp_alpha = Math.min(app.cameraControl.zoom_lerp_alpha, 1);
	}
	app.renderer.stage.position.x -= app.cars[best_car].graphics.position.x * (app.renderer.stage.scale.x - old_scale_x);
	app.renderer.stage.position.y -= app.cars[best_car].graphics.position.y * (app.renderer.stage.scale.y - old_scale_y);

	// camera positioning
	const car_pos_x =  app.renderer.renderer.width/(2 * app.renderer.renderer.resolution) - app.renderer.stage.scale.x * app.cars[best_car].graphics.position.x,
		  car_pos_y = app.renderer.renderer.height/(2 * app.renderer.renderer.resolution) - app.renderer.stage.scale.y * app.cars[best_car].graphics.position.y;

	if (app.cameraControl.pos_lerp_alpha == 1) {
		app.renderer.stage.position.x = car_pos_x;
		app.renderer.stage.position.y = car_pos_y;
	}
	else {
		app.renderer.stage.position.x = (1 - app.cameraControl.pos_lerp_alpha) * app.renderer.stage.position.x + app.cameraControl.pos_lerp_alpha * car_pos_x;
		app.renderer.stage.position.y = (1 - app.cameraControl.pos_lerp_alpha) * app.renderer.stage.position.y + app.cameraControl.pos_lerp_alpha * car_pos_y;
		
		app.cameraControl.pos_lerp_alpha += (app.loopControl.phys.iter_per_sec * app.loopControl.phys.steps_per_iter)/(app.loopControl.render.fps*100);
		app.cameraControl.pos_lerp_alpha += .1/Math.abs(app.renderer.stage.position.x - car_pos_x);
		app.cameraControl.pos_lerp_alpha += .1/Math.abs(app.renderer.stage.position.y - car_pos_y);
		app.cameraControl.pos_lerp_alpha = Math.min(app.cameraControl.pos_lerp_alpha, 1);
	}
}

function sortConnActv(a, b) {
	return a.actv - b.actv;
}

// neural network graph - draw best performing car neural network activations
function renderGraph(app, best_car) {
	app.graph.graphics.clear();

	// calculate neural network inputs
	var input = [];
	input.push(Math.sqrt(app.cars[best_car].body.velocity[0]**2 + app.cars[best_car].body.velocity[1]**2) / 50);
	input.push(Activations.sigmoid(app.cars[best_car].body.angularVelocity));  // angular velocity
	for (var i = 0; i < 4; ++i)
		input.push(app.cars[best_car].prevOutputs[i]);
	for (var i = 0; i < 7; ++i) {
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
	for (const l in net.hidden_layers) {
		var layer_out = new Array(net.hidden_layers[l].neurons.length);
		var conn_activations = new Array(layer_in.length * layer_out.length);

		for (const n in net.hidden_layers[l].neurons) {
			layer_out[n] = 0;
			
			for (const w in net.hidden_layers[l].neurons[n].weights) {
				const conn = layer_in[w] * net.hidden_layers[l].neurons[n].weights[w];
				layer_out[n] += conn;
				conn_activations[(n * layer_in.length) + Number(w)] = {
					actv: 0xff * Math.min(Math.max(0, conn), 1),
					n: n,
					w: w
				};
			}

			const z = net.hidden_layers[l].activation;
			const b = net.hidden_layers[l].neurons[n].bias;
			layer_out[n] = z(layer_out[n] + b);
		}
		conn_activations.sort(sortConnActv);
		for (const a in conn_activations) {
			app.graph.graphics.lineStyle(
				2, (conn_activations[a].actv << 24) + (conn_activations[a].actv << 16) + conn_activations[a].actv,
				1, .5, true
			);
			app.graph.graphics.moveTo(x_offset + l * x_spacing, y_offset + conn_activations[a].w * y_spacing);
			app.graph.graphics.lineTo(x_offset + (l + 1) * x_spacing, y_offset + conn_activations[a].n * y_spacing);
		}

		layer_in = layer_out;
	}

	//  draw output weights
	var output = Array(net.output_layer.neurons.length);
	var conn_activations = new Array(layer_in.length * output.length);
	for (const n in net.output_layer.neurons) {
		output[n] = 0;

		for (const w in net.output_layer.neurons[n].weights) {
			const conn = layer_in[w] * net.output_layer.neurons[n].weights[w];
			output[n] += conn;
			conn_activations[(n * layer_in.length) + Number(w)] = {
				actv: 0xff * Math.min(Math.max(0, conn), 1),
				n: n,
				w: w
			};
		}

		const z = net.output_layer.activation;
		const b = net.output_layer.neurons[n].bias;
		output[n] = z(output[n] + b);
	}
	conn_activations.sort(sortConnActv);
	for (const a in conn_activations) {
		app.graph.graphics.lineStyle(2, (conn_activations[a].actv << 24) + (conn_activations[a].actv << 16) + conn_activations[a].actv, 1, .5, true);
		app.graph.graphics.moveTo(x_offset + net.hidden_layers.length * x_spacing, y_offset + conn_activations[a].w * y_spacing);
		app.graph.graphics.lineTo(x_offset + (net.hidden_layers.length + 1) * x_spacing, y_offset + conn_activations[a].n * y_spacing);
	}

	// input neurons
	app.graph.graphics.lineStyle(0, 0, 0, .5, false);
	for (const neuron in input) {
		const gray = 0xff * Math.min(Math.max(0, input[neuron]), 1);
		app.graph.graphics.beginFill((gray << 24) + (gray << 16) + gray, 1);
		app.graph.graphics.drawCircle(x_offset, y_offset + neuron * y_spacing, 10);
		app.graph.graphics.endFill();
	}

	// draw last hidden layer neurons
	for (const neuron in layer_in) {
		const gray = 0xff * Math.min(Math.max(0, layer_in[neuron]), 1);
		app.graph.graphics.beginFill((gray << 24) + (gray << 16) + gray, 1);
		app.graph.graphics.drawCircle(x_offset + x_spacing, y_offset + neuron * y_spacing, 10);
		app.graph.graphics.endFill();
	}

	for (const neuron in output) {
		//graph.lineStyle(2, 0x000000, 1, .5, false);
		const gray = 0xff * Math.min(Math.max(0, output[neuron]), 1);
		app.graph.graphics.beginFill((gray << 24) + (gray << 16) + gray, 1);
		app.graph.graphics.drawCircle(x_offset + 2 * x_spacing, y_offset + neuron * y_spacing, 10);
		app.graph.graphics.endFill();
	}
}
