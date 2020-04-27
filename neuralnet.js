class Genome {
    constructor() {
        this.fitness = null;
        this.id = null;
        this.weights = [];
    }
}


class NNet {
    constructor() {
        this.input_cnt = null;
        this.output_cnt = null;
        this.inputs = [];
        this.input_layer = null;
        this.hidden_layers = [];
        this.output_layer = null;
        this.outputs = [];
    }

    predict(input) {
        this.inputs = input;
        this.outputs = [];

        for(const l in this.hidden_layers) {
            if(l > 0)
                this.inputs = this.outputs;

            this.outputs = this.hidden_layers[l].predict(this.inputs);
        }

        this.inputs = this.outputs;

        this.outputs = this.output_layer.predict(this.inputs);

        return this.outputs;
    }
    printnet(input) {
        this.inputs = input;
        this.outputs = [];
        var output = [input];

        for(const l in this.hidden_layers) {
            if(l > 0)
                this.inputs = this.outputs;

            this.outputs = this.hidden_layers[l].predict(this.inputs);
            output.push(this.outputs);
        }

        this.inputs = this.outputs;
        this.outputs = this.output_layer.predict(this.inputs);
        output.push(this.outputs);

        return output;
    }
    getOutput(id) {
        if (id >= this.output_cnt)
            return 0;

        return this.outputs[id];
    }
    getOutputcnt() {
        return this.output_cnt;
    }

    createNet(inputs, hidden_layers, hidden_neurons, outputs) {
        this.input_cnt = inputs;
        this.output_cnt = outputs;

        var layer = new NLayer();
        layer.populate(inputs, hidden_neurons);
        this.hidden_layers.push(layer);

        for (var hl = 1; hl < hidden_layers; ++hl) {
            layer = new NLayer();
            layer.populate(hidden_neurons, hidden_neurons);
            this.hidden_layers.push(layer);
        }

        this.output_layer = new NLayer();
        this.output_layer.populate(hidden_neurons, outputs);
    }

    saveNet() {
        var output = {};

        output.input_cnt = this.input_cnt;
        output.output_cnt = this.output_cnt;
        output.hidden_layers = this.hidden_layers;
        output.output_layer = this.output_layer;

        return output;
    }

    LoadNet(nn_string) {
        JSON.parse(nn_string);

        this.input_cnt = nn_string.input_cnt;
        this.output_cnt = nn_string.output_cnt;
        this.input_layer = nn_string.input_layer;
        this.hidden_layers = nn_string.hidden_layers;
        this.output_layer = nn_string.output_layer;
    }

    releaseNet() {
        this.input_cnt = null;
        this.output_cnt = null;
        this.inputs = [];
        this.input_layer = null;
        this.hidden_layers = [];
        this.output_layer = null;
        this.outputs = [];
    }

    toGenome() {
        var genome = new Genome();
        for (hl in this.hidden_layers) {
            var weights = this.hidden_layers[hl].getWeights();
            for (w in weights)
                genome.weights.push(weights[w]);
        }

        var weights = this.output_layer.getWeights();
        for(w in weights)
            genome.weights.push(weights[w]);

        return genome;
    }
    fromGenome(genome, inputs, hidden_layers, hidden_neurons, outputs) {
        this.releaseNet();

        this.input_cnt = inputs;
        this.output_cnt = outputs;
        var neurons = [];

        var hidden = new NLayer();
        for(var n = 0; n < hidden_neurons; ++n) {
            var weights = [];

            for (var i = 0; i < inputs; ++i) {
                weights.push(genome.weights[n * hidden_neurons + i]);
            }
            
            neurons.push(new NCell());
            neurons[n].init(inputs, weights);
        }

        var split = (inputs*hidden_neurons),
            split_last = split;
        hidden.LoadLayer(neurons);
        this.hidden_layers.push(hidden);
        for (var hl = 1; hl < hidden_layers; ++hl) {
            hidden = new NLayer();
            neurons = [];
            for(var n = 0; n < hidden_neurons; ++n) {
                var weights = [];

                for (var i = 0; i < hidden_neurons; ++i) {
                    weights.push(genome.weights[split_last + (hl-1) * hidden_layers * hidden_neurons + n * hidden_neurons + i]);
                }
                
                neurons.push(new NCell());
                neurons[n].init(hidden_neurons, weights);
            }
            hidden.LoadLayer(neurons);
            this.hidden_layers.push(hidden);

            split += hidden_neurons**2;
        }

        var output_weights = hidden_neurons * outputs;
        neurons = [];
        for (var o = 0; o < outputs; ++o) {
            var weights = [];
            for (var n = 0; n < hidden_neurons; ++n) {
                weights.push(genome.weights[split + o * hidden_neurons + n]);
            }
            
            neurons.push(new NCell());
            neurons[o].init(hidden_neurons, weights);
        }
        this.output_layer = new NLayer();
        this.output_layer.LoadLayer(neurons);
    }
}



const BIAS = -1;

class NLayer {
    constructor() {
        this.neuron_cnt = null;
        this.input_cnt = null;
        this.neurons = [];
    }

    populate(input_cnt, neuron_cnt) {
        this.input_cnt = input_cnt;
        this.neuron_cnt = neuron_cnt;
        this.neurons = [];

        for (var n = 0; n < neuron_cnt; ++n) {
            this.neurons.push(new NCell());
            this.neurons[this.neurons.length-1].populate(input_cnt);
        }
    }

    sigmoid(a, p) {
        return (1 / (1 + Math.exp((-a)/p)));
    }

    bipolarsigmoid(a, p) {
        return (2 / (1 + Math.exp((-a)/p)) - 1);
    }

    predict(input) {
        var output = [];

        var idx = 0;
        for (const n in this.neurons) {
            var activation = 0;
            
            for (var i = 0; i < this.neurons[n].input_cnt-2; ++i) {
                activation += input[idx] * this.neurons[n].weights[i];
                ++idx;
            }

            activation += this.neurons[n].weights[this.neurons[n].input_cnt-1] * BIAS;
            output.push(this.sigmoid(activation, 1));
            idx = 0;
        }
        return output;
    }

    setWeights(weights, neuron_cnt, input_cnt) {
        var idx = 0;
        this.input_cnt = input_cnt;
        this.neuron_cnt = neuron_cnt;
        this.neurons = [];
        
        for (var n = 0; n < neuron_cnt; ++n) {
            this.neurons[n].weights = [];
            for (var i = 0; i < this.input_cnt; ++i) {
                this.neurons[n].weights[i] = weights[idx];
                ++idx;
            }
        }
    }

    getWeights() {
        var weights = [];
        for (const n in this.neurons)
            for (const w in this.neurons[n].weights)
                weights.push(neurons[n].weights[w]);

        return weights;
    }

    setNeurons(input_cnt, neuron_cnt, neurons) {
        this.input_cnt = input_cnt;
        this.neuron_cnt = neuron_cnt;
        this.neurons = neurons;
    }

    LoadLayer(input) {
        this.neuron_cnt = input.length;
        this.neurons = input;
    }
}



class NCell {
    constructor() {
        this.input_cnt = null;
        this.weights = [];
    }

    init(input_cnt, weights) {
        this.input_cnt = input_cnt;
        this.weights = weights;
    }

    populate(input_cnt) {
        this.input_cnt = input_cnt;

        for (var i = 0; i < input_cnt; ++i)
            this.weights.push(Math.random()-Math.random());

        this.weights.push(Math.random()-Math.random());
    }
}
