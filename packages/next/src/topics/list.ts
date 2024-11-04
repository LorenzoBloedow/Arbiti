"use server";
import ArbitiServer from "@arbiti/server";

export async function list(
	params: Parameters<typeof ArbitiServer.topic.list>[0]
): Promise<{
	data: {
		topics: { name: string }[];
	};
	message: string;
}> {
	const result = await (await ArbitiServer.topic.list(params)).json();

	if (result.error) {
		throw result.message;
	}
	return result;
}
