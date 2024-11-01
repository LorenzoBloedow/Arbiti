import Arbiti from "@arbiti/core";
import { log } from "../log";
import { getCache } from "../getCache";

type UnsubscribeParams = Parameters<typeof Arbiti.topic.unsubscribe>[0];

// TODO: Add support for unsubscribing by userId
// export function unsubscribe(userId: string): Promise<Response>;
/**
 * @param topics The topic to unsubscribe from. This can be any string or an array of strings for multiple topics
 */
export function unsubscribe(topics: UnsubscribeParams["topics"]) {
	const browserUuid = getCache()?.browserUuid;

	if (!browserUuid) {
		throw log(
			"Browser UUID not found in cache. Did you forget to register the browser?",
			"error"
		);
	}

	return Arbiti.topic.unsubscribe({
		topics,
		browserUuid,
		userId: window.Arbiti.userId,
		appUuid: window.Arbiti.appUuid,
	});
}
