class Genome {
	constructor() {
		this.fitness = 0;
		this.net = null;
	}
}

class GenAlgo {
	constructor(pop_cnt, champions, inputs, hidden_layers, hidden_neurons, outputs) {
		this.population_cnt = pop_cnt;
		this.champions = champions;
		this.generation = 1;
		this.population = null;

		this.inputs = inputs;
		this.hidden_layers = hidden_layers;
		this.hidden_neurons = hidden_neurons;
		this.outputs = outputs;

		this.mutation_chance = 0.25;
		this.learning_rate = 0.15;

		this.infer_step = 0;
	}

	GenerateNewPopulation() {
		this.population = [];

		for (var i = 0; i < this.population_cnt; ++i) {
			var genome = new Genome();
			genome.fitness = 0;
			genome.net = new NNet(true, this.inputs, this.hidden_layers, this.outputs, this.hidden_neurons);

			this.population.push(genome);
		}
	}

	updateParams(recordKeeping) {
		this.mutation_chance -= .001 - (recordKeeping.score_time + recordKeeping.chkpts_time)/20000;
		this.mutation_chance = Math.min(Math.max(.05, this.mutation_chance), .3);

		this.learning_rate -= .001 - (recordKeeping.score_time + recordKeeping.chkpts_time)/20000;
		this.learning_rate = Math.min(Math.max(.05, this.learning_rate), .25);
	}

	infer(idx, input) {
		if (idx >= this.population_cnt)
			return null;

		return this.population[idx].net.forward(input);
	}


	GetBestGenomes(champion_cnt) {
		var champions = [];

		for (var genome = 0; genome < this.population_cnt; genome++) {
			if (this.population[genome].fitness > 0) {
				if (champions.length < champion_cnt) {
					champions.push(genome);
				}
				else {
					for (var champ = 0; champ < champions.length; champ++) {
						if (this.population[genome].fitness > this.population[champions[champ]].fitness) {
							champions.splice(champ, 0, genome);
							champions.pop();

							break;
						}
					}
				}
			}
		}

		return champions;
	}

	// randomly mix weights and biases of two networks
	CrossBreed(g1, g2) {
		var offspring1 = _.cloneDeep(g1);
		offspring1.fitness = 0;
		var offspring2 = _.cloneDeep(g2);
		offspring2.fitness = 0;

		for (var hl = 0; hl < g1.net.hidden_layers.length; hl++) {
			for (var n = 0; n < g1.net.hidden_layers[hl].neurons.length; n++) {
				for (var w = 0; w < g1.net.hidden_layers[hl].neurons[n].weights.length; w++) {
					if (Math.random() < this.mutation_chance) {
						offspring1.net.hidden_layers[hl].neurons[n].weights[w] = g2.net.hidden_layers[hl].neurons[n].weights[w];
						offspring2.net.hidden_layers[hl].neurons[n].weights[w] = g1.net.hidden_layers[hl].neurons[n].weights[w];
					}
				}

				if (Math.random() < this.mutation_chance) {
					offspring1.net.hidden_layers[hl].neurons[n].bias = g2.net.hidden_layers[hl].neurons[n].bias;
					offspring2.net.hidden_layers[hl].neurons[n].bias = g1.net.hidden_layers[hl].neurons[n].bias;
				}
			}
		}

		for (var n = 0; n < g1.net.output_layer.neurons.length; n++) {
			for (var w = 0; w < g1.net.output_layer.neurons[n].weights.length; w++) {
				if (Math.random() < this.mutation_chance) {
					offspring1.net.output_layer.neurons[n].weights[w] = g2.net.output_layer.neurons[n].weights[w];
					offspring2.net.output_layer.neurons[n].weights[w] = g1.net.output_layer.neurons[n].weights[w];
				}
			}

			if (Math.random() < this.mutation_chance) {
				offspring1.net.output_layer.neurons[n].bias = g2.net.output_layer.neurons[n].bias;
				offspring2.net.output_layer.neurons[n].bias = g1.net.output_layer.neurons[n].bias;
			}
		}

		return [offspring1, offspring2];
	}


	// slightly adjust the weights and biases of a network
	Mutate(genome) {
		var mutated = _.cloneDeep(genome); // lodash deep clone
		mutated.fitness = 0;

		for (var hl = 0; hl < mutated.net.hidden_layers.length; hl++) {
			for (var n = 0; n < mutated.net.hidden_layers[hl].neurons.length; n++) {
				for (var w = 0; w < mutated.net.hidden_layers[hl].neurons[n].weights.length; w++) {
					if (Math.random() < this.mutation_chance)
						mutated.net.hidden_layers[hl].neurons[n].weights[w] += (2 * Math.random() - .9) * this.learning_rate;
				}

				if (Math.random() < this.mutation_chance)
					mutated.net.hidden_layers[hl].neurons[n].bias += (2 * Math.random() - .95) * this.learning_rate;
			}
		}

		for (var n = 0; n < mutated.net.output_layer.neurons.length; n++) {
			for (var w = 0; w < mutated.net.output_layer.neurons[n].weights.length; w++) {
				if (Math.random() < this.mutation_chance)
					mutated.net.output_layer.neurons[n].weights[w] += (2 * Math.random() - .9) * this.learning_rate;
			}

			if (Math.random() < this.mutation_chance)
				mutated.net.output_layer.neurons[n].bias += (2 * Math.random() - 1) * this.learning_rate;
		}

		return mutated;
	}

	CreateNewGenome() {
		var genome = new Genome();
		genome.fitness = 0;
		genome.net = new NNet(true, this.inputs, this.hidden_layers, this.outputs, this.hidden_neurons);

		return genome;
	}

	GetCurrentGeneration() {
		return this.generation;
	}
	GetTotalPopulation() {
		return this.population_cnt;
	}

	BreedPopulation() {
		var new_population = [];

		var best_genomes = this.GetBestGenomes(this.champions);

		// if there are no champions, create a new population
		if (best_genomes.length == 0) {
			this.GenerateNewPopulation();
			++this.generation;
			return;
		}

		// otherwise, retain champions
		for (const g in best_genomes)
			new_population.push(this.population[best_genomes[g]]);

		// crossbreed and mutate champions
		for (var i = 0; i < best_genomes.length; ++i) {
			for (var j = 0; j < best_genomes.length; ++j) {
				if (i == j) {
					var mutated = this.Mutate(this.population[best_genomes[i]]);
					new_population.push(mutated);
				}
				else {
					var offspring = this.CrossBreed(this.population[best_genomes[i]], this.population[best_genomes[j]]);

					offspring[0] = this.Mutate(offspring[0]);
					offspring[1] = this.Mutate(offspring[1]);

					new_population.push(offspring[0]);
					new_population.push(offspring[1]);
				}
			}
		}

		// fill the remaining population with a genetic algo
		var remaining = this.population_cnt - new_population.length;

		// crossbreed champions with a new genome and mutate offspring
		if (this.generation % 4 == 0) {
			while (remaining > 0)
				for (var i = 0; i < best_genomes.length; ++i)
					if (remaining > 0) {
						var new_genome = this.CreateNewGenome();

						var offspring = this.CrossBreed(this.population[best_genomes[i]], new_genome);

						offspring[0] = this.Mutate(offspring[0]);
						offspring[1] = this.Mutate(offspring[1]);

						new_population.push(offspring[0]);
						if (remaining > 1)
							new_population.push(offspring[1]);

						remaining -= 2;
					}
		}
		// crossbreed champions with a new genome
		else if (this.generation % 4 == 1) {
			while (remaining > 0)
				for (var i = 0; i < best_genomes.length; ++i)
					if (remaining > 0) {
						var new_genome = this.CreateNewGenome();

						offspring = this.CrossBreed(this.population[best_genomes[i]], new_genome);

						new_population.push(offspring[0]);
						if (remaining > 1)
							new_population.push(offspring[1]);

						remaining -= 2;
					}
		}
		// crossbreed champions and mutate offspring
		else {
			while (remaining > 0)
				for (var i = 0; i < best_genomes.length; ++i)
					for (var j = 0; j < best_genomes.length; ++j)
						if (remaining > 0) {
							offspring = this.CrossBreed(this.population[best_genomes[i]], this.population[best_genomes[j]]);

							offspring[0] = this.Mutate(offspring[0]);
							offspring[1] = this.Mutate(offspring[1]);

							new_population.push(offspring[0]);
							if (remaining > 1)
								new_population.push(offspring[1]);

							remaining -= 2;
						}
		}

		this.population = new_population;

		++this.generation;
	}

	SetGenomeFitness(idx, fitness) {
		if (idx >= this.population.length)
			return;

		this.population[idx].fitness = fitness;
	}
}
