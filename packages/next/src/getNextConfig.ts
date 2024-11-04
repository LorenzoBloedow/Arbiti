"use server";
import getConfig from "next/config";

export const getNextConfig = async () =>
	getConfig() as
		| {
				publicRuntimeConfig?: {
					nextPublicEnv?: string[];
				};
		  }
		| undefined;
