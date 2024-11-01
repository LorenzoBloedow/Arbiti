import { getCache } from "./getCache";

export function getBrowserUuid() {
	return getCache()?.browserUuid;
}
