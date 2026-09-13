"use client";

import { useCallback, useEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from "react";

/**
 * Scroll-driven typography primitives. All motion is written to CSS variables or data
 * attributes directly on the DOM (no React re-renders), and switches off entirely for
 * users who prefer reduced motion.
 */

const prefersReduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Exposes scroll progress on the wrapper as the CSS variable `--p` (0 → 1).
 *  through: 0 when the top enters at the bottom of the viewport, 1 when the bottom leaves at the top.
 *  exit:    0 while the element's top is at the top of the viewport, 1 once it has scrolled out.
 */
export function Scene({
  children,
  className,
  mode = "through",
  style,
}: {
  children: ReactNode;
  className?: string;
  mode?: "through" | "exit";
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReduced()) {
      el.style.setProperty("--p", mode === "exit" ? "0" : "0.5");
      return;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const p = mode === "exit" ? -r.top / Math.max(1, r.height) : (vh - r.top) / (vh + r.height);
      el.style.setProperty("--p", Math.min(1, Math.max(0, p)).toFixed(4));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [mode]);
  return (
    <div ref={ref} className={className} style={{ ...({ "--p": mode === "exit" ? 0 : 0.5 } as CSSProperties), ...style }}>
      {children}
    </div>
  );
}

/**
 * Calls `onVisible` once, the first time the element's top is within 90% of the viewport
 * height (or already above it). Uses the same scroll + requestAnimationFrame loop as
 * Scene rather than IntersectionObserver, so it behaves identically everywhere.
 */
function useFirstVisible(ref: RefObject<HTMLElement | null>, onVisible: (el: HTMLElement) => void) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    let done = false;
    const stop = () => {
      done = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
    const check = () => {
      frame = 0;
      if (done) return;
      if (el.getBoundingClientRect().top < window.innerHeight * 0.9) {
        stop();
        onVisible(el);
      }
    };
    function schedule() {
      if (!frame) frame = requestAnimationFrame(check);
    }
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    check();
    return stop;
  }, [ref, onVisible]);
}

const markShown = (el: HTMLElement) => {
  el.dataset.shown = "true";
};

/** Sets data-shown="true" the first time the element scrolls into view. */
function useShowOnView(ref: RefObject<HTMLElement | null>) {
  useFirstVisible(ref, markShown);
}

/** Fades and lifts its content into place when it enters the viewport. */
export function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useShowOnView(ref);
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ "--d": `${delay}ms` } as CSSProperties}>
      {children}
    </div>
  );
}

/** Word-by-word entrance for headings. Put it inside the heading element. */
export function KineticText({ segments }: { segments: { text: string; className?: string }[] }) {
  const ref = useRef<HTMLSpanElement>(null);
  useShowOnView(ref);
  const words: { w: string; cls?: string; space: boolean }[] = [];
  for (const s of segments) {
    s.text.split(/(\s+)/).forEach((w) => {
      if (!w) return;
      if (/^\s+$/.test(w)) words.push({ w: " ", space: true });
      else words.push({ w, cls: s.className, space: false });
    });
  }
  let n = 0;
  return (
    <span ref={ref} className="kinetic">
      {words.map((x, i) =>
        x.space ? (
          " "
        ) : (
          <span key={i} className={`kw ${x.cls ?? ""}`} style={{ "--i": n++ } as CSSProperties}>
            {x.w}
          </span>
        ),
      )}
    </span>
  );
}

const formatNumber = (v: number, decimals: number, sign: string, grouped: boolean) =>
  sign + (grouped ? Math.round(v).toLocaleString("en") : Math.abs(v).toFixed(decimals));

/**
 * Counts up to `value` when first scrolled into view. The real value is in the DOM until
 * the moment the animation starts and is always where it ends, so the number shown is
 * never wrong, with or without JavaScript.
 */
export function CountUp({ value, decimals = 1, signed = false, grouped = false }: { value: number; decimals?: number; signed?: boolean; grouped?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const sign = signed ? (value > 0.05 ? "+" : value < -0.05 ? "−" : "±") : "";
  const finalText = formatNumber(value, decimals, sign, grouped);
  const frame = useRef(0);
  const animate = useCallback(
    (el: HTMLElement) => {
      if (prefersReduced()) return;
      const start = performance.now();
      const tick = (t: number) => {
        const k = Math.min(1, (t - start) / 1100);
        const eased = 1 - Math.pow(1 - k, 3);
        el.textContent = k < 1 ? formatNumber(Math.abs(value) * eased, decimals, sign, grouped) : finalText;
        if (k < 1) frame.current = requestAnimationFrame(tick);
      };
      frame.current = requestAnimationFrame(tick);
    },
    [value, decimals, sign, grouped, finalText],
  );
  useFirstVisible(ref, animate);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  return <span ref={ref}>{finalText}</span>;
}

export type MarqueeWord = { segs: string[]; rtl?: boolean; note?: string };

/**
 * Rows of real word forms, split into stem and exponents, that slide sideways and
 * change weight as the page scrolls. Rows alternate direction.
 */
export function MorphemeMarquee({ rows }: { rows: MarqueeWord[][] }) {
  return (
    <Scene className="relative overflow-hidden py-10 sm:py-14">
      <div className="space-y-2 sm:space-y-4" aria-hidden>
        {rows.map((row, ri) => {
          const dir = ri % 2 === 0 ? -1 : 1;
          const weight = ri % 2 === 0 ? "calc(300 + var(--p) * 450)" : "calc(750 - var(--p) * 450)";
          return (
            <div
              key={ri}
              className="flex w-max items-baseline gap-[0.6em] whitespace-nowrap will-change-transform"
              style={{
                transform: `translate3d(calc(-28vw + (var(--p) - 0.5) * ${dir * 46}vw), 0, 0)`,
                fontSize: "clamp(2.6rem, 1rem + 7vw, 8rem)",
                lineHeight: 1.15,
              }}
            >
              {[...row, ...row, ...row].map((w, wi) => (
                <span key={wi} className="inline-flex items-baseline">
                  <span className={w.rtl ? "urdu" : "font-serif"} dir={w.rtl ? "rtl" : undefined} style={{ fontWeight: weight, lineHeight: 1.15 }}>
                    {w.segs.map((s, si) => (
                      <span key={si}>
                        {si > 0 && <span className="mx-[0.06em] text-oak">·</span>}
                        <span className={si % 2 === 0 ? "text-bush" : "italic text-sienna"}>{s}</span>
                      </span>
                    ))}
                  </span>
                  <span className="ml-[0.6em] text-[0.3em] text-oak">✦</span>
                </span>
              ))}
            </div>
          );
        })}
      </div>
    </Scene>
  );
}
