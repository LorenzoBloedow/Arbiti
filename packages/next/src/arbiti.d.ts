declare global {
	interface Window {
		Arbiti: {
			appUuid: string;
			logLevel: "info" | "warn" | "error";
			userId?: string;
		};
	}

	namespace NodeJS {
		interface ProcessEnv {
			NEXT_PUBLIC_ARBITI_APP_UUID: string;
			ARBITI_API_KEY: string;
		}
	}
}

export {};
