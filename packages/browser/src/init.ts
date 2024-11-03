import Arbiti from "@arbiti/core";
import { getServiceWorkerPath } from "./getServiceWorkerPath";
import { log } from "./log";
import { registerBrowser } from "./registerBrowser";
import { setUser } from "./setUser";
import { updateCache } from "./updateCache";
import { getCache } from "./getCache";

export type InitOptions = {
	/** The unique identifier of your Arbiti app */
	appUuid: string;
	/** The path to the service worker file */
	path?: string;
	/** Setting this to true reduces time to initialize but won't work if the path isn't 100% correct */
	skipPathResolution?: boolean;
	logLevel?: Window["Arbiti"]["logLevel"];
	/** Automatically trigger a native notification permission prompt and register the browser if the prompt is accepted */
	autoRegister?: boolean;
	// TODO:
	/** Setting this to true will filter all content from our servers and your dashboard */
	// filterContent?:
	// 	| boolean
	// 	| {
	// 			/** Setting this to true will filter the title from our servers and your dashboard */
	// 			title: boolean;
	// 			/** Setting this to true will filter the message from our servers and your dashboard */
	// 			message: boolean;
	// 			/** Setting this to true will filter the url from our servers and your dashboard */
	// 			url: boolean;
	// 			/** Setting this to true will filter the buttons from our servers and your dashboard */
	// 			buttons: boolean;
	// 	  };
	/**
	 * Your unique identifier for this user, it will be used to track
	 * the authenticated user across browsers and devices. You can also set this later
	 * when the user identifies itself by logging in
	 * */
	userId?: string;
	/**
	 * Setting this to one of the supported analytics providers
	 * will automagically send analytics data to them if they're
	 * already set up in your application, if they're not set up, we'll help you do so
	 * */
	// TODO: Support Google, Mixpanel, Amplitude, and Segment
	// analytics?: "google";
};

const defaultOptions = {
	path: "/arbitiServiceWorker.js",
	// TODO: Don't cast this type
	logLevel: (typeof process?.env?.NODE_ENV !== "undefined" &&
	process.env.NODE_ENV === "production"
		? "error"
		: "warn") as "error" | "warn",
	autoRegister: true,
	skipPathResolution: false,
	filterContent: false,
	userId: undefined,
	appUuid: undefined,
};

export async function init(
	{
		path = defaultOptions.path,
		logLevel = defaultOptions.logLevel,
		autoRegister = defaultOptions.autoRegister,
		skipPathResolution = false,
		userId,
		appUuid,
	}: InitOptions = {
		path: defaultOptions.path,
		logLevel: defaultOptions.logLevel,
		autoRegister: defaultOptions.autoRegister,
		skipPathResolution: defaultOptions.skipPathResolution,
		userId: defaultOptions.userId,
		// @ts-ignore
		appUuid: defaultOptions.appUuid,
	}
) {
	if (typeof window === "undefined") {
		log(
			"'window' is undefined. Arbiti can only be initialized in a browser environment. Skipping initialization",
			"warn"
		);
		return;
	}
	if ("Arbiti" in window) {
		log("Arbiti is already initialized. Skipping reinitialization", "warn");
		return;
	}
	if (!appUuid) {
		log(
			"No app UUID provided. Arbiti will not work without an app UUID",
			"error"
		);
		return;
	}

	// Set global options
	// TODO: Properly fix type errors instead of using ts-ignore
	// @ts-ignore
	window.Arbiti = {
		appUuid,
		logLevel,
	};

	// Register service worker
	if ("serviceWorker" in navigator) {
		await Arbiti.retry(
			async () =>
				navigator.serviceWorker
					.register(
						await getServiceWorkerPath(path, skipPathResolution)
					)
					.then(
						() => {
							log("Service worker registered", "info");
						},
						(error) => {
							throw error;
						}
					),
			{
				retries: 5,
				delay: 2000,
				onBeforeRetry: (error: any, retriesLeft: number) => {
					log(
						`Failed to register service worker: ${JSON.stringify(
							error
						)}. Retrying ${retriesLeft} more time${
							retriesLeft > 1 ? "s" : ""
						}...`,
						"warn"
					);
				},
			}
		);
		navigator.serviceWorker.addEventListener("message", (event) => {
			if (event.data.type === "log") {
				log(event.data.message, event.data.level);
			}
		});
	} else {
		log(
			"Service workers are not supported in this browser. Arbiti will not work without service workers",
			"error"
		);
		return;
	}

	if (userId) {
		log("Setting user ID", "info");
		const cachedUserId = getCache()?.userId;
		if (cachedUserId !== userId) {
			log(
				"User ID not found or is different from cache. Refreshing user ID",
				"info"
			);
			await setUser(userId);
			updateCache({
				userId,
			});
		}
		log("User ID set successfully", "info");
	}
	// @ts-ignore
	window.Arbiti.userId = getCache()?.userId;

	if (autoRegister) {
		await registerBrowser({
			userId,
		});

		log(
			"Arbiti automatically registered the browser because 'autoRegister' was set to 'true'",
			"info"
		);
	}

	log("Arbiti successfully initialized!", "info");
}
