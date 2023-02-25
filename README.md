# Smart Car AI - Neural Networks Trained by a Genetic Algorithm
This demo is meant to demonstrate the process of breeding a neural network-driven car through the use of genetical algorithms with the goal of having the cars navigate a race track as quickly as possible.


## Architecture
### Neural Network
The neural networks driving each car have the following attributes
- 12 inputs: 7 forward and side-facing distance sensors and the car's speed, steerings angle, gas throttle, and standard and emergency brakes
- 1 hidden layer of 10 neurons, found to be a good balance of training time and function complexity for this simple problem
- 4 outputs: steerings angle, gas throttle, and standard and emergency brakes

Each input is normalized to enhance the genetic algorithm's performance.\
The network applies leakyRELU activation on the input and hidden layers and sigmoid activation on the output.\
The network outputs are then denormalized and applied to the physical body of the car.


### Genetic Algorithms
There are 3 different genetic algorithms which rotate in turn with the genome generation. They differ in how they introduce new genetics to the genome pool through the use of mutation and cross-breeding the networks. Two algorithms splice new, random neurons into the best performing networks, while the third cross-breeds and mutates only the champion networks.


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


## Features
Scoreboard
Toggleable p2.js world step rate to speed up training (by a lot)
Save and load leading champion's neural network weights using ctrl+c and ctrl+v with the canvas in focus


## Javascript libraries
P2.js - Physics engine\
Pixi.js - WebGL (canvas fallback) renderer\
Lodash - deep cloning ability for genetic algorithm functionality


## To do
Finish implementing neural network graph render\
Find fix for intervals/fps counter in firefox

---

The silverstone track image used to create the demo model is from https://commons.wikimedia.org/wiki/File:Evolution_of_Silverstone_Grand_Prix_Circuit_1949_to_present.png