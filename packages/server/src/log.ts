/**
 * @throws If the log level is "error"
 */
export function log(
	message: string,
	level: "info" | "warn" | "error" = "info"
) {
	if (level === "error") {
		throw new Error(`[Arbiti] ${message}`);
	}
	console[level](`[Arbiti] ${message}`);
}
