"use client";

import { useEffect, useRef, useState } from "react";

export interface TimelineStep {
  title: string;
  description: string;
}

export function AnimatedTimeline({ steps }: { steps: TimelineStep[] }) {
  const [visible, setVisible] = useState<boolean[]>(() => steps.map(() => false));
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = Number((entry.target as HTMLElement).dataset.index);
          setVisible((prev) => {
            if (prev[index]) return prev;
            const next = [...prev];
            next[index] = true;
            return next;
          });
        }
      },
      { threshold: 0.3, rootMargin: "0px 0px -10% 0px" },
    );
    for (const el of refs.current) {
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <ol className="relative border-l-2 border-black/10 pl-6 dark:border-white/15">
      {steps.map((step, index) => (
        <li
          key={step.title}
          ref={(el) => {
            refs.current[index] = el;
          }}
          data-index={index}
          className={`relative pb-10 transition-all duration-700 ease-out last:pb-0 motion-reduce:opacity-100 motion-reduce:translate-y-0 motion-reduce:transition-none ${
            visible[index] ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          <span
            aria-hidden
            className={`absolute top-1 -left-[1.95rem] h-3.5 w-3.5 rounded-full border-2 border-[var(--background)] transition-colors duration-500 ${
              visible[index] ? "bg-[var(--wb-water-500)]" : "bg-black/20 dark:bg-white/20"
            }`}
          />
          <p className="text-sm font-semibold text-[var(--foreground)]">{step.title}</p>
          <p className="mt-1 text-sm text-black/70 dark:text-white/70">{step.description}</p>
        </li>
      ))}
    </ol>
  );
}
