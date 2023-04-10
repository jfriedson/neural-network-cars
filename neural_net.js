class NNet {
    constructor(init, inputs, hidden_layers, output_layer, hidden_neurons) {
        this.inputs = inputs;
        this.hidden_layers = [];
        this.output_layer = null;

        // if init is true, create network with random weights and biases
        if(init) {
            this.hidden_layers.push(new NNLayer(true, inputs, hidden_neurons, Activations.leakyrelu));
            for (var hl = 1; hl < hidden_layers; hl++)
                this.hidden_layers.push(new NNLayer(true, hidden_neurons, hidden_neurons, Activations.leakyrelu));

            this.output_layer = new NNLayer(true, hidden_neurons, output_layer, Activations.sigmoid);
        }
        else {
            this.hidden_layers.push(new NNLayer(false, inputs, hidden_layers[0].neurons, Activations.leakyrelu));
            for (var hl = 1; hl < hidden_layers; hl++)
                this.hidden_layers.push(new NNLayer(false, net_obj.hidden_layers[0].neurons.length, net_obj.hidden_layers[hl].neurons, Activations.leakyrelu));

            this.output_layer = new NNLayer(false, net_obj.hidden_layers[0].neurons.length, output_layer.neurons, Activations.sigmoid);
        }
    }

    forward(input) {
        if(input.length != this.inputs) {
            console.log(input.length + "   " + this.inputs)
            console.log("input array length doesn't match the number of inputs expected by the network")
            return [.5,1,0,0];
        }

        var outputs = [];

        for (const hl in this.hidden_layers) {
            outputs = this.hidden_layers[hl].forward(input);

            input = outputs;
        }

        outputs = this.output_layer.forward(input);

        return outputs;
    }

    save() {
        var net_obj = {};

        net_obj.inputs = this.inputs;
        net_obj.hidden_layers = this.hidden_layers;
        net_obj.output_layer = this.output_layer;

        return JSON.stringify(net_obj);
    }

    load(net_obj) {
        this.inputs = net_obj.inputs;
        this.hidden_layers = [];

        this.hidden_layers.push(new NNLayer(false, this.inputs, net_obj.hidden_layers[0].neurons, Activations.leakyrelu));
        for (var hl = 1; hl < net_obj.hidden_layers.length; hl++)
            this.hidden_layers.push(new NNLayer(false, net_obj.hidden_layers[0].neurons.length, net_obj.hidden_layers[hl].neurons, Activations.leakyrelu));

        this.output_layer = new NNLayer(false, net_obj.hidden_layers[0].neurons.length, net_obj.output_layer.neurons, Activations.sigmoid);
    }
}


class Activations {
    static linear(z) {
        return z;
    }

    static relu(z) {
        return Math.max(0, z);
    }

    static leakyrelu(z) {
        return Math.max(z * .1, z);
    }

    static sigmoid(z) {
        return 1 / (1 + Math.exp(-z));
    }
}

class NNLayer {
    constructor(init, inputs, neurons, activation = Activations.linear) {
        this.inputs = inputs;
        this.neurons = [];
        this.activation = activation;

        if(init) {
            for (var n = 0; n < neurons; n++)
                this.neurons.push(new Neuron(true, inputs));
        }
        else {
            for (const n in neurons)
                this.neurons.push(new Neuron(false, neurons[n].weights, neurons[n].bias));
        }
    }

    forward(input) {
        if(input.length != this.inputs) {
            console.log("input array length doesn't match the number of inputs expected by the layer" + id)
            return input;
        }

        var output = [];

        for (const n in this.neurons) {
            const z = this.neurons[n].forward(input);

            output.push(this.activation(z));
        }

        return output;
    }
}


class Neuron {
    constructor(init, weights, bias) {
        this.weights = [];
        this.bias = 0;

        if (init) {
            for (var w = 0; w < weights; w++)
                this.weights.push(2 * Math.random() - 1);
        }
        else {
            this.weights = weights;
            this.bias = bias;
        }
    }

    forward(input) {
        if(input.length != this.weights.length) {
            console.log(input.length + " != " + this.weights.length)
            console.log("input array length doesn't match the number of weights expected by the neuron");
            return null;
        }

        var z = 0;
        for (const i in input)
            z += this.weights[i] * input[i];

        return z + this.bias;
    }
}
