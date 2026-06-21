import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ZIDER",
  description: "A multilingual content-first home for ZIDER blog and forum migration.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/zider-app-icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, overflowX: "hidden", backgroundColor: "#f7f7f9" }}>
        {children}
      </body>
    </html>
  );
}
