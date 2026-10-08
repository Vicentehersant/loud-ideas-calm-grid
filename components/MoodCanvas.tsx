"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { MagnifyingGlassPlus, MagnifyingGlassMinus, X, Heart, PushPin, Star as StarIcon, UsersThree, ChatCircle, ShareNetwork, DownloadSimple } from "@phosphor-icons/react";
import images from "@/lib/images.json";
import PressCard from "./motion-cards/PressCard";
import ColorSearchCard from "./motion-cards/ColorSearchCard";
import BoardSaveCard from "./motion-cards/BoardSaveCard";
import TypeBlockCard from "./motion-cards/TypeBlockCard";
import TabBarCard from "./motion-cards/TabBarCard";
import PinHoverCard from "./motion-cards/PinHoverCard";

type Img = { src: string; w: number; h: number; kind: string };
type Item =
  | { type: "img"; x: number; y: number; w: number; h: number; src: string; act?: Act; sim?: "hover" | "press"; d?: number }
  | { type: "ui"; x: number; y: number; w: number; h: number; kind: UiKind };
type UiKind = "press" | "colorsearch" | "board" | "type" | "tabbar" | "pinhover" | "ideas" | "palette";
type Act = "heart" | "made" | "group" | "pin";
type Bubble = { x: number; y: number; r: number; variant: number };

const COLS = 8;
const COL_W = 250;
const GAP = 14;
const TILE_H = 2200;
const TILE_W = COLS * (COL_W + GAP);
const GRID = [0, 1, 2, 3, 4];
const MIN_Z = 0.35;
const OPEN_Z = 0.8;

// Four-actions system: each action sits on a specific photo with its pill (never floating).
const ACTS: Record<string, Act> = {
  "/mood/art-studio-14.jpg": "heart",
  "/mood/people-12-people-making-31.jpg": "made",
  "/mood/people-11-people-friends-21.jpg": "group",
  "/mood/art-sketch-03.jpg": "pin",
};

// "UI + motion" cards: one per column, spread across the tile (at = fraction of TILE_H).
const UI_SLOTS: { col: number; at: number; kind: UiKind; ratio: number }[] = [
  { col: 0, at: 0.62, kind: "pinhover", ratio: 1.3 },
  { col: 1, at: 0.14, kind: "press", ratio: 1.3 },
  { col: 2, at: 0.05, kind: "type", ratio: 1.45 },
  { col: 3, at: 0.5, kind: "colorsearch", ratio: 1.8 },
  { col: 5, at: 0.3, kind: "board", ratio: 1.25 },
  { col: 6, at: 0.78, kind: "tabbar", ratio: 1.9 },
  { col: 4, at: 0.4, kind: "ideas", ratio: 1.62 },
  { col: 7, at: 0.2, kind: "palette", ratio: 1.48 },
];
const UI_CARDS: Record<UiKind, () => React.JSX.Element> = {
  press: PressCard,
  colorsearch: ColorSearchCard,
  board: BoardSaveCard,
  type: TypeBlockCard,
  tabbar: TabBarCard,
  pinhover: PinHoverCard,
  ideas: IdeasTypeCard,
  palette: PaletteCard,
};

// Deterministic PRNG so server and client agree.
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

function buildTile() {
  const r = rng(7);
  const imgs = images as Img[];
  // art carries the same weight as people photos
  const people = imgs.filter((i) => i.kind === "people" || i.kind === "art");
  const brand = imgs.filter((i) => i.kind === "brand");
  // ~75% people / art / UGC, the app is about people; brand graphics are accents.
  const pool: Img[] = [];
  let p = 0,
    b = 0;
  for (let i = 0; i < 80; i++) {
    if (i % 4 < 3) pool.push(people[p++ % people.length]);
    else pool.push(brand[b++ % brand.length]);
  }
  const items: Item[] = [];
  const ends: number[][] = [];
  let k = Math.floor(r() * pool.length);
  let simN = 0;
  for (let c = 0; c < COLS; c++) {
    const x = c * (COL_W + GAP);
    let y = 0;
    const colEnds: number[] = [];
    let ui = UI_SLOTS.find((u) => u.col === c);
    while (y < TILE_H) {
      let h: number;
      const remaining = TILE_H - y;
      if (ui && y >= ui.at * TILE_H) {
        h = Math.round(COL_W * ui.ratio);
        if (remaining - h - GAP < 160) h = remaining - GAP;
        items.push({ type: "ui", x, y, w: COL_W, h, kind: ui.kind });
        ui = undefined;
        y += h + GAP;
        if (y < TILE_H) colEnds.push(y - GAP / 2);
        continue;
      }
      const im = pool[k % pool.length];
      h = Math.round(Math.min(1.55, Math.max(0.75, im.h / im.w)) * COL_W);
      // stretch last item so every column ends exactly at TILE_H (seamless wrap)
      if (remaining - h - GAP < 160) h = remaining - GAP;
      const src = pool[k++ % pool.length].src;
      // simulated interactions: some cards show a desktop hover, others a phone press
      const free = !ACTS[src] && !COMMENTS[src];
      const sim = free ? (simN++ % 11 === 4 ? "hover" : simN % 17 === 9 ? "press" : undefined) : undefined;
      items.push({ type: "img", x, y, w: COL_W, h, src, act: ACTS[src], sim, d: sim ? (simN * 1.7) % 6 : undefined });
      y += h + GAP;
      if (y < TILE_H) colEnds.push(y - GAP / 2);
    }
    ends.push(colEnds);
  }
  // Bubbles only at T-junctions: an item edge in column c that lands mid-item in
  // column c+1 → the point touches 3 images.
  const bubbles: Bubble[] = [];
  let n = 0;
  for (let c = 0; c < COLS; c++) {
    const next = ends[(c + 1) % COLS];
    for (const y of ends[c]) {
      const clear = next.every((e) => Math.abs(e - y) > 70);
      if (!clear || y < 90 || y > TILE_H - 90) continue;
      if (n++ % 3 === 2) continue; // keep it airy
      bubbles.push({
        x: (c + 1) * (COL_W + GAP) - GAP / 2,
        y,
        r: 20 + Math.round(r() * 6),
        variant: Math.floor(r() * 8),
      });
    }
  }
  return { items, bubbles };
}

// T-junction bubbles: every bubble is one action of the system, never decoration.
// red = save (the only red action) · white = love · green = made it · amber = group · violet = comment.
export const BUBBLE_MEANING = [
  { label: "Save", tone: "t-red", icon: PushPin, iconColor: undefined },
  { label: "Love", tone: "t-grey", icon: Heart, iconColor: "var(--red-500)" },
  { label: "Friends loved it", tone: "t-violet", icon: UsersThree, iconColor: undefined },
  { label: "Made it together", tone: "t-green", icon: StarIcon, iconColor: undefined },
  { label: "Saved together", tone: "t-amber", icon: StarIcon, iconColor: undefined },
] as const;

// Community comments anchored to their photo (Figma 306:1398): who did what with this idea.
type Corner = "tl" | "tr" | "bl" | "br";
const COMMENTS: Record<string, { name: string; msg: string; tone: string; pos: Corner }> = {
  "/mood/people-13-people-picnic-12.jpg": { name: "@maya", msg: "saved it for her picnic", tone: "t-violet", pos: "tl" },
  "/mood/people-02-people-dinner-12.jpg": { name: "@sam", msg: "added 4 friends", tone: "t-amber", pos: "br" },
  "/mood/people-17-people-workshop-20.jpg": { name: "@leo", msg: "made it this weekend", tone: "t-green", pos: "bl" },
  "/mood/people-06-people-film-12.jpg": { name: "@ana", msg: "our next movie night", tone: "t-red-soft", pos: "tr" },
  "/mood/art-sketch-13.jpg": { name: "@kai", msg: "trying this tonight", tone: "t-violet", pos: "br" },
};

export default function MoodCanvas({ embedded = false }: { embedded?: boolean }) {
  const { items, bubbles } = useMemo(() => buildTile(), []);
  const wrapRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const zoomTarget = useRef(1);
  const [open, setOpen] = useState<string | null>(null);
  const [zoomUi, setZoomUi] = useState(1);
  const lightRef = useRef<HTMLDivElement>(null);

  const zoomBy = (f: number) => {
    zoomTarget.current = Math.min(2.2, Math.max(MIN_Z, zoomTarget.current * f));
    setZoomUi(zoomTarget.current);
  };

  useEffect(() => {
    const wrap = wrapRef.current!;
    const plane = planeRef.current!;
    const zl = zoomRef.current!;
    const pos = { x: -TILE_W * 0.3, y: -TILE_H * 0.2 };
    const vel = { x: -0.25, y: -0.15 }; // gentle idle drift
    let z = 1;
    let dragging = false;
    let moved = 0;
    let last = { x: 0, y: 0 };
    const pts = new Map<number, { x: number; y: number }>();
    let pinch0 = 0;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const render = () => {
      const x = ((pos.x % TILE_W) + TILE_W) % TILE_W;
      const y = ((pos.y % TILE_H) + TILE_H) % TILE_H;
      plane.style.transform = `translate3d(${x - 2 * TILE_W}px, ${y - 2 * TILE_H}px, 0)`;
      zl.style.transform = `scale(${z})`;
    };
    const tick = () => {
      z += (zoomTarget.current - z) * 0.15;
      if (!dragging) {
        pos.x += vel.x;
        pos.y += vel.y;
        vel.x *= 0.95;
        vel.y *= 0.95;
        if (!reduce && Math.abs(vel.x) < 0.25 && Math.abs(vel.y) < 0.25) {
          vel.x = vel.x * 0.9 - 0.025;
          vel.y = vel.y * 0.9 - 0.015;
        }
      }
      render();
    };
    gsap.ticker.add(tick);

    const down = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("[data-ui]")) return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 2) {
        const [p1, p2] = [...pts.values()];
        pinch0 = Math.hypot(p1.x - p2.x, p1.y - p2.y);
      }
      dragging = true;
      moved = 0;
      last = { x: e.clientX, y: e.clientY };
      wrap.setPointerCapture(e.pointerId);
      wrap.style.cursor = "grabbing";
    };
    const move = (e: PointerEvent) => {
      if (!dragging || !pts.has(e.pointerId)) return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 2) {
        const [p1, p2] = [...pts.values()];
        const d = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        if (pinch0) zoomBy(d / pinch0);
        pinch0 = d;
        moved += 10;
        return;
      }
      const dx = e.clientX - last.x;
      const dy = e.clientY - last.y;
      moved += Math.abs(dx) + Math.abs(dy);
      pos.x += dx / z;
      pos.y += dy / z;
      vel.x = dx / z;
      vel.y = dy / z;
      last = { x: e.clientX, y: e.clientY };
    };
    const up = (e: PointerEvent) => {
      pts.delete(e.pointerId);
      if (pts.size) return;
      dragging = false;
      pinch0 = 0;
      wrap.style.cursor = "grab";
      // a click (not a drag) on an image, close enough → open it
      if (moved < 6 && z >= OPEN_Z) {
        const el = document.elementsFromPoint(e.clientX, e.clientY).find((n) => n instanceof HTMLImageElement && n.classList.contains("mc-item")) as HTMLImageElement | undefined;
        if (el) {
          vel.x = vel.y = 0;
          setOpen(el.getAttribute("src"));
        }
      }
    };
    const wheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        // trackpad pinch / ctrl+wheel = zoom (also inside the deck)
        e.preventDefault();
        e.stopPropagation();
        zoomBy(Math.exp(-e.deltaY * 0.01));
        return;
      }
      if (embedded) return; // in the deck, the wheel changes slides
      e.preventDefault();
      vel.x = -e.deltaX * 0.6;
      vel.y = -e.deltaY * 0.6;
    };
    wrap.addEventListener("pointerdown", down);
    wrap.addEventListener("pointermove", move);
    wrap.addEventListener("pointerup", up);
    wrap.addEventListener("pointercancel", up);
    wrap.addEventListener("wheel", wheel, { passive: false });

    const ctx = gsap.context(() => {
      if (location.search.includes("static")) return;
      gsap.from(wrap.querySelector(".fade-edges"), { opacity: 0, scale: 1.08, duration: 1.4, ease: "power3.out" });
      gsap.from(".mc-bubble", { scale: 0, duration: 0.8, delay: 0.6, stagger: { amount: 1.2, from: "random" }, ease: "back.out(2)" });
    }, wrap);

    return () => {
      gsap.ticker.remove(tick);
      ctx.revert();
      wrap.removeEventListener("pointerdown", down);
      wrap.removeEventListener("pointermove", move);
      wrap.removeEventListener("pointerup", up);
      wrap.removeEventListener("pointercancel", up);
      wrap.removeEventListener("wheel", wheel);
    };
  }, [embedded]);

  // lightbox: fade in, Esc to close
  useEffect(() => {
    if (!open) return;
    gsap.fromTo(lightRef.current, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power2.out" });
    gsap.fromTo(lightRef.current!.querySelector("img"), { scale: 0.9, y: 30 }, { scale: 1, y: 0, duration: 0.6, ease: "power3.out" });
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open]);

  const tile = (tx: number, ty: number, layer: "items" | "bubbles") => (
    <div key={`${layer}-${tx}-${ty}`} className="absolute" style={{ left: tx * TILE_W, top: ty * TILE_H, width: TILE_W, height: TILE_H }}>
      {layer === "items" && items.map((it, i) =>
        it.type === "ui" ? (
          (() => {
            const Card = UI_CARDS[it.kind];
            return (
              <div key={i} className="mc-item absolute" style={{ left: it.x, top: it.y, width: it.w, height: it.h, borderRadius: "var(--radius-img)" }}>
                <Card />
              </div>
            );
          })()
        ) : (
          <div key={i} className="absolute" style={{ left: it.x, top: it.y, width: it.w, height: it.h }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={it.src}
              alt=""
              draggable={false}
              className="mc-item h-full w-full object-cover select-none"
              style={{ borderRadius: "var(--radius-img)" }}
            />
            {it.act && <ActionBadge act={it.act} />}
            {!it.act && COMMENTS[it.src] && <Comment {...COMMENTS[it.src]} />}
            {it.sim === "hover" && <SimHover delay={it.d!} />}
            {it.sim === "press" && <SimPress delay={it.d!} />}
          </div>
        ),
      )}
      {layer === "bubbles" &&
        bubbles.map((b, i) => {
          const m = BUBBLE_MEANING[(i + b.variant) % BUBBLE_MEANING.length];
          const Icon = m.icon;
          return (
            <div
              key={`b${i}`}
              title={m.label}
              className={`mc-bubble tonal ${m.tone} absolute grid place-items-center rounded-full`}
              style={{ left: b.x - b.r, top: b.y - b.r, width: b.r * 2, height: b.r * 2, ["--t-depth" as string]: "3px" }}
            >
              <Icon className="mc-wiggle" style={{ animationDelay: `${-(i % 7) * 0.6}s`, ...(m.iconColor ? { color: m.iconColor } : {}) }} size={Math.round(b.r * 0.95)} weight="fill" />
            </div>
          );
        })}
    </div>
  );

  return (
    <div
      ref={wrapRef}
      className="relative h-full w-full overflow-hidden bg-bg touch-none select-none"
      style={{ cursor: "grab" }}
      role="region"
      aria-label="Moodboard canvas: an endless masonry grid of people, red tonal graphics, circles and stickers. Drag to explore, pinch or use the buttons to zoom, tap a pin to open it."
    >
      <div className="fade-edges absolute inset-0">
        <div ref={zoomRef} className="absolute inset-0 origin-center will-change-transform">
          <div ref={planeRef} className="absolute left-0 top-0 will-change-transform">
            {(["items", "bubbles"] as const).flatMap((l) => GRID.flatMap((ty) => GRID.map((tx) => tile(tx, ty, l))))}
          </div>
        </div>
      </div>

      <div data-ui className="absolute bottom-5 left-4 z-10 flex items-center gap-2 md:bottom-8 md:left-1/2 md:-translate-x-1/2">
        <button onClick={() => zoomBy(1 / 1.4)} aria-label="Zoom out" className="tonal t-grey grid h-11 w-11 place-items-center rounded-full" style={{ ["--t-depth" as string]: "3px" }}>
          <MagnifyingGlassMinus size={20} weight="bold" />
        </button>
        <span className="tonal-flat t-grey hidden rounded-full px-4 py-2 text-sm font-medium tabular-nums md:inline">
          {zoomUi < OPEN_Z ? "Zoom in to open a pin" : "Tap a pin to open"}
        </span>
        <button onClick={() => zoomBy(1.4)} aria-label="Zoom in" className="tonal t-red grid h-11 w-11 place-items-center rounded-full" style={{ ["--t-depth" as string]: "3px" }}>
          <MagnifyingGlassPlus size={20} weight="bold" />
        </button>
      </div>

      {open && (
        <div
          data-ui
          ref={lightRef}
          className="absolute inset-0 z-20 grid place-items-center bg-[var(--neutral-0)] p-8 md:p-20"
          onClick={() => setOpen(null)}
          role="dialog"
          aria-label="Pin preview"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={open} alt="" className="max-h-full max-w-full object-contain shadow-[0_30px_80px_-30px_rgba(45,43,43,.45)]" style={{ borderRadius: "var(--radius-img)" }} />
          <button onClick={() => setOpen(null)} aria-label="Close" className="tonal t-grey absolute right-5 top-5 grid h-12 w-12 place-items-center rounded-full md:right-8 md:top-8" style={{ ["--t-depth" as string]: "3px" }}>
            <X size={20} weight="bold" />
          </button>
        </div>
      )}
    </div>
  );
}

const SOFT = "0 6px 16px -6px rgba(45,43,43,.3)";

const STAR = {
  made: { fill: "var(--green-300)", line: "var(--green-700)", pill: "t-green", label: "★ 12 made this" },
  group: { fill: "var(--amber-300)", line: "var(--amber-700)", pill: "t-amber", label: "★ Saved by the group!" },
};

/** One of the four actions, anchored to its photo with its pill. */
function ActionBadge({ act }: { act: Act }) {
  const pill = "absolute left-3 bottom-3 whitespace-nowrap rounded-full px-3 py-1 text-base font-semibold";
  if (act === "heart" || act === "pin")
    return (
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span
          className={`tonal ${act === "heart" ? "t-grey" : "t-red"} absolute right-3 top-3 grid h-12 w-12 place-items-center rounded-full`}
          style={{ ["--t-depth" as string]: "3px" }}
        >
          {act === "heart" ? <Heart size={24} weight="fill" style={{ color: "var(--red-500)" }} /> : <PushPin size={24} weight="fill" />}
        </span>
        <span className={`tonal ${act === "heart" ? "t-grey" : "t-red"} ${pill}`} style={{ ["--t-depth" as string]: "3px" }}>
          {act === "heart" ? "♥ 248" : "Saved"}
        </span>
      </div>
    );
  const st = STAR[act];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <Star r={24} fill={st.fill} line={st.line} />
      <span className={`tonal ${st.pill} ${pill}`} style={{ ["--t-depth" as string]: "3px" }}>
        {st.label}
      </span>
    </div>
  );
}

function Star({ r, fill, line }: { r: number; fill: string; line: string }) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 ? r * 0.48 : r;
    return `${r + 6 + rr * Math.cos(a)},${r + 6 + rr * Math.sin(a)}`;
  }).join(" ");
  return (
    <svg className="absolute right-2 top-2" width={r * 2 + 18} height={r * 2 + 18} aria-hidden>
      <polygon points={pts} transform="translate(5 5)" fill={line} strokeLinejoin="round" stroke={line} strokeWidth="4" />
      <polygon points={pts} fill={fill} stroke={line} strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}

/** Speech-bubble comment (Figma 306:1398): sits on a card edge, overhanging it, with the tail
 *  bubble pointing back toward the center of the photo. Position varies per card. */
const CORNER: Record<Corner, { box: React.CSSProperties; tail: React.CSSProperties; rot: number }> = {
  tl: { box: { left: -14, top: 14 }, tail: { right: 18, bottom: -16 }, rot: -3 },
  tr: { box: { right: -14, top: 18 }, tail: { left: 18, bottom: -16 }, rot: 3 },
  bl: { box: { left: -14, bottom: 22 }, tail: { right: 18, top: -16 }, rot: 2 },
  br: { box: { right: -14, bottom: 16 }, tail: { left: 18, top: -16 }, rot: -2 },
};
function Comment({ name, msg, tone, pos }: { name: string; msg: string; tone: string; pos: Corner }) {
  const c = CORNER[pos];
  return (
    <div aria-hidden className="mc-float pointer-events-none absolute z-[1]" style={c.box}>
      <div className={`tonal ${tone} relative flex w-max max-w-[220px] items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4`} style={{ ["--t-depth" as string]: "3px", rotate: `${c.rot}deg` }}>
        <span className="h-8 w-8 shrink-0 rounded-full" style={{ background: "var(--t-line)" }} />
        <span className="leading-tight">
          <b className="block text-sm">{name}</b>
          <span className="block truncate text-xs">{msg}</span>
        </span>
        <span className={`tonal ${tone} absolute h-3.5 w-3.5 rounded-full`} style={{ ...c.tail, ["--t-depth" as string]: "2px" }} />
      </div>
    </div>
  );
}

/** Brutalist desktop cursor: white arrow, ink stroke, hard shadow. Small on purpose. */
function BrutalCursor() {
  return (
    <svg className="sim-cursor absolute left-0 top-0" width="26" height="30" viewBox="0 0 26 30" aria-hidden>
      <path d="M4 3 L4 23 L9.5 18 L13 26 L17 24.4 L13.6 16.6 L21 16.6 Z" transform="translate(3 3)" fill="var(--neutral-900)" />
      <path d="M4 3 L4 23 L9.5 18 L13 26 L17 24.4 L13.6 16.6 L21 16.6 Z" fill="var(--neutral-0)" stroke="var(--neutral-900)" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

/** Desktop hover, simulated (Figma Pin/Hover · Desktop 152:2): cursor glides to the corner, a red
 *  radial glow grows from the bottom-right corner, three actions fan out around it, Save on the left. */
function SimHover({ delay }: { delay: number }) {
  const d = { animationDelay: `${-delay}s` };
  const fan = [
    { Icon: Heart, r: 112, b: 62 },
    { Icon: ShareNetwork, r: 70, b: 98 },
    { Icon: DownloadSimple, r: 22, b: 112 },
  ];
  return (
    <div aria-hidden className="sim pointer-events-none absolute inset-0 overflow-hidden" style={{ borderRadius: "var(--radius-img)" }}>
      <div className="sim-scrim absolute inset-0" style={{ ...d, background: "rgba(30,30,30,.22)" }} />
      <span className="sim-corner absolute -bottom-24 -right-24 h-56 w-56 rounded-full" style={{ ...d, background: "radial-gradient(circle, #c80000 0%, #ef1212 28%, rgba(248,73,73,.75) 45%, rgba(255,174,174,0) 70%)" }} />
      {fan.map(({ Icon, r, b }, k) => (
        <span key={k} className="sim-hfan absolute grid h-9 w-9 place-items-center rounded-full bg-white text-[var(--neutral-900)] shadow-[0_6px_16px_-6px_rgba(45,43,43,.35)]" style={{ right: r, bottom: b, ["--fx" as string]: `${r - 12}px`, ["--fy" as string]: `${b - 12}px`, animationDelay: `${-delay + k * 0.07}s` }}>
          <Icon size={17} weight="regular" />
        </span>
      ))}
      <span className="sim-ctl sim-save absolute bottom-3 left-3 rounded-full px-5 py-2 text-base font-semibold text-white shadow-[0_6px_16px_-6px_rgba(45,43,43,.4)]" style={{ ...d, background: "var(--red-500)" }}>Save</span>
      <div className="sim-cursor-path absolute left-0 top-0" style={d}><BrutalCursor /></div>
    </div>
  );
}

/** Phone press, simulated: a fingertip print presses the pin and the actions bubble out. */
function SimPress({ delay }: { delay: number }) {
  const d = { animationDelay: `${-delay}s` };
  // V1 phone press: Save stays red, the rest are flat white buttons (no brutalist strokes)
  const fan = [
    { red: true, Icon: PushPin, x: "-62px", y: "-40px" },
    { red: false, Icon: ShareNetwork, x: "-22px", y: "-70px" },
    { red: false, Icon: Heart, x: "24px", y: "-68px" },
    { red: false, Icon: DownloadSimple, x: "62px", y: "-36px" },
  ];
  return (
    <div aria-hidden className="sim pointer-events-none absolute inset-0 overflow-hidden" style={{ borderRadius: "var(--radius-img)" }}>
      <div className="sim-dim absolute inset-0" style={{ ...d, background: "rgba(45,43,43,.22)", backdropFilter: "blur(7px)", WebkitBackdropFilter: "blur(7px)" }} />
      <div className="absolute left-1/2 top-[58%]">
        <span className="sim-glow absolute -left-12 -top-12 h-24 w-24 rounded-full" style={{ ...d, background: "radial-gradient(circle, rgba(200,0,0,.55) 0%, rgba(248,73,73,.35) 40%, rgba(255,174,174,0) 72%)" }} />
        <svg className="sim-print absolute -left-[17px] -top-[21px]" width="34" height="42" viewBox="0 0 34 42" style={d} fill="none" stroke="var(--neutral-0)" strokeWidth="1.8" strokeLinecap="round">
          <path d="M17 39c-4-3-6-8-6-14a6 6 0 0 1 12 0c0 4 1 7 3 9" />
          <path d="M8 35c-2-3-3-7-3-11a12 12 0 0 1 24 0c0 2 0 4 1 6" />
          <path d="M17 31c-1.5-2-2-4-2-6a2 2 0 0 1 4 0c0 3 1 5 2 7" />
          <path d="M4 14a15 15 0 0 1 26 0" />
          <path d="M9 5a15 15 0 0 1 16 0" />
        </svg>
        {fan.map(({ red, Icon, x, y }, k) => (
          <span key={k} className="sim-fan absolute -left-4 -top-4 grid h-8 w-8 place-items-center rounded-full" style={{ ...d, ["--fx" as string]: x, ["--fy" as string]: y, animationDelay: `${-delay + k * 0.06}s`, background: red ? "var(--red-500)" : "var(--neutral-0)", color: red ? "var(--neutral-0)" : "var(--neutral-900)", boxShadow: "0 4px 12px -4px rgba(45,43,43,.45)" }}>
            <Icon size={15} weight={red ? "fill" : "bold"} />
          </span>
        ))}
      </div>
    </div>
  );
}

/** Typography card (Figma 279:62): the voice of the brand, set in the type scale. */
function IdeasTypeCard() {
  return (
    <div className="flex h-full flex-col justify-between bg-white p-4" style={{ borderRadius: "var(--radius-img)", boxShadow: "inset 0 0 0 1px var(--neutral-200)" }}>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-text">Save · Plan · Make · Share</p>
        <p className="mt-2 text-[38px] font-semibold leading-[0.95] tracking-tight text-ink">Ideas you can use.</p>
        <p className="mt-3 text-xl leading-tight text-ink">Find what sparks you.</p>
        <p className="mt-2 text-xs leading-snug text-ink-3">Saved by Maya to “Picnic ideas”<br />12 friends are planning it too.</p>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-[34px] leading-none text-brand-text">1.2k</span>
        <span className="text-xs font-semibold text-ink-3">saves this week</span>
      </div>
    </div>
  );
}

/** Colorimetry card (Figma 279:75): one red, warm neutrals, community accents. Band height = share. */
function PaletteCard() {
  const bands: [string, number][] = [
    ["--amber-300", 4], ["--violet-300", 4], ["--green-300", 5], ["--neutral-0", 33],
    ["--neutral-200", 14], ["--neutral-300", 8], ["--neutral-900", 6], ["--red-500", 17], ["--red-100", 4], ["--red-700", 5],
  ];
  return (
    <div className="flex h-full flex-col overflow-hidden" style={{ borderRadius: "var(--radius-img)", boxShadow: "inset 0 0 0 1px var(--neutral-200)" }}>
      {bands.map(([v, f]) => <div key={v} style={{ flex: f, background: `var(${v})` }} />)}
    </div>
  );
}
