import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZIDER App",
  description: "Webhook, API, and data dashboard for ZIDER.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
