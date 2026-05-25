import type { Metadata } from "next";
import Script from "next/script";

import { getAiCustomerWidgetConfig } from "@/lib/ai-customer-widget";

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
