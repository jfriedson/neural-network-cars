class GenAlgo {
    constructor() {
        this.current_genome = -1;
        this.population_cnt = 0;
        this.genomeid = 0;
        this.generation = 1;
        this.genome_weights_cnt = null;
        this.population = [];
        this.crossover_splits = [];
    }

    GetBestCases(genomes) {
        var genome_cnt = 0,
            run_cnt = 0,
            output = [];

        while (genome_cnt < genomes) {
            if (run_cnt > genomes)
                break;

            ++run_cnt;

            var best_fit = 0,
                best_idx = -1;

            for (var i = 0; i < this.population_cnt; ++i) {
                if (this.population[i].fitness > best_fit) {
                    var used = false;

                    for(var j = 0; j < output.length; ++j)
                        if (this.population[i].id == output[j].id)
                            used = true;

                    if (!used) {
                        best_idx = i;
                        best_fit = this.population[best_idx].fitness;
                    }
                }
            }

            if (best_idx != -1) {
                ++genome_cnt;
                output.push(this.population[best_idx]);
            }
            else {
                break;
            }
        }

        return output;
    }
    CrossBreed(g1, g2) {
        var weight_cnt = g1.weights.length,
            crossover = Math.floor(Math.random() * (weight_cnt-2))+1;

        var b1 = new Genome();
        b1.id = this.genomeid;
        b1.weights = [];
        ++this.genomeid;

        var b2 = new Genome();
        b2.id = this.genomeid;
        b2.weights = [];
        ++this.genomeid;

        for (var i = 0; i < crossover; ++i) {
            b1.weights.push(g1.weights[i]);
            b2.weights.push(g2.weights[i]);
        }

        for (var i = crossover; i < weight_cnt; ++i) {
            b1.weights.push(g2.weights[i]);
            b2.weights.push(g1.weights[i]);
        }

        return [b1, b2];
    }
    Mutate(genome) {
        for (const w in genome.weights)
            if (Math.random() - Math.random() < m_mutation_rate)
                genome.weights[w] += (Math.random() - Math.random()) * m_max_perbetuation;

        return genome;
    }
    CreateNewGenome(weight_cnt) {
        var genome = new Genome();
        genome.id = this.genomeid;
        genome.fitness = 0;
        genome.weights = [];

        for(var w = 0; w < weight_cnt; ++w)
            genome.weights[w] = Math.random() - Math.random();

        ++this.genomeid;

        return genome;
    }

    GetNextGenome() {
        ++this.current_genome;
        if (this.current_genome >= this.population.length)
            return null;

        return this.population[this.current_genome];
    }
    GetBestGenome() {
        var best_genome = -1;
        var fitness = 0;
        for (g in this.population) {
            if (this.population[g].fitness > fitness) {
                fitness = this.population[g].fitness;
                best_genome = g;
            }
        }

        return this.population[best_genome];
    }
    GetWorstGenome() {
        var worst_genome = -1;
        var fitness = 1000000;
        for (g in this.population) {
            if (this.population[g].fitness < fitness) {
                fitness = this.population[g].fitness;
                worst_genome = g;
            }
        }

        return this.population[worst_genome];
    }
    GetGenome(idx) {
        if (idx >= this.population_cnt)
            return null;

        return this.population[idx];
    }

    GetCurrentGenomeIndex() {
        return this.current_genome;
    }
    GetCurrentGenomeID() {
        return this.population[this.current_genome].id;
    }
    GetCurrentGeneration() {
        return this.generation;
    }
    GetTotalPopulation() {
        return this.population_cnt;
    }

    GenerateNewPopulation(pop_cnt, inputs, hidden_layers, hidden_neurons, outputs){
        var gen = 1;
        this.population = [];
        this.current_genome = -1;
        this.population_cnt = pop_cnt;
        this.population = [];
        var weight_cnt = inputs * hidden_neurons + hidden_layers * hidden_neurons**2 + hidden_neurons * outputs - 100;

        for(var i = 0; i < this.population_cnt; ++i) {
            var genome = new Genome();
            genome.id = this.genomeid;
            genome.fitness = 0;
            genome.weights = [];
            for (var j = 0; j < weight_cnt; ++j)
                genome.weights[j] = Math.random() - Math.random();
            ++this.genomeid;
            this.population[i] = genome;
        }
    }
    BreedPopulation() {
        var children = [];

        // Keep best
        var best_genomes = this.GetBestCases(m_champions);
        if(best_genomes.length > 0) {
            var best = best_genomes[0];
            children.push(best);

            var b = null;
            for(var i = 0; i < best_genomes.length; ++i) {
                for(var j = 0; j < best_genomes.length; ++j) {
                    if(i == j) {
                        b = this.Mutate(best_genomes[i]);
                        children.push(b);
                    }
                    else {
                        b = this.CrossBreed(best_genomes[i], best_genomes[j]);

                        b[0] = this.Mutate(b[0]);
                        b[1] = this.Mutate(b[1]);
                        children.push(b[0]);
                        children.push(b[1]);
                    }
                }
            }
        }
        var remaining = this.population_cnt - children.length;

        if(best_genomes.length == 0 || this.generation < 10) {
            for (var i = 0; i < remaining; ++i) {
                children.push(this.CreateNewGenome(this.population[0].weights.length));
            }
        }
        else if(this.generation < 20) {
            while(remaining > 0) {
                for (var i = 0; i < best_genomes.length; ++i) {
                    b = this.CrossBreed(best_genomes[i], this.CreateNewGenome(this.population[0].weights.length));

                    b[0] = this.Mutate(b[0]);
                    b[1] = this.Mutate(b[1]);
                    children.push(b[0]);
                    children.push(b[1]);
                    remaining -= 2;
                }
            }
        }
        else {
            while(remaining > 0) {
                for (var i = 0; i < best_genomes.length; ++i) {
                    if(remaining > 0) {
                        b = this.Mutate(best_genomes[i]);
                        children.push(b);
                        --remaining;
                    }
                }
            }
        }

        this.population = children;

        this.current_genome = -1;
        ++this.generation;
    }

    //GenerateCrossoverSplits(int neuronsPerHidden, int inputs, int outputs);

    SetGenomeFitness(idx, fitness) {
        if (idx >= this.population.length)
            return;

        this.population[idx].fitness = fitness;
    }
}
