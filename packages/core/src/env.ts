const common = {
	WEBSITE_URL: "https://arbiti.com",
	API_VERSION: "v1",
};

export const env =
	process.env.ARBITI_ENV === "production"
		? {
				...common,
				API_ENDPOINT: "https://api.arbiti.com",
		  }
		: {
				...common,
				API_ENDPOINT: "https://api-dev.arbiti.com",
		  };
