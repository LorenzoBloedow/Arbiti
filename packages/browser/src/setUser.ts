import { Arbiti } from "@arbiti/core";
import { log } from "./log";
import { registerBrowser } from "./registerBrowser";
import { getBrowserUuid } from "./getBrowserUuid";
/**
 * @param userId Your internal user ID which will be used to track this user across browsers
 */
export async function setUser(
	userId: Parameters<typeof Arbiti.setUser>[0]["userId"]
) {
	let browserUuid = getBrowserUuid();
	if (!browserUuid) {
		log("Browser UUID not found", "info");
		log("Registering browser automatically", "info");
		// @ts-ignore
		browserUuid = await registerBrowser({});
	}

	const res = await Arbiti.setUser({
		userId,
		browserUuid: browserUuid as string,
		appUuid: window.Arbiti.appUuid,
	});

	if (!res.ok) {
		throw log(
			`Failed to set user ID: ${JSON.stringify(await res.text())}`,
			"error"
		);
	}

	// Update the browser item with the new user ID
	await registerBrowser({
		userId,
	});

	return {
		userId,
	};
}
