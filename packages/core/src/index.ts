import { retry } from "./retry";
import { noop } from "./noop";
import { subscribe } from "./topic/subscribe";
import { registerBrowser } from "./registerBrowser";
import { env } from "./env";
import { sendNotification } from "./sendNotification";
import { unsubscribe } from "./topic/unsubscribe";
import { setUser } from "./setUser";
import { list } from "./topic/list";
const Arbiti = {
	env,
	retry,
	noop,
	subscribe,
	registerBrowser,
	sendNotification,
	topic: {
		subscribe,
		unsubscribe,
		list,
	},
	setUser,
};

export default Arbiti;
export { Arbiti };
