"use client";
import Image from "next/image";
import { useState } from "react";
import { sendNotification } from "./sendNotification";

export default function Home() {
	const defaultNotification = "Hello, world!";
	const [notification, setNotification] = useState(defaultNotification);
	const [loading, setLoading] = useState(false);

	return (
		<div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
			<main className="flex flex-col gap-4 row-start-2 items-center">
				<Image
					src="/logo.png"
					alt="Arbiti logo"
					width={180}
					height={38}
					priority
				/>
				<div className="flex flex-col gap-2">
					<h1 className="text-5xl font-bold text-center sm:text-left">
						Welcome to Arbiti
					</h1>
					<p className="text-base text-center text-slate-500">
						Push notifications built for developers
					</p>
				</div>

				<div className="flex flex-col items-center gap-4 text-center">
					<p className="text-slate-600 lg:max-w-96">
						Populate your .env file with{" "}
						<strong>NEXT_PUBLIC_ARBITI_APP_UUID</strong> and{" "}
						<strong>ARBITI_API_KEY</strong> to start sending
						notifications
					</p>

					<div className="flex flex-col gap-4 items-center mt-4">
						<input
							className="px-5 py-3 text-center bg-gray-950 border-2 border-white rounded-md w-72 lg:w-[50rem]"
							type="text"
							placeholder="Your awesome notification here"
							defaultValue={defaultNotification}
							onChange={(e) => setNotification(e.target.value)}
						/>
						{!loading && (
							<button
								onClick={() => {
									setLoading(true);
									sendNotification(notification).then(() =>
										setLoading(false)
									);
								}}
								className="p-2 bg-blue-500 text-white rounded-md w-52"
							>
								Send Notification
							</button>
						)}
						{loading && (
							<p className="text-blue-500 animate-pulse">
								Sending notification...
							</p>
						)}
					</div>
				</div>
			</main>
		</div>
	);
}
