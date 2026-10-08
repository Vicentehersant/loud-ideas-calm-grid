"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { MagnifyingGlassMinus, MagnifyingGlassPlus, X, ArrowsOut } from "@phosphor-icons/react";
import data from "@/lib/process.json";

type Img = { src: string; w: number; h: number };
type GroupKey = "audit" | "color" | "type" | "graphics";

export const GROUPS: { key: GroupKey; title: string; sub: string; tone: string; cols: number; at: [number, number] }[] = [
  { key: "audit", title: "Brand & UI audit", sub: "Where the insights came from", tone: "t-grey", cols: 4, at: [0, 0] },
  { key: "color", title: "Colorimetry", sub: "Red, white and warm greys", tone: "t-red", cols: 3, at: [1950, 120] },
  { key: "type", title: "Typography", sub: "Three type systems, one scale", tone: "t-violet", cols: 4, at: [80, 1350] },
  { key: "graphics", title: "Graphic styles", sub: "Three visual directions", tone: "t-green", cols: 5, at: [1900, 1250] },
];

const COL_W = 340;
const GAP = 16;
const HEAD_H = 300;

type Placed = { x: number; y: number; w: number; h: number; src: string };

function layout() {
  const groups = GROUPS.map((g) => {
    const imgs = (data as Record<string, Img[]>)[g.key];
    const colH = Array(g.cols).fill(HEAD_H + GAP);
    const items: Placed[] = [];
    imgs.forEach((im) => {
      // masonry: drop each piece into the shortest column
      const c = colH.indexOf(Math.min(...colH));
      const h = Math.round((COL_W * im.h) / im.w);
      items.push({ x: g.at[0] + c * (COL_W + GAP), y: g.at[1] + colH[c], w: COL_W, h, src: im.src });
      colH[c] += h + GAP;
    });
    const w = g.cols * (COL_W + GAP) - GAP;
    const h = Math.max(...colH);
    return { ...g, items, w, h, cx: g.at[0] + w / 2, cy: g.at[1] + h / 2 };
  });
  const maxX = Math.max(...groups.map((g) => g.at[0] + g.w));
  const maxY = Math.max(...groups.map((g) => g.at[1] + g.h));
  return { groups, W: maxX, H: maxY };
}

const MAP = 200; // minimap diameter

export default function ProcessCanvas() {
  const { groups, W, H } = useMemo(layout, []);
  const wrap = useRef<HTMLDivElement>(null);
  const plane = useRef<HTMLDivElement>(null);
  const cam = useRef({ x: W / 2, y: H / 2, z: 0.2 });
  const viewRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<GroupKey | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [zUi, setZUi] = useState(0.2);
  const lightRef = useRef<HTMLDivElement>(null);

  const fitZ = () => {
    const el = wrap.current!;
    return Math.min(el.clientWidth / (W + 250), el.clientHeight / (H + 250));
  };
  const flyTo = (x: number, y: number, z: number) => {
    gsap.to(cam.current, { x, y, z, duration: 1.2, ease: "power3.inOut", onUpdate: () => setZUi(cam.current.z) });
  };
  const flyToGroup = (k: GroupKey) => {
    const g = groups.find((g) => g.key === k)!;
    const el = wrap.current!;
    const z = Math.min(1, Math.min(el.clientWidth / (g.w + 200), el.clientHeight / (g.h + 200)));
    flyTo(g.cx, g.cy, z);
    history.replaceState(null, "", `#${k}`);
  };
  const zoomBy = (f: number) => {
    const z = Math.min(2, Math.max(fitZ() * 0.8, cam.current.z * f));
    gsap.to(cam.current, { z, duration: 0.4, ease: "power2.out", onUpdate: () => setZUi(cam.current.z) });
  };

  useEffect(() => {
    const el = wrap.current!;
    const pl = plane.current!;
    const c = cam.current;
    c.z = fitZ();
    setZUi(c.z);

    const render = () => {
      const vw = el.clientWidth, vh = el.clientHeight;
      pl.style.transform = `translate3d(${vw / 2 - c.x * c.z}px, ${vh / 2 - c.y * c.z}px, 0) scale(${c.z})`;
      // minimap viewport rectangle + active group = nearest center
      const s = MAP / Math.max(W, H);
      const v = viewRef.current;
      if (v) {
        const rw = (vw / c.z) * s, rh = (vh / c.z) * s;
        v.style.width = `${Math.min(MAP, rw)}px`;
        v.style.height = `${Math.min(MAP, rh)}px`;
        v.style.transform = `translate(${c.x * s - Math.min(MAP, rw) / 2}px, ${c.y * s - Math.min(MAP, rh) / 2}px)`;
      }
      let best: GroupKey | null = null, bd = Infinity;
      groups.forEach((g) => {
        const d = Math.hypot(g.cx - c.x, g.cy - c.y);
        if (d < bd) { bd = d; best = g.key; }
      });
      const near = c.z > fitZ() * 1.4 ? best : null;
      setActive((a) => (a === near ? a : near));
    };
    gsap.ticker.add(render);

    // deep link: /process#color
    const h = location.hash.slice(1) as GroupKey;
    if (groups.some((g) => g.key === h)) setTimeout(() => flyToGroup(h), 500);

    let drag = false, moved = 0, last = { x: 0, y: 0 };
    const pts = new Map<number, { x: number; y: number }>();
    let pinch0 = 0;
    const down = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("[data-ui]")) return;
      gsap.killTweensOf(c);
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch0 = Math.hypot(a.x - b.x, a.y - b.y); }
      drag = true; moved = 0; last = { x: e.clientX, y: e.clientY };
      el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!drag || !pts.has(e.pointerId)) return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 2) {
        const [a, b] = [...pts.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinch0) { c.z = Math.min(2, Math.max(fitZ() * 0.8, c.z * (d / pinch0))); setZUi(c.z); }
        pinch0 = d; moved += 10; return;
      }
      const dx = e.clientX - last.x, dy = e.clientY - last.y;
      moved += Math.abs(dx) + Math.abs(dy);
      c.x -= dx / c.z; c.y -= dy / c.z;
      last = { x: e.clientX, y: e.clientY };
    };
    const up = (e: PointerEvent) => {
      pts.delete(e.pointerId);
      if (pts.size) return;
      drag = false; pinch0 = 0;
      if (moved < 6) {
        const img = document.elementsFromPoint(e.clientX, e.clientY).find((n) => n instanceof HTMLImageElement && n.dataset.pc) as HTMLImageElement | undefined;
        if (img && c.z >= 0.45) setOpen(img.getAttribute("src"));
        else if (img) {
          // too far: zoom toward what was clicked first
          const r = el.getBoundingClientRect();
          flyTo(c.x + (e.clientX - r.left - r.width / 2) / c.z, c.y + (e.clientY - r.top - r.height / 2) / c.z, 0.6);
        }
      }
    };
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      gsap.killTweensOf(c);
      if (e.ctrlKey || e.metaKey) { c.z = Math.min(2, Math.max(fitZ() * 0.8, c.z * Math.exp(-e.deltaY * 0.01))); setZUi(c.z); }
      else { c.x += e.deltaX / c.z; c.y += e.deltaY / c.z; }
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("wheel", wheel, { passive: false });
    const ctx = gsap.context(() => {
      if (location.search.includes("static")) return;
      gsap.from(".pc-head", { scale: 0.6, opacity: 0, duration: 0.9, stagger: 0.12, ease: "back.out(1.8)" });
      gsap.from(".pc-map-bubble", { scale: 0, duration: 0.6, delay: 0.5, stagger: 0.08, ease: "back.out(2.5)" });
    }, el);
    return () => {
      gsap.ticker.remove(render);
      ctx.revert();
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("wheel", wheel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!open) return;
    gsap.fromTo(lightRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    gsap.fromTo(lightRef.current!.querySelector("img"), { scale: 0.92, y: 24 }, { scale: 1, y: 0, duration: 0.55, ease: "power3.out" });
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open]);

  const s = MAP / Math.max(W, H);

  return (
    <div ref={wrap} className="relative h-dvh w-full touch-none select-none overflow-hidden bg-bg" style={{ cursor: "grab" }} role="region" aria-label="Process canvas: audit, colorimetry, typography and graphic style explorations. Drag to move, zoom to read, tap a piece to open it.">
      <div ref={plane} className="absolute left-0 top-0 origin-top-left will-change-transform">
        {/* white circular gradients live in their own bottom layer so they never cover another section */}
        {groups.map((g) => (
          <div key={`glow-${g.key}`}>
            <div
              className="pointer-events-none absolute rounded-full"
              style={{
                left: g.cx - Math.max(g.w, g.h) * 0.85,
                top: g.cy - Math.max(g.w, g.h) * 0.85,
                width: Math.max(g.w, g.h) * 1.7,
                height: Math.max(g.w, g.h) * 1.7,
                background: "radial-gradient(circle, #ffffff 0%, rgba(255,255,255,.85) 40%, rgba(255,255,255,0) 70%)",
              }}
              aria-hidden
            />
          </div>
        ))}
        {groups.map((g) => (
          <section key={g.key} aria-label={g.title}>
            <div className={`pc-head tonal ${g.tone} absolute flex flex-col justify-end rounded-[28px] p-8`} style={{ left: g.at[0], top: g.at[1], width: COL_W * 2 + GAP, height: HEAD_H - 20, ["--t-depth" as string]: "10px" }}>
              <p className="text-2xl font-semibold opacity-80">0{GROUPS.indexOf(GROUPS.find((x) => x.key === g.key)!) + 1}</p>
              <h2 className="text-[88px] font-semibold leading-none tracking-tight">{g.title}</h2>
            </div>
            <p className="absolute text-3xl text-ink-3" style={{ left: g.at[0] + COL_W * 2 + GAP * 3, top: g.at[1] + HEAD_H - 80, width: COL_W * 2 }}>{g.sub}</p>
            {g.items.map((it, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} data-pc="1" src={it.src} alt={`${g.title} ${i + 1}`} draggable={false} className="absolute max-w-none bg-card object-cover shadow-[0_10px_30px_-18px_rgba(45,43,43,.5)]" style={{ left: it.x, top: it.y, width: it.w, height: it.h, borderRadius: "var(--radius-img)" }} />
            ))}
          </section>
        ))}
      </div>

      {/* top bar */}
      <div data-ui className="absolute inset-x-0 top-0 flex items-center justify-between gap-3 p-4 md:p-6">
        <Link href="/" className="tonal t-red rounded-full px-4 py-2 text-sm font-semibold" style={{ ["--t-depth" as string]: "3px" }}>Loud Ideas, Calm Grid</Link>
        <span className="tonal-flat t-grey hidden rounded-full px-4 py-2 text-sm font-medium md:inline">Process · {active ? GROUPS.find((g) => g.key === active)!.title : "overview"}</span>
      </div>

      {/* map: bubbles mark each section, over a white circular gradient */}
      <nav data-ui aria-label="Process map" className="absolute bottom-4 right-4 md:bottom-8 md:right-8">
        <div className="relative grid place-items-center rounded-full" style={{ width: MAP + 90, height: MAP + 90, background: "radial-gradient(circle, #ffffff 0%, rgba(255,255,255,.95) 45%, rgba(255,255,255,0) 72%)" }}>
          <div className="relative" style={{ width: MAP, height: MAP * (H / Math.max(W, H)) }}>
            <div ref={viewRef} className="pointer-events-none absolute left-0 top-0 rounded-md border-2 border-[var(--red-300)]" aria-hidden />
            {groups.map((g) => {
              const on = active === g.key;
              return (
                <button
                  key={g.key}
                  onClick={() => flyToGroup(g.key)}
                  aria-label={`Go to ${g.title}`}
                  aria-current={on}
                  className={`pc-map-bubble group tonal ${g.tone} absolute grid place-items-center rounded-full transition-transform duration-300 ${on ? "scale-125" : "hover:scale-110"}`}
                  style={{ left: g.cx * s - 22, top: g.cy * s - 22, width: 44, height: 44, ["--t-depth" as string]: "3px" }}
                >
                  <span className="text-sm font-bold">0{GROUPS.indexOf(GROUPS.find((x) => x.key === g.key)!) + 1}</span>
                  <span className={`tonal-flat t-grey pointer-events-none absolute top-full mt-2 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold transition-opacity ${on ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>{g.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* zoom */}
      <div data-ui className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 md:bottom-8">
        <button onClick={() => zoomBy(1 / 1.4)} aria-label="Zoom out" className="tonal t-grey grid h-11 w-11 place-items-center rounded-full" style={{ ["--t-depth" as string]: "3px" }}><MagnifyingGlassMinus size={20} weight="bold" /></button>
        <button onClick={() => { flyTo(W / 2, H / 2, fitZ()); history.replaceState(null, "", "#"); }} aria-label="See everything" className="tonal t-grey grid h-11 w-11 place-items-center rounded-full" style={{ ["--t-depth" as string]: "3px" }}><ArrowsOut size={20} weight="bold" /></button>
        <span className="tonal-flat t-grey hidden rounded-full px-4 py-2 text-sm font-medium sm:inline">{zUi < 0.45 ? "Zoom in to open a piece" : "Tap a piece to open"}</span>
        <button onClick={() => zoomBy(1.4)} aria-label="Zoom in" className="tonal t-red grid h-11 w-11 place-items-center rounded-full" style={{ ["--t-depth" as string]: "3px" }}><MagnifyingGlassPlus size={20} weight="bold" /></button>
      </div>

      {open && (
        <div data-ui ref={lightRef} role="dialog" aria-label="Preview" onClick={() => setOpen(null)} className="absolute inset-0 z-20 grid place-items-center bg-[var(--neutral-0)] p-6 md:p-16">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={open} alt="" className="max-h-full max-w-full object-contain shadow-[0_30px_80px_-30px_rgba(45,43,43,.45)]" style={{ borderRadius: "var(--radius-img)" }} />
          <button onClick={() => setOpen(null)} aria-label="Close" className="tonal t-grey absolute right-5 top-5 grid h-12 w-12 place-items-center rounded-full md:right-8 md:top-8" style={{ ["--t-depth" as string]: "3px" }}><X size={20} weight="bold" /></button>
        </div>
      )}
    </div>
  );
}
