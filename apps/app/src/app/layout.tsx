import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

const GOOGLE_ANALYTICS_ID = "G-ZTBTQ9Z9LH";

export const metadata: Metadata = {
  title: "Page not found - ZIDER",
  description: "This page is not available. Visit the ZIDER website instead.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`} strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GOOGLE_ANALYTICS_ID}');
          `}
        </Script>
      </body>
    </html>
  );
}
