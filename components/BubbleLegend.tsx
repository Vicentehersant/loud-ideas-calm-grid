"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Info, X } from "@phosphor-icons/react";
import { BUBBLE_MEANING } from "./MoodCanvas";

/** Collapsible legend: an info button with the icon set; click opens, X / outside / Esc closes. */
export default function BubbleLegend({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce && panel.current) {
      gsap.fromTo(panel.current, { opacity: 0, y: 12, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "expo.out" });
      gsap.fromTo(panel.current.querySelectorAll("li"), { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.4, stagger: 0.04, ease: "power3.out", delay: 0.05 });
    }
    const outside = (e: PointerEvent) => { if (root.current && !root.current.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", outside, true);
    window.addEventListener("keydown", esc);
    return () => { document.removeEventListener("pointerdown", outside, true); window.removeEventListener("keydown", esc); };
  }, [open]);

  const chip = (m: (typeof BUBBLE_MEANING)[number], size: number) => {
    const Icon = m.icon;
    return (
      <span className={`tonal ${m.tone} grid shrink-0 place-items-center rounded-full`} style={{ width: size, height: size, ["--t-depth" as string]: "2px" }}>
        <Icon size={Math.round(size * 0.5)} weight="fill" style={m.iconColor ? { color: m.iconColor } : undefined} />
      </span>
    );
  };

  return (
    <div ref={root} data-ui className={`absolute z-20 ${className}`} onPointerDown={(e) => e.stopPropagation()}>
      {open ? (
        <div ref={panel} id="bubble-legend" role="dialog" aria-label="What each bubble means" className="relative w-[min(300px,80vw)] rounded-[var(--radius-card)] bg-card/95 p-5 shadow-[0_20px_50px_-24px_rgba(45,43,43,.5)] backdrop-blur-sm">
          <button onClick={() => setOpen(false)} aria-label="Close legend" className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-[var(--neutral-100)] text-ink hover:bg-[var(--neutral-200)]">
            <X size={16} weight="bold" />
          </button>
          <p className="mb-3 pr-8 text-xs font-semibold uppercase tracking-[0.16em] text-ink-3">Every bubble is an action</p>
          <ul className="flex flex-col gap-2.5">
            {BUBBLE_MEANING.map((m) => (
              <li key={m.label} className="flex items-center gap-3 text-base font-semibold">{chip(m, 32)}{m.label}</li>
            ))}
            <li className="mt-1 flex items-center gap-3 text-base font-semibold">
              <span className="tonal t-violet rounded-full px-2 py-0.5 text-xs" style={{ ["--t-depth" as string]: "2px" }}>@name</span>Community comment
            </li>
          </ul>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} aria-expanded={false} aria-controls="bubble-legend" aria-label="Show what each bubble means"
          className="tonal t-grey flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3" style={{ ["--t-depth" as string]: "3px" }}>
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--neutral-900)] text-[var(--neutral-0)]"><Info size={18} weight="bold" /></span>
          <span className="flex">
            {BUBBLE_MEANING.map((m, k) => <span key={m.label} style={{ marginLeft: k ? -6 : 0 }}>{chip(m, 24)}</span>)}
          </span>
        </button>
      )}
    </div>
  );
}
