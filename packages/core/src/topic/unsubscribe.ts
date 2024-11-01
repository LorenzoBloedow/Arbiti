import { env } from "../env";

type UnsubscribeOptions = {
	/**
	 * The UUID of the app to unsubscribe from
	 */
	appUuid: string;
	/**
	 * The topic or topics to unsubscribe from
	 */
	topics: string | string[];
	/**
	 * The UUID of the browser to unsubscribe
	 */
	browserUuid: string;
	/** The API key associated with your app */
	apiKey?: string;
	/**
	 * Your unique identifier for this user
	 */
	userId?: string;
};

export function unsubscribe({
	appUuid,
	topics,
	browserUuid,
	userId,
	apiKey,
}: UnsubscribeOptions) {
	return fetch(`${env.API_ENDPOINT}/${env.API_VERSION}/subscription`, {
		method: "DELETE",
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
