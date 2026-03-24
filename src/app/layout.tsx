import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AppShell from "@/components/AppShell";
import { ThemeRoot } from "@/components/theme/ThemeRoot";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bridgespace",
  description: "A warmer way to communicate. Pulse for daily connection, Mirror for empathy practice.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Bridgespace",
  },
  openGraph: {
    title: "Bridgespace",
    description: "A warmer way to communicate. Pulse for daily connection, Mirror for empathy practice.",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0f1419",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeRoot />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
