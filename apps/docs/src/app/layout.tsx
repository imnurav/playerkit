import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { RootProvider } from "fumadocs-ui/provider/next";
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
  title: {
    default: "PlayerKit — Video Player for the Modern Web",
    template: "%s | PlayerKit Docs",
  },
  description:
    "PlayerKit is a complete, production-ready video player for HLS streams, YouTube videos, and progressive MP4s. Built for React with headless hooks, token auth, live streams, and full customization.",
  keywords: [
    "hls player",
    "react video player",
    "youtube player",
    "playerkit",
    "hls.js react",
    "video player library",
  ],
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
        <RootProvider 
          theme={{ defaultTheme: 'system', enableSystem: true }}
          search={{
            options: {
              type: 'static',
          },
          links: [
            ['Documentation', '/docs/getting-started/introduction'],
            ['React', '/docs/react/overview'],
            ['Core', '/docs/core/overview'],
            ['UI', '/docs/ui/overview'],
            ['Guides', '/docs/guides/token-auth'],
            ['Reference', '/docs/reference/props'],
            ['Changelog', '/changelog/v0.0.6'],
          ]
        }}>
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
