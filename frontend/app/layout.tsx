import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: "GitHub Analyzer",
  description: "Code quality insights for your GitHub repositories",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className}>
      <body className="bg-background text-foreground antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
