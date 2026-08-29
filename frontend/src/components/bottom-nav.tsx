"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SVGProps } from "react";

interface BottomNavProps {
  session: { name: string; role: string } | null;
}

type IconProps = SVGProps<SVGSVGElement> & { active?: boolean };

function HomeIcon({ active, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={active ? 2.4 : 1.8} stroke="currentColor" {...props}>
      <path d="M4 11.5 12 4l8 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 10v9a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1v-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DropletIcon({ active, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={active ? 2.4 : 1.8} stroke="currentColor" {...props}>
      <path
        d="M12 3.5c3 3.6 6 7.2 6 10.7a6 6 0 1 1-12 0c0-3.5 3-7.1 6-10.7Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MapPinIcon({ active, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={active ? 2.4 : 1.8} stroke="currentColor" {...props}>
      <path
        d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9.5" r="2.4" />
    </svg>
  );
}

function InfoIcon({ active, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={active ? 2.4 : 1.8} stroke="currentColor" {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5.5" strokeLinecap="round" />
      <circle cx="12" cy="8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function WrenchIcon({ active, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={active ? 2.4 : 1.8} stroke="currentColor" {...props}>
      <path
        d="M14.7 6.3a3.5 3.5 0 0 0-4.6 4.2L4 16.6 7.4 20l6.1-6.1a3.5 3.5 0 0 0 4.2-4.6l-2.6 2.6-2-2 2.6-2.6Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShieldIcon({ active, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={active ? 2.4 : 1.8} stroke="currentColor" {...props}>
      <path
        d="M12 3.5 5 6v6c0 4.5 3 7.6 7 8.5 4-.9 7-4 7-8.5V6l-7-2.5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PersonIcon({ active, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={active ? 2.4 : 1.8} stroke="currentColor" {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" strokeLinecap="round" />
    </svg>
  );
}

export function BottomNav({ session }: BottomNavProps) {
  const pathname = usePathname();

  const items: { href: string; label: string; Icon: typeof HomeIcon }[] = [
    { href: "/", label: "Home", Icon: HomeIcon },
    { href: "/water-points", label: "Points", Icon: DropletIcon },
    { href: "/map", label: "Map", Icon: MapPinIcon },
    { href: "/about", label: "About", Icon: InfoIcon },
  ];

  if (session?.role === "CARETAKER" || session?.role === "ADMIN") {
    items.push({ href: "/dashboard/caretaker", label: "Care", Icon: WrenchIcon });
  }
  if (session?.role === "ADMIN") {
    items.push({ href: "/dashboard/admin", label: "Admin", Icon: ShieldIcon });
  }
  if (!session) {
    items.push({ href: "/login", label: "Log in", Icon: PersonIcon });
  }

  return (
    <nav
      aria-label="Primary (mobile)"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-[var(--background)]/90 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-[backdrop-filter]:bg-[var(--background)]/75 sm:hidden"
    >
      <ul className="flex items-stretch justify-around">
        {items.map(({ href, label, Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
                  active ? "text-[var(--wb-water-500)]" : "text-black/55 dark:text-white/55"
                }`}
              >
                <Icon active={active} className="h-6 w-6" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
