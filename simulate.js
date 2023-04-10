// 12 inputs: 7 rays, car speed, steerings angle, gas throttle, standard and emergency brakes
// 4 outputs: steerings angle, gas throttle, standard brakes pressure, handbrake pressure
// every car has a NN + score (# of chkpts, time between each chkpt)
// the genetical algo does mutation+crossover of NNs based on score; reset cars
function forwardPropCar(idx, input, cars, gen_algo) {
	const output = gen_algo.infer(idx, input);

	cars[idx].prevOutputs = output;

	cars[idx].frontWheel.steerValue = ((2*car_max_steer) * output[0] - car_max_steer);
	cars[idx].backWheel.engineForce = ((car_max_forward_accel + car_max_reverse_accel) * output[1] - car_max_reverse_accel);
	cars[idx].frontWheel.setBrakeForce(car_max_std_brake * .65 * output[2]);
	cars[idx].backWheel.setBrakeForce((car_max_std_brake * .35) * output[2] + (car_max_e_brake * output[3]));
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

function getTimeSincePrevChkpt(app, car_id) {
	return (app.statTrackingVars.sim_steps - app.cars[car_id].score.times[app.cars[car_id].score.times.length-1])/m_sim_world_fps;
}


function setStepIntv(app) {
	clearInterval(app.sim_step_intv);

	const m_sim_delay = 1000/m_sim_intv_fps;

	if (m_sim_intv_fps == 60)
		app.sim_step_intv = setInterval(app.stepPhysWorld.bind(app, 1), m_sim_delay);
	else
		app.sim_step_intv = setInterval(app.stepPhysWorld.bind(app, 10), m_sim_delay*10);
}

function simStep(num_steps, app) {
	for(var s = 0; s < num_steps; ++s) {
		const now = performance.now();

		// clear records older than a second to easily calculate FPS
		while (app.statTrackingVars.sim_times.length > 0 && app.statTrackingVars.sim_times[0] <= now - 1000)
			app.statTrackingVars.sim_times.shift();
		app.statTrackingVars.sim_times.push(now);

		// update simulation FPS on scoreboard
		var text = app.scoreboard.text.split("\n");
		text[1] = "world " + app.statTrackingVars.sim_times.length.toString() + "fps";
		app.scoreboard.text = text.join("\n");
		
		// check if cars have run out of time, if so reward them
		// otherwise run inputs through the neural network
		var racing = 0;  // count the number of cars still racing

		for(const c in app.cars) {
			// check if living cars have reached the time limits
			if (app.cars[c].score.racing &&
				// if the car hasn't reached the first checkpoint yet, make sure they are at least moving after a second
				(
					((app.cars[c].score.chkpts == 0)  &&  (getTimeSincePrevChkpt(app, c) >= 1))
					? (Math.abs(app.cars[c].body.velocity[0] + app.cars[c].body.velocity[1]) < 0.1)
					: false
				)
				||
				// otherwise, compare against the normal time limit calculated as the time since collecting the previous checkpoint
				(
					getTimeSincePrevChkpt(app, c) >= time_limit
				)
			) {
				if (score_by_dist) {
					// reward - distance from previous checkpoint
					if (app.cars[c].score.chkpts >= 1) {
						app.cars[c].score.score += Math.sqrt((app.cars[c].body.position[0] - app.track.chkpts[app.cars[c].score.chkpts-1].position[0])**2 + 
															 (app.cars[c].body.position[1] - app.track.chkpts[app.cars[c].score.chkpts-1].position[1])**2);
					}
				}

				app.cars[c].score.racing = false;

				// slow non-racing car to stop
				app.cars[c].frontWheel.setBrakeForce(3);
				app.cars[c].backWheel.setBrakeForce(5);
				app.cars[c].frontWheel.steerValue = 1.57;
				app.cars[c].backWheel.engineForce = 0;
				// perpendicular wheels & random angular velocity for comedic effect
				app.cars[c].frontWheel.steerValue = 1.57;
				app.cars[c].body.angularVelocity = ((2 * Math.random() - 1) * app.cars[c].body.velocity[0] * app.cars[c].body.velocity[1]) / 20;
			}

			// calculate neural net inputs and forward progate
			if(app.cars[c].score.racing) {
				var input = [];
				input.push( Math.sqrt(app.cars[c].body.velocity[0]**2 + app.cars[c].body.velocity[1]**2) / 50 );  // car speed
				input.push(Activations.sigmoid(app.cars[c].body.angularVelocity));  // angular velocity

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

				forwardPropCar(c, input, app.cars, app.gen_algo);
				++racing;
			}
		}

		// if all cars in a failure condition, reset track and NNs
		if(racing == 0) {
			// get best score
			var best_score = Number.MIN_SAFE_INTEGER,
				best_chkpt = 0;
			for (c in app.cars) {
				app.gen_algo.SetGenomeFitness(c, app.cars[c].score.score);
				
				if(app.cars[c].score.score > best_score) {
					best_score = app.cars[c].score.score;
					best_chkpt = app.cars[c].score.chkpts;
				}
			}
			
			resetCars(app);

			// run genetic algorithm
			m_mutation_chance = Math.min(Math.max(.05, m_mutation_chance - (app.gen_algo.generation/10000) + (app.statTrackingVars.record_score_time/10000) + (app.statTrackingVars.record_chkpts_time/10000)), .3)
			m_learning_rate = Math.min(Math.max(.05, m_learning_rate - (app.gen_algo.generation/10000) + (app.statTrackingVars.record_score_time/10000) + (app.statTrackingVars.record_chkpts_time/10000)), .25)
			
			app.gen_algo.BreedPopulation();

			// update checkpoint record
			if(best_chkpt > app.statTrackingVars.record_chkpts) {
				app.statTrackingVars.record_chkpts = best_chkpt;
				app.statTrackingVars.record_chkpts_time = 0;
			}
			else {
				app.statTrackingVars.record_chkpts_time++;
			}
			
			// update checkpoint record
			if(best_score > app.statTrackingVars.record_score) {
				app.statTrackingVars.record_score = best_score;
				app.statTrackingVars.record_score_time = 0;

				// log to console and scoreboard in the case of a new high score
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
			}

			//var text = scoreboard.text.split("\n");
			text[4] = "Generation " + app.gen_algo.generation;
			app.scoreboard.text = text.join("\n");
		}

		++app.statTrackingVars.sim_steps;
		app.phys_world.step(m_sim_step);
	}
};
