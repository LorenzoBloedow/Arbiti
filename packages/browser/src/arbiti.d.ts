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
			ARBITI_ENV: "development" | "production";
		}
	}
}

export {};
