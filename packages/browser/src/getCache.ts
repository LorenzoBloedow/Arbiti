export type ArbitiCache = {
	browserUuid: string;
	userId: string;
};

export function getCache() {
	if ("localStorage" in window) {
		const cache = localStorage.getItem("arbiti");
		if (cache) {
			return JSON.parse(cache) as ArbitiCache;
		}
	}
}
