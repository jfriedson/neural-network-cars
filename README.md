# Car AI - Neural Network Trained by a Genetic Algorithm
This demo is meant to demonstrate the process of breeding a neural network driven car through the use of a genetical algorithn with the goal of having the car navigate a race track quickly using 7 forward-facing depth sensors as input for the neural network.  The neural network operates the car's steering angle which has a maximum of 45 degrees (to the left and the right from center), gas throttle, standard break force, and e-break force.  The size of the neural network's "hidden" layers is configurable, and I have found that a configuration of 2 hidden layers each containing 10 cells is able to be trained to complete the demo fairly quickly even if the first few generations see little success.

## How to use
### Track preparation
Python (2.7 and 3.8 both work) and the shapely package are required for this process.
1. Open mapmaker.html in a text editor and replace the image containing silverstone.png with an image of a track that you would like to create.
2. Open mapmaker.html in a browser and click and drag along the track.  This will create the inside wall of the track.  Press "d" to undo and "s" to print the track data to the browser's console log.
3. Open mapmakerp2.py in a text editor and replace the value of the variable "line" at the top of the file with the value from the browser's console.
4. Run mapmakerp2.py in python.
5. Copy both arrays to a track variable at the top of the smartcar.js file.
Checkpoints have to be created through trial and error, but mapmakerp2.py may be updated to do this programmatically in the future.

### Run the demo
Open index.html
Click on the canvas to toggle between normal and hyper speed

Something to note is that some browsers (only firefox afaik) rounds intervals to a multiple of 25 milliseconds.  Chrome and the new MS Edge do not exhibit this behavior.


## Features
Scoreboard
Toggleable p2.js world step rate to speed up training (by a lot)
Save and load leading champion's neural network weights using ctrl+c and ctrl+v with the canvas in focus

## Javascript libraries
P2.js - Physics engine
Pixi.js - WebGL (canvas fallback) renderer

## Ideas to implement later
Add evaluation mode that should only display a single car with the neural network weights to allow for easier assessment.

## To do
Fix intervals/fps counter