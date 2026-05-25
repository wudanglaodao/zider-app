import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Page not found - ZIDER",
  description: "This page is not available. Visit the ZIDER website instead.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
