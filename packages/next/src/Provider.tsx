"use client";
import React from "react";
import { Arbiti } from "@arbiti/browser";
import { log } from "@arbiti/browser/dist/log";
import { useEffect } from "react";
import { getNextConfig } from "./getNextConfig";
import { list } from "./topics/list";

export type Topics = {
	name: string;
}[];

export const ArbitiContext = React.createContext<{
	topics: Topics | null;
	isInit: boolean;
}>({
	topics: null,
	isInit: false,
});

export default function Provider(
	props: Partial<Parameters<typeof Arbiti.init>[0]> & {
		children: React.ReactNode;
	}
) {
	const [initialTopics, setInitialTopics] = React.useState<Topics | null>(
		null
	);
	const [isInit, setIsInit] = React.useState(false);

	useEffect(() => {
		if (
			!props?.appUuid &&
			!process.env.NEXT_PUBLIC_ARBITI_APP_UUID &&
			!process.env.NEXT_PUBLIC_ARBITI_APP_ID
		) {
			getNextConfig().then((config) => {
				const arbitiVariables = [
					"NEXT_PUBLIC_ARBITI_APP_UUID",
					"NEXT_PUBLIC_ARBITI_APP_ID",
				];
				const typos =
					config?.publicRuntimeConfig?.nextPublicEnv?.filter(
						(variable: string) =>
							variable.includes("ARBITI") &&
							!arbitiVariables.includes(variable)
					);

				if (typos?.length) {
					// This value may be overridden by Arbiti.init later but we need to set it here so this warning logs
					window.Arbiti = {
						...window.Arbiti,
						logLevel: "warn",
					};
					log(
						`Found unrecognized Arbiti environment variable${
							typos.length > 1 ? "s" : ""
						}: ${typos.join(
							", "
						)}. Did you mean one of these: ${arbitiVariables.join(
							", "
						)}?`,
						"warn"
					);

					throw log(
						"Arbiti: Missing appUuid. Please provide it as a parameter or set it as the NEXT_PUBLIC_ARBITI_APP_UUID environment variable.",
						"error"
					);
				}
			});
		} else {
			Arbiti.init({
				// @ts-ignore
				appUuid:
					process.env.NEXT_PUBLIC_ARBITI_APP_UUID ||
					process.env.NEXT_PUBLIC_ARBITI_APP_ID,
				...(props || {}),
			})
				.then(async () => {
					setIsInit(true);
					const browserUuid = Arbiti.getBrowserUuid();

					if (window.Arbiti.appUuid && browserUuid) {
						setInitialTopics(
							(
								await list({
									appUuid: window.Arbiti.appUuid,
									browserUuid,
								})
							).data.topics
						);
					}
				})
				.catch(() => setInitialTopics([]));
		}
	}, []);

	return (
		<ArbitiContext.Provider
			value={{
				topics: initialTopics,
				isInit,
			}}
		>
			{props.children}
		</ArbitiContext.Provider>
	);
}
