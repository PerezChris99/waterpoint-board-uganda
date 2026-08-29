"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// Four abstract, animated "scenes" evoking dawn, borehole, community, and dusk —
// built entirely from CSS gradients/SVG so the hero never depends on external
// images that could break or carry unclear licensing.
const SCENES = [
  "radial-gradient(circle at 20% 20%, #4f9bd9 0%, transparent 55%), radial-gradient(circle at 80% 70%, #35b9ac 0%, transparent 50%), linear-gradient(160deg, #0a1628 0%, #1e3a5f 55%, #2f7ec2 100%)",
  "radial-gradient(circle at 75% 25%, #d99a2b 0%, transparent 45%), radial-gradient(circle at 15% 80%, #2f7ec2 0%, transparent 55%), linear-gradient(150deg, #0f2038 0%, #16283f 50%, #1e3a5f 100%)",
  "radial-gradient(circle at 50% 15%, #5fd0c4 0%, transparent 50%), radial-gradient(circle at 85% 85%, #2b4d76 0%, transparent 55%), linear-gradient(170deg, #0a1628 0%, #2f7ec2 60%, #35b9ac 100%)",
  "radial-gradient(circle at 30% 75%, #c1483d 0%, transparent 40%), radial-gradient(circle at 70% 20%, #4f9bd9 0%, transparent 50%), linear-gradient(160deg, #0f2038 0%, #1e3a5f 55%, #0a1628 100%)",
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

  return (
    <div ref={heroRef} className="relative isolate flex min-h-[88vh] items-center justify-center overflow-hidden">
      {SCENES.map((scene, i) => (
        <div
          key={i}
          aria-hidden
          className="absolute inset-0 -z-20 transition-opacity duration-[2000ms] ease-in-out"
          style={{
            background: scene,
            opacity: i === sceneIndex ? 1 : 0,
            transform: `translateY(${offset}px) scale(1.15)`,
          }}
        />
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
      <div aria-hidden className="absolute inset-0 -z-10 bg-black/45 backdrop-blur-[2px]" />

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
    </div>
  );
}
