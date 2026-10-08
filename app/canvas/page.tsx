import type { Metadata } from "next";
import Link from "next/link";
import MoodCanvas from "@/components/MoodCanvas";
import BubbleLegend from "@/components/BubbleLegend";

export const metadata: Metadata = {
  title: "Moodboard canvas — Loud Ideas, Calm Grid",
  description: "Drag to explore the moodboard for the Pinterest redesign direction “Loud Ideas, Calm Grid”.",
};

export default function CanvasPage() {
  return (
    <main className="relative h-dvh w-full">
      <h1 className="sr-only">Loud Ideas, Calm Grid — moodboard canvas</h1>
      <MoodCanvas />
      <BubbleLegend className="left-4 top-16 md:left-6 md:top-20" />
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-4 md:p-6 md:pl-24">
        <Link href="/" className="pointer-events-auto tonal-flat t-grey rounded-full px-3 py-1.5 text-sm font-medium">
          Loud Ideas, Calm Grid
        </Link>
        <span className="tonal-flat t-grey rounded-full px-4 py-2 text-sm font-medium">Drag to explore</span>
      </div>
    </main>
  );
}
