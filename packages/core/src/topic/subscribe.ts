import { env } from "../env";

interface SubscribeOptions {
	/**
	 * The topic to subscribe to. This can be any string or an array of strings
	 */
	topics: string | string[];
	/**
	 * A unique identifier for this browser
	 */
	browserUuid: string;
	/**
	 * The UUID of the app to subscribe to
	 */
	appUuid: string;
	/** The API key associated with your app */
	apiKey?: string;
	/**
	 * Your user ID to associate with the subscription
	 */
	userId?: string;
}

export function subscribe({
	appUuid,
	topics,
	browserUuid,
	userId,
	apiKey,
}: SubscribeOptions) {
	return fetch(`${env.API_ENDPOINT}/${env.API_VERSION}/subscription`, {
		method: "POST",
		headers: {
			...(apiKey
				? {
						"x-api-key": apiKey,
				  }
				: {}),
			"x-app-uuid": appUuid,
		},
		body: JSON.stringify({
			topics,
			browserUuid,
			userId,
		}),
	});
}
