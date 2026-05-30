import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ZIDER",
  description: "A multilingual content-first home for ZIDER blog and forum migration.",
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
