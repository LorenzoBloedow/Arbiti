import { env } from "./env";

type SetUser = {
	/**
	 * The UUID of the app to create the user with
	 */
	appUuid: string;
	/**
	 * The user's unique identifier
	 */
	userId: string;
	/**
	 * The browser's unique identifier
	 */
	browserUuid: string;
};

export function setUser({ appUuid, userId, browserUuid }: SetUser) {
	return fetch(`${env.API_ENDPOINT}/${env.API_VERSION}/user`, {
		method: "POST",
		headers: {
			"x-app-uuid": appUuid,
		},
		body: JSON.stringify({
			userId,
			browserUuid,
		}),
	});
}
