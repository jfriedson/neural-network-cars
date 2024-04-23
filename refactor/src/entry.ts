import { SmartCarApp } from "./smartcarapp";


(async () => {
	const app = new SmartCarApp();
	await app.init();
	app.run();
})();
