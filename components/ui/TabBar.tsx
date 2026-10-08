"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { House, Compass, Plus, Bell, User, MagnifyingGlass, type Icon } from "@phosphor-icons/react";

gsap.registerPlugin(CustomEase);
const EASE = CustomEase.create("tabStretch", "M0,0 C0.6,0 0.15,1 1,1");

export type TabItem = { key: string; label: string; icon: Icon };

export const DEFAULT_TABS: TabItem[] = [
  { key: "home", label: "Home", icon: House },
  { key: "explore", label: "Explore", icon: Compass },
  { key: "create", label: "Create", icon: Plus },
  { key: "updates", label: "Updates", icon: Bell },
  { key: "profile", label: "Profile", icon: User },
];

const INK = "var(--neutral-900)";
const ON = "var(--neutral-0)";

/**
 * Pinterest V1 mobile tab bar: white floating pill + separate circular search button.
 *
 * Motion spec (active indicator, a dark #2D2B2B circle):
 * 1. STRETCH 0.7s: the circle stretches into a full-radius pill from the current tab to the
 *    target tab (width = distance + circle size), opacity 1 → 0.35.
 * 2. CONTRACT 0.7s: the pill contracts into a circle at the target tab, opacity → 1.
 * 3. Icon colors cross-fade in the last 0.5s (old active → #2D2B2B, new → white).
 * Ease: cubic-bezier(.6,0,.15,1) via CustomEase. prefers-reduced-motion: instant swap.
 *
 * Size scales with the `--tb` CSS variable (circle diameter, default 44px) so the bar can
 * live inside container-query cards (e.g. `--tb: 11cqw`).
 */
export default function TabBar({
  items = DEFAULT_TABS,
  active,
  onChange,
  className = "",
  decorative = false,
}: {
  items?: TabItem[];
  active: string;
  onChange?: (key: string) => void;
  className?: string;
  /** render as a non-interactive illustration (aria-hidden, no focus stops) */
  decorative?: boolean;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const indRef = useRef<HTMLSpanElement>(null);
  const prev = useRef(active);
  const tl = useRef<gsap.core.Timeline | null>(null);

  const btn = (k: string) => barRef.current?.querySelector<HTMLElement>(`[data-tab="${k}"]`) ?? null;

  // place the indicator on first paint (no motion)
  useLayoutEffect(() => {
    const b = btn(active);
    if (b && indRef.current) gsap.set(indRef.current, { left: b.offsetLeft, width: b.offsetWidth, opacity: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const from = prev.current;
    prev.current = active;
    const ind = indRef.current;
    const a = btn(from);
    const b = btn(active);
    if (!ind || !b) return;
    tl.current?.kill();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const iconOf = (el: HTMLElement | null) => el?.querySelector("[data-icon]") ?? null;
    if (!a || from === active || reduce) {
      gsap.set(ind, { left: b.offsetLeft, width: b.offsetWidth, opacity: 1 });
      if (a && a !== b) gsap.set(iconOf(a), { color: INK });
      gsap.set(iconOf(b), { color: ON });
      return;
    }
    const s = b.offsetWidth;
    const x0 = a.offsetLeft;
    const x1 = b.offsetLeft;
    try {
      tl.current = gsap
        .timeline()
        .to(ind, { left: Math.min(x0, x1), width: Math.abs(x1 - x0) + s, opacity: 0.35, duration: 0.7, ease: EASE })
        .to(ind, { left: x1, width: s, opacity: 1, duration: 0.7, ease: EASE })
        .to(iconOf(a), { color: INK, duration: 0.5, ease: "power1.inOut" }, 0.9)
        .to(iconOf(b), { color: ON, duration: 0.5, ease: "power1.inOut" }, 0.9);
    } catch {
      gsap.set(ind, { left: x1, width: s, opacity: 1 });
    }
    return () => {
      tl.current?.kill();
    };
  }, [active]);

  return (
    <div
      className={`flex items-center ${className}`}
      style={{ gap: "calc(var(--tb, 44px) * 0.2)" }}
      aria-hidden={decorative || undefined}
    >
      <nav
        ref={barRef}
        aria-label={decorative ? undefined : "Main"}
        className="relative flex flex-1 items-center justify-between rounded-full bg-white"
        style={{ padding: "calc(var(--tb, 44px) * 0.14)", boxShadow: "0 6px 16px -6px rgba(45,43,43,.3)" }}
      >
        <span ref={indRef} aria-hidden className="absolute rounded-full" style={{ top: "calc(var(--tb, 44px) * 0.14)", height: "var(--tb, 44px)", background: INK }} />
        {items.map(({ key, label, icon: I }) => (
          <button
            key={key}
            type="button"
            data-tab={key}
            tabIndex={decorative ? -1 : undefined}
            aria-label={label}
            aria-current={active === key ? "page" : undefined}
            onClick={() => onChange?.(key)}
            className="relative grid place-items-center rounded-full focus-visible:outline-offset-2"
            style={{ width: "var(--tb, 44px)", height: "var(--tb, 44px)" }}
          >
            <span data-icon className="grid place-items-center" style={{ color: active === key ? ON : INK }}>
              <I weight="regular" style={{ width: "calc(var(--tb, 44px) * 0.5)", height: "calc(var(--tb, 44px) * 0.5)" }} />
            </span>
          </button>
        ))}
      </nav>
      <button
        type="button"
        tabIndex={decorative ? -1 : undefined}
        aria-label="Search"
        className="grid flex-none place-items-center rounded-full bg-white"
        style={{ width: "calc(var(--tb, 44px) * 1.28)", height: "calc(var(--tb, 44px) * 1.28)", color: INK, boxShadow: "0 6px 16px -6px rgba(45,43,43,.3)" }}
      >
        <MagnifyingGlass weight="regular" style={{ width: "calc(var(--tb, 44px) * 0.5)", height: "calc(var(--tb, 44px) * 0.5)" }} />
      </button>
    </div>
  );
}
