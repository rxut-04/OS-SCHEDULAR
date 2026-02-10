import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import "./globals.css";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
});

export const metadata: Metadata = {
  title: "AlgoLogic - Mastering OS & AI",
  description: "Learning hard concepts made easier. Interactive platform for Operating System and AI/ML algorithms.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sourceSans.className} antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
