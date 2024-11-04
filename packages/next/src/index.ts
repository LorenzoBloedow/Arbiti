import Provider from "./Provider";
import { sendNotification } from "./sendNotification";
import { useNotification } from "./useNotification";
import { withArbitiConfig } from "./withArbitiConfig";

const Arbiti = {
	Provider,
	useNotification,
	withArbitiConfig,
	sendNotification,
};

export default Arbiti;
export { Arbiti };
