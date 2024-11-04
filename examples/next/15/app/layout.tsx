import "./globals.css";
import { Inter } from "next/font/google";
import { Arbiti } from "@arbiti/next";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${inter.className} antialiased`}>
				<Arbiti.Provider
					autoRegister
					skipPathResolution
					path="/arbitiServiceWorker.js"
					userId="next-15-example"
				>
					{children}
				</Arbiti.Provider>
			</body>
		</html>
	);
}
