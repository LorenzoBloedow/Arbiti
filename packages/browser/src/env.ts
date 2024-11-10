import { env as coreEnv } from "@arbiti/core/dist/env";

const common = {};

export const env =
	process.env.ARBITI_ENV === "production"
		? { ...common, ...coreEnv }
		: { ...common, ...coreEnv };
