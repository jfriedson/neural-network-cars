import { PhysicalWorld } from "../../physics/physical_world";
import { Renderer } from "../../rendering/renderer";

import { Car } from "../car";
import { Rays } from "./rays/rays";


export class CarDriver {
    private readonly car: Car; 
	private readonly rays: Rays;
    
    constructor(renderer: Renderer, car: Car) {
        this.car = car;
        this.rays = new Rays(renderer, car);
    }

    step(physicalWorld: PhysicalWorld) {
        this.rays.step(physicalWorld);

        this.car.engine_force_mag = 10;
    }
}
