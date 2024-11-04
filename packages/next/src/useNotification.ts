"use client";
import Arbiti from "@arbiti/browser";
import { useContext, useEffect, useState } from "react";
import { getBrowserUuid } from "@arbiti/browser/dist/getBrowserUuid";
import { getCache } from "@arbiti/browser/dist/getCache";
import { log } from "@arbiti/server/dist/log";
import { ArbitiContext, Topics } from "./Provider";

export function useNotification() {
	const [browserUuid, setBrowserUuid] = useState<string | null>(null);
	const [userId, setUserId] = useState<string | null>(null);

	const { topics, isInit } = useContext(ArbitiContext);
	const [_topics, _setTopics] = useState<Topics>(
		topics === null ? [] : topics
	);
	const [topicsLoading, setTopicsLoading] = useState(true);

	useEffect(() => {
		setBrowserUuid(getBrowserUuid() || null);
		setUserId(getCache()?.userId || null);
	}, []);

	useEffect(() => {
		console.log("TOPICS", topics, _topics);
		_setTopics(topics === null ? [] : topics);

		if (topics === null) {
			setTopicsLoading(true);
		} else {
			setTopicsLoading(false);
		}
	}, [topics]);

	const registerBrowser = async (
		params: Parameters<typeof Arbiti.registerBrowser>[0]
	) => {
		if (!isInit) {
			return;
		}
		await Arbiti.registerBrowser(params);
		setBrowserUuid(getBrowserUuid() || null);
	};

	const registerUser = async (
		params: Parameters<typeof Arbiti.setUser>[0]
	) => {
		if (!isInit) {
			log("Arbiti is not initialized, skipping registerUser", "warn");
			return;
		}
		await Arbiti.setUser(params);
		setUserId(getCache()?.userId || null);
	};

	const subscribe = async (
		/**
		 * The topic to subscribe to. This can be any string or an array of strings
		 */
		topics: Parameters<typeof Arbiti.topic.subscribe>[0]
	) => {
		if (!isInit) {
			log("Arbiti is not initialized, skipping subscribe", "warn");
			return;
		}
		const res = await (await Arbiti.topic.subscribe(topics)).json();

		if (res.error) {
			throw log(res.message, "error");
		}

		const resTopics = (Array.isArray(topics) ? topics : [topics]).map(
			(topic) => ({
				name: topic,
			})
		);

		_setTopics(
			[
				...(_topics || []).filter(
					(topic) =>
						!resTopics.some(
							(resTopic) => resTopic.name === topic.name
						)
				),
				...(Array.isArray(resTopics) ? resTopics : [resTopics]),
			].flat()
		);
	};

	const unsubscribe = async function unsubscribe(
		/**
		 * The topic to unsubscribe from. This can be any string or an array of strings
		 */
		topics: Parameters<typeof Arbiti.topic.unsubscribe>[0]
	) {
		if (!isInit) {
			log("Arbiti is not initialized, skipping unsubscribe", "warn");
			return;
		}
		const res = await (await Arbiti.topic.unsubscribe(topics)).json();

		if (res.error) {
			throw log(res.message, "error");
		}

		const resTopics = (Array.isArray(topics) ? topics : [topics]).map(
			(topic) => ({
				name: topic,
			})
		);

		_setTopics(
			[
				...(_topics || []).filter(
					(topic) =>
						!resTopics.some(
							(resTopic) => resTopic.name === topic.name
						)
				),
				...resTopics,
			].flat()
		);
	};

	return {
		browserUuid,
		userId,
		isInit,
		registerBrowser,
		registerUser,
		topic: {
			subscribe,
			unsubscribe,
			topics: _topics,
			isLoading: topicsLoading,
		},
	};
}
