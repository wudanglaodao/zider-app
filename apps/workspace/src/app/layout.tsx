import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZIDER Workspace",
  description: "Components and Solutions backends for ZIDER products.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
