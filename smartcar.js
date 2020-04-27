(function() {
    var zoom = 20;
    var m_start_time = performance.now(),
        m_sim_steps = 0;


    // TRACKS
    var silverstone_reverse = {start : [-10,-50, 0], walls1 : [[0,0],[0,-279],[2,-294],[8,-310],[15,-320],[25,-329],[40,-336],[74,-347],[130,-358],[171,-362],[198,-365],[338,-359],[353,-361],[366,-363],[392,-373],[412,-382],[425,-385],[434,-384],[442,-381],[509,-353],[521,-349],[532,-350],[544,-351],[556,-355],[568,-363],[582,-372],[593,-378],[614,-380],[624,-379],[634,-374],[644,-367],[652,-357],[664,-339],[672,-315],[678,-306],[686,-293],[701,-281],[1076,-32],[1113,-2],[1131,17],[1141,34],[1143,41],[1145,58],[1143,70],[1137,85],[1126,99],[1114,108],[1097,115],[1065,126],[1038,141],[1012,159],[998,170],[985,182],[972,193],[964,196],[957,198],[907,228],[900,238],[899,248],[901,254],[914,272],[920,289],[915,299],[894,319],[868,333],[836,343],[821,342],[811,337],[561,111],[553,98],[550,87],[549,72],[551,61],[567,-8],[568,-23],[568,-41],[564,-61],[555,-82],[485,-187],[481,-195],[481,-202],[487,-212],[494,-217],[507,-219],[559,-230],[567,-234],[572,-243],[573,-251],[568,-259],[542,-275],[517,-284],[474,-292],[462,-294],[452,-293],[445,-289],[124,9],[113,24],[109,42],[110,63],[119,79],[130,85],[179,94],[191,99],[201,110],[205,121],[205,138],[200,149],[192,157],[178,165],[163,166],[148,160],[59,102],[31,72],[17,50],[4,18],[0,0]],
                                              walls2 : [[-20,6],[-17,20],[-2,58],[0,61],[16,86],[48,119],[137,177],[141,179],[156,185],[164,186],[179,185],[188,182],[202,174],[206,171],[214,163],[218,157],[223,146],[225,138],[225,121],[220,103],[216,97],[206,86],[199,81],[187,76],[183,74],[137,66],[134,64],[130,57],[129,44],[132,32],[139,22],[457,-273],[458,-274],[461,-274],[471,-272],[512,-265],[533,-257],[548,-248],[503,-239],[491,-237],[482,-233],[475,-228],[470,-222],[464,-212],[461,-202],[461,-195],[463,-186],[467,-178],[468,-176],[537,-72],[545,-55],[548,-39],[548,-24],[547,-11],[532,56],[531,57],[529,68],[529,73],[530,88],[531,92],[534,103],[536,108],[544,121],[548,126],[798,352],[802,355],[812,360],[820,362],[835,363],[842,362],[874,352],[877,351],[903,337],[908,333],[929,313],[933,308],[938,298],[939,282],[933,265],[930,260],[919,245],[919,245],[921,243],[965,217],[969,215],[971,215],[979,212],[985,208],[998,197],[999,197],[1011,185],[1024,175],[1049,158],[1073,144],[1104,134],[1105,133],[1122,126],[1126,124],[1138,115],[1142,111],[1153,97],[1156,92],[1162,77],[1163,73],[1165,61],[1165,56],[1163,39],[1162,36],[1160,29],[1158,24],[1148,7],[1146,3],[1128,-16],[1126,-18],[1089,-48],[1087,-49],[713,-297],[701,-305],[690,-324],[683,-345],[680,-351],[675,-358],[669,-367],[668,-369],[660,-379],[655,-383],[645,-390],[633,-397],[626,-399],[616,-400],[605,-400],[590,-398],[583,-396],[572,-390],[557,-380],[547,-373],[540,-371],[530,-370],[523,-369],[516,-372],[450,-399],[441,-403],[436,-404],[427,-405],[421,-404],[408,-401],[404,-400],[384,-391],[361,-382],[350,-381],[337,-379],[199,-385],[196,-385],[169,-382],[128,-378],[126,-378],[70,-367],[68,-366],[34,-355],[32,-354],[17,-347],[12,-344],[2,-335],[-1,-331],[-8,-321],[-11,-317],[-17,-301],[-18,-297],[-20,-282],[-20,-279],[-20,0],[-20,6]],
                                              chkpts : [[[-20,-25],[0,-25]],[[-17,20],[4,18]],[[-2,58],[17,50]],[[48,119],[59,102]],[[137,177],[148,160]],[[223,146],[205,121]],[[130,57],[110,63]]]};
    var silverstone_demo = JSON.parse(JSON.stringify(silverstone_reverse));
        silverstone_demo.start = [220, -375, -1.53];
        silverstone_demo.chkpts = [[[240,-363],[241,-383]],[[300,-361],[301,-380]],[[338,-359],[337,-379]],[[412,-382],[404,-400]],[[442,-381],[450,-399]],[[475,-367],[483,-386]],[[521,-349],[523,-369]],[[556,-355],[547,-373]],[[582,-372],[571,-389]]];
    var silverstone_bootcamp = JSON.parse(JSON.stringify(silverstone_reverse));
        silverstone_bootcamp.start = [200, -376, -1.52];
        silverstone_bootcamp.chkpts = [[[240,-363],[241,-383]],[[323,-360],[324,-379]],[[412,-382],[404,-400]],[[475,-367],[483,-386]],[[521,-349],[523,-369]],[[582,-372],[571,-389]]];
    var track_data = silverstone_demo;


    PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.LINEAR;
    const app = new PIXI.Application({width: 1600, height: 900, backgroundColor: 0x060f39, autoDensity: true, resolution: window.devicePixelRatio});

    document.body.appendChild(app.renderer.view);
    app.renderer.view.oncontextmenu = function (e) {
        e.preventDefault();
    };


    var TRACKCG = Math.pow(2, 1),
        CKHPTCG = Math.pow(2, 2),
        CARCG = Math.pow(2, 3);

    var world = new p2.World({gravity : [0,0]});

    var track = {walls : [], chkpts : [], graphics : new PIXI.Graphics()};
    generateTrack();


    var gen_algo = new GenAlgo();
    gen_algo.GenerateNewPopulation(m_car_amt, 8, m_hidden_layers, m_hidden_neurons, 4);

    var cars = [];
    var NNets = [];
    var scores = [];
    for(var i = 0; i < m_car_amt; ++i) {
        var car = {body : null, vehicle : null, graphics : new PIXI.Graphics(), frontWheel : null, backWheel : null, rays : []};
        cars.push(car);
        generateCar(car);
        NNets.push(new NNet());
        //NNets[NNets.length-1].createNet(8, m_hidden_layers, m_hidden_neurons, 4);
        NNets[NNets.length-1].fromGenome(gen_algo.GetNextGenome(), 8, m_hidden_layers, m_hidden_neurons, 4);
        scores.push({racing: true, chkpts : 0, times : [m_sim_steps], score : 0});
    }

   /* var scoreboard = new PIXI.Text('No record yet');;
    scoreboard.x = track_data.start[0];
    scoreboard.y = track_data.start[1];

    app.stage.addChild(scoreboard);*/



    // inputs: 7 rays, speed
    // outputs: steerings angle, gas throttle, standard brakes pressure, handbrake pressure
    // every car has a NN + score (# of chkpts, time between each chkpt)
    // the genetical algo does mutation+crossover of NNs based on score; reset cars


    function NNetInput(idx, input){ 
        var output = NNets[idx].predict(input);

        cars[idx].frontWheel.steerValue = .8 * 2*(.5 - output[0]);

        // Engine force forward
        cars[idx].backWheel.engineForce = output[1] * 12;

        if(cars[idx].backWheel.getSpeed() > 0.1){
            // Moving forward - add some brake force to slow down
            cars[idx].frontWheel.setBrakeForce(7 * output[2]);
            cars[idx].backWheel.setBrakeForce(6 * output[2] + 9 * output[3]);
        } else {
            // Moving backwards - reverse the engine force
            cars[idx].backWheel.engineForce -= 7 * output[2];
            cars[idx].frontWheel.setBrakeForce(0);
            cars[idx].backWheel.setBrakeForce(9 * output[3]);
        }

        cars[idx].backWheel.setSideFriction(6.5 - output[3]);
    }

    world.on('impact', function(event) {
        var car = event.bodyB,
            chkpt = event.bodyA;
        if(event.bodyA.mass == 0.8) {
            car = event.bodyA;
            chkpt = event.bodyB;
        }

        var c = 0;
        for(c in cars)
            if (cars[c].body.id == car.id)
                break;

        // check if checkpoint collision, otherwise assume wall collision
        var ch = 0,
            get_pt = false;

        if (chkpt.id <= track.chkpts.length) {
            get_pt = true;
        }

        // checkpoint
        if(get_pt && scores[c].chkpts == chkpt.id-1 && scores[c].racing) {
            ++scores[c].chkpts;
            scores[c].times.push(m_sim_steps);
            scores[c].score += 100;
            //  Use this later to improve track times;
            if (gen_algo.generation >= 200)
                scores[c].score += time_limit - (scores[c].times[scores[c].times.length-1] - scores[c].times[scores[c].times.length-2])/m_sim_world_fps;
        }
        // crash
        else {
            if(!get_pt && scores[c].racing) {
                if(scores[c].chkpts >= 3)
                    scores[c].score += (cars[c].body.position[0] > track.chkpts[scores[c].chkpts-1].position[0] ? 1 : -1) * Math.sqrt((cars[c].body.position[0]-track.chkpts[scores[c].chkpts-1].position[0])**2 + (cars[c].body.position[1]-track.chkpts[scores[c].chkpts-1].position[1])**2);
                scores[c].racing = false;
                gen_algo.SetGenomeFitness(c,scores[c].score);
            }
        }
    });

    var record_score = 0;

    var sim_step_intv = function() {
        var racing = 0;
        for(const c in cars) {
            // did the car hit the checkpoint time limit
            if((m_sim_steps - scores[c].times[scores[c].times.length-1])/m_sim_world_fps >= time_limit) {
                if(scores[c].racing) {
                    if(scores[c].chkpts >= 1)
                        scores[c].score += 1.5 * (cars[c].body.position[0] > track.chkpts[scores[c].chkpts-1].position[0] ? 1 : -1) * Math.sqrt((cars[c].body.position[0]-track.chkpts[scores[c].chkpts-1].position[0])**2 + (cars[c].body.position[1]-track.chkpts[scores[c].chkpts-1].position[1])**2);
                        // The line below doesnt work well becuase it causes the cars to spin out and go backwards
                        //scores[c].score += 15 * ((m_sim_steps - scores[c].times[scores[c].times.length-1])/m_sim_world_fps)/time_limit;
                    else
                        scores[c].score += 50 - Math.sqrt((cars[c].body.position[0]-track.chkpts[0].position[0])**2 + (cars[c].body.position[1]-track.chkpts[0].position[1])**2);
 
                    scores[c].racing = false;
                    gen_algo.SetGenomeFitness(c,scores[c].score);
                }
            }
            var input = [];
            input.push(Math.sqrt(cars[c].body.velocity[0]**2 + cars[c].body.velocity[1]**2)/100);
            for(var i = 0; i < 7; ++i) {
                cars[c].rays[i].world.from = cars[c].body.position;
                cars[c].rays[i].world.to = [cars[c].body.position[0]-Math.sin(cars[c].body.angle+cars[c].rays[i].angle)*cars[c].rays[i].length,
                                        cars[c].body.position[1]+Math.cos(cars[c].body.angle+cars[c].rays[i].angle)*cars[c].rays[i].length];
                cars[c].rays[i].world.update();

                cars[c].rays[i].result.reset();
                world.raycast(cars[c].rays[i].result, cars[c].rays[i].world);

                var fraction = cars[c].rays[i].result.fraction;
                if (fraction < 0)
                    fraction = 0;

                input.push(cars[c].rays[i].result.fraction);
            }
            if(scores[c].racing) {
                NNetInput(c, input);
                ++racing;
            }
            else {
                cars[c].frontWheel.setBrakeForce(10);
                cars[c].frontWheel.steerValue = 1.57;
                cars[c].backWheel.engineForce = 0;
            }
        }

        // if all cars in a failure condition, reset track and NNs
        if(racing == 0) {
            gen_algo.BreedPopulation();

            var best_score = 10;
            for (nn in NNets) {
                NNets[nn].fromGenome(gen_algo.GetNextGenome(), 8, m_hidden_layers, m_hidden_neurons, 4);

                if(scores[nn].score > best_score) {
                    best_score = scores[nn].score;
                }

                scores[nn] = {racing: true, chkpts : 0, times : [m_sim_steps], score : 0};
                cars[nn].body.position = [track_data.start[0], track_data.start[1]];
                cars[nn].body.angle = track_data.start[2];
                cars[nn].body.setZeroForce();
                cars[nn].body.velocity = [0,0];
                cars[nn].body.angularVelocity = 0;
            }

            if(best_score > record_score) {
                record_score = best_score;
                console.log("New record of " + record_score.toFixed(3) + " in gen " + gen_algo.generation + " at " + Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric'}).format(Date.now()) + " after " + Math.floor((performance.now()-m_start_time)/1440000) + "hours " + Math.floor((performance.now()-m_start_time)/60000)%60 + "mins " + Math.floor((performance.now()-m_start_time)/1000)%60 + "s");
            }
        }

        ++m_sim_steps;
        world.step(m_sim_step);
    };

    function setStepIntv(sim_fps) {
        clearInterval(sim_step_intv);
        m_sim_intv_fps = sim_fps;
        m_sim_delay = 1000/m_sim_intv_fps;
        setInterval(sim_step_intv, m_sim_delay);
    }
    setStepIntv(m_sim_intv_fps);

    var stats = new Stats();
    stats.showPanel( 0 );
    document.body.appendChild( stats.dom );

    function animate() {
        stats.begin();

        for(const c in cars) {
            cars[c].graphics.position.x = cars[c].body.position[0];
            cars[c].graphics.position.y = cars[c].body.position[1];
            cars[c].graphics.rotation   = cars[c].body.angle;

            for(var i = 0; i < 7; ++i) {
                cars[c].rays[i].graphic.clear();
                if(scores[c].racing) {
                    if( cars[c].rays[i].result.hasHit() ) {
                        var hitPoint = p2.vec2.create();
                        cars[c].rays[i].result.getHitPoint(hitPoint, cars[c].rays[i].world);
                        cars[c].rays[i].graphic.lineStyle(.25, 0xff0000, 1, .5, false);
                        cars[c].rays[i].graphic.moveTo(cars[c].body.position[0], cars[c].body.position[1]);
                        cars[c].rays[i].graphic.lineTo(hitPoint[0], hitPoint[1]);
                    }
                    else {
                        cars[c].rays[i].graphic.lineStyle(.25, 0x00ff00, 1, .5, false);
                        cars[c].rays[i].graphic.moveTo(cars[c].body.position[0], cars[c].body.position[1]);
                        cars[c].rays[i].graphic.lineTo(cars[c].body.position[0]-Math.sin(cars[c].body.angle+cars[c].rays[i].angle)*cars[c].rays[i].length,
                                                        cars[c].body.position[1]+Math.cos(cars[c].body.angle+cars[c].rays[i].angle)*cars[c].rays[i].length);
                    }
                }
            }
        }

        var best_score = 0,
            best_car = 0;
        for (const s in scores) {
            if (scores[s].score > best_score && scores[s].racing) {
                best_score = scores[s].score;
                best_car = s;
            }
        }
        const car_pos_x = app.renderer.width/app.renderer.resolution / 2 - app.stage.scale.x * cars[best_car].graphics.position.x,
              car_pos_y = app.renderer.height/app.renderer.resolution / 2 - app.stage.scale.y * cars[best_car].graphics.position.y;
        if(Math.abs(car_pos_x - app.stage.position.x) > 10 || Math.abs(car_pos_y - app.stage.position.y) > 10) {
            app.stage.position.x += (car_pos_x - app.stage.position.x)/10;
            app.stage.position.y += (car_pos_y - app.stage.position.y)/10;
        }
        else {
            app.stage.position.x = car_pos_x;
            app.stage.position.y = car_pos_y;
        }


        app.renderer.render(app.stage);

        stats.end();

        requestAnimationFrame(animate);
    }

    animate();

    function renderUpdate() {
        for(const c in cars) {
            cars[c].graphics.position.x = cars[c].body.position[0];
            cars[c].graphics.position.y = cars[c].body.position[1];
            cars[c].graphics.rotation   = cars[c].body.angle;

            for(var i = 0; i < 7; ++i) {
                cars[c].rays[i].graphic.clear();
                if(scores[c].racing) {
                    if( cars[c].rays[i].result.hasHit() ) {
                        var hitPoint = p2.vec2.create();
                        cars[c].rays[i].result.getHitPoint(hitPoint, cars[c].rays[i].world);
                        cars[c].rays[i].graphic.lineStyle(.25, 0xff0000, 1, .5, false);
                        cars[c].rays[i].graphic.moveTo(cars[c].body.position[0], cars[c].body.position[1]);
                        cars[c].rays[i].graphic.lineTo(hitPoint[0], hitPoint[1]);
                    }
                    else {
                        cars[c].rays[i].graphic.lineStyle(.25, 0x00ff00, 1, .5, false);
                        cars[c].rays[i].graphic.moveTo(cars[c].body.position[0], cars[c].body.position[1]);
                        cars[c].rays[i].graphic.lineTo(cars[c].body.position[0]-Math.sin(cars[c].body.angle+cars[c].rays[i].angle)*cars[c].rays[i].length,
                                                        cars[c].body.position[1]+Math.cos(cars[c].body.angle+cars[c].rays[i].angle)*cars[c].rays[i].length);
                    }
                }
            }
        }

        var best_score = 0,
            best_car = 0;
        for (const s in scores) {
            if (scores[s].score > best_score && scores[s].racing) {
                best_score = scores[s].score;
                best_car = s;
            }
        }

        app.stage.position.x = (app.renderer.width/app.renderer.resolution / 2 - app.stage.scale.x * cars[best_car].graphics.position.x);
        app.stage.position.y = (app.renderer.height/app.renderer.resolution / 2 - app.stage.scale.y * cars[best_car].graphics.position.y);

        app.renderer.render(app.stage);
    }


    /***********************************/


    function generateTrack() {
        // checkpoints
        track.graphics.lineStyle(1, 0xffff00, 1, .5, false);
        for(var i = 0; i < track_data.chkpts.length; ++i) {
            var wall_dx = (track_data.chkpts[i][1][0]-track_data.chkpts[i][0][0]),
                wall_dy = (track_data.chkpts[i][1][1]-track_data.chkpts[i][0][1]),
                wall_length = Math.sqrt(wall_dx**2 + wall_dy**2),
                wall_angle = -Math.atan(wall_dx/wall_dy);

            var boxShape = new p2.Box({ width: 1, height: wall_length, collisionGroup: CKHPTCG, collisionMask: CARCG, collisionResponse: false });
            track.chkpts[i] = new p2.Body({
                mass: 0,
                position: [track_data.chkpts[i][0][0]+wall_dx/2, track_data.chkpts[i][0][1]+wall_dy/2],
                angle: wall_angle
            });
            track.chkpts[i].addShape(boxShape);
            world.addBody(track.chkpts[i]);

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

            var boxShape = new p2.Box({ width: 1, height: wall_length, collisionGroup: TRACKCG, collisionMask: CARCG });
            track.walls[i] = new p2.Body({
                mass: 0,
                position: [track_data.walls1[i][0]+wall_dx/2, track_data.walls1[i][1]+wall_dy/2],
                angle: wall_angle
            });
            track.walls[i].addShape(boxShape);
            world.addBody(track.walls[i]);

            track.graphics.lineTo(track_data.walls1[i+1][0], track_data.walls1[i+1][1])
        }

        track.graphics.moveTo(track_data.walls2[0][0], track_data.walls2[0][1]);
        for(var j = 0; j < track_data.walls2.length-1; ++j) {
            var wall_dx = (track_data.walls2[j+1][0]-track_data.walls2[j][0]),
                wall_dy = (track_data.walls2[j+1][1]-track_data.walls2[j][1]),
                wall_length = Math.sqrt(wall_dx**2 + wall_dy**2),
                wall_angle = -Math.atan(wall_dx/wall_dy);

            var boxShape = new p2.Box({ width: 1, height: wall_length, collisionGroup: TRACKCG, collisionMask: CARCG });
            track.walls[j+i] = new p2.Body({
                mass: 0,
                position: [track_data.walls2[j][0]+wall_dx/2, track_data.walls2[j][1]+wall_dy/2],
                angle: wall_angle
            });
            track.walls[j+i].addShape(boxShape);
            world.addBody(track.walls[j+i]);

            track.graphics.lineTo(track_data.walls2[j+1][0], track_data.walls2[j+1][1])
        }

        app.stage.addChild(track.graphics);
    }

    function generateCar(car) {
        var carShape = new p2.Box({ width: 2, height: 4, collisionGroup: CARCG, collisionMask: TRACKCG | CKHPTCG});
        car.body = new p2.Body({
            mass: .8,
            position: [track_data.start[0], track_data.start[1]],
            angle: track_data.start[2]
        });
        car.body.addShape(carShape);
        car.body.shape = p2.Shape.BOX;
        world.addBody(car.body);

        car.graphics.beginFill(0x0c1e70);
        car.graphics.drawRect(-1, -2, 2, 4);
        car.graphics.endFill();
        app.stage.addChild(car.graphics);

        car.vehicle = new p2.TopDownVehicle(car.body);

        car.frontWheel = car.vehicle.addWheel({
            localPosition: [0, 1.5]
        });
        car.frontWheel.setSideFriction(8);
        
        car.backWheel = car.vehicle.addWheel({
            localPosition: [0, -1.5]
        });
        car.backWheel.setSideFriction(6.5);
        car.vehicle.addToWorld(world);

        car.frontWheel.steerValue = 0;

        car.backWheel.engineForce = 0;
        car.backWheel.setBrakeForce(0);

        car.rays.push({length : 20, angle : -1.3962634016, world : new p2.Ray({mode: p2.Ray.CLOSEST, collisionMask : TRACKCG}), result : new p2.RaycastResult(), graphic : new PIXI.Graphics()});
        car.rays.push({length : 60, angle : -0.6981317008, world : new p2.Ray({mode: p2.Ray.CLOSEST, collisionMask : TRACKCG}), result : new p2.RaycastResult(), graphic : new PIXI.Graphics()});
        car.rays.push({length : 80, angle : -0.3490658504, world : new p2.Ray({mode: p2.Ray.CLOSEST, collisionMask : TRACKCG}), result : new p2.RaycastResult(), graphic : new PIXI.Graphics()});
        car.rays.push({length : 100, angle : 0, world : new p2.Ray({mode: p2.Ray.CLOSEST, collisionMask : TRACKCG}), result : new p2.RaycastResult(), graphic : new PIXI.Graphics()});
        car.rays.push({length : 80, angle : 0.3490658504, world : new p2.Ray({mode: p2.Ray.CLOSEST, collisionMask : TRACKCG}), result : new p2.RaycastResult(), graphic : new PIXI.Graphics()});
        car.rays.push({length : 60, angle : 0.6981317008, world : new p2.Ray({mode: p2.Ray.CLOSEST, collisionMask : TRACKCG}), result : new p2.RaycastResult(), graphic : new PIXI.Graphics()});
        car.rays.push({length : 20, angle : 1.3962634016, world : new p2.Ray({mode: p2.Ray.CLOSEST, collisionMask : TRACKCG}), result : new p2.RaycastResult(), graphic : new PIXI.Graphics()});
        for(var i = 0; i < 7; ++i) {
            app.stage.addChild(car.rays[i].graphic);
        }
    }

    // pixijs interaction
    app.renderer.view.addEventListener('wheel', function(event) {
        event.preventDefault();

        if((event.deltaX + event.deltaY + event.deltaZ) > 0) {
            if(zoom > 1)
                zoom -= 1;
        } else
            zoom += 1;

        resize();
    });


    // Window resizing stuff
    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', orientationchange);

    function resize() {
        var w = window.innerWidth;
        var h = window.innerHeight;

        app.renderer.resize(w, h);

        app.stage.scale.x = zoom*w/1600;
        app.stage.scale.y = -zoom*h/900;

        if(app.stage.scale.x > (-app.stage.scale.y)) {
            app.stage.scale.x = -app.stage.scale.y;
        } else {
            app.stage.scale.y = -app.stage.scale.x;
        }

        renderUpdate();
    }
    resize();

    function orientationchange() {
        window.scrollTo(0, 0);
        resize();
        window.scrollTo(0, 0);
        window.scrollTo(0, 0);
    }


    function saveNNet() {
        console.log(NNets[0].saveNet());
    }
    /*function loadNNet(nn) {
        NNets[0].LoadNet(nn);
        gen_algo.
        fromGenome(nn, 8, m_hidden_layers, m_hidden_neurons, 4);
        console.log(NNets[0].saveNet());
    }*/
})();
