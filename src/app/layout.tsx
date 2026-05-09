import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zider",
  description: "Small apps. Sharper websites.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, backgroundColor: "#090b0f" }}>{children}</body>
    </html>
  );
}
