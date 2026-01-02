import type { Metadata } from "next";
import "./globals.css";

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
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
