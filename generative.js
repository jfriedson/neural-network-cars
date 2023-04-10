// generate world physics and graphics for simulation objects
function generateTrack(track, track_data, phys_world, renderer) {
    // checkpoints
    track.graphics.lineStyle(1, 0xffff00, 1, .5, false);
    for(var i = 0; i < track_data.chkpts.length; ++i) {
        var chkpt_dx = (track_data.chkpts[i][1][0]-track_data.chkpts[i][0][0]),
            chkpt_dy = (track_data.chkpts[i][1][1]-track_data.chkpts[i][0][1]),
            chkpt_length = Math.sqrt(chkpt_dx**2 + chkpt_dy**2),
            chkpt_angle = -Math.atan(chkpt_dx/chkpt_dy);

        var boxShape = new p2.Box({ width: 1, height: chkpt_length, collisionGroup: phys_world.collisionGroups.CHKPT, collisionMask: phys_world.collisionGroups.CAR, collisionResponse: false });
        track.chkpts[i] = new p2.Body({
            mass: 0,
            position: [track_data.chkpts[i][0][0]+chkpt_dx/2, track_data.chkpts[i][0][1]+chkpt_dy/2],
            angle: chkpt_angle
        });
        track.chkpts[i].addShape(boxShape);
        phys_world.addBody(track.chkpts[i]);

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

        var boxShape = new p2.Box({ width: 1, height: wall_length, collisionGroup: phys_world.collisionGroups.TRACK, collisionMask: phys_world.collisionGroups.CAR });
        track.walls[i] = new p2.Body({
            mass: 0,
            position: [track_data.walls1[i][0]+wall_dx/2, track_data.walls1[i][1]+wall_dy/2],
            angle: wall_angle
        });
        track.walls[i].addShape(boxShape);
        phys_world.addBody(track.walls[i]);

        track.graphics.lineTo(track_data.walls1[i+1][0], track_data.walls1[i+1][1])
    }

    track.graphics.moveTo(track_data.walls2[0][0], track_data.walls2[0][1]);
    for(var j = 0; j < track_data.walls2.length-1; ++j) {
        var wall_dx = (track_data.walls2[j+1][0]-track_data.walls2[j][0]),
            wall_dy = (track_data.walls2[j+1][1]-track_data.walls2[j][1]),
            wall_length = Math.sqrt(wall_dx**2 + wall_dy**2),
            wall_angle = -Math.atan(wall_dx/wall_dy);

        var boxShape = new p2.Box({ width: 1, height: wall_length, collisionGroup: phys_world.collisionGroups.TRACK, collisionMask: phys_world.collisionGroups.CAR });
        track.walls[j+i] = new p2.Body({
            mass: 0,
            position: [track_data.walls2[j][0]+wall_dx/2, track_data.walls2[j][1]+wall_dy/2],
            angle: wall_angle
        });
        track.walls[j+i].addShape(boxShape);
        phys_world.addBody(track.walls[j+i]);

        track.graphics.lineTo(track_data.walls2[j+1][0], track_data.walls2[j+1][1])
    }

    // miscWalls
    for(var i = 0; i < track_data.miscWalls.length; ++i) {
        var wall_dx = (track_data.miscWalls[i][1][0]-track_data.miscWalls[i][0][0]),
            wall_dy = (track_data.miscWalls[i][1][1]-track_data.miscWalls[i][0][1]),
            wall_length = Math.sqrt(wall_dx**2 + wall_dy**2),
            wall_angle = -Math.atan(wall_dx/wall_dy);

        var boxShape = new p2.Box({ width: 1, height: wall_length, collisionGroup: phys_world.collisionGroups.TRACK, collisionMask: phys_world.collisionGroups.CAR});
        track.walls[i] = new p2.Body({
            mass: 0,
            position: [track_data.miscWalls[i][0][0]+wall_dx/2, track_data.miscWalls[i][0][1]+wall_dy/2],
            angle: wall_angle
        });
        track.walls[i].addShape(boxShape);
        phys_world.addBody(track.walls[i]);

        track.graphics.moveTo(track_data.miscWalls[i][0][0], track_data.miscWalls[i][0][1]);
        track.graphics.lineTo(track_data.miscWalls[i][1][0], track_data.miscWalls[i][1][1]);
    }

    renderer.stage.addChild(track.graphics);
}


function generateCar(car, track_data, idx, phys_world, renderer) {
    var carShape = new p2.Box({ width: 2, height: 4, collisionGroup: phys_world.collisionGroups.CAR, collisionMask: phys_world.collisionGroups.TRACK | phys_world.collisionGroups.CHKPT});
    car.body = new p2.Body({
        mass: .8,
        position: [track_data.start[0], track_data.start[1] + Math.random() * 10 - 5],
        angle: track_data.start[2]
    });
    car.body.addShape(carShape);
    car.body.shape = p2.Shape.BOX;
    phys_world.addBody(car.body);

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
    car.vehicle.addToWorld(phys_world);

    car.frontWheel.steerValue = 0;

    car.backWheel.engineForce = 0;
    car.backWheel.setBrakeForce(0);

    car.rays.push({length : 20, angle : -1.3962634016, phys_world : new p2.Ray({mode: p2.Ray.CLOSEST, collisionMask : phys_world.collisionGroups.TRACK}), result : new p2.RaycastResult(), graphic : new PIXI.Graphics()});
    car.rays.push({length : 60, angle : -0.6981317008, phys_world : new p2.Ray({mode: p2.Ray.CLOSEST, collisionMask : phys_world.collisionGroups.TRACK}), result : new p2.RaycastResult(), graphic : new PIXI.Graphics()});
    car.rays.push({length : 80, angle : -0.3490658504, phys_world : new p2.Ray({mode: p2.Ray.CLOSEST, collisionMask : phys_world.collisionGroups.TRACK}), result : new p2.RaycastResult(), graphic : new PIXI.Graphics()});
    car.rays.push({length : 100, angle : 0, phys_world : new p2.Ray({mode: p2.Ray.CLOSEST, collisionMask : phys_world.collisionGroups.TRACK}), result : new p2.RaycastResult(), graphic : new PIXI.Graphics()});
    car.rays.push({length : 80, angle : 0.3490658504, phys_world : new p2.Ray({mode: p2.Ray.CLOSEST, collisionMask : phys_world.collisionGroups.TRACK}), result : new p2.RaycastResult(), graphic : new PIXI.Graphics()});
    car.rays.push({length : 60, angle : 0.6981317008, phys_world : new p2.Ray({mode: p2.Ray.CLOSEST, collisionMask : phys_world.collisionGroups.TRACK}), result : new p2.RaycastResult(), graphic : new PIXI.Graphics()});
    car.rays.push({length : 20, angle : 1.3962634016, phys_world : new p2.Ray({mode: p2.Ray.CLOSEST, collisionMask : phys_world.collisionGroups.TRACK}), result : new p2.RaycastResult(), graphic : new PIXI.Graphics()});

    // add car and rays to stage
    for(var i = 0; i < 7; ++i)
        renderer.stage.addChild(car.rays[i].graphic);

    renderer.stage.addChild(car.graphics);

    car.prevOutputs.push(0.5);  // set steering to neutral
    car.prevOutputs.push(car_max_reverse_accel/(car_max_forward_accel + car_max_reverse_accel));  // throttle to 0
    car.prevOutputs.push(0);  // standard brake to 0
    car.prevOutputs.push(0);  // e-brake to 0
}
