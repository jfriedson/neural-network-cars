# Neural Network-Driven Cars Trained by a Genetic Algorithm
This project demonstrates the process of using genetic algorithms to breed and mutate neural networks with the goal of navigating cars through a race track as quickly as possible.

You can see the live demo at my website: https://JoshFriedson.com/projects/smart_car

![Demo screenshot](demo.png?raw=true)


## Architecture
### Neural Network
The neural networks driving each car have the following attributes
- 13 inputs
    - 7 forward and side-facing distance sensors
    - the car's speed
    - car's angular velocity
    - steerings angle
    - gas throttle
    - standard brakes
    - emergency brakes
- 1 hidden layer of 10 neurons - found to be a good balance of training time and function complexity for this simple problem
- 4 outputs
    - steerings angle
    - gas throttle
    - standard brakes
    - emergency brakes

Each input is normalized to enhance the genetic algorithm's performance.\
The network applies leakyRELU activation on the hidden layer and sigmoid activation on the output.\
The network outputs are then denormalized and applied to the physical body of the car.


### Genetic Algorithms
There are 3 different genetic algorithms which rotate in turn with the genome generation. They differ in how they introduce new genetics to the genome pool through the use of mutation and cross-breeding. Two algorithms splice new, random neurons into the best performing networks, while the third cross-breeds and mutates only the champion networks.

Champions are determined by performance score which is a sum of rewards and deduction of penalties as follows:
- Rewards
    - yellow checkpoints - 100 points
    - 10 points minus time in seconds between 2 checkpoints
    - .9 * distance from previous checkpoint in a crash
    - .8 * distance from previous checkpoint in a timeout
- Penalties
    - distance to next checkpoint in a crash or timeout

The reason for rewarding more points in the event of a crash vs a timeout is that timeouts encourage use of the brakes which results in slower training times. Penalizing crashes also promotes the same behavior of brake use.\
The reason for penalizing more than rewarding in a crash or timeout is to coax the cars to crash closer to the following checkpoint until they ultimately reach it.


## How to create your own race track
### Track preparation
Python (2.7 and 3.8 both work) and the shapely package are required for this process.
1. Open mapmaker.html in a text editor and replace the image containing silverstone.png with an image of a track that you would like to create.
2. Open mapmaker.html in a browser and click and drag along the track.  This will create the inside wall of the track.  Press "d" to undo and "s" to print the track data to the browser's console log.
3. Open mapmakerp2.py in a text editor and replace the value of the variable "line" at the top of the file with the value from the browser's console.
4. Run mapmakerp2.py in python.
5. Copy both arrays to a track variable at the top of the smartcar.js file.

Checkpoints have to be created through trial and error, but mapmakerp2.py may be updated to do this programmatically in the future.


## Running the demo
Open index.html\
Click on the canvas to toggle between normal and hyper speed


## More Features
- Toggleable world step rate to speed up training immensely
- Save and load leading champion's neural network weights using ctrl+c and ctrl+v with the canvas in focus
- Load a pre-trained network with an html button
- Scoreboard
- Graph of weight and neuron activations of best performing neural network


## Javascript libraries
P2.js - Physics engine\
Pixi.js - WebGL (canvas fallback) renderer\
Lodash - deep cloning ability for genetic algorithm functionality


## To do
Use webworkers for computationally intensive loops acting on cars\
Find fix for interval timers in firefox

---

The silverstone track image used to create the demo model is from https://commons.wikimedia.org/wiki/File:Evolution_of_Silverstone_Grand_Prix_Circuit_1949_to_present.png