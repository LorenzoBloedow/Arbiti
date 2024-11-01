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
	if (window.Arbiti) {
		const logLevels = ["info", "warn", "error"];
		const configLevel = logLevels.indexOf(window.Arbiti.logLevel);
		const currentLevel = logLevels.indexOf(level);
		if (currentLevel <= configLevel) {
			console[level](`[Arbiti] ${message}`);
		}
	}
}
