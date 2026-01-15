import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";
import { HelixBackground } from "@/components/ui/helix-hero";

const lexend = Lexend({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AlgoViz OS - Operating System Algorithm Visualizer",
  description: "Interactive educational platform for visualizing Operating System algorithms including CPU Scheduling, Disk Scheduling, Memory Management, and Page Replacement",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${lexend.className} antialiased`} suppressHydrationWarning>
        <HelixBackground />
        {children}
      </body>
    </html>
  );
}
