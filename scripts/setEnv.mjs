import fs from "fs";

const sourceFilePath = process.argv[2];
if (!sourceFilePath) {
	console.error("Please provide a source file path");
	process.exit(1);
}

// Get environment variable
const arbitiEnv = process.env.ARBITI_ENV || "development";

// Read the source file
try {
	const content = fs.readFileSync(sourceFilePath, "utf8");

	// Replace process.env.ARBITI_ENV with actual value
	const modifiedContent = content.replace(
		/process\.env\.ARBITI_ENV/g,
		`"${arbitiEnv}"`
	);

	// Create a temporary file with the same name but .tmp extension
	const tmpFilePath = sourceFilePath.replace(/\.ts$/, ".tmp.ts");

	// Write the modified content to the temporary file
	fs.writeFileSync(tmpFilePath, modifiedContent);

	// Rename the temporary file to the original file
	fs.renameSync(tmpFilePath, sourceFilePath);

	console.log(
		`Successfully substituted ARBITI_ENV in ${sourceFilePath} with "${arbitiEnv}"`
	);
} catch (error) {
	console.error("Error processing file:", error);
	process.exit(1);
}
