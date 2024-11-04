import { NextConfig } from "next";

export function withArbitiConfig(config: NextConfig = {}): NextConfig {
	return {
		...config,
		publicRuntimeConfig: {
			nextPublicEnv: Object.keys(process.env).filter((key) =>
				key.startsWith("NEXT_PUBLIC_")
			),
			// Leave this after our own config in order not to break existing apps or
			// libraries that might use the same 'nextPublicEnv' name
			...config.publicRuntimeConfig,
		},
	};
}
