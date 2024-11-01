import { sendNotification } from "./sendNotification";
import { subscribe } from "./topic/subscribe";
import { unsubscribe } from "./topic/unsubscribe";

const Arbiti = {
	sendNotification,
	topic: {
		subscribe,
		unsubscribe,
	},
};

export default Arbiti;
export { Arbiti };
