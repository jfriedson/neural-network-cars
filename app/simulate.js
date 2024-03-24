// 12 inputs: 7 rays, car speed, steerings angle, gas throttle, standard and emergency brakes
// 4 outputs: steerings angle, gas throttle, standard brakes pressure, handbrake pressure
// every car has a NN + score (# of chkpts, time between each chkpt)
// the genetical algo does mutation+crossover of NNs based on score; reset cars
function forwardPropCar(idx, input, cars, gen_algo, app) {
	const output = gen_algo.infer(idx, input);

	cars[idx].prevOutputs = output;

	cars[idx].frontWheel.steerValue = ((2 * app.constant.carControl.max_steer) * output[0] - app.constant.carControl.max_steer);
	cars[idx].backWheel.engineForce = ((app.constant.carControl.max_forward_accel + app.constant.carControl.max_reverse_accel) * output[1] - app.constant.carControl.max_reverse_accel);
	cars[idx].frontWheel.setBrakeForce((app.constant.carControl.max_std_brake * .65) * output[2]);
	cars[idx].backWheel.setBrakeForce((app.constant.carControl.max_std_brake * .35) * output[2] + (app.constant.carControl.max_e_brake * output[3]));
}


function resetCars(app) {
	app.timeTracking.sim_steps = 0;
	for (c in app.cars) {
		app.cars[c].score = {
			racing: true,
			chkpts : 0,
			times : [0],
			score: 0
		};

		app.cars[c].body.position = [
			app.track_data.start[0],
			app.track_data.start[1] + Math.random() * 10 - 5
		];
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

function setCarNotRacingState(app, c) {
	// slow non-racing car to stop
	app.cars[c].frontWheel.setBrakeForce(3);
	app.cars[c].backWheel.setBrakeForce(5);
	app.cars[c].backWheel.engineForce = 0;
	// perpendicular wheels & random angular velocity for comedic effect
	app.cars[c].frontWheel.steerValue = 1.57;
	app.cars[c].body.angularVelocity = ((2 * Math.random()) - 1) * (Math.abs(app.cars[c].body.angularVelocity) + Math.abs(app.cars[c].body.velocity[0]) + Math.abs(app.cars[c].body.velocity[1]));
}

function getTimeSincePrevChkpt(app, car_id) {
	const step_diff = app.timeTracking.sim_steps - app.cars[car_id].score.times[app.cars[car_id].score.times.length-1];
	return step_diff/app.loopControl.phys.iter_per_sec_normal;
}

function checkCarOutoftime(app, c) {
	// check if car's hit the time limit
	if (getTimeSincePrevChkpt(app, c) >= app.constant.sim.time_limit)
		return true;

	// if the car hasn't reached the first checkpoint yet, make sure they are moving after a second
	if (app.cars[c].score.chkpts == 0) {
		if (getTimeSincePrevChkpt(app, c) >= 1)
			if (Math.abs(app.cars[c].body.velocity[0]) + Math.abs(app.cars[c].body.velocity[1]) < 3)
				return true;
	}
	// after the first checkpoint, take cars out of the race if they stop
	else if (Math.abs(app.cars[c].body.velocity[0]) + Math.abs(app.cars[c].body.velocity[1]) < .01)
		return true;

	return false;
}


function stepPhys(num_steps, app) {
	const new_delay = Math.max(app.loopControl.phys.delay - (performance.now() - app.loopControl.phys.next_time), 0);
	app.loopControl.phys.timeout = setTimeout(app.stepPhys.bind(app, app.loopControl.phys.steps_per_iter), new_delay);
	app.loopControl.phys.next_time += app.loopControl.phys.delay;
	
	app.stepPhys.bind(app, app.loopControl.phys.steps_per_iter);

	var text = app.scoreboard.text.split("\n");
	
	for (var s = 0; s < num_steps; ++s) {
		const now = performance.now();

		// IPS calculation
		++app.loopControl.phys.iter_cnt;
		if (now - app.loopControl.phys.ips_last_update > 1000) {
			app.loopControl.phys.ips_last_update = now;

			// update simulation ips on scoreboard
			text[1] = "physics " + app.loopControl.phys.iter_cnt + "ips";
			app.scoreboard.text = text.join("\n");

			app.loopControl.phys.iter_cnt = 0;
		}
		
		var carsRacing = 0;  // the number of cars still racing

		// check if cars have run out of time, if so reward them
		// otherwise run inputs through the neural network
		for (const c in app.cars) {
			if (!app.cars[c].score.racing)
				continue;

			if (checkCarOutoftime(app, c)) {
				// reward - distance from previous checkpoint
				if (app.cars[c].score.chkpts >= 1) {
					app.cars[c].score.score += .8 * Math.sqrt((app.cars[c].body.position[0] - app.track.chkpts[app.cars[c].score.chkpts - 1].position[0]) ** 2
						+ (app.cars[c].body.position[1] - app.track.chkpts[app.cars[c].score.chkpts - 1].position[1]) ** 2);

					// penalize - distance to next checkpoint
					// ignore the first checkpoint to encourage accelerator use
					if (app.cars[c].score.chkpts < app.track.chkpts.length)
						app.cars[c].score.score -= Math.sqrt(
							(app.cars[c].body.position[0] - app.track.chkpts[app.cars[c].score.chkpts].position[0]) ** 2
							+ (app.cars[c].body.position[1] - app.track.chkpts[app.cars[c].score.chkpts].position[1]) ** 2
						);
				}

				app.cars[c].score.racing = false;
				setCarNotRacingState(app, c);

				continue;
			}

			++carsRacing;

			// calculate neural net inputs and forward progate
			var input = [];
			input.push(Math.sqrt(app.cars[c].body.velocity[0] ** 2 + app.cars[c].body.velocity[1] ** 2) / 50);  // car speed
			input.push(Activations.sigmoid(app.cars[c].body.angularVelocity));  // angular velocity

			input.push(app.cars[c].prevOutputs[0]);  // steering angle
			input.push(app.cars[c].prevOutputs[1]);  // gas throttle
			input.push(app.cars[c].prevOutputs[2]);  // standard brake
			input.push(app.cars[c].prevOutputs[3]);  // e-brake

			// 7 distance rays
			for (var i = 0; i < 7; ++i) {
				app.cars[c].rays[i].phys_world.from = app.cars[c].body.position;
				app.cars[c].rays[i].phys_world.to = [
					app.cars[c].body.position[0] - Math.sin(app.cars[c].body.angle + app.cars[c].rays[i].angle) * app.cars[c].rays[i].length,
					app.cars[c].body.position[1] + Math.cos(app.cars[c].body.angle + app.cars[c].rays[i].angle) * app.cars[c].rays[i].length
				];
				app.cars[c].rays[i].phys_world.update();

				app.cars[c].rays[i].result.reset();
				app.phys_world.raycast(app.cars[c].rays[i].result, app.cars[c].rays[i].phys_world);

				const ray_dist = (app.cars[c].rays[i].result.fraction == -1) ? 1 : app.cars[c].rays[i].result.fraction;

				input.push(ray_dist);
			}

			if (app.gen_algo.infer_step % app.constant.learningAlgo.phys_step_per_infer == 0)
				forwardPropCar(c, input, app.cars, app.gen_algo, app);
		}

		++app.gen_algo.infer_step;

		// if all cars in a failure condition, reset track and NNs
		if (carsRacing == 0) {
			// get best score
			var best_score = Number.MIN_SAFE_INTEGER,
				best_chkpt = 0;
			for (c in app.cars) {
				app.gen_algo.SetGenomeFitness(c, app.cars[c].score.score);
				
				if (app.cars[c].score.score > best_score) {
					best_score = app.cars[c].score.score;
					best_chkpt = app.cars[c].score.chkpts;
				}
			}
			
			resetCars(app);

			// run genetic algorithm
			app.gen_algo.updateParams(app.recordKeeping);
			app.gen_algo.BreedPopulation();

			// update checkpoint record
			if (best_chkpt > app.recordKeeping.chkpts) {
				app.recordKeeping.chkpts = best_chkpt;
				app.recordKeeping.chkpts_time = 0;
			}
			else
				app.recordKeeping.chkpts_time++;
			
			// update checkpoint record
			if (best_score > app.recordKeeping.score) {
				app.recordKeeping.score = best_score;
				app.recordKeeping.score_time = 0;

				// log to console and scoreboard in the case of a new high score
				var time_diff = performance.now() - app.timeTracking.start_time;
				console.log("New record of " + app.recordKeeping.score.toFixed(3) +
					" in gen " + (app.gen_algo.generation - 1) +
					" at " + Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric' }).format(Date.now()) +
					" after " + Math.floor(time_diff / 1440000) + "h " + Math.floor(time_diff / 60000) % 60 + "m " + Math.floor(time_diff / 1000) % 60 + "s");

				// when scoreboard text contains 11 lines, remove the oldest leaderboard entry
				if (text.length == 11) {
					for (var i = 6; i < 11; ++i)
						text[i] = text[i + 1];

					text[10] = app.recordKeeping.score.toFixed(3) + " at gen " + (app.gen_algo.generation - 1);
				}
				else
					text.push(app.recordKeeping.score.toFixed(3) + " at gen " + (app.gen_algo.generation - 1));
			}
			else
				app.recordKeeping.score_time++;

			text[4] = "Generation " + app.gen_algo.generation;
			app.scoreboard.text = text.join("\n");

			// reset camera
			app.cameraControl.camera_target = -1;
		}

		++app.timeTracking.sim_steps;
		app.phys_world.step(1000 / 60 / 1000);
	}
};
