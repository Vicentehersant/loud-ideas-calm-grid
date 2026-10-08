"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { QRCodeSVG } from "qrcode.react";
import { ArrowUpRight, ArrowLeft, ArrowRight, Star, Heart, PushPin, ShareNetwork, DownloadSimple, MagnifyingGlass, Plus, UsersThree } from "@phosphor-icons/react";
import TabBar from "./ui/TabBar";
import MoodCanvas from "./MoodCanvas";
import BubbleLegend from "./BubbleLegend";
import images from "@/lib/images.json";

type Img = { src: string; w: number; h: number; kind: string };
const PEOPLE = (images as Img[]).filter((i) => i.kind === "people").map((i) => i.src);
const BRAND = (images as Img[]).filter((i) => i.kind === "brand").map((i) => i.src);

const STEP_NAMES = [
  "Intro",
  "Cover",
  "01 · Context",
  "Context · No personality",
  "Context · Comms vs app",
  "Context · Two devices",
  "Context · Small fixes",
  "02 · What did we learn",
  "Insight 01 · Grid",
  "Insight 02 · Circle",
  "Insight 03 · Color",
  "Insight 04 · People",
  "Learning · Two temperatures",
  "03 · The idea",
  "Loud ideas, calm grid",
  "Moodboard",
  "One color, many voices",
  "Calm grid · The app",
  "Motion · Press & hold",
  "Bubbles · Four actions",
  "Loud · Ads",
  "04 · Evidence",
  "Evidence · Who it's for",
  "Evidence · Calm keeps",
  "Evidence · Loud pulls",
  "05 · Impact",
  "Impact · Why now",
  "Impact · What changes",
  "Thanks",
];

function useOrigin() {
  const [o, setO] = useState("");
  useEffect(() => setO(process.env.NEXT_PUBLIC_SITE_URL || window.location.origin), []);
  return o;
}

/* ---------- small building blocks ---------- */

function Kicker({ children }: { children: React.ReactNode }) {
  return <p className="reveal text-sm md:text-base font-semibold uppercase tracking-[0.18em] text-brand-text">{children}</p>;
}
function Title({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={`reveal font-semibold tracking-tight leading-[0.98] text-[clamp(40px,7vw,112px)] ${className}`}>{children}</h2>
  );
}
function Sub({ children }: { children: React.ReactNode }) {
  return <p className="reveal mt-6 max-w-[34ch] text-[clamp(18px,2vw,28px)] leading-snug text-ink-3">{children}</p>;
}
function MasonryMini({ srcs, cols = 4, className = "" }: { srcs: string[]; cols?: number; className?: string }) {
  const columns = Array.from({ length: cols }, (_, c) => srcs.filter((_, i) => i % cols === c));
  return (
    <div className={`flex gap-3 ${className}`}>
      {columns.map((col, c) => (
        <div key={c} className="flex flex-1 flex-col gap-3" style={{ marginTop: c % 2 ? 48 : 0 }}>
          {col.map((s, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={s} alt="" className="reveal-img w-full object-cover" style={{ borderRadius: "var(--radius-img)", aspectRatio: (i + c) % 3 ? "3/4" : "4/5" }} />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ---------- steps ---------- */

function Intro({ origin }: { origin: string }) {
  return (
    <div className="grid h-full grid-cols-1 items-center gap-8 px-6 py-10 md:grid-cols-[1fr_auto] md:px-20">
      <div className="flex flex-col items-center gap-8 text-center md:items-start md:text-left">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/pinterest-red.svg" alt="Pinterest" className="reveal-pop h-20 w-20 md:h-28 md:w-28" />
        <div>
          <p className="reveal text-[clamp(40px,6vw,104px)] font-semibold leading-[0.95] tracking-tight">Vicente Hernaiz</p>
          <p className="reveal mt-4 text-[clamp(16px,1.6vw,26px)] text-ink-3">UXDG 315 · Project 2 · Interface moodboard</p>
        </div>
        <p className="reveal tonal t-red-soft rounded-full px-5 py-2 text-lg font-semibold" style={{ ["--t-depth" as string]: "3px" }}>Scan to follow along on your phone →</p>
      </div>
      <BigQR origin={origin} path="/" />
    </div>
  );
}

function BigQR({ origin, path }: { origin: string; path: string }) {
  return (
    <div className="reveal tonal t-grey mx-auto aspect-square h-[min(84vh,90vw)] rounded-[32px] p-[2.5vh]" style={{ ["--t-depth" as string]: "10px" }}>
      {origin && <QRCodeSVG value={`${origin}${path}`} size={512} className="h-full w-full" fgColor="#2d2b2b" bgColor="#ffffff" />}
    </div>
  );
}

/* Press → radial quick actions (V1 Pin/Press component, Figma 152:182).
   Finger = radial gradient effect/press core→glow→halo; 4 bubbles fan toward the pin center. */
const PRESS_POINTS = [
  { x: 0.7, y: 0.62 },
  { x: 0.28, y: 0.3 },
  { x: 0.72, y: 0.24 },
  { x: 0.3, y: 0.7 },
];
function PressDemo() {
  const box = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = box.current!;
    const finger = el.querySelector<HTMLElement>(".press-finger")!;
    const bubbles = [...el.querySelectorAll<HTMLElement>(".press-bubble")];
    const img = el.querySelector<HTMLElement>(".press-img")!;
    // geometry is read live (every loop) and clamped inside the card, so nothing leaves it
    const geo = (p: { x: number; y: number }) => {
      const W = el.clientWidth || 1, H = el.clientHeight || 1;
      const pad = 40;
      const fx = p.x * W, fy = p.y * H;
      const toC = Math.atan2(H / 2 - fy, W / 2 - fx);
      const R = Math.min(W, H) * 0.26;
      const pos = bubbles.map((_, k) => {
        const a = toC + ((k - 1.5) * Math.PI) / 4.4;
        return {
          x: Math.min(W - pad, Math.max(pad, fx + Math.cos(a) * R)),
          y: Math.min(H - pad, Math.max(pad, fy + Math.sin(a) * R)),
        };
      });
      return { fx, fy, pos };
    };
    const ctx = gsap.context(() => {
      // slow, smooth ease-in-out with a long soft landing; actions keep the bubble "pop"
      const SMOOTH = "power3.inOut", LAND = "expo.out", POP = "back.out(1.7)";
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.6, repeatRefresh: true });
      PRESS_POINTS.forEach((p) => {
        const g = () => geo(p);
        tl.set(finger, { x: () => g().fx, y: () => g().fy, scale: 0, opacity: 0 })
          .set(bubbles, { x: () => g().fx, y: () => g().fy, scale: 0, opacity: 0 })
          .to(finger, { scale: 1, opacity: 1, duration: 0.7, ease: LAND })
          .to(img, { scale: 1.03, filter: "brightness(0.8) blur(6px)", duration: 0.9, ease: SMOOTH }, "<")
          .to(finger, { scale: 1.15, duration: 0.9, ease: "sine.inOut", yoyo: true, repeat: 1 })
          .to(bubbles, { x: (k) => g().pos[k].x, y: (k) => g().pos[k].y, scale: 1, opacity: 1, duration: 0.9, stagger: 0.12, ease: POP }, "<0.3")
          .to(finger, { x: () => g().pos[0].x, y: () => g().pos[0].y, duration: 0.9, ease: SMOOTH }, "+=0.6")
          .to(bubbles[0], { scale: 1.3, duration: 0.6, ease: POP }, "<0.4")
          .to([finger, ...bubbles], { scale: 0, opacity: 0, duration: 0.8, stagger: 0.05, ease: SMOOTH }, "+=1")
          .to(img, { scale: 1, filter: "brightness(1) blur(0px)", duration: 1, ease: LAND }, "<0.2");
      });
      // brutalist satellites: gentle float, out of sync
      gsap.utils.toArray<HTMLElement>(".sat", wrapRef.current!).forEach((s, k) => {
        gsap.to(s, { y: k % 2 ? 10 : -10, rotate: k % 2 ? 4 : -4, duration: 2.2 + k * 0.3, yoyo: true, repeat: -1, ease: "sine.inOut" });
      });
    }, wrapRef.current!);
    return () => ctx.revert();
  }, []);
  const icons = [PushPin, ShareNetwork, Heart, DownloadSimple];
  const d = (n: number) => ({ ["--t-depth" as string]: `${n}px` });
  return (
    <div ref={wrapRef} className="relative mx-auto w-fit">
      <div ref={box} className="reveal-img relative aspect-[3/4] h-[52vh] max-h-[520px] max-w-[80vw] overflow-hidden" style={{ borderRadius: "var(--radius-card)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={PEOPLE[8]} alt="" className="press-img h-full w-full object-cover" />
        <div
          className="press-finger pointer-events-none absolute left-0 top-0 h-36 w-36 rounded-full"
          style={{ background: "radial-gradient(circle, #c80000 0%, #f84949 30%, #ffaeae 55%, rgba(255,174,174,0) 72%)", marginLeft: -72, marginTop: -72 }}
          aria-hidden
        />
        {icons.map((Icon, k) => (
          <div
            key={k}
            className={`press-bubble absolute left-0 top-0 grid h-14 w-14 place-items-center rounded-full shadow-[0_6px_18px_-6px_rgba(45,43,43,.5)] ${k === 0 ? "bg-brand text-white" : "bg-card text-ink"}`}
            style={{ marginLeft: -28, marginTop: -28 }}
            aria-hidden
          >
            <Icon size={24} weight={k === 0 ? "fill" : "bold"} />
          </div>
        ))}
      </div>

      {/* Tonal Play satellites around the card */}
      <div aria-hidden className="pointer-events-none">
        <div className="sat reveal-pop tonal t-red absolute -left-10 top-[8%] grid h-20 w-20 place-items-center rounded-full" style={d(5)}><Heart size={34} weight="fill" /></div>
        <div className="sat reveal-pop tonal t-violet absolute -right-16 top-[14%] -rotate-6 whitespace-nowrap rounded-full px-5 py-2.5 text-lg font-semibold" style={d(4)}>@maya saved this</div>
        <div className="sat reveal-pop tonal t-amber absolute -left-14 top-[52%] grid h-16 w-16 place-items-center rounded-full" style={d(4)}><UsersThree size={28} weight="bold" /></div>
        <div className="sat reveal-pop tonal t-green-soft absolute -right-8 top-[46%] h-12 w-12 rounded-full" style={d(3)} />
        <div className="sat reveal-pop tonal t-green absolute -bottom-6 left-[18%] rotate-6 whitespace-nowrap rounded-full px-5 py-2.5 text-lg font-semibold" style={d(4)}>Press & hold</div>
        <div className="sat reveal-pop tonal t-red-soft absolute -right-12 bottom-[10%] grid h-24 w-24 place-items-center rounded-full" style={d(6)}><PushPin size={38} weight="bold" /></div>
        <div className="sat reveal-pop tonal t-red-deep absolute -top-5 right-[22%] h-10 w-10 rounded-full" style={d(3)} />
        <svg className="sat reveal-pop absolute -bottom-8 -left-8" width="74" height="74" viewBox="0 0 74 74">
          <polygon points="37,4 46,27 70,27 51,42 58,66 37,52 16,66 23,42 4,27 28,27" transform="translate(4 4)" fill="var(--green-700)" />
          <polygon points="37,4 46,27 70,27 51,42 58,66 37,52 16,66 23,42 4,27 28,27" fill="var(--green-300)" stroke="var(--green-700)" strokeWidth="3" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

function Cover() {
  return (
    <div className="grid h-full grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-10 px-6 md:px-20 py-16 items-center">
      <div>
        <Kicker>Pinterest · Brand & UI redesign</Kicker>
        <h1 className="reveal mt-5 font-semibold tracking-tight leading-[0.92] text-[clamp(56px,9.5vw,168px)]">
          Loud ideas,
          <br />
          <span className="text-brand-text">calm grid.</span>
        </h1>
        <Sub>One design direction for a warmer, more social Pinterest.</Sub>
      </div>
      <div className="relative hidden md:block h-[78vh] overflow-hidden fade-edges">
        <MasonryMini srcs={[...PEOPLE.slice(0, 8), ...BRAND.slice(0, 4)]} cols={3} />
        <div className="reveal-pop tonal t-red absolute left-[31%] top-[38%] h-24 w-24 rounded-full" />
        <div className="reveal-pop tonal t-red-soft absolute left-[64%] top-[18%] h-14 w-14 rounded-full" />
      </div>
      <p className="absolute bottom-6 left-6 md:left-20 text-sm text-ink-3">Vicente Hernaiz · UXDG 315 · Project 2</p>
    </div>
  );
}

function InsightGrid() {
  return (
    <div className="grid h-full grid-cols-1 md:grid-cols-2 gap-10 px-6 md:px-20 items-center">
      <div>
        <Kicker>Insight 01</Kicker>
        <Title className="mt-4">The grid is the brand.</Title>
        <Sub>People recognize Pinterest by its masonry, even without the logo.</Sub>
      </div>
      <div className="h-[70vh] overflow-hidden fade-edges">
        <div className="flex h-full gap-3">
          {[0.62, 0.9, 0.45, 0.78, 0.55].map((h, i) => (
            <div key={i} className="flex flex-1 flex-col gap-3" style={{ marginTop: i % 2 ? 60 : 0 }}>
              {[h, 1 - h + 0.3, h * 0.8].map((hh, j) => (
                <div key={j} className={`reveal-img ${["bg-brand", "bg-red-200", "bg-n-300", "bg-card", "bg-inverse", "bg-red-700", "bg-n-400"][(i * 3 + j * 2) % 7]}`} style={{ height: `${hh * 34}vh`, borderRadius: "var(--radius-img)" }} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InsightCircle() {
  return (
    <div className="grid h-full grid-cols-1 md:grid-cols-2 gap-10 px-6 md:px-20 items-center">
      <div>
        <Kicker>Insight 02</Kicker>
        <Title className="mt-4">The circle is the second shape.</Title>
        <Sub>The logo, the avatars, the save button. Circles already sit on top of the grid.</Sub>
      </div>
      <div className="relative h-[70vh] overflow-hidden fade-edges">
        <MasonryMini srcs={PEOPLE.slice(0, 9)} cols={3} />
        <div className="reveal-pop tonal t-red absolute left-[30%] top-[30%] grid h-24 w-24 place-items-center rounded-full"><PushPin size={44} weight="fill" /></div>
        <div className="reveal-pop tonal t-red-soft absolute left-[62%] top-[55%] h-16 w-16 rounded-full" />
        <div className="reveal-pop tonal t-grey absolute left-[18%] top-[66%] grid h-14 w-14 place-items-center rounded-full"><Heart size={26} weight="fill" className="text-[var(--red-500)]" /></div>
      </div>
    </div>
  );
}

function InsightColor() {
  const reds = ["--red-100", "--red-200", "--red-300", "--red-500", "--red-700", "--red-900"];
  const greys = ["--neutral-0", "--neutral-100", "--neutral-200", "--neutral-300", "--neutral-400", "--neutral-600"];
  return (
    <div className="flex h-full flex-col justify-center gap-10 px-6 md:px-20">
      <div>
        <Kicker>Insight 03</Kicker>
        <Title className="mt-4">Red, white, and warm greys.</Title>
        <Sub>Today the red sits on cold, generic greys. Warmer neutrals make it feel like home.</Sub>
      </div>
      <div className="flex flex-col gap-3">
        {[reds, greys].map((row, r) => (
          <div key={r} className="flex gap-3">
            {row.map((v) => (
              <div key={v} className="reveal-img h-[12vh] flex-1 border border-black/5" style={{ background: `var(${v})`, borderRadius: "var(--radius-img)" }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function InsightPeople() {
  return (
    <div className="grid h-full grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-10 px-6 md:px-20 items-center">
      <div>
        <Kicker>Insight 04</Kicker>
        <Title className="mt-4">Pinterest is made by people.</Title>
        <Sub>Every pin is someone’s real table, room or outfit. The brand should look like its community, not like stock.</Sub>
      </div>
      <div className="h-[80vh] overflow-hidden fade-edges">
        <MasonryMini srcs={PEOPLE.slice(4, 16)} cols={4} />
      </div>
    </div>
  );
}

function Opportunity() {
  return (
    <div className="flex h-full flex-col justify-center px-6 md:px-20 gap-10">
      <div>
        <Kicker>What we learned</Kicker>
        <Title className="mt-4">One brand, two temperatures.</Title>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="reveal tonal-flat t-grey rounded-[var(--radius-card)] p-8 md:p-10">
          <p className="text-[clamp(28px,3.4vw,52px)] font-semibold leading-none">Calm grid</p>
          <p className="mt-4 text-xl text-ink-3">The app. Where you decide, save and plan. Quiet, warm, images first.</p>
        </div>
        <div className="reveal tonal t-red rounded-[var(--radius-card)] p-8 md:p-10">
          <p className="text-[clamp(28px,3.4vw,52px)] font-semibold leading-none">Loud ideas</p>
          <p className="mt-4 text-xl text-red-100">The public web and campaigns. Where you get inspired. Playful, tactile, bold.</p>
        </div>
      </div>
    </div>
  );
}

function Direction() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <Kicker>The idea · Our name</Kicker>
      <h2 className="reveal mt-6 font-semibold tracking-tight leading-[0.92] text-[clamp(56px,10vw,180px)]">
        Loud ideas,
        <br />
        <span className="text-brand-text">calm grid.</span>
      </h2>
      <p className="reveal mt-8 text-[clamp(18px,2vw,28px)] text-ink-3">
        with a brand layer called <span className="tonal t-red-soft rounded-full px-4 py-1 font-semibold" style={{ ["--t-depth" as string]: "3px" }}>Tonal Play</span>
      </p>
    </div>
  );
}

function Statement() {
  return (
    <div className="flex h-full items-center justify-center px-6">
      <div className="relative text-center">
        <p className="reveal font-semibold tracking-tight leading-[0.95] text-[clamp(52px,9vw,160px)]">
          One color,
          <br />
          many voices.
        </p>
        <div className="reveal-pop tonal t-red absolute -right-6 -top-8 md:-right-16 md:-top-10 h-14 w-14 md:h-20 md:w-20 rounded-full" />
      </div>
    </div>
  );
}

function Voices() {
  // One color = Pinterest red over warm neutrals (circle area = share of the brand).
  const circles: [string, number, string, number, number][] = [
    ["--neutral-100", 36, "--neutral-300", 48, 57], ["--neutral-200", 16, "--neutral-300", 22, 82], ["--neutral-300", 10, "--neutral-400", 81, 75],
    ["--red-500", 22, "--red-800", 69, 43], ["--neutral-900", 8, "--neutral-600", 28, 39], ["--red-700", 6, "--red-800", 88, 31], ["--red-100", 6, "--red-300", 14, 64],
  ];
  const voices = [
    ["@maya", "saved it for her picnic", "t-violet", -4],
    ["@leo", "made it this weekend", "t-green", 3],
    ["@sam", "added 4 friends", "t-amber", -2],
  ] as const;
  return (
    <div className="grid h-full grid-cols-1 items-center gap-10 px-6 md:grid-cols-[0.9fr_1.1fr] md:px-20">
      <div>
        <Kicker>The statement, explained</Kicker>
        <h2 className="reveal mt-4 font-semibold tracking-tight leading-[0.95] text-[clamp(44px,6.5vw,112px)]">
          <span className="text-brand-text">One color,</span>
          <br />
          many voices.
        </h2>
        <Sub>Red is the one brand color, held by warm neutrals. Every other color belongs to the community: the people, their photos and what they save.</Sub>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <div className="reveal-img relative aspect-square overflow-hidden rounded-[var(--radius-card)] border-2 border-n-200 bg-card p-6">
          <p className="text-[clamp(22px,2.2vw,40px)] font-semibold leading-none text-brand-text">One color</p>
          <p className="mt-2 text-[clamp(13px,1.1vw,18px)] text-ink-3">The brand</p>
          {circles.map(([c, w, ln, x, y], i) => (
            <span
              key={i}
              className="reveal-pop absolute rounded-full"
              style={{
                width: `${Math.sqrt(w) * 6.2}%`, aspectRatio: "1", left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)",
                background: `var(${c})`, border: `2px solid var(${ln})`,
                boxShadow: c.includes("red-5") || c.includes("red-7") ? `5px 5px 0 var(${ln})` : undefined,
              }}
            />
          ))}
        </div>
        <span className="reveal-pop text-[clamp(40px,4vw,72px)] font-semibold leading-none text-ink">&amp;</span>
        <div className="reveal-img relative flex aspect-square flex-col overflow-hidden rounded-[var(--radius-card)] border-2 border-n-200 bg-card p-6">
          <p className="text-[clamp(22px,2.2vw,40px)] font-semibold leading-none">Many colors</p>
          <p className="mt-2 text-[clamp(13px,1.1vw,18px)] text-ink-3">People and actions</p>
          <div className="mt-auto flex flex-col gap-4">
            {voices.map(([n, msg, tone, rot], i) => (
              <div key={n} className={`reveal-pop tonal ${tone} flex w-fit items-center gap-3 rounded-full py-2 pl-2 pr-5`} style={{ ["--t-depth" as string]: "4px", transform: `rotate(${rot}deg)`, marginLeft: `${[0, 22, 6][i]}%` }}>
                <span className="h-8 w-8 shrink-0 rounded-full" style={{ background: "var(--t-line)" }} />
                <span className="leading-tight">
                  <b className="block text-[clamp(13px,1.1vw,18px)]">{n}</b>
                  <span className="text-[clamp(11px,0.9vw,14px)]">{msg}</span>
                </span>
              </div>
            ))}
          </div>
          
        </div>
      </div>
    </div>
  );
}

function WriteUp() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 px-6 md:px-16 py-16">
      <Title className="text-center">Why this direction.</Title>
      <div className="flex w-full max-w-[1500px] flex-col items-center justify-center gap-6 md:flex-row md:gap-8">
        {/* 01 — biggest: the message, told with people */}
        <article className="reveal-pop tonal t-red flex w-full flex-col overflow-hidden rounded-[var(--radius-card)] md:w-[34%]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={PEOPLE[0]} alt="" className="h-[22vh] w-full object-cover md:h-[30vh]" />
          <div className="p-6 md:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-red-100">01 · What it says</p>
            <h3 className="mt-2 text-[clamp(30px,3.2vw,52px)] font-semibold leading-[1] tracking-tight">Ideas, made together.</h3>
            <p className="mt-3 text-[clamp(16px,1.3vw,21px)] leading-snug text-red-100">The interface stays calm so people’s ideas can be loud.</p>
          </div>
        </article>

        {/* 02 — medium: the audit, shown as its two shapes */}
        <article className="reveal-pop tonal t-grey flex w-full flex-col rounded-[var(--radius-card)] p-6 md:w-[28%] md:p-8">
          <div className="flex h-[16vh] items-end gap-2 md:h-[20vh]" aria-hidden>
            {[0.55, 0.9, 0.7, 1, 0.6].map((h, i) => (
              <div key={i} className={`flex-1 ${i === 1 ? "bg-brand" : i === 3 ? "bg-n-400" : "bg-n-200"}`} style={{ height: `${h * 100}%`, borderRadius: "var(--radius-img)" }} />
            ))}
            <div className="tonal t-red-soft -ml-10 mb-[30%] h-14 w-14 shrink-0 rounded-full" style={{ ["--t-depth" as string]: "3px" }} />
          </div>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-brand-text">02 · Where it comes from</p>
          <h3 className="mt-2 text-[clamp(28px,2.8vw,46px)] font-semibold leading-[1] tracking-tight">Grid + circle are already the brand.</h3>
          <p className="mt-3 text-[clamp(16px,1.3vw,21px)] leading-snug text-ink-3">Cold greys, made-by-people content.</p>
        </article>

        {/* 03 — small: the change, shown with Tonal Play stickers */}
        <article className="reveal-pop tonal t-red-soft relative flex w-full flex-col rounded-[var(--radius-card)] p-6 md:w-[24%] md:p-8">
          <div className="flex h-[12vh] items-center gap-3 md:h-[14vh]" aria-hidden>
            <span className="tonal t-green grid h-14 w-14 place-items-center rounded-full" style={{ ["--t-depth" as string]: "3px" }}><Star size={26} weight="fill" /></span>
            <span className="tonal t-amber -rotate-6 rounded-full px-4 py-2 text-lg font-semibold" style={{ ["--t-depth" as string]: "3px" }}>Saved!</span>
          </div>
          <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-red-800">03 · What it changes</p>
          <h3 className="mt-2 text-[clamp(26px,2.4vw,40px)] font-semibold leading-[1] tracking-tight text-red-800">Quiet app, playful brand.</h3>
          <p className="mt-3 text-[clamp(16px,1.3vw,21px)] leading-snug text-red-800">Inside the app, photos lead. On the web and in ads, bold color and stickers.</p>
        </article>
      </div>
    </div>
  );
}

function Moodboard() {
  return (
    <div className="relative h-full w-full" data-canvas>
      <MoodCanvas embedded />
      <div className="pointer-events-none absolute left-6 top-6 md:left-10 md:top-10 flex items-center gap-3">
        <span className="tonal t-red rounded-full px-5 py-2 text-lg font-semibold" style={{ ["--t-depth" as string]: "4px" }}>Moodboard</span>
        <span className="tonal-flat t-grey rounded-full px-4 py-2 text-base">Drag to explore</span>
      </div>
      <BubbleLegend className="right-6 top-6 md:right-10 md:top-10" />
    </div>
  );
}

function TonalPlay() {
  return (
    <div className="grid h-full grid-cols-1 md:grid-cols-[1fr_1.3fr] gap-10 px-6 md:px-20 items-center">
      <div>
        <Kicker>Loud ideas · Social</Kicker>
        <Title className="mt-4">One hue per element.</Title>
        <ul className="reveal mt-8 space-y-3 text-[clamp(17px,1.6vw,22px)] text-ink-3">
          <li>Surface: one tone of the scale.</li>
          <li>Border + hard shadow: a softer tone of the same scale.</li>
          <li>Text and icons: the tone with the most contrast.</li>
          <li>Not everything is raised. Flat and elevated mix.</li>
        </ul>
      </div>
      <div className="mx-auto grid w-full max-w-[min(100%,68vh)] grid-cols-2 gap-6 md:gap-8">
        <div className="reveal-pop tonal t-red rounded-[var(--radius-card)] p-6 aspect-square flex flex-col justify-between">
          <Star size={40} weight="fill" />
          <p className="text-2xl md:text-3xl font-semibold">Try this weekend</p>
        </div>
        <div className="reveal-pop tonal t-red-soft rounded-[var(--radius-card)] p-6 aspect-square flex flex-col justify-between" style={{ ["--t-depth" as string]: "10px" }}>
          <UsersThree size={40} weight="bold" />
          <p className="text-2xl md:text-3xl font-semibold">Saved by 12 friends</p>
        </div>
        <div className="reveal-pop tonal-flat t-grey-warm rounded-[var(--radius-card)] p-6 aspect-square flex flex-col justify-between">
          <PushPin size={40} weight="regular" />
          <p className="text-2xl md:text-3xl font-semibold">Flat, calm</p>
        </div>
        <div className="reveal-pop tonal t-red-deep rounded-full aspect-square flex items-center justify-center text-center p-6">
          <p className="text-2xl md:text-3xl font-semibold">Make it together</p>
        </div>
      </div>
    </div>
  );
}

function FourActions() {
  const AV = ["/mood/people-10-people-friends-14.jpg", "/mood/people-06-people-film-12.jpg", "/mood/people-08-people-friends-01.jpg"];
  const cards = [
    { img: "/mood/people-09-people-friends-06.jpg", verb: "Keep it", name: "Pin", desc: "Save to your board. The main action, the only one in red.", kind: "pin", pill: "Save", tone: "t-red", label: "text-brand-text", av: false },
    { img: "/mood/people-01-people-dinner-08.jpg", verb: "Love it", name: "Heart", desc: "A quick reaction for the creator.", kind: "heart", pill: "♥ 248", tone: "t-grey", label: "text-ink-3", av: false },
    { img: "/mood/people-13-people-picnic-12.jpg", verb: "Friends loved it", name: "Violet · your circle", desc: "See what the people you follow loved.", kind: "friends", pill: "Maya, Leo +4 loved this", tone: "t-violet", label: "text-[var(--violet-500)]", av: true },
    { img: "/mood/people-12-people-making-31.jpg", verb: "Made it together", name: "Green star", desc: "You and your friends tried it and shared the result.", kind: "star", pill: "You + 3 friends made this", tone: "t-green", label: "text-[var(--green-700)]", av: true },
    { img: "/mood/people-11-people-friends-21.jpg", verb: "Saved together", name: "Yellow star", desc: "One shared board the whole group plans on.", kind: "star", pill: "Saved with 3 friends", tone: "t-amber", label: "text-[var(--amber-700)]", av: true },
  ];
  return (
    <div className="flex h-full flex-col justify-center gap-8 px-6 md:px-16">
      <div>
        <Kicker>The idea · Bubbles</Kicker>
        <Title className="mt-3">Every shape has one job.</Title>
      </div>
      <div className="grid grid-cols-2 gap-5 md:grid-cols-5 md:gap-6">
        {cards.map((c) => (
          <div key={c.verb} className="reveal">
            <div className="relative overflow-hidden" style={{ borderRadius: "var(--radius-card)", aspectRatio: "3/4", maxHeight: "46vh", width: "100%" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.img} alt="" className="reveal-img h-full w-full object-cover" />
              <span className={`reveal-pop absolute right-3 top-3 grid h-[clamp(40px,3.6vw,68px)] w-[clamp(40px,3.6vw,68px)] place-items-center ${c.kind === "star" ? "" : `tonal ${c.tone} rounded-full`}`} style={c.kind === "star" ? undefined : { ["--t-depth" as string]: c.kind === "heart" ? "0px" : "4px" }}>
                {c.kind === "pin" && <PushPin weight="fill" className="h-1/2 w-1/2" />}
                {c.kind === "heart" && <Heart weight="fill" className="h-1/2 w-1/2 text-[var(--red-500)]" />}
                {c.kind === "friends" && <UsersThree weight="fill" className="h-1/2 w-1/2" />}
                {c.kind === "star" && <Star weight="fill" className={`h-full w-full ${c.tone === "t-green" ? "text-[var(--green-300)]" : "text-[var(--amber-300)]"}`} style={{ filter: `drop-shadow(3px 3px 0 var(${c.tone === "t-green" ? "--green-700" : "--amber-700"}))` }} />}
              </span>
              <span className={`reveal-pop tonal ${c.tone} absolute bottom-3 left-3 right-3 flex w-fit max-w-[calc(100%-24px)] items-center gap-2 rounded-full py-1.5 ${c.av ? "pl-1.5" : "pl-4"} pr-4 text-[clamp(11px,0.95vw,17px)] font-semibold leading-tight`} style={{ ["--t-depth" as string]: c.kind === "pin" || c.kind === "heart" ? "0px" : "3px" }}>
                {c.av && (
                  <span className="flex shrink-0">
                    {AV.map((s, k) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={s} src={s} alt="" className="h-[clamp(20px,1.8vw,30px)] w-[clamp(20px,1.8vw,30px)] rounded-full object-cover" style={{ marginLeft: k ? "-8px" : 0, border: "2px solid var(--t-line)" }} />
                    ))}
                  </span>
                )}
                {c.pill}
              </span>
            </div>
            <p className="mt-4 text-[clamp(20px,1.9vw,34px)] font-semibold leading-none tracking-tight">{c.verb}</p>
            <p className={`mt-1 text-xs font-semibold uppercase tracking-[0.14em] ${c.label}`}>{c.name}</p>
            <p className="mt-2 text-[clamp(13px,1vw,18px)] leading-snug text-ink-3">{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function InApp() {
  return (
    <div className="grid h-full grid-cols-1 md:grid-cols-[1fr_auto] gap-10 px-6 md:px-20 items-center">
      <div>
        <Kicker>The idea · Calm grid</Kicker>
        <Title className="mt-4">The app stays calm.</Title>
        <Sub>Quiet and warm, so your photos lead. The playful touches only show up in small moments, like a star on a pin your friends loved.</Sub>
      </div>
      <div className="reveal mx-auto hidden md:block w-[min(36vh,340px)] aspect-[9/19] rounded-[44px] bg-card p-3 shadow-[0_30px_80px_-30px_rgba(45,43,43,.45)]">
        <div className="h-full overflow-hidden rounded-[34px] bg-bg">
          <div className="flex items-center gap-2 p-3">
            <div className="flex flex-1 items-center gap-2 rounded-full bg-card px-3 py-2 text-xs text-ink-3">
              <MagnifyingGlass size={14} /> Search ideas
            </div>
            <div className="grid h-8 w-8 place-items-center rounded-full bg-brand text-white"><Plus size={14} weight="bold" /></div>
          </div>
          <div className="relative px-3">
            <MasonryMini srcs={PEOPLE.slice(0, 8)} cols={2} />
            <div className="absolute left-[44%] top-[110px] grid h-9 w-9 place-items-center rounded-full tonal t-red" style={{ ["--t-depth" as string]: "2px" }}>
              <Star size={16} weight="fill" />
            </div>
            <div className="absolute right-5 top-[260px] grid h-8 w-8 place-items-center rounded-full bg-card text-brand-text"><Heart size={14} weight="fill" /></div>
          </div>
        </div>
      </div>
    </div>
  );
}

const EXPLORE: { href: string; title: string; sub: string; tone: string; img?: string; tall?: boolean }[] = [
  { href: "/canvas", title: "Moodboard", sub: "The full canvas", tone: "t-red", img: PEOPLE[2], tall: true },
  { href: "/process#audit", title: "Brand & UI audit", sub: "Where the insights came from", tone: "t-grey", img: "/process/audit/audit-16.jpg" },
  { href: "/process#color", title: "Colorimetry", sub: "Red + warm greys", tone: "t-red-soft", img: "/process/color/colorimetry.jpg" },
  { href: "/process#type", title: "Typography", sub: "Three type systems", tone: "t-violet", img: "/process/type/typo-03.jpg", tall: true },
  { href: "/process#graphics", title: "Graphic styles", sub: "Three visual directions", tone: "t-green", img: "/process/graphics/book-21.jpg" },
  { href: "/process", title: "All the process", sub: "One map, every exploration", tone: "t-amber" },
  { href: "https://www.figma.com/design/A6JBUQWe7JuRTckR8FNvLB/UXDG-315", title: "Figma file", sub: "Design system + screens", tone: "t-ink" },
];

function Thanks({ origin }: { origin: string }) {
  const cols = [EXPLORE.filter((_, k) => k % 2 === 0), EXPLORE.filter((_, k) => k % 2 === 1)];
  return (
    <div className="grid h-full grid-cols-1 items-center gap-8 overflow-y-auto px-6 py-10 md:grid-cols-[auto_1fr] md:gap-14 md:overflow-hidden md:px-16">
      <div className="flex flex-col items-center gap-5">
        <Title className="text-center">Thank you.</Title>
        <div className="hidden md:block">
          <div className="reveal tonal t-grey aspect-square h-[66vh] rounded-[32px] p-[2.5vh]" style={{ ["--t-depth" as string]: "10px" }}>
            {origin && <QRCodeSVG value={`${origin}/canvas`} size={512} className="h-full w-full" fgColor="#2d2b2b" />}
          </div>
        </div>
      </div>
      <div className="flex h-full items-center">
        <div className="flex w-full gap-5" data-ui>
          {cols.map((col, c) => (
            <div key={c} className="flex flex-1 flex-col gap-5" style={{ marginTop: c ? 56 : 0 }}>
              {col.map((e) => (
                <a
                  key={e.href}
                  href={e.href}
                  target="_blank"
                  rel="noopener"
                  className={`reveal-pop tonal ${e.tone} group block overflow-hidden rounded-[var(--radius-card)] transition-transform duration-300 hover:-translate-y-1`}
                  style={{ ["--t-depth" as string]: "6px" }}
                >
                  {e.img && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={e.img} alt="" className={`w-full object-cover object-top ${e.tall ? "h-[16vh]" : "h-[9vh]"}`} />
                  )}
                  <div className="flex items-end justify-between gap-3 p-5">
                    <div>
                      <p className="text-[clamp(20px,1.8vw,30px)] font-semibold leading-none tracking-tight">{e.title}</p>
                      <p className="mt-1.5 text-sm opacity-80">{e.sub}</p>
                    </div>
                    <ArrowUpRight size={24} weight="bold" className="shrink-0 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </div>
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


/* ---------- P2b final structure (professor brief): context → learn → idea → evidence → impact ---------- */

function Divider({ n, title, q }: { n: string; title: string; q: string }) {
  return (
    <div className="flex h-full flex-col justify-center bg-inverse px-6 text-on-inverse md:px-20">
      <p className="reveal text-[clamp(20px,2vw,32px)] font-semibold tabular-nums text-red-300">{n}</p>
      <h2 className="reveal mt-4 font-semibold tracking-tight leading-[0.95] text-[clamp(56px,9vw,160px)]">{title}</h2>
      <p className="reveal mt-6 text-[clamp(20px,2.2vw,34px)] opacity-80">{q}</p>
    </div>
  );
}

function Shot({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={`reveal-img w-full border border-n-200 object-cover shadow-[0_30px_80px_-40px_rgba(45,43,43,.5)] ${className}`} style={{ borderRadius: "var(--radius-img)" }} />;
}

function OneIdea({ kicker, title, sub, children, wide = false }: { kicker: string; title: React.ReactNode; sub: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`grid h-full grid-cols-1 items-center gap-10 px-6 md:px-20 ${wide ? "md:grid-cols-[0.8fr_1.4fr]" : "md:grid-cols-2"}`}>
      <div>
        <Kicker>{kicker}</Kicker>
        <Title className="mt-4">{title}</Title>
        <Sub>{sub}</Sub>
      </div>
      <div>{children}</div>
    </div>
  );
}

function CtxPersonality() {
  return (
    <OneIdea wide kicker="Context · The app" title={<>Without the red, <span className="text-brand-text">who is it?</span></>} sub="Black, white and generic greys. Take the logo away and the app could be anyone’s.">
      <div className="relative">
        <Shot src="/process/audit/audit-28.jpg" alt="Audit: Pinterest feed page, mostly black and white UI" className="grayscale" />
        <span className="reveal-pop tonal t-red absolute -right-4 -top-5 rounded-full px-5 py-2 text-lg font-semibold" style={{ ["--t-depth" as string]: "4px" }}>Only the red is brand</span>
      </div>
    </OneIdea>
  );
}

function CtxComms() {
  return (
    <div className="flex h-full flex-col justify-center gap-10 px-6 md:px-20">
      <div>
        <Kicker>Context · Communication vs product</Kicker>
        <Title className="mt-4">The ads have a voice. <span className="text-ink-3">The app doesn’t.</span></Title>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <figure className="reveal"><Shot src="/process/context-campaign.jpg" alt="Pinterest campaign billboards: bold color, type and attitude" /><figcaption className="mt-3 text-lg font-semibold text-brand-text">Campaigns: color, pattern, attitude</figcaption></figure>
        <figure className="reveal"><Shot src="/process/context-app.jpg" alt="Pinterest desktop app: a neutral white grid" /><figcaption className="mt-3 text-lg font-semibold text-ink-3">App: a neutral grid</figcaption></figure>
      </div>
    </div>
  );
}

function CtxDevices() {
  return (
    <OneIdea wide kicker="Context · Interaction" title="A fan on the phone. Two buttons on desktop." sub="The press-and-hold fan is the only gesture that feels like Pinterest. Desktop gets a generic hover.">
      <Shot src="/process/context-gestures.jpg" alt="One card, three save gestures: default, phone fan and desktop hover" />
    </OneIdea>
  );
}

function CtxMinor() {
  const items = [["Alignment", "Edges drift between web and app"], ["Spacing", "No shared rhythm"], ["Type", "One typeface, drifting sizes"], ["Navbar", "Functional, no character"]];
  return (
    <OneIdea kicker="Context · Small fixes" title="The bugs are small." sub="Worth fixing, but they are not the problem. The problem is personality.">
      <ul className="grid grid-cols-2 gap-5">
        {items.map(([t, d]) => (
          <li key={t} className="reveal-pop tonal-flat t-grey rounded-[var(--radius-card)] p-6">
            <p className="text-[clamp(22px,2vw,34px)] font-semibold leading-none">{t}</p>
            <p className="mt-2 text-[clamp(14px,1.1vw,18px)] text-ink-3">{d}</p>
          </li>
        ))}
      </ul>
    </OneIdea>
  );
}

function CalmGridApp() {
  return <InApp />;
}

function TabBarDemo() {
  const order = ["home", "updates", "home"];
  const [active, setActive] = useState("home");
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => { i = (i + 1) % order.length; setActive(order[i]); }, 3200);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="reveal-pop mx-auto mt-8 w-fit" style={{ ["--tb" as string]: "52px" }}>
      <TabBar active={active} decorative />
    </div>
  );
}

function MotionSlide() {
  return (
    <OneIdea kicker="The idea · Motion" title="Motion that bubbles, never shouts." sub="Press, the actions bubble out toward the pin, release. Soft springs and blur fades. Never a hard cut.">
      <div>
        <PressDemo />
        <TabBarDemo />
      </div>
    </OneIdea>
  );
}

function LoudAds() {
  return (
    <OneIdea kicker="Loud ideas · Ads & comms" title="Out in the world, it gets loud." sub="Thick borders, hard shadows, stickers and one red. Built to stop the scroll and pull people in.">
      <div className="relative mx-auto aspect-[4/5] w-[min(100%,52vh)]">
        <div className="reveal-pop tonal t-red absolute inset-0 -rotate-3 overflow-hidden rounded-[var(--radius-card)] p-6" style={{ ["--t-depth" as string]: "10px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={PEOPLE[10]} alt="" className="h-[62%] w-full rounded-[var(--radius-img)] object-cover" />
          <p className="mt-5 text-[clamp(30px,3.6vw,60px)] font-semibold leading-[0.95] tracking-tight">Made it<br />together.</p>
        </div>
        <span className="reveal-pop tonal t-amber absolute -right-8 top-8 rotate-6 rounded-full px-5 py-2 text-xl font-semibold" style={{ ["--t-depth" as string]: "5px" }}>★ Saved by 12</span>
        <span className="reveal-pop tonal t-green absolute -left-10 bottom-16 -rotate-6 rounded-full px-5 py-2 text-xl font-semibold" style={{ ["--t-depth" as string]: "5px" }}>Try it this weekend</span>
      </div>
    </OneIdea>
  );
}

function Audience() {
  const people = [
    { who: "Women 18–34", what: "Everyday planners and savers. The two largest groups on Pinterest.", tone: "t-grey", where: "Calm grid" },
    { who: "Gen Z 16–24", what: "Arrive from TikTok and Instagram. Over half of Pinterest’s users.", tone: "t-red", where: "Loud ideas" },
  ];
  return (
    <div className="flex h-full flex-col justify-center gap-10 px-6 md:px-20">
      <div>
        <Kicker>Evidence · Who it’s for</Kicker>
        <Title className="mt-4">Two people, one Pinterest.</Title>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {people.map((p) => (
          <div key={p.who} className={`reveal-pop tonal ${p.tone} rounded-[var(--radius-card)] p-8 md:p-10`} style={{ ["--t-depth" as string]: p.tone === "t-red" ? "8px" : "0px" }}>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] opacity-80">{p.where}</p>
            <p className="mt-3 text-[clamp(34px,4vw,68px)] font-semibold leading-none tracking-tight">{p.who}</p>
            <p className="mt-4 max-w-[30ch] text-[clamp(17px,1.5vw,24px)] leading-snug">{p.what}</p>
          </div>
        ))}
      </div>
      <p className="reveal text-sm text-ink-3">Sources: DataReportal 2025 · Pinterest Q2 2025 results · Pinterest Business audience.</p>
    </div>
  );
}

function CalmKeeps() {
  return (
    <OneIdea kicker="Evidence · Calm grid" title="Calm keeps you in." sub="A quiet, warm interface lets photos lead. Nothing pushes you out, so planning stays relaxed and sessions stay longer.">
      <div className="h-[70vh] overflow-hidden fade-edges"><MasonryMini srcs={PEOPLE.slice(2, 14)} cols={3} /></div>
    </OneIdea>
  );
}

function LoudPulls() {
  return (
    <OneIdea kicker="Evidence · Loud ideas" title="Loud pulls you in." sub="Brutalist stickers and hard shadows catch the eye in ads and social, then point to one action: open, save, make it.">
      <div className="flex flex-wrap items-center justify-center gap-6">
        <span className="reveal-pop tonal t-red rounded-full px-8 py-4 text-[clamp(22px,2.4vw,40px)] font-semibold" style={{ ["--t-depth" as string]: "8px" }}>Open Pinterest</span>
        <span className="reveal-pop tonal t-amber -rotate-6 rounded-full px-8 py-4 text-[clamp(22px,2.4vw,40px)] font-semibold" style={{ ["--t-depth" as string]: "8px" }}>★ Save the idea</span>
        <span className="reveal-pop tonal t-green rotate-3 rounded-full px-8 py-4 text-[clamp(22px,2.4vw,40px)] font-semibold" style={{ ["--t-depth" as string]: "8px" }}>Made it!</span>
      </div>
    </OneIdea>
  );
}

function ImpactWhy() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <Kicker>Impact · Why it matters</Kicker>
      <p className="reveal mt-6 max-w-[18ch] font-semibold tracking-tight leading-[0.95] text-[clamp(44px,7vw,128px)]">
        Next to TikTok and Instagram, <span className="text-brand-text">quiet is invisible.</span>
      </p>
      <Sub>Pinterest needs a brand you can recognize without the logo, in the app and outside it.</Sub>
    </div>
  );
}

function ImpactEffects() {
  const fx = [["Recognition", "A style people spot before they see the logo.", "t-red"], ["Retention", "A calm app people stay in to plan.", "t-grey"], ["Community", "Every accent is a person, so users feel seen.", "t-amber"]] as const;
  return (
    <div className="flex h-full flex-col justify-center gap-10 px-6 md:px-20">
      <div>
        <Kicker>Impact · What changes</Kicker>
        <Title className="mt-4">A brand, not just a red.</Title>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {fx.map(([t, d, tone]) => (
          <div key={t} className={`reveal-pop tonal ${tone} rounded-[var(--radius-card)] p-8`} style={{ ["--t-depth" as string]: "6px" }}>
            <p className="text-[clamp(30px,3vw,52px)] font-semibold leading-none tracking-tight">{t}</p>
            <p className="mt-3 text-[clamp(16px,1.3vw,22px)] leading-snug">{d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- deck engine ---------- */

export default function Deck() {
  const origin = useOrigin();
  const [i, setI] = useState(0);
  const cur = useRef(0);
  const busy = useRef(false);
  const root = useRef<HTMLDivElement>(null);
  const N = STEP_NAMES.length;
  const MOOD = STEP_NAMES.indexOf("Moodboard");

  const go = useCallback(
    (next: number) => {
      next = Math.max(0, Math.min(N - 1, next));
      if (next === cur.current || busy.current) return;
      busy.current = true;
      const els = root.current!.querySelectorAll<HTMLElement>("[data-step]");
      const from = els[cur.current];
      const to = els[next];
      const dir = next > cur.current ? 1 : -1;
      const tl = gsap.timeline({ onComplete: () => { busy.current = false; } });
      // V2-borrowed fade: blur + opacity, never a hard cut
      tl.to(from, { opacity: 0, filter: "blur(12px)", y: -40 * dir, duration: 0.55, ease: "power2.in" })
        .set(from, { visibility: "hidden" })
        .set(to, { visibility: "visible", opacity: 1, filter: "blur(0px)", y: 0 })
        .fromTo(to.querySelectorAll(".reveal"), { opacity: 0, y: 50 * dir, filter: "blur(8px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.9, stagger: 0.08, ease: "power3.out" })
        .fromTo(to.querySelectorAll(".reveal-img"), { opacity: 0, y: 80, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 1, stagger: { each: 0.03, from: "random" }, ease: "power3.out" }, "<0.1")
        .fromTo(to.querySelectorAll(".reveal-pop"), { scale: 0, rotate: -12 }, { scale: 1, rotate: 0, duration: 0.8, stagger: 0.07, ease: "back.out(2.2)" }, "<0.2");
      cur.current = next;
      setI(next);
      if (!location.hash.includes("figmacapture")) history.replaceState(null, "", `#${next + 1}`);
    },
    [N],
  );

  // initial state + deep link (#n) — also used for PDF export
  useEffect(() => {
    const q = new URLSearchParams(location.search).get("step");
    const start = Math.max(0, Math.min(N - 1, (parseInt(q || location.hash.slice(1)) || 1) - 1));
    const els = root.current!.querySelectorAll<HTMLElement>("[data-step]");
    els.forEach((el, k) => gsap.set(el, { visibility: k === start ? "visible" : "hidden" }));
    cur.current = start;
    setI(start);
    const to = els[start];
    gsap.fromTo(to.querySelectorAll(".reveal"), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1, stagger: 0.08, ease: "power3.out" });
    gsap.fromTo(to.querySelectorAll(".reveal-img"), { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1, stagger: 0.03, ease: "power3.out" });
    gsap.fromTo(to.querySelectorAll(".reveal-pop"), { scale: 0 }, { scale: 1, duration: 0.8, delay: 0.4, stagger: 0.07, ease: "back.out(2.2)" });
    // ?static → jump every intro tween to its end (PDF export / screenshots)
    if (location.search.includes("static")) document.documentElement.classList.add("is-static");
    if (location.search.includes("static")) gsap.globalTimeline.getChildren(true, true, false).forEach((tw) => tw.progress(1));
  }, [N]);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (["ArrowRight", "ArrowDown", "PageDown", " "].includes(e.key)) { e.preventDefault(); go(cur.current + 1); }
      if (["ArrowLeft", "ArrowUp", "PageUp"].includes(e.key)) { e.preventDefault(); go(cur.current - 1); }
    };
    let lastWheel = 0;
    const wheel = (e: WheelEvent) => {
      const now = Date.now();
      if (e.ctrlKey || e.metaKey || (e.target as HTMLElement).closest?.("[data-ui]")) return;
      if (now - lastWheel < 1100 || Math.abs(e.deltaY) < 25) return;
      lastWheel = now;
      go(cur.current + (e.deltaY > 0 ? 1 : -1));
    };
    let sx = 0, sy = 0, onCanvas = false;
    const ts = (e: TouchEvent) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; onCanvas = !!(e.target as HTMLElement).closest("[data-canvas]"); };
    const te = (e: TouchEvent) => {
      if (onCanvas) return;
      const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 50) return;
      go(cur.current + ((Math.abs(dx) > Math.abs(dy) ? dx : dy) < 0 ? 1 : -1));
    };
    window.addEventListener("keydown", key);
    window.addEventListener("wheel", wheel, { passive: true });
    window.addEventListener("touchstart", ts, { passive: true });
    window.addEventListener("touchend", te);
    return () => {
      window.removeEventListener("keydown", key);
      window.removeEventListener("wheel", wheel);
      window.removeEventListener("touchstart", ts);
      window.removeEventListener("touchend", te);
    };
  }, [go]);

  const steps = [
    <Intro key="in" origin={origin} />,
    <Cover key="c" />,
    <Divider key="d1" n="01" title="Context" q="What are we fixing?" />,
    <CtxPersonality key="c1" />,
    <CtxComms key="c2" />,
    <CtxDevices key="c3" />,
    <CtxMinor key="c4" />,
    <Divider key="d2" n="02" title="What did we learn?" q="Four things Pinterest already owns." />,
    <InsightGrid key="g" />,
    <InsightCircle key="ci" />,
    <InsightColor key="co" />,
    <InsightPeople key="p" />,
    <Opportunity key="o" />,
    <Divider key="d3" n="03" title="The idea" q="What are we proposing?" />,
    <Direction key="dir" />,
    <Moodboard key="m" />,
    <Voices key="v" />,
    <CalmGridApp key="a" />,
    <MotionSlide key="mo" />,
    <FourActions key="fa" />,
    <LoudAds key="ads" />,
    <Divider key="d4" n="04" title="Evidence" q="How does the design support the idea?" />,
    <Audience key="au" />,
    <CalmKeeps key="ck" />,
    <LoudPulls key="lp" />,
    <Divider key="d5" n="05" title="Impact" q="Why does it matter?" />,
    <ImpactWhy key="iw" />,
    <ImpactEffects key="ie" />,
    <Thanks key="th" origin={origin} />,
  ];

  return (
    <main ref={root} className="relative h-dvh w-full overflow-hidden bg-bg">
      {steps.map((s, k) => (
        <section key={k} data-step aria-label={STEP_NAMES[k]} aria-hidden={k !== i} className="absolute inset-0" style={{ visibility: k === 0 ? "visible" : "hidden" }}>
          {/* only mount the heavy canvas when near it */}
          {k === MOOD && Math.abs(i - MOOD) > 1 ? null : s}
        </section>
      ))}

      <nav data-hide-capture className="absolute bottom-5 right-5 md:bottom-8 md:right-8 z-50 flex items-center gap-3" aria-label="Slides">
        <span className="hidden md:inline text-sm tabular-nums text-ink-3">{String(i + 1).padStart(2, "0")} / {N}</span>
        <button onClick={() => go(i - 1)} disabled={i === 0} aria-label="Previous" className="tonal t-grey grid h-12 w-12 place-items-center rounded-full disabled:opacity-40" style={{ ["--t-depth" as string]: "3px" }}>
          <ArrowLeft size={20} weight="bold" />
        </button>
        <button onClick={() => go(i + 1)} disabled={i === N - 1} aria-label="Next" className="tonal t-red grid h-12 w-12 place-items-center rounded-full disabled:opacity-40" style={{ ["--t-depth" as string]: "3px" }}>
          <ArrowRight size={20} weight="bold" />
        </button>
      </nav>
      <div data-hide-capture className="absolute left-0 top-0 z-10 h-1 bg-brand transition-[width] duration-700" style={{ width: `${((i + 1) / N) * 100}%` }} />
    </main>
  );
}
