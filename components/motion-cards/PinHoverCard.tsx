"use client";

import gsap from "gsap";
import { CaretDown, ShareNetwork, DotsThree } from "@phosphor-icons/react";
import { useMotionCard, cardRoot } from "./useMotionCard";

function build(root: HTMLDivElement) {
  const q = gsap.utils.selector(root);
  return gsap
    .timeline()
    .fromTo(q("[data-scrim]"), { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" }, 0)
    .fromTo(q("[data-ctl]"), { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.05, ease: "power2.out" }, 0.05);
}

/** V1 pin hover: Save pill, board chip, share + more. */
export default function PinHoverCard() {
  const { ref, handlers } = useMotionCard(build, { restTime: 1 });
  const round = { width: "13cqw", height: "13cqw", boxShadow: "0 6px 16px -6px rgba(45,43,43,.3)" };
  return (
    <div ref={ref} {...handlers} className={cardRoot} style={{ borderRadius: "var(--radius-img)" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/mood/people-15-people-red-11.jpg" alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
      <div data-scrim aria-hidden className="absolute inset-0 opacity-0" style={{ background: "rgba(45,43,43,.28)" }} />
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ padding: "5cqw" }}>
        <span data-ctl className="absolute flex items-center rounded-full bg-white font-medium opacity-0" style={{ right: "5cqw", top: "5cqw", padding: "2cqw 3.6cqw", gap: "1cqw", fontSize: "4.6cqw", color: "var(--neutral-900)" }}>
          Picnic ideas <CaretDown weight="bold" style={{ width: "3.6cqw", height: "3.6cqw" }} />
        </span>
        <span data-ctl className="absolute rounded-full font-semibold text-white opacity-0" style={{ left: "5cqw", bottom: "5cqw", padding: "2.6cqw 5cqw", fontSize: "5cqw", background: "var(--red-500)" }}>
          Save
        </span>
        <span data-ctl className="absolute grid place-items-center rounded-full bg-white opacity-0" style={{ ...round, right: "21cqw", bottom: "5cqw", color: "var(--neutral-900)" }}>
          <ShareNetwork weight="bold" style={{ width: "6cqw", height: "6cqw" }} />
        </span>
        <span data-ctl className="absolute grid place-items-center rounded-full bg-white opacity-0" style={{ ...round, right: "5cqw", bottom: "5cqw", color: "var(--neutral-900)" }}>
          <DotsThree weight="bold" style={{ width: "6cqw", height: "6cqw" }} />
        </span>
      </div>
    </div>
  );
}
