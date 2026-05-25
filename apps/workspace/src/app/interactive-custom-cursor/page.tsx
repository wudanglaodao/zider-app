import type { Metadata } from "next";
import { CursorLab } from "@/cursor/preview";

export const metadata: Metadata = {
  title: "Interactive Custom Cursor - Zider",
  description: "Configure, preview, save, and publish the Interactive Custom Cursor widget.",
};

export default function InteractiveCustomCursorPage() {
  return <CursorLab />;
}
