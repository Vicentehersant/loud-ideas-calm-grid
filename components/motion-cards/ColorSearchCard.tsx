"use client";

import gsap from "gsap";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { useMotionCard, cardRoot } from "./useMotionCard";

const SWATCHES = ["#E60023", "#F9C76E", "#79CFB5", "#CD89E3", "#2D2B2B", "#ECECEC"];
const PHOTOS = [
  "/mood/people-14-people-red-03.jpg",
  "/mood/people-01-people-dinner-08.jpg",
  "/mood/people-08-people-friends-01.jpg",
  "/mood/people-16-people-red-29.jpg",
];

function build(root: HTMLDivElement) {
  const q = gsap.utils.selector(root);
  const bar = q("[data-bar]");
  const sw = q("[data-sw]");
  const red = q("[data-sw]")[0];
  const barH = root.offsetWidth * 0.14; // pill height
  const tl = gsap.timeline();
  tl.fromTo(bar, { height: barH, borderRadius: 999 }, { height: root.offsetWidth * 0.42, borderRadius: 20, duration: 0.5, ease: "power3.out" }, 0.3)
    .fromTo(q("[data-ph]"), { opacity: 1 }, { opacity: 0.5, duration: 0.3 }, 0.3)
    .fromTo(sw, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, stagger: 0.09, ease: "back.out(1.3)" }, 0.65)
    .fromTo(red, { scale: 1, boxShadow: "0 0 0 0px #fff, 0 0 0 0px #E60023" }, { scale: 1.15, boxShadow: "0 0 0 2px #fff, 0 0 0 5px #E60023", duration: 0.35, ease: "power3.out" }, 1.55)
    .fromTo(q("[data-chip]"), { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.45, ease: "power3.out" }, 1.8)
    .fromTo(q("[data-ph]"), { opacity: 0.5 }, { opacity: 0, duration: 0.2 }, 1.8)
    .fromTo(q("[data-tint]"), { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "power2.out" }, 2.0)
    .fromTo(q("[data-photo]"), { y: 0 }, { y: -4, duration: 0.5, stagger: 0.08, yoyo: true, repeat: 1, ease: "sine.inOut" }, 2.0)
    .to(sw, { scale: 0, opacity: 0, duration: 0.25, stagger: 0.03, ease: "power2.in" }, 2.9)
    .to(bar, { height: barH, borderRadius: 999, duration: 0.45, ease: "power3.inOut" }, 3.1)
    // hold on the pill with the red chip, then reset to the start state
    .to(q("[data-chip]"), { scale: 0, opacity: 0, duration: 0.3, ease: "power2.in" }, 4.1)
    .to(q("[data-tint]"), { opacity: 0, duration: 0.35 }, 4.1)
    .to(q("[data-ph]"), { opacity: 1, duration: 0.3 }, 4.2)
    .to(red, { scale: 1, boxShadow: "0 0 0 0px #fff, 0 0 0 0px #E60023", duration: 0.01 }, 4.2);
  return tl;
}

export default function ColorSearchCard() {
  const { ref, handlers } = useMotionCard(build, { loop: true, restTime: 3.9, speed: 0.7 , auto: true });
  return (
    <div ref={ref} {...handlers} className={cardRoot} style={{ borderRadius: "var(--radius-img)", background: "var(--neutral-100)" }}>
      {/* mini masonry */}
      <div className="absolute grid grid-cols-2" style={{ inset: "24cqw 5cqw 5cqw 5cqw", gap: "3cqw" }}>
        {[[0, 3], [1, 2]].map((col, c) => (
          <div key={c} className="grid min-h-0" style={{ gap: "3cqw", gridTemplateRows: c ? "1fr 1.5fr" : "1.5fr 1fr" }}>
            {col.map((p) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={p} data-photo src={PHOTOS[p]} alt="" draggable={false} className="h-full min-h-0 w-full object-cover" style={{ borderRadius: "var(--radius-img)" }} />
            ))}
          </div>
        ))}
        <div data-tint aria-hidden className="pointer-events-none absolute inset-0 opacity-0" style={{ background: "rgba(230,0,35,.22)", mixBlendMode: "multiply", borderRadius: "var(--radius-img)" }} />
      </div>
      {/* search pill → panel */}
      <div
        data-bar
        aria-hidden
        className="absolute overflow-hidden bg-white"
        style={{ left: "5cqw", right: "5cqw", top: "5cqw", height: "14cqw", borderRadius: 999, boxShadow: "0 6px 16px -6px rgba(45,43,43,.3)" }}
      >
        <div className="absolute left-0 top-0 flex w-full items-center" style={{ height: "14cqw", gap: "2.4cqw", padding: "0 4cqw", color: "var(--neutral-900)" }}>
          <MagnifyingGlass weight="bold" style={{ width: "5.6cqw", height: "5.6cqw", flex: "none" }} />
          <span data-ph className="whitespace-nowrap font-medium" style={{ fontSize: "5cqw", color: "var(--neutral-600)" }}>Search ideas</span>
          <span data-chip className="tonal t-red absolute whitespace-nowrap rounded-full font-semibold opacity-0" style={{ left: "12cqw", top: 0, bottom: 0, margin: "auto 0", height: "fit-content", padding: "0.6cqw 3cqw", fontSize: "4.6cqw", ["--t-depth" as string]: "0px" }}>
            Red
          </span>
        </div>
        <div className="absolute left-0 flex w-full justify-between" style={{ top: "calc(14cqw + 2.5cqw)", padding: "0 5cqw" }}>
          {SWATCHES.map((c, i) => (
            <span
              key={c}
              data-sw
              className="rounded-full"
              style={{ width: "9.4cqw", height: "9.4cqw", opacity: 0, background: c, border: i === 5 ? "2px solid var(--neutral-300)" : "none" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
