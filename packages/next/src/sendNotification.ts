"use server";
import { Arbiti } from "@arbiti/server";

export async function sendNotification(
	params: Parameters<typeof Arbiti.sendNotification>[0]
) {
	const result = await Arbiti.sendNotification(params);

	if (result.error) {
		throw result.message;
	}
	return result;
}
