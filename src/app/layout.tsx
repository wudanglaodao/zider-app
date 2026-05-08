import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zider App Analytics",
  description: "Shared webhook analytics foundation for Zider apps.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
