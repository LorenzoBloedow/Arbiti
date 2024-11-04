"use server";
import { Arbiti } from "@arbiti/next";

export async function sendNotification(message: string) {
	return Arbiti.sendNotification({
		title: "Welcome to Arbiti! 🎉",
		message,
		userId: "next-15-example",
	});
}
