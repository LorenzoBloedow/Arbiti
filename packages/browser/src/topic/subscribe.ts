import { Arbiti } from "@arbiti/core";
import { getCache } from "../getCache";
import { log } from "../log";

// TODO: Add support for subscribing by userId
// export function subscribe(userId: string): Promise<Response>;
/**
 * @param topics The topic to subscribe to. This can be any string or an array of strings for multiple topics
 */
export function subscribe(
	topics: Parameters<typeof Arbiti.topic.subscribe>[0]["topics"]
) {
	const browserUuid = getCache()?.browserUuid;

	if (!browserUuid) {
		throw log(
			"Browser UUID not found in cache. Did you forget to register the browser?"
		);
	}

	return Arbiti.topic.subscribe({
		topics,
		appUuid: window.Arbiti.appUuid,
		browserUuid,
	});
}
