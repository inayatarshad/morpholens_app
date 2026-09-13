"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/**
 * Splash shown on every full page load (client-side navigation does not replay it).
 * All timing lives in CSS (see .splash in globals.css): the wordmark opens out from a
 * closed centre, a cream light sweeps across it, it holds for about 1.45 s and fades out.
 * The element is removed from the DOM once the fade has finished.
 */
export function Splash() {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDone(true), 2300);
    return () => clearTimeout(t);
  }, []);
  if (done) return null;
  return (
    <div className="splash" aria-hidden>
      <Image src="/splash-bg.png" alt="" fill priority sizes="100vw" quality={70} className="object-cover" />
      <div className="splash-vignette" />
      <span className="splash-beam" />
      <div className="relative flex flex-col items-center gap-6">
        <span className="splash-mark">MorphoLens</span>
        <span className="splash-rule" />
      </div>
    </div>
  );
}
