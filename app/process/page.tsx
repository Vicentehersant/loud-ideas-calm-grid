import type { Metadata } from "next";
import ProcessCanvas from "@/components/ProcessCanvas";

export const metadata: Metadata = {
  title: "Process — Loud Ideas, Calm Grid",
  description: "Process canvas for the Pinterest redesign: brand and UI audit, colorimetry, typography and graphic style explorations.",
};

export default function ProcessPage() {
  return (
    <main>
      <h1 className="sr-only">Process: audit, colorimetry, typography and graphic styles</h1>
      <ProcessCanvas />
    </main>
  );
}
