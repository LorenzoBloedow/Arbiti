import type { ArbitiCache } from "./getCache";
import { getCache } from "./getCache";

export function updateCache(cache: Partial<ArbitiCache>) {
	if ("localStorage" in window) {
		const prev = getCache();
		localStorage.setItem("arbiti", JSON.stringify({ ...prev, ...cache }));
	}
}
