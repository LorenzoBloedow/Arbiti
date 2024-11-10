import { Arbiti } from "@arbiti/core";
import { log } from "./log";

export function sendNotification(
	options: Pick<
		Parameters<typeof Arbiti.sendNotification>[0],
		| "title"
		| "message"
		| "topic"
		| "badge"
		| "browserUuid"
		| "userId"
		| "dir"
		| "lang"
		| "extraData"
		| "icon"
		| "renotify"
		| "requireInteraction"
		| "sendAt"
		| "silent"
		| "vibration"
		| "url"
	> & {
		/** This parameter takes precedence over the ARBITI_APP_UUID environment variable */
		appUuid?: string;
		/** This parameter takes precedence over the ARBITI_APP_KEY environment variable */
		apiKey?: string;
		// TODO: Add support for this parameter
		// target?:
		// 	| "mobile"
		// 	| "desktop"
		// 	| "chrome"
		// 	| "firefox"
		// 	| "safari"
		// 	| "edge"
		// 	| "opera";
	}
) {
	if (typeof options !== "object") {
		throw log("Invalid argument", "error");
	}

	if (options.silent && options.vibration) {
		log(
			"Both 'silent' and 'vibration' options are set. 'vibration' will be ignored",
			"warn"
		);
		options.vibration = undefined;
	}
	if (
		!options.appUuid &&
		!process.env.ARBITI_APP_UUID &&
		// Support Next.js actions without having to repeat the UUID for server and client
		!process.env.NEXT_PUBLIC_ARBITI_APP_UUID
	) {
		throw log(
			"Either setting the 'appUuid' parameter or the 'ARBITI_APP_UUID' environment variable is required",
			"error"
		);
	}

	if (!options.apiKey && !process.env.ARBITI_API_KEY) {
		throw log(
			"Either setting the 'apiKey' parameter or the 'ARBITI_API_KEY' environment variable is required",
			"error"
		);
	}

	return Arbiti.sendNotification({
		...options,
		appUuid: (options.appUuid ||
			process.env.ARBITI_APP_UUID ||
			// Support Next.js actions without having to repeat the UUID for server and client
			process.env.NEXT_PUBLIC_ARBITI_APP_UUID) as string,
		apiKey: (options.apiKey || process.env.ARBITI_API_KEY) as string,
	});
}
