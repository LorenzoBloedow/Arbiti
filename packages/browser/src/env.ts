import { Arbiti } from "@arbiti/core";

const common = {};

export const env =
	process.env.ARBITI_ENV === "production"
		? { ...common, ...Arbiti.env }
		: { ...common, ...Arbiti.env };
