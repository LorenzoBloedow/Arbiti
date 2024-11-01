import { noop } from "./noop";

interface RetryOptions {
	retries?: number;
	delay?: number;
	onBeforeRetry?: (error: any, retriesLeft: number) => void;
}

export function retry<T>(
	fn: () => Promise<T>,
	{ retries = 1, delay = 2000, onBeforeRetry = noop }: RetryOptions
): Promise<T> {
	return fn().catch(async (error) => {
		if (retries > 0) {
			onBeforeRetry(error, retries);
			await new Promise((resolve) => setTimeout(resolve, delay));
			return retry(fn, {
				retries: retries - 1,
				delay,
				onBeforeRetry: onBeforeRetry,
			});
		}
		throw error;
	});
}
