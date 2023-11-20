// 12 inputs: 7 rays, car speed, steerings angle, gas throttle, standard and emergency brakes
// 4 outputs: steerings angle, gas throttle, standard brakes pressure, handbrake pressure
// every car has a NN + score (# of chkpts, time between each chkpt)
// the genetical algo does mutation+crossover of NNs based on score; reset cars
function forwardPropCar(idx, input, cars, gen_algo) {
    const output = gen_algo.infer(idx, input);

    cars[idx].prevOutputs = output;

    cars[idx].frontWheel.steerValue = ((2 * g_car_max_steer) * output[0] - g_car_max_steer);
    cars[idx].backWheel.engineForce = ((g_car_max_forward_accel + g_car_max_reverse_accel) * output[1] - g_car_max_reverse_accel);
    cars[idx].frontWheel.setBrakeForce((g_car_max_std_brake * .65) * output[2]);
    cars[idx].backWheel.setBrakeForce((g_car_max_std_brake * .35) * output[2] + (g_car_max_e_brake * output[3]));
}


function resetCars(app) {
    app.statTrackingVars.sim_steps = 0;
    for (c in app.cars) {
        app.cars[c].score = { racing: true,
                              chkpts : 0,
                              times : [0],
                              score : 0 };

        app.cars[c].body.position = [ app.track_data.start[0],
                                      app.track_data.start[1] + Math.random() * 10 - 5];
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
    const step_diff = app.statTrackingVars.sim_steps - app.cars[car_id].score.times[app.cars[car_id].score.times.length-1];
    return step_diff/g_phys_iter_per_sec_normal;
}


function stepPhys(num_steps, app) {
    const new_delay = Math.max(app.phys_delay - (performance.now() - app.phys_next_time), 0);
    app.phys_timeout = setTimeout(app.stepPhys.bind(app, app.phys_steps_per_iter), new_delay);
    app.phys_next_time += app.phys_delay;
    
    app.stepPhys.bind(app, app.phys_steps_per_iter);

    var text = app.scoreboard.text.split("\n");
    
    for (var s = 0; s < num_steps; ++s) {
        const now = performance.now();

        // ips calculation
        ++app.phys_iter_cnt;
        if (now - app.phys_ips_last_update > 1000) {
            app.phys_ips_last_update = now;

            // update simulation ips on scoreboard
            text[1] = "physics " + app.phys_iter_cnt + "ips";
            app.scoreboard.text = text.join("\n");

            app.phys_iter_cnt = 0;
        }
        
        var racing = 0;  // the number of cars still racing

        // check if cars have run out of time, if so reward them
        // otherwise run inputs through the neural network
        for (const c in app.cars) {		
            if (app.cars[c].score.racing) {
                var chkpt_time_limit_reached = false;

                // if the car hasn't reached the first checkpoint yet, make sure they are at least moving after a second
                if (app.cars[c].score.chkpts == 0) {
                    if (getTimeSincePrevChkpt(app, c) >= 1)
                        if (Math.abs(app.cars[c].body.velocity[0]) + Math.abs(app.cars[c].body.velocity[1]) < 3)
                            chkpt_time_limit_reached =  true;
                }
                // after a second, take cars out of the race if they stop
                else if (Math.abs(app.cars[c].body.velocity[0]) + Math.abs(app.cars[c].body.velocity[1]) < .01)
                    chkpt_time_limit_reached =  true;

                // check if it's hit the normal time limit in any case
                if (getTimeSincePrevChkpt(app, c) >= g_time_limit)
                    chkpt_time_limit_reached = true;

                if (chkpt_time_limit_reached) {
                    // reward - distance from previous checkpoint
                    if (app.cars[c].score.chkpts >= 1) {
                        app.cars[c].score.score += .8 * Math.sqrt( (app.cars[c].body.position[0] - app.track.chkpts[app.cars[c].score.chkpts-1].position[0])**2
                                                                  +(app.cars[c].body.position[1] - app.track.chkpts[app.cars[c].score.chkpts-1].position[1])**2 );
                                                            
                        // penalize - distance to next checkpoint
                        // ignore the first checkpoint to encourage accelerator use
                        if (app.cars[c].score.chkpts < app.track.chkpts.length)
                            app.cars[c].score.score -= Math.sqrt( (app.cars[c].body.position[0] - app.track.chkpts[app.cars[c].score.chkpts].position[0])**2
                                                                 +(app.cars[c].body.position[1] - app.track.chkpts[app.cars[c].score.chkpts].position[1])**2 );
                    }

                    app.cars[c].score.racing = false;
                    setCarNotRacingState(app, c);
                }
            }

            // calculate neural net inputs and forward progate
            if (app.cars[c].score.racing) {
                var input = [];
                input.push( Math.sqrt(app.cars[c].body.velocity[0]**2 + app.cars[c].body.velocity[1]**2) / 50 );  // car speed
                input.push(Activations.sigmoid(app.cars[c].body.angularVelocity));  // angular velocity

                input.push(app.cars[c].prevOutputs[0]);  // steering angle
                input.push(app.cars[c].prevOutputs[1]);  // gas throttle
                input.push(app.cars[c].prevOutputs[2]);  // standard brake
                input.push(app.cars[c].prevOutputs[3]);  // e-brake

                // 7 distance rays
                for (var i = 0; i < 7; ++i) {
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
            g_mutation_chance = Math.min(Math.max(.05, g_mutation_chance - (app.gen_algo.generation/10000) + (app.statTrackingVars.record_score_time/10000) + (app.statTrackingVars.record_chkpts_time/10000)), .3);
            g_learning_rate = Math.min(Math.max(.05, g_learning_rate - (app.gen_algo.generation/10000) + (app.statTrackingVars.record_score_time/10000) + (app.statTrackingVars.record_chkpts_time/10000)), .25);
            
            app.gen_algo.BreedPopulation();

            // update checkpoint record
            if (best_chkpt > app.statTrackingVars.record_chkpts) {
                app.statTrackingVars.record_chkpts = best_chkpt;
                app.statTrackingVars.record_chkpts_time = 0;
            }
            else
                app.statTrackingVars.record_chkpts_time++;
            
            // update checkpoint record
            if (best_score > app.statTrackingVars.record_score) {
                app.statTrackingVars.record_score = best_score;
                app.statTrackingVars.record_score_time = 0;

                // log to console and scoreboard in the case of a new high score
                var time_diff = performance.now() - app.statTrackingVars.start_time;
                console.log("New record of " + app.statTrackingVars.record_score.toFixed(3) +
                            " in gen " + (app.gen_algo.generation-1) +
                            " at " + Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric'}).format(Date.now()) +
                            " after " + Math.floor(time_diff/1440000) + "h " + Math.floor(time_diff/60000)%60 + "m " + Math.floor(time_diff/1000)%60 + "s");

                // when scoreboard text contains 11 lines, remove the oldest leaderboard entry
                if (text.length == 11) {
                    for (var i = 6; i < 11; ++i)
                        text[i] = text[i+1];

                    text[10] = app.statTrackingVars.record_score.toFixed(3) + " at gen " + (app.gen_algo.generation - 1);
                }
                else
                    text.push(app.statTrackingVars.record_score.toFixed(3) + " at gen " + (app.gen_algo.generation-1));
            }
            else
                app.statTrackingVars.record_score_time++;

            text[4] = "Generation " + app.gen_algo.generation;
            app.scoreboard.text = text.join("\n");

            // reset camera
            app.cameraVars.camera_target = -1;
        }

        ++app.statTrackingVars.sim_steps;
        app.phys_world.step((1000/60)/1000);
    }
};
