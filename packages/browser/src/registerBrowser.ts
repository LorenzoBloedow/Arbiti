import Arbiti from "@arbiti/core";
import { log } from "./log";
import { env } from "./env";
import { getCache } from "./getCache";
import { updateCache } from "./updateCache";

export async function registerBrowser({ userId }: { userId?: string }) {
	const vapidKey = await Arbiti.retry(
		async () => await (await fetch(`${env.WEBSITE_URL}/vapid.pub`)).text(),
		{
			delay: 1000,
			retries: 3,
			onBeforeRetry: (error, retriesLeft) => {
				log(
					`Failed to get VAPID public key: ${JSON.stringify(
						error
					)}. Retrying ${retriesLeft} more time${
						retriesLeft > 1 ? "s" : ""
					}...`,
					"warn"
				);
			},
		}
	);

	return Arbiti.retry(
		async () =>
			navigator.serviceWorker.ready.then(
				async (registration) => {
					log("Service worker ready", "info");

					// We need to unsubscribe before subscribing otherwise we might
					// get an error if the VAPID key changes
					const existingSubscription =
						await registration.pushManager.getSubscription();
					if (existingSubscription) {
						log(
							"Unsubscribing existing subscription to avoid VAPID issues",
							"info"
						);
						await existingSubscription.unsubscribe();
					}

					const subscription =
						await registration.pushManager.subscribe({
							userVisibleOnly: true,
							applicationServerKey: vapidKey,
						});

					const publicKey = subscription.getKey("p256dh");
					const authenticationSecret = subscription.getKey("auth");

					if (!publicKey || !authenticationSecret) {
						return log(
							"Failed to get encryption keys for subscription",
							"error"
						);
					}

					const browserUuidCache = getCache()?.browserUuid;
					const browserUuid = browserUuidCache || crypto.randomUUID();
					await Arbiti.registerBrowser({
						appUuid: window.Arbiti.appUuid,
						userId,
						browserUuid,
						endpoint: subscription.endpoint,
						keys: {
							publicKey:
								Buffer.from(publicKey).toString("base64"),
							authenticationSecret:
								Buffer.from(authenticationSecret).toString(
									"base64"
								),
						},
						timezone:
							Intl.DateTimeFormat().resolvedOptions().timeZone,
					});

					if (!browserUuidCache) {
						log("Browser registered for the first time", "info");
					} else {
						log(
							"Browser registered with existing browser UUID: " +
								browserUuidCache,
							"info"
						);
					}

					updateCache({
						browserUuid,
					});

					return browserUuid;
				},
				(error) => {
					throw error;
				}
			),
		{
			retries: 3,
			delay: 1000,
			onBeforeRetry: (error, retriesLeft) => {
				log(
					`Failed to register browser: ${JSON.stringify(
						error
					)}. Retrying ${retriesLeft} more time${
						retriesLeft > 1 ? "s" : ""
					}...`,
					"warn"
				);
			},
		}
	);
}
