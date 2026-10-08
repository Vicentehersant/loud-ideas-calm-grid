"use client";

import gsap from "gsap";
import { PushPin, ShareNetwork, Heart, DownloadSimple } from "@phosphor-icons/react";
import { useMotionCard, cardRoot } from "./useMotionCard";

const ACTIONS = [PushPin, ShareNetwork, Heart, DownloadSimple];

function build(root: HTMLDivElement) {
  const W = root.offsetWidth;
  const H = root.offsetHeight;
  const d = W * 0.22;
  const fx = W * 0.65;
  const fy = H * 0.68;
  const m = d / 2 + 6;
  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
  // fan toward the card center, on an arc around the finger
  const dir = Math.atan2(H / 2 - fy, W / 2 - fx);
  const R = W * 0.4;
  const spread = (Math.PI / 180) * 38;
  const pts = ACTIONS.map((_, i) => {
    const a = dir + (i - 1.5) * spread;
    return { x: clamp(fx + R * Math.cos(a), m, W - m), y: clamp(fy + R * Math.sin(a), m, H - m) };
  });
  // the red pin sits at the arc end nearest the finger's side
  const pinIdx = 0;
  const q = gsap.utils.selector(root);
  const btns = q("[data-btn]");
  const finger = q("[data-finger]");
  const tl = gsap.timeline();
  tl.fromTo(q("[data-photo]"), { scale: 1, filter: "brightness(1) blur(0px)" }, { scale: 1.04, filter: "brightness(0.8) blur(6px)", duration: 0.5, ease: "power2.out" }, 0)
    .fromTo(finger, { opacity: 0, scale: 0.4, x: 0, y: 0 }, { opacity: 1, scale: 1, duration: 0.35, ease: "power2.out" }, 0.1)
    .to(finger, { scale: 1.12, duration: 0.3, yoyo: true, repeat: 3, ease: "sine.inOut" }, 0.45);
  btns.forEach((b, i) => {
    tl.fromTo(b, { x: fx - W / 2, y: fy - H / 2, scale: 0, opacity: 0 }, { x: pts[i].x - W / 2, y: pts[i].y - H / 2, scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.8)" }, 1.0 + i * 0.09);
  });
  tl.to(finger, { x: pts[pinIdx].x - fx, y: pts[pinIdx].y - fy, scale: 0.8, duration: 0.5, ease: "power3.inOut" }, 1.75)
    .to(btns[pinIdx], { scale: 1.3, duration: 0.35, ease: "back.out(2.4)" }, 2.15)
    .fromTo(q("[data-pill]"), { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(2.2)" }, 2.25);
  return tl;
}

export default function PressCard() {
  const { ref, handlers } = useMotionCard(build, { restTime: 2.8, speed: 1.25 });
  return (
    <div ref={ref} {...handlers} className={cardRoot} style={{ borderRadius: "var(--radius-img)" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img data-photo src="/mood/people-13-people-picnic-12.jpg" alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
      <div
        data-finger
        aria-hidden
        className="pointer-events-none absolute opacity-0"
        style={{
          left: "65%",
          top: "68%",
          width: "45cqw",
          height: "45cqw",
          marginLeft: "-22.5cqw",
          marginTop: "-22.5cqw",
          borderRadius: "50%",
          background: "radial-gradient(circle, #c80000 0%, #f84949 30%, #ffaeae 55%, rgba(255,174,174,0) 72%)",
        }}
      />
      {ACTIONS.map((Icon, i) => (
        <div
          key={i}
          data-btn
          aria-hidden
          className={`pointer-events-none absolute grid place-items-center rounded-full opacity-0 ${i === 0 ? "" : "bg-white"}`}
          style={{
            left: "50%",
            top: "50%",
            width: "22cqw",
            height: "22cqw",
            marginLeft: "-11cqw",
            marginTop: "-11cqw",
            background: i === 0 ? "var(--red-500)" : undefined,
            color: i === 0 ? "#fff" : "var(--neutral-900)",
            boxShadow: "0 6px 16px -4px rgba(45,43,43,.35)",
          }}
        >
          <Icon weight={i === 0 ? "fill" : "bold"} style={{ width: "10cqw", height: "10cqw" }} />
        </div>
      ))}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 flex justify-center" style={{ top: "7cqw" }}>
        <span
          data-pill
          className="tonal t-amber whitespace-nowrap rounded-full px-[4cqw] py-[1.5cqw] font-semibold opacity-0"
          style={{ fontSize: "5.6cqw", ["--t-depth" as string]: "3px" }}
        >
          Saved!
        </span>
      </div>
    </div>
  );
}
