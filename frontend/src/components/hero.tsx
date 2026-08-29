"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

// Real, verified free-license photographs taken in Uganda (Wikimedia Commons),
// self-hosted in public/hero. See /copyright for full attribution details.
const SCENES = [
  {
    src: "/hero/hero-1-borehole-child.jpg",
    alt: "A young child pumping water from a community borehole in rural Uganda",
    credit: { name: "Mmukwa59", license: "CC0", url: "https://commons.wikimedia.org/wiki/File:A_young_child_fetching_water_from_a_borehole_in_a_rural_setting.jpg" },
  },
  {
    src: "/hero/hero-2-tap-stand.jpg",
    alt: "Children fetching water from a public tap stand in Uganda",
    credit: { name: "Ronaldladu John", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:Children_fetching_water_from_taps_in_rhino_camp.jpg" },
  },
  {
    src: "/hero/hero-3-girl-pumping.jpg",
    alt: "A girl pumping water from a community borehole beside a yellow jerrycan",
    credit: { name: "Mozerayayena", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:A_girl_pumping_a_borehole.jpg" },
  },
  {
    src: "/hero/hero-4-jerrycans.jpg",
    alt: "Girls carrying jerrycans of water fetched from a borehole, balanced on their heads",
    credit: { name: "Denis Kasozi", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:Girls_carrying_jerrycans_of_water_on_the_head_06.jpg" },
  },
];

export function Hero() {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [offset, setOffset] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(() => setSceneIndex((i) => (i + 1) % SCENES.length), 6000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;
    function onScroll() {
      setOffset(window.scrollY * 0.35);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const activeCredit = SCENES[sceneIndex].credit;

  return (
    <div ref={heroRef} className="relative isolate flex min-h-[88vh] items-center justify-center overflow-hidden">
      {SCENES.map((scene, i) => (
        <div
          key={scene.src}
          aria-hidden={i !== sceneIndex}
          className="absolute inset-0 -z-20 transition-opacity duration-[2000ms] ease-in-out"
          style={{
            opacity: i === sceneIndex ? 1 : 0,
            transform: `translateY(${offset}px) scale(1.15)`,
          }}
        >
          <Image
            src={scene.src}
            alt={scene.alt}
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover"
          />
        </div>
      ))}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-32 w-full text-[var(--background)]"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
      >
        <path
          fill="currentColor"
          d="M0,64 C240,120 480,0 720,32 C960,64 1200,120 1440,64 L1440,120 L0,120 Z"
        />
      </svg>
      <div aria-hidden className="absolute inset-0 -z-10 bg-black/55 backdrop-blur-[1px]" />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-5 px-6 py-24 text-center text-white">
        <p className="max-w-2xl text-sm font-medium tracking-[0.2em] text-[var(--wb-teal-300)] uppercase">
          Community water-point tracker · Uganda
        </p>
        <h1 className="max-w-xl text-4xl font-semibold sm:text-5xl">WaterPoint Board Uganda</h1>
        <p className="max-w-md text-base text-white/85 sm:text-lg">
          Live status, community reporting, and caretaker &amp; admin tools for every borehole, well,
          and tap stand — built for real adoption.
        </p>
        <div className="flex w-fit flex-wrap justify-center gap-3">
          <Link
            href="/water-points"
            className="rounded-md bg-[var(--wb-water-500)] px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-black/20 transition-colors hover:bg-[var(--wb-water-400)]"
          >
            Explore water points
          </Link>
          <Link
            href="/map"
            className="rounded-md border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/20"
          >
            View live map &amp; insights
          </Link>
        </div>
      </div>

      <a
        href={activeCredit.url}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-3 right-3 z-10 rounded bg-black/40 px-2 py-1 text-[10px] text-white/70 backdrop-blur transition-colors hover:text-white"
      >
        Photo: {activeCredit.name} · {activeCredit.license} · Wikimedia Commons
      </a>
    </div>
  );
}

