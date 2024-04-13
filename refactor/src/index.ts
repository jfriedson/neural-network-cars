import { SmartCarApp } from "./smartcarapp";
import { PhysicalWorld } from "./systems/physics";


(async () => {
    await PhysicalWorld.init();

    const app = new SmartCarApp();
    await app.init();
    app.run();
})();
