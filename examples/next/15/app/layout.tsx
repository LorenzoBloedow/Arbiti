import { Arbiti } from "@arbiti/next";
import "./globals.css";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });
export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<Arbiti.Provider
			autoRegister
			skipPathResolution
			path="/arbitiServiceWorker.js"
		>
			<html lang="en">
				<body className={`${inter.className} antialiased`}>
					{children}
				</body>
			</html>
		</Arbiti.Provider>
	);
}
