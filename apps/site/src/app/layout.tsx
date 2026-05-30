import type { Metadata } from "next";
import Script from "next/script";

import { getAiCustomerWidgetConfig } from "@/lib/ai-customer-widget";
import "./globals.css";

const GOOGLE_ANALYTICS_ID = "G-ZTBTQ9Z9LH";

export const metadata: Metadata = {
  title: "ZIDER",
  description: "A multilingual content-first home for ZIDER blog and forum migration.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const aiCustomerWidget = getAiCustomerWidgetConfig();

  return (
    <html lang="en">
      <body style={{ margin: 0, overflowX: "hidden", backgroundColor: "#f7f7f9" }}>
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
        {aiCustomerWidget.enabled ? (
          <Script
            data-plugins={aiCustomerWidget.plugins}
            data-site-id={aiCustomerWidget.siteId}
            data-theme={aiCustomerWidget.theme}
            src={aiCustomerWidget.src}
            strategy="afterInteractive"
          />
        ) : null}
      </body>
    </html>
  );
}
