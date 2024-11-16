#!/usr/bin/env node
import { randomBytes } from "crypto";
import { env } from "./env.js";
import open from "open";
import "colors";
import cliSpinners from "cli-spinners";
import { confirm, input, select, Separator } from "@inquirer/prompts";
import ora from "ora";
import { dirname, resolve } from "path";
import semver from "semver";
import { exec } from "child_process";
import { detectSync } from "package-manager-detector/detect";
import { resolveCommand } from "package-manager-detector/commands";
import * as acorn from "acorn";
import * as walk from "acorn-walk";
import * as escodegen from "escodegen";
// @ts-ignore
import * as jsxcodegen from "escodegen-wallaby";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { homedir } from "os";
import figlet from "figlet";
import tsPlugin from "acorn-typescript";
import { promisify } from "util";
import parser from "gitignore-parser";
import arbitiBrowserDir from "@arbiti/browser/dist/dir.js";
import { fileURLToPath } from "url";
// @ts-ignore
import { extend } from "acorn-jsx-walk";
import * as prettier from "prettier";
import { copyFile, mkdir } from "fs/promises";

const execPromise = promisify(exec);

function capitalize(str: string) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

async function getPackageJson(projectDir: string) {
	try {
		return (
			await import(resolve(projectDir, "package.json"), {
				with: {
					type: "json",
				},
			})
		).default;
	} catch {
		return null;
	}
}

async function getCredentials() {
	const credentialsPath = resolve(homedir(), ".arbiti/credentials.json");
	return (
		await import(credentialsPath, {
			with: {
				type: "json",
			},
		})
	).default;
}

async function authenticate(projectDir: string) {
	const credentialsPath = resolve(homedir(), ".arbiti/credentials.json");

	const secret = randomBytes(256).toString("base64url");
	const initTime = Date.now();

	open(
		`${env.WEBSITE}/?cliSecret=${secret}&vscodeUri=vscode://file/${resolve(
			process.cwd(),
			projectDir,
			"package.json"
		)}`
	);

	// TODO: Use a more efficient way to listen for the response from the browser instead of polling
	async function pollUntilSuccess(
		fn: () => Promise<Response>,
		delay: number
	): Promise<{
		status: "success";
		jwt: string;
	} | void> {
		if (Date.now() - initTime > 1000 * 60 * 5) {
			console.log(
				"Timed out while waiting for confirmation from the browser".red
					.bold
			);
			const answer = await confirm({
				message: "Do you want to try again?",
				default: true,
			});

			if (answer) {
				return authenticate(projectDir);
			} else {
				process.exit(1);
			}
		}

		const localInitTime = Date.now();
		try {
			const response = await (await fn()).json();
			if (response.status === "success") {
				return response;
			}
		} catch {}

		const timePassed = Date.now() - localInitTime;
		await new Promise((resolve) =>
			setTimeout(resolve, timePassed < delay ? delay - timePassed : 0)
		);
		return pollUntilSuccess(fn, delay);
	}

	const credentialsSpinner = ora({
		spinner: cliSpinners.dots,
	});
	try {
		const res = await pollUntilSuccess(
			() =>
				fetch(env.AUTH_ENDPOINT, {
					method: "POST",
					body: JSON.stringify({
						from: "cli",
						secret,
					}),
				}),
			1000
		);

		const jwt = res?.jwt;
		if (jwt) {
			credentialsSpinner.start("Saving credentials...");
			if (existsSync(credentialsPath)) {
				credentialsSpinner.stopAndPersist();
				const overwriteAnswer = await confirm({
					message:
						"Found existing credentials. Do you want to overwrite them?",
					default: true,
				});
				if (!overwriteAnswer) {
					// console.log(
					// 	"Ok, you can always overwrite them later by running arbiti login"
					// 		.gray
					// );
					credentialsSpinner.succeed(
						"Skipped overwriting credentials"
					);
					return;
				}
			}
			mkdirSync(resolve(homedir(), ".arbiti"), { recursive: true });
			writeFileSync(
				credentialsPath,
				JSON.stringify({
					jwt,
				})
			);
			credentialsSpinner.succeed(
				`Saved credentials to ${credentialsPath}`
			);
		}
	} catch (err) {
		// credentialsSpinner.fail(
		// 	"Failed to authenticate. You can try authenticating again later by running arbiti login"
		// );
		credentialsSpinner.fail("Failed to authenticate.");
	}
}

async function detectFramework(projectDir: string) {
	// Detect the framework by checking the package.json file
	const packageJson = await getPackageJson(projectDir);

	try {
		if (packageJson.dependencies.next) {
			if (semver.major(packageJson.dependencies.next) === 15) {
				return {
					name: "next",
					version: "15",
				};
			}
		}
	} catch {}

	return null;
}

async function getInstallCommand(packages: string[]) {
	const packageManager = detectSync();
	if (packageManager) {
		const command = resolveCommand(
			packageManager.agent,
			"install",
			packages
		);
		if (command?.command && command?.args) {
			return `${command.command} ${command.args.join(" ")}`;
		}
	}

	const command = await input({
		message:
			"We couldn't detect your package manager. Please provide the command to install packages in your project",
		default: "npm install",
	});

	return `${command} ${packages.join(" ")}`;
}

async function setupNext15(
	projectDir: string,
	appData?: {
		appUuid: string;
		apiKey: string;
		environment: "development" | "production";
	}[]
) {
	const packageSpinner = ora({
		spinner: cliSpinners.dots,
	});
	packageSpinner.start("Installing the necessary packages");

	const packages = ["@arbiti/next"];
	const installCommand = await getInstallCommand(packages);

	await execPromise(installCommand, {
		cwd: projectDir,
	});

	packageSpinner.succeed(`Successfully installed ${packages.join(", ")}`);

	const answer = await confirm({
		message:
			"Let's modify your Next.js config file to include our configuration",
		default: true,
	});
	if (answer) {
		try {
			const configFiles = [
				"next.config.js",
				"next.config.mjs",
				"next.config.ts",
			];
			let configFile;

			// Find the existing Next.js config file
			for (const file of configFiles) {
				const filepath = resolve(projectDir, file);
				try {
					const exists = existsSync(filepath);
					if (exists) {
						configFile = filepath;
						break;
					}
				} catch {}
			}

			if (!configFile) {
				const configFilename = existsSync(
					resolve(projectDir, "tsconfig.json")
				)
					? "next.config.ts"
					: "next.config.js";
				console.log(
					`No Next.js configuration file found. Creating ${configFilename}...`
						.white
				);
				if (configFilename === "next.config.js") {
					writeFileSync(
						resolve(projectDir, "next.config.js"),
						`import { Arbiti } from "@arbiti/next;"

const nextConfig = Arbiti.withArbitiConfig({});

export default nextConfig;`
					);
				} else {
					writeFileSync(
						resolve(projectDir, "next.config.ts"),
						`import type { NextConfig } from "next";
import { Arbiti } from "@arbiti/next";
	 
const nextConfig: NextConfig = Arbiti.withArbitiConfig({});
	
export default nextConfig;`
					);
				}
				packageSpinner.succeed("Created next.config.ts");
			} else {
				// Read the file content
				const content = readFileSync(configFile, "utf-8");

				// Parse the content
				// @ts-ignore
				const ast = acorn.Parser.extend(tsPlugin()).parse(content, {
					ecmaVersion: "latest",
					sourceType: "module",
				});

				// Find the export declaration
				let exportNode: any;
				walk.simple(ast, {
					ExportDefaultDeclaration(node) {
						exportNode = node;
					},
				});

				if (!exportNode) {
					console.log(
						"No default export found in the configuration file.".red
					);
					return;
				}

				// Wrap the existing configuration with withArbitiConfig
				exportNode.declaration = {
					type: "CallExpression",
					callee: {
						type: "Identifier",
						name: "Arbiti.withArbitiConfig",
					},
					arguments: [exportNode.declaration],
				};

				// Add import statement for withArbitiConfig
				ast.body.unshift({
					type: "ImportDeclaration",
					specifiers: [
						{
							type: "ImportSpecifier",
							// @ts-ignore
							imported: { type: "Identifier", name: "Arbiti" },
							// @ts-ignore
							local: { type: "Identifier", name: "Arbiti" },
						},
					],
					// @ts-ignore
					source: { type: "Literal", value: "@arbiti/next" },
				});

				// Generate the modified code
				const modifiedCode = escodegen.generate(ast, {
					format: {
						indent: {
							style: "  ",
							base: 0,
						},
						newline: "\n",
					},
				});

				// Write the modified code back to the file
				writeFileSync(
					configFile,
					await prettier.format(modifiedCode, { parser: "babel-ts" })
				);

				console.log(
					"✔".green + `Successfully modified ${configFile}`.white
				);
			}
		} catch {
			console.log(
				"✖".red +
					" Failed to modify Next.js configuration file. You can always do this manually later!"
			);
		}
	} else {
		console.log(
			"Ok, skipping Next.js configuration file patch. You can always do this manually later!"
				.yellow
		);
	}

	if (appData) {
		const envSpinner = ora({
			spinner: cliSpinners.dots,
		});
		envSpinner.start("Setting up environment variables and secrets");

		try {
			for (let i = 0; i < appData.length; i++) {
				const envFile = resolve(
					projectDir,
					`.env.${appData[i].environment}`
				);
				if (!existsSync(envFile)) {
					writeFileSync(envFile, "");
				}
				const envContent = readFileSync(envFile, "utf-8");
				if (!envContent.includes("NEXT_PUBLIC_ARBITI_APP_UUID")) {
					const newEnvContent = `${envContent.trimEnd()}\nNEXT_PUBLIC_ARBITI_APP_UUID=${
						appData[i].appUuid
					}`;
					writeFileSync(envFile, newEnvContent);
				}

				const localEnvFilename = `.env.${appData[i].environment}.local`;
				const localEnvFile = resolve(projectDir, localEnvFilename);
				if (!existsSync(localEnvFile)) {
					writeFileSync(localEnvFile, "");
				}
				const localEnvContent = readFileSync(localEnvFile, "utf-8");
				if (!localEnvContent.includes("ARBITI_API_KEY")) {
					const newLocalEnvContent = `${localEnvContent.trimEnd()}\nARBITI_API_KEY=${
						appData[i].apiKey
					}`;
					writeFileSync(localEnvFile, newLocalEnvContent);
				}

				const gitignoreFile = resolve(projectDir, ".gitignore");
				const gitignoreContent = readFileSync(gitignoreFile, "utf-8");
				if (
					!parser.compile(gitignoreContent).denies(localEnvFilename)
				) {
					writeFileSync(
						gitignoreFile,
						`${gitignoreContent.trimEnd()}\n${localEnvFilename}`
					);
				}
			}
		} catch {
			envSpinner.fail(
				"Failed to set up environment variables and secrets"
			);
			return;
		}

		envSpinner.succeed(
			"Successfully set up environment variables and secrets"
		);
	}

	const workerSpinner = ora({
		spinner: cliSpinners.dots,
	});

	workerSpinner.start("Copying Arbiti worker file to the public directory");

	try {
		const workerDir = resolve(projectDir, "public");
		if (!existsSync(workerDir)) {
			await mkdir(workerDir);
		}
		const workerPath = resolve(
			dirname(fileURLToPath(arbitiBrowserDir)),
			"arbitiServiceWorker.js"
		);
		const finalWorkerPath = resolve(workerDir, "arbitiServiceWorker.js");
		await copyFile(workerPath, finalWorkerPath);
		workerSpinner.succeed(
			"Successfully copied Arbiti worker file to the public directory"
		);
	} catch (err) {
		console.log(77777777, err);
		workerSpinner.fail(
			"Failed to copy Arbiti worker file to the public directory"
		);
	}

	const initializationAnswer = await confirm({
		message:
			"Do you want to write the initialization code to your Next.js layout?",
		default: true,
	});

	try {
		if (initializationAnswer) {
			// Wrap the existing layout.tsx/jsx file with Arbiti.Provider in TSX/JSX using Acorn
			const layoutFiles = [
				"src/app/layout.tsx",
				"src/app/layout.jsx",
				"app/layout.tsx",
				"app/layout.jsx",
			];
			let layoutFile;

			// Find the existing layout file
			for (const file of layoutFiles) {
				const filepath = resolve(projectDir, file);
				try {
					layoutFile = existsSync(filepath) ? filepath : undefined;
					if (layoutFile) {
						break;
					}
				} catch {}
			}

			if (layoutFile) {
				const layoutContent = readFileSync(layoutFile, "utf-8");

				// Parse the content
				// @ts-ignore
				const layoutAst = acorn.Parser.extend(tsPlugin()).parse(
					layoutContent,
					{
						ecmaVersion: "latest",
						sourceType: "module",
					}
				);

				extend(walk.base);

				// Find the default export declaration
				let layoutExportNode: any;
				walk.simple(layoutAst, {
					ExportDefaultDeclaration(node) {
						layoutExportNode = node;
					},
				});

				if (!layoutExportNode) {
					console.log(
						"No default export found in the layout file.".red
					);
					return;
				}

				// Find the return statement in the default export
				let returnStatement: any;
				walk.simple(layoutExportNode, {
					ReturnStatement(node) {
						returnStatement = node;
					},
				});

				if (!returnStatement) {
					console.log(
						"No return statement found in the default export.".red
					);
					return;
				}

				// Wrap the existing layout with Arbiti.Provider
				returnStatement.argument = {
					type: "JSXElement",
					openingElement: {
						type: "JSXOpeningElement",
						name: {
							type: "JSXIdentifier",
							name: "Arbiti.Provider",
						},
						attributes: [
							{
								type: "JSXAttribute",
								name: {
									type: "JSXIdentifier",
									name: "autoRegister",
								},
								value: null,
							},
							{
								type: "JSXAttribute",
								name: {
									type: "JSXIdentifier",
									name: "skipPathResolution",
								},
								value: null,
							},
							{
								type: "JSXAttribute",
								name: { type: "JSXIdentifier", name: "path" },
								value: {
									type: "Literal",
									value: "/arbitiServiceWorker.js",
								},
							},
						],
						selfClosing: false,
					},
					closingElement: {
						type: "JSXClosingElement",
						name: {
							type: "JSXIdentifier",
							name: "Arbiti.Provider",
						},
					},
					children: [returnStatement.argument],
				};

				// Add import statement for Arbiti
				layoutAst.body.unshift({
					type: "ImportDeclaration",
					specifiers: [
						{
							type: "ImportSpecifier",
							// @ts-ignore
							imported: { type: "Identifier", name: "Arbiti" },
							// @ts-ignore
							local: { type: "Identifier", name: "Arbiti" },
						},
					],
					// @ts-ignore
					source: { type: "Literal", value: "@arbiti/next" },
				});

				// Generate the modified code
				const modifiedLayoutCode = jsxcodegen.generate(layoutAst, {
					format: {
						indent: {
							style: "  ",
							base: 0,
						},
						newline: "\n",
					},
				});

				// Write the modified code back to the layout file
				writeFileSync(
					layoutFile,
					await prettier.format(modifiedLayoutCode, {
						parser: "babel-ts",
					})
				);

				console.log(
					"✔".green + ` Successfully modified ${layoutFile}`.white
				);
			} else {
				console.log(
					"No layout file found. You can always do this manually later!"
						.yellow
				);
			}
		}
	} catch (err) {
		console.log(
			"✖".red +
				" Failed to modify layout file. You can always do this manually later!"
		);
	}
}

async function createApp(projectDir: string) {
	const defaultEnvironment =
		existsSync(resolve(projectDir, ".env.development")) &&
		existsSync(resolve(projectDir, ".env.production"))
			? "both"
			: existsSync(resolve(projectDir, ".env.production"))
				? "production"
				: "development";
	const environment = await select({
		message:
			"Do you want to create the app for development, production or both?",
		choices: ["development", "production", "both"],
		default: defaultEnvironment,
	});

	const result: {
		appUuid: string;
		apiKey: string;
		environment: "development" | "production";
	}[] = [];

	if (environment === "both") {
		const devAppName = await input({
			message: "What's the name of your development app?",
			default:
				((await getPackageJson(projectDir))?.name || "project") +
					"-dev" ||
				dirname(projectDir) + "-dev" ||
				"my-awesome-app-dev",
		});
		const prodAppName = await input({
			message: "What's the name of your production app?",
			default:
				((await getPackageJson(projectDir))?.name || "project") +
					"-prod" ||
				dirname(projectDir) + "-prod" ||
				"my-awesome-app-prod",
		});
		const appSpinner = ora({
			spinner: cliSpinners.dots,
		});
		appSpinner.start(
			`Creating ${devAppName} (development) and ${prodAppName} (production)`
		);

		const promises = [
			fetch(`${env.WEBSITE}/api/app`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${(await getCredentials()).jwt}`,
				},
				body: JSON.stringify({
					name: devAppName,
					environment: "development",
				}),
			}).then(async (res) => {
				const data = (await res.json()).data;
				if (!res.ok || !data) {
					throw new Error("Failed to create production app");
				}
				return data;
			}),
			fetch(`${env.WEBSITE}/api/app`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${(await getCredentials()).jwt}`,
				},
				body: JSON.stringify({
					name: prodAppName,
					environment: "production",
				}),
			}).then(async (res) => {
				const data = (await res.json()).data;
				if (!res.ok || !data) {
					throw new Error("Failed to create production app");
				}
				return data;
			}),
		];

		try {
			const res = await Promise.all(promises);
			result.push(...res);
		} catch (err) {
			appSpinner.fail(
				"Failed to create Arbiti apps. You can try again later by running `arbiti app create`"
			);
			return;
		}

		appSpinner.succeed(
			`Successfully created ${devAppName} and ${prodAppName}`
		);
	} else {
		const appName = await input({
			message: `What's the name of your ${environment} app?`,
			default:
				(await getPackageJson(projectDir))?.name ||
				"project" ||
				+`-${environment}` ||
				dirname(projectDir) + `-${environment}` ||
				`my-awesome-app-${environment}`,
		});
		const appSpinner = ora({
			spinner: cliSpinners.dots,
		});
		appSpinner.start(`Creating ${appName} (${environment})`);

		try {
			const res = await fetch(`${env.WEBSITE}/api/app`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${(await getCredentials()).jwt}`,
				},
				body: JSON.stringify({
					name: appName,
					environment,
				}),
			}).then(async (res) => {
				const data = (await res.json()).data;
				if (!res.ok || !data) {
					throw new Error("Failed to create production app");
				}
				return data;
			});

			result.push(res);
		} catch (err) {
			appSpinner.fail(
				`Failed to create Arbiti app. You can try again later by running \`arbiti app create\``
			);
			return;
		}

		appSpinner.succeed(`Successfully created ${appName} (${environment})`);
	}
	return result;
}

async function setup() {
	const startTime = Date.now();
	console.log("\n\n\n");
	console.log(
		figlet.textSync("Arbiti", {
			font: "Larry 3D",
		})
	);
	console.log(
		"Welcome to the Arbiti CLI wizard, we're excited to have you here!"
			.magenta.bold
	);
	let projectDir: string;
	do {
		projectDir = await input({
			message: "First, what's the path to your project directory?",
			default: "./",
		});
		if (!existsSync(projectDir)) {
			console.log(
				"The specified directory doesn't exist. Please try again".red
			);
		}
	} while (!existsSync(projectDir));

	const browserAnswer = await confirm({
		message:
			"We need to authenticate you so we'll open Arbiti.com in your browser, ok?",
		default: true,
	});
	if (browserAnswer) {
		await authenticate(projectDir);
	} else {
		// console.log(
		// 	"Got it, you can always authenticate later by running `arbiti login`"
		// 		.yellow
		// );
	}

	let appData:
		| {
				appUuid: string;
				apiKey: string;
				environment: "development" | "production";
		  }[]
		| undefined;
	if (browserAnswer) {
		const createAppAnswer = await confirm({
			message:
				"Do you want to create an app so you can access your dashboard on Arbiti.com?",
			default: true,
		});
		if (createAppAnswer) {
			appData = await createApp(projectDir);
		} else {
			const selectAppAnswer = await confirm({
				message:
					"Do you want to select an existing app to continue the setup?",
				default: true,
			});

			if (selectAppAnswer) {
				const apps = await fetch(`${env.WEBSITE}/api/app`, {
					headers: {
						Authorization: `Bearer ${(await getCredentials()).jwt}`,
					},
				}).then(async (res) => {
					if (res.status === 404) {
						console.log("No app found. Skipping app setup".yellow);

						return null;
					} else {
						const data = (await res.json()).data;
						if (!res.ok || !data) {
							throw new Error("Failed to fetch apps");
						}
						return data;
					}
				});

				if (apps) {
					const appChoices: Separator[] = apps.map((app: any) => ({
						name: `${app.name} (${capitalize(app.environment)})`,
						value: app,
					}));

					const selectedApp = await select({
						message: "Select an app to continue the setup",
						choices: appChoices,
					});

					// TODO: Fix type errors
					appData = [
						{
							// @ts-ignore
							appUuid: selectedApp.appUuid,
							// @ts-ignore
							apiKey: selectedApp.apiKey,
							// @ts-ignore
							environment: selectedApp.environment,
						},
					];
				}
			}
		}

		const framework = await detectFramework(projectDir);

		if (framework) {
			if (framework.name === "next" && framework.version === "15") {
				console.log("✔".green + " Detected Next.js 15 project!".white);
				try {
					await setupNext15(projectDir, appData);
				} catch (err) {
					console.log("Failed to setup Next.js 15 project".red);
					return;
				}
			}
		} else {
			console.log(
				"We either couldn't detect your framework or it's not supported yet"
					.yellow
			);
			const packageSpinner = ora({
				spinner: cliSpinners.dots,
			});
			packageSpinner.start("Installing the universal Arbiti packages...");

			const packages = ["@arbiti/browser", "@arbiti/server"];
			const installCommand = await getInstallCommand(packages);

			await execPromise(installCommand, {
				cwd: projectDir,
			});

			packageSpinner.succeed(
				`Successfully installed ${packages.join(", ")}`
			);
		}

		const success = ora({
			spinner: cliSpinners.mindblown,
			text: `You're all set! And it only took ${Math.ceil((Date.now() - startTime) / 1000)} seconds. Mind-blowing, right?`,
		}).start();
		await new Promise((resolve) => setTimeout(resolve, 5000));
		success.succeed();
	}
}

await setup();

export {};
