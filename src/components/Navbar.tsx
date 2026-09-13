"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { ResearchBadge } from "./ResearchBadge";

const links = [
  { href: "/explore", label: "Explore" },
  { href: "/compare", label: "Compare" },
  { href: "/experiment", label: "Experiment" },
  { href: "/about", label: "Methodology" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-cashmere/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-5 sm:px-8">
        <Link href="/" className="group flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="relative h-9 w-9 overflow-hidden rounded-md bg-ivory ring-1 ring-line">
            <Image src="/logo.png" alt="" fill sizes="36px" className="object-cover object-top mix-blend-multiply" priority />
          </span>
          <span className="font-sans text-[0.8rem] font-semibold tracking-[0.24em] text-bush">MORPHOLENS</span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 md:flex" aria-label="Primary">
          {links.map((l) => {
            const active = pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                  active ? "bg-bush text-ivory" : "text-ink/75 hover:bg-oak-soft hover:text-bush"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto hidden md:ml-2 md:block">
          <ResearchBadge />
        </div>

        <button
          className="ml-auto rounded-md p-2 text-bush md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle navigation"
          aria-expanded={open}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-line bg-ivory px-5 py-3 md:hidden" aria-label="Mobile">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`block rounded-md px-3 py-2 text-sm ${pathname.startsWith(l.href) ? "bg-bush text-ivory" : "text-ink"}`}
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-3 px-3">
            <ResearchBadge />
          </div>
        </nav>
      )}
    </header>
  );
}
