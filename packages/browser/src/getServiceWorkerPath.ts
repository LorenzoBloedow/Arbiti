import { log } from "./log";

const serviceWorkerFilename = "arbitiServiceWorker.js";
const identifierComment =
	"Arbiti_Service_Worker_Identifier_Comment_Do_Not_Modify_Or_Use_In_Your_Code";
// TODO: Find the file by the hash of the content (path as a hint) by using node before building the app
export async function getServiceWorkerPath(
	path: string,
	skipPathResolution = false
) {
	if (skipPathResolution) {
		return path;
	}
	{
		// Fully-qualified path
		const result = await fetch(path);
		if (result.ok) {
			const content = await result.text();
			if (content.includes(identifierComment)) {
				return path;
			}
		}
	}
	{
		// Input: /random/dir/
		// Output: /random/dir/arbitiServiceWorker.js
		const tempPath = path + serviceWorkerFilename;
		const result = await fetch(tempPath);
		if (result.ok) {
			const content = await result.text();
			if (content.includes(identifierComment)) {
				return tempPath;
			}
		}
	}
	{
		// Input: /random/dir
		// Output: /random/dir/arbitiServiceWorker.js
		const tempPath = path + "/" + serviceWorkerFilename;
		const result = await fetch(tempPath);
		if (result.ok) {
			const content = await result.text();
			if (content.includes(identifierComment)) {
				return tempPath;
			}
		}
	}
	{
		// Input /random/dir/randomServiceWorkerName
		// Output /random/dir/randomServiceWorkerName.js
		const tempPath = path + ".js";
		const result = await fetch(tempPath);
		if (result.ok) {
			const content = await result.text();
			if (content.includes(identifierComment)) {
				return tempPath;
			}
		}
	}
	{
		// Input: random/dir/randomServiceWorkerName
		// Output: /random/dir/randomServiceWorkerName.js
		const tempPath = "/" + path + ".js";
		const result = await fetch(tempPath);
		if (result.ok) {
			const content = await result.text();
			if (content.includes(identifierComment)) {
				return tempPath;
			}
		}
	}
	{
		// Input: /random/dir
		// Output: /public/arbitiServiceWorker.js
		const tempPath = "/public/" + serviceWorkerFilename;
		const result = await fetch(tempPath);
		if (result.ok) {
			const content = await result.text();
			if (content.includes(identifierComment)) {
				return tempPath;
			}
		}
	}

	// Throws
	log(`Service worker not found at ${path}`, "error");

	// For TypeScript
	return "";
}
