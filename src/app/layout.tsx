import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zider Workspace",
  description: "Interactive Custom Cursor workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, overflowX: "hidden", backgroundColor: "#f7f7f9" }}>{children}</body>
    </html>
  );
}
