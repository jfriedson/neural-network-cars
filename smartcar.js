(function() {
    var zoom = 20;
    var m_start_time = performance.now(),
        m_sim_steps = 0;


    // TRACKS
    var silverstone_reverse = {start : [-10,-50, 0], walls1 : [[0,0],[0,-279],[2,-294],[8,-310],[15,-320],[25,-329],[40,-336],[74,-347],[130,-358],[171,-362],[198,-365],[338,-359],[353,-361],[366,-363],[392,-373],[412,-382],[425,-385],[434,-384],[442,-381],[509,-353],[521,-349],[532,-350],[544,-351],[556,-355],[568,-363],[582,-372],[593,-378],[614,-380],[624,-379],[634,-374],[644,-367],[652,-357],[664,-339],[672,-315],[678,-306],[686,-293],[701,-281],[1076,-32],[1113,-2],[1131,17],[1141,34],[1143,41],[1145,58],[1143,70],[1137,85],[1126,99],[1114,108],[1097,115],[1065,126],[1038,141],[1012,159],[998,170],[985,182],[972,193],[964,196],[957,198],[907,228],[900,238],[899,248],[901,254],[914,272],[920,289],[915,299],[894,319],[868,333],[836,343],[821,342],[811,337],[561,111],[553,98],[550,87],[549,72],[551,61],[567,-8],[568,-23],[568,-41],[564,-61],[555,-82],[485,-187],[481,-195],[481,-202],[487,-212],[494,-217],[507,-219],[559,-230],[567,-234],[572,-243],[573,-251],[568,-259],[542,-275],[517,-284],[474,-292],[462,-294],[452,-293],[445,-289],[124,9],[113,24],[109,42],[110,63],[119,79],[130,85],[179,94],[191,99],[201,110],[205,121],[205,138],[200,149],[192,157],[178,165],[163,166],[148,160],[59,102],[31,72],[17,50],[4,18],[0,0]],
                                              walls2 : [[-20,6],[-17,20],[-2,58],[0,61],[16,86],[48,119],[137,177],[141,179],[156,185],[164,186],[179,185],[188,182],[202,174],[206,171],[214,163],[218,157],[223,146],[225,138],[225,121],[220,103],[216,97],[206,86],[199,81],[187,76],[183,74],[137,66],[134,64],[130,57],[129,44],[132,32],[139,22],[457,-273],[458,-274],[461,-274],[471,-272],[512,-265],[533,-257],[548,-248],[503,-239],[491,-237],[482,-233],[475,-228],[470,-222],[464,-212],[461,-202],[461,-195],[463,-186],[467,-178],[468,-176],[537,-72],[545,-55],[548,-39],[548,-24],[547,-11],[532,56],[531,57],[529,68],[529,73],[530,88],[531,92],[534,103],[536,108],[544,121],[548,126],[798,352],[802,355],[812,360],[820,362],[835,363],[842,362],[874,352],[877,351],[903,337],[908,333],[929,313],[933,308],[938,298],[939,282],[933,265],[930,260],[919,245],[919,245],[921,243],[965,217],[969,215],[971,215],[979,212],[985,208],[998,197],[999,197],[1011,185],[1024,175],[1049,158],[1073,144],[1104,134],[1105,133],[1122,126],[1126,124],[1138,115],[1142,111],[1153,97],[1156,92],[1162,77],[1163,73],[1165,61],[1165,56],[1163,39],[1162,36],[1160,29],[1158,24],[1148,7],[1146,3],[1128,-16],[1126,-18],[1089,-48],[1087,-49],[713,-297],[701,-305],[690,-324],[683,-345],[680,-351],[675,-358],[669,-367],[668,-369],[660,-379],[655,-383],[645,-390],[633,-397],[626,-399],[616,-400],[605,-400],[590,-398],[583,-396],[572,-390],[557,-380],[547,-373],[540,-371],[530,-370],[523,-369],[516,-372],[450,-399],[441,-403],[436,-404],[427,-405],[421,-404],[408,-401],[404,-400],[384,-391],[361,-382],[350,-381],[337,-379],[199,-385],[196,-385],[169,-382],[128,-378],[126,-378],[70,-367],[68,-366],[34,-355],[32,-354],[17,-347],[12,-344],[2,-335],[-1,-331],[-8,-321],[-11,-317],[-17,-301],[-18,-297],[-20,-282],[-20,-279],[-20,0],[-20,6]],
                                              chkpts : [[[-20,-25],[0,-25]],[[-17,20],[4,18]],[[-2,58],[17,50]],[[48,119],[59,102]],[[137,177],[148,160]],[[225,121],[205,121]],[[130,57],[110,63]],[[165,-29],[179,-15]],[[342,-194],[357,-180]]]};
    var silverstone_demo = JSON.parse(JSON.stringify(silverstone_reverse));
        silverstone_demo.start = [200, -376, -1.52];
        silverstone_demo.chkpts = [[[240,-363],[241,-383]],[[300,-361],[301,-380]],[[338,-359],[337,-379]],[[412,-382],[404,-400]],[[462,-373],[470,-391]],[[521,-349],[523,-369]],[[582,-372],[571,-389]],[[640,-370],[651,-386]],[[680,-303],[695,-314]]];
    
    var track_data = silverstone_demo;
    var score_by_dist = true;
    var train_mode = true;


    PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.LINEAR;
    const app = new PIXI.Application({ width: 1600, height: 900, backgroundColor: 0x060f39, autoDensity: true, resolution: window.devicePixelRatio||1 });

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
            //  Use this to improve track times;
            if (gen_algo.generation <= 10 || gen_algo.generation >= 200)
                scores[c].score += time_limit - (scores[c].times[scores[c].times.length-1] - scores[c].times[scores[c].times.length-2])/m_sim_world_fps;
        }
        // crash
        else {
            if(!get_pt && scores[c].racing) {
                if(score_by_dist && scores[c].chkpts >= 3)
                    scores[c].score += (cars[c].body.position[0] > track.chkpts[scores[c].chkpts-1].position[0] ? 1 : -1) * Math.sqrt((cars[c].body.position[0]-track.chkpts[scores[c].chkpts-1].position[0])**2 + (cars[c].body.position[1]-track.chkpts[scores[c].chkpts-1].position[1])**2);
                scores[c].racing = false;
                gen_algo.SetGenomeFitness(c,scores[c].score);

                cars[c].frontWheel.steerValue = 1.57;
                cars[c].body.angularVelocity = (Math.random()-Math.random()) * cars[c].body.velocity[0] * cars[c].body.velocity[1] / 10;
            }
        }
    });


    var scoreboard = new PIXI.Text("Click to toggle sim speed\nworld 0fps\nrenderer 0fps\n\nGeneration 1\nLeaderboard",{fontFamily : 'Arial', fontSize: 30, fill : 0xffffff, align : 'left'}),
        sim_times = [],
        render_times = [];
    scoreboard.x = 5;
    scoreboard.y = 5;
    app.stage.addChild(scoreboard);

    function toggleSimSpeed() {
        if (m_sim_intv_fps == 64) {
            m_sim_intv_fps = 1000;
            m_render_fps = 5;
        }
        else {
            m_sim_intv_fps = 64;
            m_render_fps = 30;
        }

        setStepIntv(m_sim_intv_fps);
        setAnimIntv(m_render_fps);
    }

    app.renderer.view.addEventListener('mousedown', toggleSimSpeed);
    app.renderer.view.addEventListener('touchstart', toggleSimSpeed);


    var record_score = 0;

    function sim_step(mp) {
        for(var m = 0; m < mp; ++m) {
            const now = performance.now();
            while (sim_times.length > 0 && sim_times[0] <= now - 1000)
                sim_times.shift();
            sim_times.push(now);
            var text = scoreboard.text.split("\n");
            text[1] = "world " + sim_times.length.toString() + "fps";
            scoreboard.text = text.join("\n");

            var racing = 0;
            for(const c in cars) {
                // did the car reach the checkpoint time limit
                if((m_sim_steps - scores[c].times[scores[c].times.length-1])/m_sim_world_fps >= time_limit) {
                    if(scores[c].racing) {
                        if(score_by_dist && scores[c].chkpts > 0)
                            scores[c].score += 1.5 * (cars[c].body.position[0] > track.chkpts[scores[c].chkpts-1].position[0] ? 1 : -1) * Math.sqrt((cars[c].body.position[0]-track.chkpts[scores[c].chkpts-1].position[0])**2 + (cars[c].body.position[1]-track.chkpts[scores[c].chkpts-1].position[1])**2);
                            // Using time doesnt work well becuase it causes the cars to spin out and go backwards
                            //scores[c].score += 15 * ((m_sim_steps - scores[c].times[scores[c].times.length-1])/m_sim_world_fps)/time_limit;
                        else if(score_by_dist)
                        {
                            sc = 40 - Math.sqrt((cars[c].body.position[0]-track.chkpts[0].position[0])**2 + (cars[c].body.position[1]-track.chkpts[0].position[1])**2);
                            if(sc > 0)
                                scores[c].score += sc;
                        }
     
                        scores[c].racing = false;
                        gen_algo.SetGenomeFitness(c,scores[c].score);

                        cars[c].body.angularVelocity = (Math.random()-Math.random()) * cars[c].body.velocity[0] * cars[c].body.velocity[1] / 20;
                    }
                }

                if(scores[c].racing) {
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
                    NNetInput(c, input);
                    ++racing;
                }
                else {
                    cars[c].frontWheel.setBrakeForce(3);
                    cars[c].backWheel.setBrakeForce(5);
                    cars[c].frontWheel.steerValue = 1.57;
                    cars[c].backWheel.engineForce = 0;
                }
            }

            // if all cars in a failure condition, reset track and NNs
            if(racing == 0) {
                gen_algo.BreedPopulation();

                var best_score = 0;
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
                    console.log("New record of " + record_score.toFixed(3) + " in gen " + (gen_algo.generation-1) + " at " + Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric'}).format(Date.now()) + " after " + Math.floor((performance.now()-m_start_time)/1440000) + "hours " + Math.floor((performance.now()-m_start_time)/60000)%60 + "mins " + Math.floor((performance.now()-m_start_time)/1000)%60 + "s");
                    if (text.length == 11) {
                        for(var i = 6; i < 11; ++i)
                            text[i] = text[i+1];

                        text[text.length-1] = record_score.toFixed(3) + " at gen " + (gen_algo.generation-1);
                    }
                    else
                        text.push(record_score.toFixed(3) + " at gen " + (gen_algo.generation-1));
                }

                //var text = scoreboard.text.split("\n");
                text[4] = "Generation " + gen_algo.generation;
                scoreboard.text = text.join("\n");
            }

            ++m_sim_steps;
            world.step(m_sim_step);
        }
    };

    var sim_step_intv = null;
    function setStepIntv(sim_fps) {
        clearInterval(sim_step_intv);

        m_sim_intv_fps = sim_fps;
        m_sim_delay = 1000/m_sim_intv_fps;

        if (m_sim_intv_fps <= 200)
            sim_step_intv = setInterval(sim_step, m_sim_delay, 1);
        else
            sim_step_intv = setInterval(sim_step, m_sim_delay*10, 10);
    }

    setStepIntv(m_sim_intv_fps);


    var last_update_ts = performance.now();
    function animate() {
        const now = performance.now();
        while (render_times.length > 0 && render_times[0] <= now - 1000)
            render_times.shift();
        render_times.push(now);
        var text = scoreboard.text.split("\n");
        text[2] = "renderer " + render_times.length.toString() + "fps";
        scoreboard.text = text.join("\n");

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
            app.stage.position.x += (car_pos_x - app.stage.position.x)/(m_render_fps/3);
            app.stage.position.y += (car_pos_y - app.stage.position.y)/(m_render_fps/3);

            scoreboard.x = (app.renderer.width/app.renderer.resolution / 2 - app.stage.position.x)/app.stage.scale.x - 780/zoom;
            scoreboard.y = (app.renderer.height/app.renderer.resolution / 2 - app.stage.position.y)/app.stage.scale.y + 430/zoom;
            
            scoreboard.scale.x = 1/zoom;
            scoreboard.scale.y = -1/zoom;
        }
        else {
            app.stage.position.x = car_pos_x;
            app.stage.position.y = car_pos_y;

            scoreboard.x = cars[best_car].graphics.position.x - 780/zoom;
            scoreboard.y = cars[best_car].graphics.position.y + 430/zoom;

            scoreboard.scale.x = 1/zoom;
            scoreboard.scale.y = -1/zoom;
        }

        app.renderer.render(app.stage);

        //requestAnimationFrame(animate);
    }
    //animate();
    
    var animate_intv = null;
    function setAnimIntv(renderer_fps) {
        clearInterval(animate_intv);
        m_render_fps = renderer_fps;
        m_render_delay = 1000/m_render_fps;
        animate_intv = setInterval(animate, m_render_delay);
    }

    setAnimIntv(m_render_fps);


    function renderUpdate() {
        const now = performance.now();
        while (render_times.length > 0 && render_times[0] <= now - 1000)
            render_times.shift();
        render_times.push(now);
        var text = scoreboard.text.split("\n");
        text[1] = "renderer " + render_times.length.toString() + "fps";
        scoreboard.text = text.join("\n");

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

        scoreboard.x = cars[best_car].graphics.position.x - 780/zoom;
        scoreboard.y = cars[best_car].graphics.position.y + 430/zoom;

        scoreboard.scale.x = 1/zoom;
        scoreboard.scale.y = -1/zoom;

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


    window.addEventListener("copy", e => {
        e.preventDefault();

        const nn = btoa(gen_algo.population[0].weights);
        
        console.log(nn);
        e.clipboardData.setData('text/plain', nn);
    });

    window.addEventListener("paste", e => {
        e.preventDefault();

        const cb_text = atob((e.clipboardData || window.clipboardData).getData("text"));
        const nn_weights = cb_text.match(/-?\d+(?:\.\d+)?/g).map(Number);
        
        gen_algo = new GenAlgo();
        gen_algo.GenerateNewPopulation(m_car_amt, 8, m_hidden_layers, m_hidden_neurons, 4);

        gen_algo.population[0].weights = nn_weights;
        gen_algo.population[1] = gen_algo.Mutate(gen_algo.population[0]);
        gen_algo.population[2] = gen_algo.Mutate(gen_algo.population[0]);
        gen_algo.population[3] = gen_algo.Mutate(gen_algo.population[0]);

        for (nn in NNets) {
            NNets[nn].fromGenome(gen_algo.GetNextGenome(), 8, m_hidden_layers, m_hidden_neurons, 4);

            scores[nn] = {racing: true, chkpts : 0, times : [m_sim_steps], score : 0};
            cars[nn].body.position = [track_data.start[0], track_data.start[1]];
            cars[nn].body.angle = track_data.start[2];
            cars[nn].body.setZeroForce();
            cars[nn].body.velocity = [0,0];
            cars[nn].body.angularVelocity = 0;
        }

        gen_algo.generation = 50;

        record_score = 0;
    });

    parent.document.getElementById("pretrained").addEventListener("click", () => {
        const cb_text = atob("LTAuMDkzMzA0OTQyMzA5ODA3MjQsLTEuMTg1Mzc1NTYxOTc1NjA2NiwtMC4zNTA0Mzk0Mzc3MTE1MzU2MywwLjAxMTQ3MTQ5NDA1ODczMjQ5LDAuNDA1MTEwMTUxNTIwMDMwNCwtMC40MjkzMzAxNTQ0Mjc2MjgzNCwzLjIwOTczODE1MTc4Nzc0OTIsLTEuNDY2NjYyNjAzOTY1NDA3MiwtMC4wNTc2Njg5MzEwOTUyMzE4NiwxLjgwNTk4ODIyMjQ0NTQ4MywtMS4wMzQ0ODk0OTE5NzYxNjQsMS4wMDIxNTU1Nzk0MTY2MjMsMi44MjY1ODkyMDU1MDkwNjA3LC0wLjUxNTE5MTEwNzA3MjA5MzEsLTAuMzgxMjc4ODc1NjE1MTY4NSwtMC40NzY5MDMxOTU1ODY5NTExNiwtMi4zMDAzMDAxMDYxMzI3MDYsLTAuODM0MDM4MTQ0MjA4MjUxNywtMC4yNDMzNjIzMjcyMDk3MzQzOSwtMS40MDA5OTU5MzIwMTk4NDk3LC0wLjUyNzMzMzE0MzMyMzUxMzEsMS44NDg3NTA0MjQ0ODk3MzYxLDAuMDg2MDc3MjM5ODM5NzczMzMsMS41OTMyMjY0NjA5Nzg5NSwwLjgxNDk5MzYyNTU2Mjk3NSwxLjMyNTY2MTM0MzMyMDIwNjcsMC41MzU3MzUwNjkwNTE0MDQxLC0wLjIwMTQ1MzY1NzQ0ODcwMDE0LDAuNDI5MTkwMDc2NTIyMzc5ODQsMS4xNjgzNjYxMDI5MjIyMjEsMS40NTQzNjg2ODQxNjA5MDI3LDAuOTE1NDY3OTU5NTc1NzI4NSwxLjMwNTQwODg4NDg5ODA0MjcsMC4wMTI2NTcyNTY3NTQ2MTM0ODgsMC42MDg2Mzg5MTUwNjA0NjM0LDAuMDc0NTk0NTMzMDMwMzIzMjYsLTIuNjU0NTg4NjAyMTI5NzkwNCwxLjgyMjE2MjQ2ODg4NTQzMzIsLTAuMDI0MzMwOTY3NTM2OTUzOTYyLDAuNzI2NjMyNzk5NDY0MzUxOCwwLjc1MjczMDQ4NjE2OTMwNTcsMC4yMTcwNDk2NDE0NDgwODc0NywxLjM4NDIzNjU0MzY4OTMyNDMsMC4xNjU1MzY4NDUzMDI1OTU4MywtMC4wODE0MjM1NTc1MjUxMjk2NCwzLjMzMDQ1OTM2OTY2NDU2MywwLjM4MTQ3NDgzNjEwMjczNjgsMS43NDA5MTg0OTc2MDQ4OTg4LC0wLjIxMTU5NDU1NTk4OTA2Mzk2LDAuMjgxNTQ2ODMyMTkyNDU2OCwwLjg3NDMzMDQzMzQ2ODkxMjQsMS4zNDIzMTQ2NzIyNjg2Mzk5LC0wLjQzOTIwNTcwNDc5MTE3NTcsMS4yNjIxNjc4ODUxMzQ3MjQ0LC0wLjAxMTI4MjQ2ODEyODcwODkyMiwwLjA1MDIwMTU1NjgzNTI0Mzk2NiwxLjE2MjI2MDczMTgyMzgwMjcsMS4wMzAxOTIxODA3NjM5MzEsMC4wOTQzOTI0OTAwNDkzODM2NiwtMC40MDgwODA5NzU2NDczNzgxLC0xLjM5MTE0ODE5NDY5NTc3NDksMS4yOTc3NTM0ODg5ODcyNTY2LDAuMzc2MjQ3NDU4NTQ3NDk2NzUsMS41MDg4MjQ5OTI3MTM1NDQ2LDEuNDkyNzExNDEyNTQ4MDA1NCwwLjk2ODEyNjY0MzYxMTYyMDcsMC4zMzgyNDUwMTU1MzEzOTc0LDEuNDkzNjAwNjk1NjIxMDY3MiwtMS45MTc3NDcyNDUzMzc0NDI3LDAuNDM4OTk4MjAxNDM1OTU5NiwwLjcxNTEzNTExNTI1MDQzNjMsMC42ODU2NjEyNDk2ODk4NDcsMC40OTE1ODc5ODczODAwNjYwNCwtMC4wMzIyNDQ2NzA1MDA2MDQ0MiwwLjc0NDg3NjI3NjY4OTU3NDMsLTEuNDYzNDYxNTQ4OTMwOTQwNiwyLjUyMjMxNDQzNzE2NjkxNSwtMC43NzU3NTQ4NDIxODA4NjU3LC0wLjI0MjU3NzQ2OTE1MDc1MTk2LDEuODQ0OTY5NTM4MDgxMzAxMiwwLjYyODg4NjAxMzk4ODk2MDQsMC4yNzkyNjk3MTg5Mjk1MjE5LC0yLjUyMzQ3NjIyNTUxNjg3NCwtMi40MDA5Njc4MDI3MzUzMzgsLTAuNzE3Mzg4NzY0ODk3NTM0MywtMC41OTI4OTYxMjQyMjc0MTc0LC0zLjQxOTYxMzU3NzM3MTY3NDUsMS4yMjgxOTk1MzUzODU4OTc0LDIuMjAwMjY1MjM3Mjg5MDIyNiwwLjI1Nzc4NjA1OTgwODc4ODY2LC0xLjczNjkxODIwNjc3ODU0MTYsLTAuNTk4NTM0MTc1NzA0MzgzNywxLjA5ODQ5MjM0NjYwNDkwNSwtMC4zNjI0NTk2NDQ1MzQ2MjYzLDIuNDg0MDE0MjY5NzE3OTM2LC0wLjEzMzUyNjUwMjk3NzgxODY1LC0xLjU2MTk4MjAzNjEzMDk4LDAuMjA1OTUyODg1ODM4MjUyMjIsLTAuMjE3ODE3MDk5OTkyNDc2NTYsMS4yMzA5NzI0NjMxMTQ5MjA2LC0xLjM3NzA0Mzg4Nzc1NTc2MSwyLjM0NjM0Mjg3NTM0MzkzOTUsLTEuMDA4MjIzNjM3NDUxMzk1NSwtMC41MzU0OTkwOTgzNjEyNjExLDEuNTQyNTQ4ODM0NTA1OTM0MiwtMC4xNzgwNzQwNjczMDgzNTA5NiwzLjUyMDA5MjI0NTM4MTk4MTQsLTEuODU4ODczNjY5NjA2NTIzNiwtMC41Nzc5NDkzMjgxODg4ODc3LC0wLjY5NzY4NjE0MDk4NDQ4NjYsLTEuMzI3NTM3NjM2NDMwNDE3MiwtMC4yMTE4MDAzMzYwODU1NjgxNCwtMC4zOTc1OTQ5NjkwNzE4NDYyLC0xLjQzOTY2ODQzMTEyMTk1NCwxLjUyNzYwNjcxMTMwOTM1OCwtMC41ODQ0NDQ4MTI5OTYzNjEsMC41ODU4NDA2MTUwNDQ5NTY0LDAuOTMyODk0MTMyMTE3Mzg0OSwtMC4zMzIwNzIyNzY4MTA0MDc3NCwwLjgzNTYxODg2MzU4NjYxNDQsMC45MzczNTkwMzM3NzQ4NDY2LC0xLjEyMDE3MjgzNzYwNjgwNDcsMC4yMzAxODY3NjE4MzgwMzQ1NSwtMC42ODQ2NTA0Njk0MjM0NDI5LDIuNDM1MjA2NDcxMTExNTcyLDAuNTA4MDI2MDYyOTMwOTMxOSwtNC4xMDgwNzcyNTIwMDM3MywtMC43NzE0NjIxNjMwNTk1MTg4LDAuODY3Mzg0Mjk2Mzk4MzQzLC0wLjQ0NjAyMzk2MjYwODYyOCwtMS40MTkzOTg4ODUxNDcyNTE3LDIuMzM4MDM3NzE0ODM2MzA1NiwtMS43MzEzNzkwODgwODkyMTM3LDAuNzAxNDUwNzY5NzAzMzYyNiwwLjQ2NDkyODM2NDg2MjM3NzksLTAuMTg5NDE4NzE2Nzc2MjQsMC4wMjIzNzUwOTc2NDU3MjI5ODYsMS4wNDc1Mzk1NjE2NjIxMTYxLC0wLjkyNjAxOTkxNjA1MjUzNTksLTAuNDE0OTcxNzM5NDg2MzYxNTcsMC4zODczODEyOTQ5NTMwMDg1NSwyLjI2NjU1MDgzNTA5MDExODUsLTEuNjIzNjEwMzQ2MjcyMTEyNSwyLjQ3ODg1OTgxMjU2MjU2MzQsMC41MDY0OTc5NjA3NTk0ODAxLC0zLjQ5OTI0MTQ3MTQyNzgyMywtMC44OTgxNjQyNDYyNDAyNjU0LC0wLjYxNDAzNzk3NjEzMDk4NjgsLTAuNDIxNTE1NTQ0MTIyOTc0NjUsMC42NjY1MjczODcyODE1NDI4LC0xLjE4NjI3MDkzMzU3ODM3ODgsMC43NzE1MTA4OTA5Nzk4Mjg0LDAuMTk3MTk4MzAwMTAzNzk2OSwtMC40NjM3MTQ5NDU0OTg5OTY0LC0wLjcwMzU0MDg2MzQ5Nzc4NiwtMS4wMjc0NzYxODAyNzI1NTg3LC0wLjM3NjA2NjM0NTM1NzE2NzY1LC0wLjU2NTM3MDcxNjkzODk3MTIsMS45MjcyNjUxODc4ODY2NzM2LC0wLjYwNjE1NDc0MTcwNDIzNTIsMS42MTI1NDc0NjcxNTQ5MTgsMS41NTMyMzM5OTg3NTY4NzUsLTEuNTUzOTU1Nzg2ODc4MjE1MiwyLjEzMDg2OTkwMjMwMzQwNzcsOC42NDg5ODc5Mzg2MjM1MSwwLjc0NjQ3ODgxNTgyMDAyNTMsMC4wMTMwNDUxNDU4OTY3NTk0MjUsLTAuMDE4MTIwNDAwNDQ5OTM2MzQ3LDAuMTg2ODQxMjU2MDExNjY2NDYsMC4yNjUzNDM0NTAzNTczODE2LDAuNzIyMDM2NDY5NjIwMDM5NSwtMy4yMTA1MDY2NjI0MTcxOTIsMC4zMTk2ODEzNDY3MTM4NzA2LDAuMzkyNjEyNzE3OTAxMDg5MywtMS45MzEwMTMzMTg1Nzg4Mzg1LDEuODMzNzMzMDU1MTYyMTYzMywwLjMzODIyNjgwNzYyMTYwMDg0LDEuMDEzOTE4NDg2MjQ0ODA3LDAuMTUzNzAwNzU0OTMwNzQzNzUsMS4wMTA5OTY0NDg3Mjk1MzIyLC0yLjUxODA2NjkwMDg5NzIxNTYsMC44NTE5MTY0NzcwNTk1MTA1LDAuMDIyMTQyMzMxNjU3OTU1OTgzLC0wLjgzMzMzMzU0NDY1MDc0NDMsLTEuNDgxMjQ2NzUwMjQxNDU4OCwwLjQ5ODAwNDU3ODAzMDc3NDksMi4zOTQ2NTAyODExODg1NDksMC4wMTQxOTIzMjI1ODgxMTU4NjksLTEuNjE0NDA1MDMzMDY3NTk5NCwwLjMwODk1NTY1MTkwNzA1NDEsMC43NzQ0NDAzNzQ1MzkwNTQyLDAuOTY3Mjg1MDk2MDgwMjUxLC0yLjU3NTc5NTIzMzY4NTk2NzcsLTAuMjA4ODIwNjk0NjQwMDU4NywtMC42MDI4NDA0ODUzNzk4NjY2LDAuNDg2Mzg4NjM0MDEzNjg4NywwLjQ5NDE3ODUxNDI0NTE4MTQ0LDAuMTk0MzEwMTUwMjMzNzk2NSwwLjgzMDI5MTk2OTE0NTUwMDksLTAuODc1MDY2MjcwNjE3MjUyMiwtMC45ODc5ODQwMjg3NDU3NzYyLDAuMzgxMzYyOTkzNjM0Nzc2MSwtMC4yMjc2MTA1MzExNjY3MTY5MiwwLjUyNDUzNTA4NDYyNTMwNiwtMS41OTYxMDExNjQ5NTEyOTQ0LC0zLjUyODMzOTgwMzc1NDA5MDMsMC42NDk1MjQ5NzEyNDEzMzUzLDEuNDg1OTE5MzE0NTIxNjc2NywtMi4yNDM3ODAyMzA2NjUzNzkzLDIuMzIzMDAwMDA3MzU2OTQsLTAuODI4NTAwMDUwMDAxOTY3OCwwLjU4Nzk5MDIyMTMxNDAzMjYsLTAuMDMyODg3OTc1NzU4Njk1ODQsMC43ODA5MzU5MzYyNzAwMjAzLC0wLjM4MjEyNjIwMjIxNTMwMTYsLTEuNjcxMDk5NDI3Mjg4MTc5MiwtMC40NzQ0MDExNDgzNzExNTM0NCwtMi4yNTYxNDk1MjUxMDU5MTEsLTAuMDcxMDYzMTUxOTA2NDExMSwtMC41NDI3NzI1MDE3ODc2NTY4LDEuMDg4ODYyODc1MDgxOTM5NCwtMi4xNTgwMDAxNTUyMDAyMjM3LDAuMTYzNDg0OTY2MzM2MDU3NDcsLTAuNDI5MjQ5MjQxMjYzNzgzMDUsLTAuODQzMTYyODY5NzYxOTc3NiwwLjA1ODkzMDkzMDkwOTUwNDE5LC0xLjY0NDUxMzcyOTc3OTQxODgsMi4zODk1MDM3NDM3Njg1NjYsMC41ODQzNTAwNjg3NzIwNTkzLDAuMjQwNDM4NTY3MDAxODAwNjYsMC44NjAxNTM0MzM5MDc4NDAyLDAuNTk4NDU1MDcyOTczNDQzMiwtMC41MzM4NzE5NzEwMTE1NTI3LDEuMzI4NDk2Nzg0MzU0NDMyOSwtMC4xMjQ2MTc0MjYyMzI4ODgzLC0xLjQ0OTA3OTcxMjkzMjQzOSwtMi4xMDU1MjQ2Mzk3OTc1NTQsLTAuNjYxODkyMTkwNjcyNDQ3NSwwLjA4MDc1MjE0Mzg4MTUxMDMxLDEuODUzMzc0OTI2NjI4NDYxMiwxLjIyODY5NzUxNTE3ODc4NDQsMS4zODY4NTI1MTkwMzExNzMsLTAuMjIzOTA1OTg4MzA4Mjc1OSwtMi4yNzgzNDE4OTQzODYzNDgzLC0yLjM3MjE0MDY0MDU0MzAyNDgsLTAuNTI2Nzc0MjMxMzIzNTA2LDIuMTIxMTczMjEzMzIwNDQ2NCwtMy4wNTMwNTkxOTE5NDYwMDczLC0xLjY2NTk3MDMxMzM1ODkwNTcsMS4xODM0Mzc0ODM4NTQ1NTMsMC4zMDY5NDI5NDQ1NDU0OTU4NywwLjgyMTcxMTM3NDI4MTYzMzEsMS4zMDg4NTU1Mzg2MzAyMjk2LDAuOTczMjE4Njg3MDE3MTA2NSwwLjk5MTE0MDczODY3OTUxNzIsLTAuMzAyNjQxODc4MTkwNDM1LDAuOTkxNDM2NTc4MjI3MDI2OCwtMi41NjkyMjAzMTczMTY0Nzc2LDAuODE2NDk1MzM2NTUzODAzNSwwLjAwMjczODI4NDY1NzkwMTYwMiwtMC4yMzY3MjAyMjA1NTYyMjMxLC0zLjM3OTY1MTU2MDIyMTAzOCwtMi4wNTU5NjkyMzA0NDMzNTcsMC4yNjE5NTIzMTQ2NDUxNzE0NCwwLjI3NjQ2ODk0OTM2MzAzOCwtMC4wNDc0OTg4MjQyNTk0NTg4NCwtMS42Mzk1NDM4MjU0MzUzMjM0LDAuMjAxNjQ4NjkxMjU2MTUzMjYsLTEuMTgzNjUzNzQ1NTA3MTIyOCwwLjczOTMyNTEyMDA2NjMzNzksLTQuMDgwMDIwMzc0MDAxMDk4LC0wLjIyNjIzMDc5NDgxMTY0NDQzLDAuNDk3NDc4NzkzNjUxMTg5MiwwLjYxNDg5NDQ0NDk0MDYxNzIsLTIuNDUyNzM3OTYwMjEyOTE0LC0wLjg4ODAzNDAwNzI4ODg5MjksMC41MDQzNDQ4Mzg3NzE3MzE0LC0wLjIyOTQxNDcwNzEyMzExNDE4LDEuNDE2NjAwODEwNjk1NDY3LDEuMTgzNzk0ODQxNjY2Nzk5NiwxLjAwODU2OTE0NDUxMDY1MzcsMC40MTE1OTQzMjY0ODYxNzA5LDAuMzcxOTM0NjE3OTcxMTY2MiwtMC40NDE2MzE2ODczODA3ODU0LDIuNjkxMTI3MDM3OTc1NTQyLDAuNjk3ODcyOTk5NTQ3MzE0MSwtMi41MDcxMTAzMTk1OTI1NzQ2LDAuMTMyOTk1Mzk5Nzc1OTMyNDQsMS4yOTc0MzU3NjM4NzY3NDk1LDEuOTE5MzY1NDg3Nzg5NTYyNSwtMi40NDg4NjY4MTEwMTgxNDQ0LC0wLjE1OTgxMDU5NDIxNjczMjcyLC0xLjc3MDczNjA3NjA2MDIwMDcsMC4wMjg0MDYwODA1NDI1MDcyNiwtMC4wNDkxNTE1MzI4NzQwMDU0MiwtMS4wNTMyMjg4ODgxODMzNzczLDEuODI2NzkxNjE5NDgwNTczNiwyLjQ2Njg3NDE1NzU5MTM0NzMsMS4xODAwNTUzMzg3NzkzODIyLC0xLjg1NTgyNzUwODMwODI3MDcsLTAuODYyNjYxODk1ODM3NTc4LDAuNzY0ODQyMTcxNzcxMTM0OSwyLjI3MDE0OTcyNjE3Njg3ODYsMC40NTEwNjcyODY2MjUyMTU2NywtMS44MzI5Mjc0OTA0MTcwNDg3LC0zLjMxOTQ5MjkxMjU1MzMxMDYsMy40ODcwMDE0MDIwMzI1LC0wLjQwNjI5MTAxMTkwMDkyMDY1LDAuMDgyMjYwODAxMjc2MDExMjEsMC44MTQzODY3Nzg1NTY5MzUxLDEuODExMzIyNTk3NTAxODYyLC0wLjczODgyOTM5ODU5MjE4NywtMS4zODYxMzMwNTI0MDY3OTQsMS4xNzcyNzY3NjUxMTk3MzQ3LC0xLjkzOTAzNDU4Mjg2MTM1MDIsMS41NTkyNTIzNDAyMjUyMjcsLTAuMzgxNjI4NTIxOTg0NTY3MywtMC44NjczMDQzNTQxNjM3NzgyLC0yLjc3NDA3NjQ2OTMzMDk1NjMsLTAuMTU2NDQwNTg0MjE5Mzk2");
        const nn_weights = cb_text.match(/-?\d+(?:\.\d+)?/g).map(Number);
        
        gen_algo = new GenAlgo();
        gen_algo.GenerateNewPopulation(m_car_amt, 8, m_hidden_layers, m_hidden_neurons, 4);

        gen_algo.population[0].weights = nn_weights;
        gen_algo.population[1] = gen_algo.Mutate(gen_algo.population[0]);
        gen_algo.population[2] = gen_algo.Mutate(gen_algo.population[0]);
        gen_algo.population[3] = gen_algo.Mutate(gen_algo.population[0]);

        for (nn in NNets) {
            NNets[nn].fromGenome(gen_algo.GetNextGenome(), 8, m_hidden_layers, m_hidden_neurons, 4);

            scores[nn] = {racing: true, chkpts : 0, times : [m_sim_steps], score : 0};
            cars[nn].body.position = [track_data.start[0], track_data.start[1]];
            cars[nn].body.angle = track_data.start[2];
            cars[nn].body.setZeroForce();
            cars[nn].body.velocity = [0,0];
            cars[nn].body.angularVelocity = 0;
        }

        gen_algo.generation = 200;

        record_score = 0;

        return false;
    });
})();
