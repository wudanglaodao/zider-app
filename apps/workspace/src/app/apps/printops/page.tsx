import type { Metadata } from "next";
import { PrintOpsAccessGuide } from "./PrintOpsAccessGuide";

export const metadata: Metadata = {
  title: "Zider PrintOps",
  description: "Install Zider PrintOps through Wix to connect orders and print invoices.",
};

export default function PrintOpsPage() {
  return <PrintOpsAccessGuide />;
}
