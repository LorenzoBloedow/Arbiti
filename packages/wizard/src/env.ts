const common = {};

export const env =
	process.env.ARBITI_ENV === "production"
		? {
				...common,
				API_ENDPOINT: "https://api.arbiti.com",
				AUTH_ENDPOINT: "https://arbiti.com/api/cli",
				WEBSITE: "https://arbiti.com",
		  }
		: {
				...common,
				API_ENDPOINT: "https://api-dev.arbiti.com",
				AUTH_ENDPOINT: "http://localhost:3000/api/cli",
				WEBSITE: "http://localhost:3000",
		  };
