import { init } from "./init";
import { setUser } from "./setUser";
import { subscribe } from "./topic/subscribe";
import { unsubscribe } from "./topic/unsubscribe";
import { getBrowserUuid } from "./getBrowserUuid";
import { registerBrowser } from "./registerBrowser";

const Arbiti = {
	init,
	topic: {
		subscribe,
		unsubscribe,
	},
	setUser,
	getBrowserUuid,
	registerBrowser,
};

export default Arbiti;
export { Arbiti };
