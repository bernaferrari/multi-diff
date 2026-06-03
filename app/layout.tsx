import { Geist, Geist_Mono } from "next/font/google";
import type { Metadata } from "next";

import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL ?? "multi-diff.vercel.app"}`,
  ),
  title: "Multi Diff",
  description: "Compare multiple unified diff files side by side.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Multi Diff",
    description: "Compare multiple unified diff files side by side.",
    url: "/",
    siteName: "Multi Diff",
    images: [
      {
        url: "/og.png",
        width: 1280,
        height: 640,
        alt: "Multi Diff",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Multi Diff",
    description: "Compare multiple unified diff files side by side.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", geist.variable)}
    >
      <body>
        <ThemeProvider>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster position="bottom-left" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
