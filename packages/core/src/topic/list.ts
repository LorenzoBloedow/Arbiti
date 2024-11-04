import { env } from "../env";

type ListOptions = {
	/**
	 * The UUID of the app to fetch the topics from
	 */
	appUuid: string;
	/** The API key associated with your app */
	apiKey?: string;
	/** The UUID of the browser to fetch the topics from */
	browserUuid: string;
};

export function list({ apiKey, appUuid, browserUuid }: ListOptions) {
	return fetch(
		`${env.API_ENDPOINT}/${env.API_VERSION}/subscription?browserUuid=${browserUuid}`,
		{
			method: "GET",
			headers: {
				...(apiKey
					? {
							"x-api-key": apiKey,
					  }
					: {}),
				"x-app-uuid": appUuid,
			},
		}
	);
}
