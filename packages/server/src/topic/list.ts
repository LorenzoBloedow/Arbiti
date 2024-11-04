import Arbiti from "@arbiti/core";
import { log } from "../log";

type ListParams = Pick<
	Parameters<typeof Arbiti.topic.subscribe>[0],
	"browserUuid" | "appUuid"
>;

export function list(params: ListParams) {
	if (
		!params.appUuid &&
		!process.env.ARBITI_APP_UUID &&
		!process.env.NEXT_PUBLIC_ARBITI_APP_UUID
	) {
		throw log(
			"Either setting the 'appUuid' parameter or the 'ARBITI_APP_UUID' environment variable is required",
			"error"
		);
	}

	return Arbiti.topic.list({
		...params,
		// @ts-ignore
		appUuid:
			params.appUuid ||
			process.env.ARBITI_APP_UUID ||
			process.env.NEXT_PUBLIC_ARBITI_APP_UUID,
	});
}
