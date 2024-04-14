import { SmartCarApp } from "./smartcarapp";
import { PhysicalWorld } from "./physics/physical_world";


(async () => {
	await PhysicalWorld.init();

	const app = new SmartCarApp();
	await app.init();
	app.run();
})();
