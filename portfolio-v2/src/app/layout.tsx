"use client";

import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { CommandProvider } from "@/components/CommandProvider";
import { ReactLenis } from "lenis/react";
import { AmbientBackground } from "@/components/AmbientBackground";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-[var(--bg-void)] text-[var(--text-primary)]`}
        suppressHydrationWarning
      >
        <AmbientBackground />
        <ReactLenis root options={{ lerp: 0.05, duration: 1.2, smoothWheel: true }}>
          <CommandProvider>{children}</CommandProvider>
        </ReactLenis>
      </body>
    </html>
  );
}

