"use server";
import { Arbiti } from "@arbiti/server";

export async function sendNotification(message: string) {
	const result = await Arbiti.sendNotification({
		title: "Welcome to Arbiti! 🎉",
		message,
		userId: "test",
	});

	if (result.error) {
		throw result.message;
	}
	return result;
}
