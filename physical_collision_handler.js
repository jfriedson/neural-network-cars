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

			// slow non-racing car to stop
			app.cars[c].frontWheel.setBrakeForce(3);
			app.cars[c].backWheel.setBrakeForce(5);
			app.cars[c].frontWheel.steerValue = 1.57;
			app.cars[c].backWheel.engineForce = 0;
			// perpendicular wheels & random angular velocity for comedic effect
			app.cars[c].frontWheel.steerValue = 1.57;
			app.cars[c].body.angularVelocity = (2 * Math.random() - 1) * app.cars[c].body.velocity[0] * app.cars[c].body.velocity[1] / 10;
		}
	});
}
