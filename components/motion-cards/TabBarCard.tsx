"use client";

import { useCallback, useState } from "react";
import gsap from "gsap";
import TabBar from "@/components/ui/TabBar";
import { useMotionCard, cardRoot } from "./useMotionCard";

const PHOTOS = [
  "/mood/people-04-people-film-01.jpg",
  "/mood/people-09-people-friends-06.jpg",
  "/mood/people-02-people-dinner-12.jpg",
  "/mood/people-16-people-red-29.jpg",
];

/** Mobile tab bar over a mini masonry; the card auto-drives TabBar: home → updates, pause, back. */
export default function TabBarCard() {
  const [active, setActive] = useState("home");
  const build = useCallback((root: HTMLDivElement) => {
    const tl = gsap.timeline();
    // direction-aware calls: reversing (mouse leave) always lands back on home
    tl.call(() => setActive(tl.reversed() ? "home" : "updates"), [], 0.2)
      .call(() => setActive("home"), [], 2.8)
      .to(root, { duration: 0.01 }, 4.6);
    return tl;
  }, []);
  const { ref, handlers } = useMotionCard(build, { loop: true, restTime: 0, auto: true });
  return (
    <div ref={ref} {...handlers} className={cardRoot} style={{ borderRadius: "var(--radius-img)", background: "var(--neutral-100)" }}>
      <div aria-hidden className="absolute grid grid-cols-2" style={{ inset: "5cqw", gap: "3cqw" }}>
        {[[0, 2], [1, 3]].map((col, c) => (
          <div key={c} className="grid min-h-0" style={{ gap: "3cqw", gridTemplateRows: c ? "1fr 1.4fr" : "1.4fr 1fr" }}>
            {col.map((p) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={p} src={PHOTOS[p]} alt="" draggable={false} className="h-full min-h-0 w-full object-cover" style={{ borderRadius: "var(--radius-img)" }} />
            ))}
          </div>
        ))}
      </div>
      <div className="absolute" style={{ left: "4cqw", right: "4cqw", bottom: "5cqw", ["--tb" as string]: "11cqw" }}>
        <TabBar active={active} decorative />
      </div>
    </div>
  );
}
