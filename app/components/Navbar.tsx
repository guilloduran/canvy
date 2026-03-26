"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Canvy" },
  { href: "/network", label: "Network" },
  { href: "/letry", label: "Letry" },
  { href: "/orca", label: "Orca" },
  { href: "/flow-field", label: "Flow Field" },
  { href: "/glitch-grid", label: "Glitch Grid" },
  { href: "/waveform", label: "Waveform" },
  { href: "/string-art", label: "String Art" },
  { href: "/moire", label: "Moiré" },
  { href: "/radial-pulse", label: "Radial Pulse" },
  { href: "/iso-cubes", label: "Iso Cubes" },
  { href: "/cellular", label: "Cellular" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="h-14 bg-black border-b border-white/10 flex items-center px-6 z-50 shrink-0">
      {links.map((link) => {
        const isHome = link.href === "/";
        const isActive = isHome
          ? pathname === "/"
          : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm font-medium transition-colors ${
              isHome ? "mr-8 text-base font-bold" : ""
            } ${
              isActive && !isHome
                ? "text-white border-b-2 border-white pb-0.5"
                : isActive
                  ? "text-white"
                  : "text-white/50 hover:text-white/80"
            }`}
            style={{ marginRight: isHome ? undefined : "1.5rem" }}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
