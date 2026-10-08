"use client";

import { useCallback, useEffect, useRef } from "react";
import gsap from "gsap";

type Build = (root: HTMLDivElement) => gsap.core.Timeline;
type Opts = {
  /** restart the timeline while the card stays active */
  loop?: boolean;
  /** time (s) of the representative frame shown under prefers-reduced-motion */
  restTime?: number;
  /** playback speed while active (1 = authored timing) */
  speed?: number;
  /** play on its own in a calm loop (with a pause between runs), no hover needed */
  auto?: boolean;
};

// Touch devices have no hover: one shared poll auto-plays the cards that sit near the
// center of the canvas region. Registered only when (hover: none).
const registry = new Set<{ el: HTMLElement; set: (on: boolean) => void }>();
let poll: ReturnType<typeof setInterval> | null = null;
function startPoll() {
  if (poll) return;
  poll = setInterval(() => {
    for (const c of registry) {
      const region = c.el.closest("[role=region]") ?? document.documentElement;
      const rr = region.getBoundingClientRect();
      const r = c.el.getBoundingClientRect();
      const dx = r.left + r.width / 2 - (rr.left + rr.width / 2);
      const dy = r.top + r.height / 2 - (rr.top + rr.height / 2);
      c.set(Math.hypot(dx, dy) < Math.min(rr.width, rr.height) * 0.28);
    }
  }, 350);
}
function stopPoll() {
  if (registry.size === 0 && poll) {
    clearInterval(poll);
    poll = null;
  }
}

/**
 * Lazy per-card GSAP timeline. Built on first activation inside a gsap.context scoped to
 * the card, reversed on leave, reverted on unmount. Debug: `?ui=play` plays every card,
 * `?ui=0.5` freezes every card at 50% of its timeline.
 */
export function useMotionCard(build: Build, { loop = false, restTime, speed = 1, auto = false }: Opts = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const ctxRef = useRef<gsap.Context | null>(null);
  const active = useRef(false);
  const holdUntil = useRef(0);

  const ensure = useCallback(() => {
    const root = ref.current;
    if (!root) return null;
    if (!tlRef.current) {
      ctxRef.current = gsap.context(() => {
        const tl = build(root).pause(0);
        if (loop || auto) tl.eventCallback("onComplete", () => { if (active.current) gsap.delayedCall(auto ? 1.6 : 0, () => active.current && tl.restart()); });
        tlRef.current = tl;
      }, root);
    }
    return tlRef.current;
  }, [build, loop, auto]);

  const set = useCallback(
    (on: boolean) => {
      if (on === active.current) return;
      active.current = on;
      const tl = ensure();
      if (!tl) return;
      if (on) tl.timeScale(speed).play();
      else tl.timeScale(2.6 * speed).reverse();
    },
    [ensure, speed],
  );

  useEffect(() => {
    const root = ref.current!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const q = location.search.match(/[?&]ui=([\w.]+)/)?.[1];
    let entry: { el: HTMLElement; set: (on: boolean) => void } | null = null;

    if (reduce) {
      // representative static frame, no motion
      const tl = ensure();
      tl?.time(restTime ?? tl.duration()).pause();
    } else if (auto && !location.search.includes("static")) {
      // stagger the start so repeated tiles don't move in sync
      gsap.delayedCall(Math.random() * 2.5, () => set(true));
    } else if (q === "play") {
      set(true);
    } else if (q && !Number.isNaN(Number(q))) {
      const tl = ensure();
      tl?.progress(Number(q)).pause();
    } else if (window.matchMedia("(hover: none)").matches) {
      entry = { el: root, set: (on) => (on || Date.now() > holdUntil.current) && set(on) };
      registry.add(entry);
      startPoll();
    }
    return () => {
      if (entry) registry.delete(entry);
      stopPoll();
      tlRef.current?.kill();
      ctxRef.current?.revert();
      tlRef.current = null;
      ctxRef.current = null;
      active.current = false;
    };
  }, [ensure, set, restTime]);

  const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return {
    ref,
    handlers: {
      onMouseEnter: () => !reduced() && set(true),
      onMouseLeave: () => !reduced() && !auto && set(false),
      onTouchStart: () => {
        if (reduced()) return;
        holdUntil.current = Date.now() + 4500;
        set(true);
      },
    },
  };
}

export const cardRoot = "relative h-full w-full overflow-hidden select-none [container-type:size]";
