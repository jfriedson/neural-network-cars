// initialize physical collision callbacks
function initWorldCollisionEvent(app) {
    app.phys_world.on('impact', function(event) {
        var car, obj;

        // cars have mass of 0.8, walls and checkpoints are 0.0
        if (event.bodyA.mass == 0.8) {
            car = event.bodyA;
            obj = event.bodyB;
        }
        else {
            car = event.bodyB;
            obj = event.bodyA;
        }

        var c = 0;
        for (c in app.cars)
            if (app.cars[c].body.id == car.id)
                break;


        // return early if the car is inactive
        if (!app.cars[c].score.racing)
            return;


        // check if checkpoint collision, otherwise assume wall collision
        var get_pt = false;
        for (const cp in app.track.chkpts)
            if (obj.id == app.track.chkpts[cp].id) {
                get_pt = true;
                break;
            }


        // checkpoint
        if (get_pt) {
            // if the checkpoint isn't the next objective checkpoint for the car, don't reward
            if (app.cars[c].score.chkpts != obj.id - 1)
                return;

            ++app.cars[c].score.chkpts;
            app.cars[c].score.times.push(app.statTrackingVars.sim_steps);
            app.cars[c].score.score += 100;

            // only reward for time during relatively straight sections of track until track is completed
            // in order to improve learning of tight turns
            const completed_track = (app.statTrackingVars.record_chkpts == app.track.chkpts.length);
            const score_by_speed_sections = ((app.cars[c].score.chkpts <= 2 || app.cars[c].score.chkpts >= 8) &&
                                             (app.cars[c].score.chkpts <= 20 || app.cars[c].score.chkpts >= 40));

            if (completed_track || score_by_speed_sections)
                app.cars[c].score.score += g_time_limit - (app.cars[c].score.times[app.cars[c].score.times.length-1] - app.cars[c].score.times[app.cars[c].score.times.length-2])/g_phys_iter_per_sec_normal;
        }
        // wall
        else {
            // reward - distance from previous checkpoint
            if (app.cars[c].score.chkpts >= 1)
                app.cars[c].score.score += .9 * Math.sqrt( (app.cars[c].body.position[0] - app.track.chkpts[app.cars[c].score.chkpts-1].position[0])**2
                                                          +(app.cars[c].body.position[1] - app.track.chkpts[app.cars[c].score.chkpts-1].position[1])**2 );

            // penalize - distance to next checkpoint
            if (app.cars[c].score.chkpts < app.track.chkpts.length)
                app.cars[c].score.score -= Math.sqrt( (app.cars[c].body.position[0] - app.track.chkpts[app.cars[c].score.chkpts].position[0])**2
                                                     +(app.cars[c].body.position[1] - app.track.chkpts[app.cars[c].score.chkpts].position[1])**2 );

            app.cars[c].score.racing = false;
            setCarNotRacingState(app, c);
        }
    });
}
