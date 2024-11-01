declare global {
	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV: "internal" | "development" | "production";
		}
	}
}

export {};
