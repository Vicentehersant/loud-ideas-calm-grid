"use client";

import gsap from "gsap";
import { Check } from "@phosphor-icons/react";
import { useMotionCard, cardRoot } from "./useMotionCard";

const BOARDS = [
  { name: "Picnic ideas", src: "/mood/people-13-people-picnic-12.jpg" },
  { name: "Dinner with friends", src: "/mood/people-02-people-dinner-12.jpg" },
  { name: "Make it together", src: "/mood/people-12-people-making-31.jpg" },
];

function build(root: HTMLDivElement) {
  const q = gsap.utils.selector(root);
  const tl = gsap.timeline();
  tl.fromTo(q("[data-photo]"), { scale: 1, filter: "brightness(1)" }, { scale: 0.97, filter: "brightness(0.8)", duration: 0.4, ease: "power2.out" }, 0)
    .fromTo(q("[data-sheet]"), { bottom: "-100%" }, { bottom: "0%", duration: 0.55, ease: "power3.out" }, 0.1)
    .fromTo(q("[data-row]"), { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.35, stagger: 0.08, ease: "power2.out" }, 0.4)
    .fromTo(q("[data-check]"), { scale: 0 }, { scale: 1, duration: 0.35, ease: "back.out(3)" }, 0.95)
    .fromTo(q("[data-pill]"), { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(2.2)" }, 1.05);
  return tl;
}

export default function BoardSaveCard() {
  const { ref, handlers } = useMotionCard(build, { restTime: 1.6 });
  return (
    <div ref={ref} {...handlers} className={cardRoot} style={{ borderRadius: "var(--radius-img)" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img data-photo src="/mood/people-10-people-friends-14.jpg" alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
      <div
        data-sheet
        aria-hidden
        className="absolute inset-x-0 bg-white"
        style={{ bottom: "-100%", padding: "4cqw 4cqw 4.5cqw", borderRadius: "5cqw 5cqw 0 0", boxShadow: "0 -8px 24px -8px rgba(45,43,43,.3)" }}
      >
        <p className="font-semibold" style={{ fontSize: "4.4cqw", color: "var(--neutral-600)", marginBottom: "2.4cqw" }}>Save to board</p>
        <div className="flex flex-col" style={{ gap: "2.4cqw" }}>
          {BOARDS.map((b, i) => (
            <div key={b.name} data-row className="flex items-center" style={{ gap: "3cqw" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={b.src} alt="" draggable={false} className="rounded-full object-cover" style={{ width: "10.5cqw", height: "10.5cqw", flex: "none" }} />
              <span className="min-w-0 flex-1 truncate font-medium" style={{ fontSize: "5cqw", color: "var(--neutral-900)" }}>{b.name}</span>
              {i === 0 && (
                <span data-check className="grid place-items-center rounded-full" style={{ width: "7cqw", height: "7cqw", background: "var(--red-500)", color: "#fff" }}>
                  <Check weight="bold" style={{ width: "4.2cqw", height: "4.2cqw" }} />
                </span>
              )}
            </div>
          ))}
        </div>
        <span
          data-pill
          className="tonal t-violet absolute whitespace-nowrap rounded-full font-semibold opacity-0"
          style={{ right: "4cqw", top: "-4.2cqw", padding: "0.8cqw 3.2cqw", fontSize: "4.4cqw", rotate: "-3deg", ["--t-depth" as string]: "3px" }}
        >
          @maya saved this
        </span>
      </div>
    </div>
  );
}
