import { sendNotification } from "./sendNotification";
import { list } from "./topic/list";
import { subscribe } from "./topic/subscribe";
import { unsubscribe } from "./topic/unsubscribe";

const Arbiti = {
	sendNotification,
	topic: {
		subscribe,
		unsubscribe,
		list,
	},
};

export default Arbiti;
export { Arbiti };
