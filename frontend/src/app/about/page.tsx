import type { Metadata } from "next";
import Link from "next/link";
import { AnimatedTimeline } from "@/components/animated-timeline";

export const metadata: Metadata = {
  title: "About",
  description: "The story behind WaterPoint Board Uganda — why it exists and how it works.",
};

const TIMELINE_STEPS = [
  {
    title: "A problem nobody could see",
    description:
      "A broken pump in Kiruli Sub-county could sit unfixed for weeks, because the people who knew about it had no way to tell the people who could fix it.",
  },
  {
    title: "A report, in under a minute",
    description:
      "Any community member can now flag an issue — no water, low pressure, contamination, physical damage — straight from their phone, no account required.",
  },
  {
    title: "A caretaker takes it on",
    description:
      "The caretaker assigned to that water point sees the report immediately, triages it, and logs the maintenance work as it happens.",
  },
  {
    title: "An administrator sees the whole picture",
    description:
      "Sub-county administrators oversee every user, water point, and report through dashboards that turn raw reports into trends worth acting on.",
  },
  {
    title: "The data speaks for itself",
    description:
      "A live map and statistics page make the current status of every water point public — no spreadsheets, no waiting for the next meeting.",
  },
];

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <p className="text-center text-sm font-medium tracking-wide text-[var(--wb-water-500)] uppercase">
        Our story
      </p>
      <h1 className="mt-2 text-center text-3xl font-semibold sm:text-4xl">
        Every borehole has a story. We built a place to tell it.
      </h1>

      <div className="mt-12 grid gap-x-10 gap-y-6 border-y border-black/10 py-10 sm:grid-cols-2 dark:border-white/10">
        <div className="text-black/75 dark:text-white/75">
          <p className="mb-6 first-letter:float-left first-letter:mr-2 first-letter:text-5xl first-letter:leading-[0.85] first-letter:font-semibold first-letter:text-[var(--wb-water-500)]">
            In Kiruli Sub-county, a walk to the nearest water point can take an hour each way — longer
            when the pump is broken and nobody outside the village knows it yet. A child misses school
            to fetch water from a source two villages over. A mother boils questionable water because
            the one she trusts has run dry. These moments never make it into any government report,
            because there was never an easy way to record them.
          </p>
          <p className="mb-6">
            <strong className="text-[var(--foreground)]">WaterPoint Board Uganda</strong> started as a
            simple question: what if every person standing at a broken pump could report it in under a
            minute, and what if the person responsible for fixing it saw that report the same day? What
            if a sub-county water officer could see, at a glance, exactly which of the 150+ water points
            under their care needed attention — instead of waiting for a phone call that might never
            come?
          </p>
        </div>
        <div className="text-black/75 dark:text-white/75">
          <p className="mb-6">
            That question became a platform. Community members report issues — no water, low pressure,
            contamination concerns, physical damage — directly from their phone. Caretakers, assigned to
            specific water points, triage those reports and log the maintenance work they do. Sub-county
            administrators oversee the whole picture: every user, every water point, every report, and
            dashboards that turn raw reports into trends worth acting on.
          </p>
          <p className="mb-6">
            It is built the way a real public-infrastructure system should be: role-based access so
            people only see and do what their responsibility allows, an audit trail for accountability,
            rate-limited and validated reporting to resist abuse, and a live map and statistics page so
            the data speaks for itself — no spreadsheets, no waiting for the next meeting.
          </p>
          <p>
            We believe tools like this belong in the hands of the people who most need them: rural water
            committees, district water offices, NGOs running WASH programmes, and the communities they
            serve. WaterPoint Board is designed so any of them — or a national government body — could
            adopt it, retag it to their own villages, and start tracking real infrastructure the same
            day.
          </p>
        </div>
      </div>

      <section className="mt-14">
        <h2 className="text-center text-2xl font-semibold">How a report becomes a fix</h2>
        <div className="mx-auto mt-8 max-w-2xl">
          <AnimatedTimeline steps={TIMELINE_STEPS} />
        </div>
      </section>

      <div className="mt-14 rounded-lg border border-black/10 bg-[var(--wb-surface-100)] p-5 text-sm dark:border-white/10 dark:bg-[var(--wb-surface-800)]">
        <p className="font-medium text-[var(--foreground)]">A note on the data you see here</p>
        <p className="mt-1.5 text-black/70 dark:text-white/70">
          This public instance runs on fictional demonstration data for Kiruli Sub-county — a
          composite, invented place — so the workflow can be explored safely. WaterPoint Board does
          not certify water quality or drinking-water safety, and does not replace local water
          authorities. Read the full{" "}
          <Link href="/data-methodology" className="underline">
            data methodology
          </Link>{" "}
          for details.
        </p>
      </div>
    </main>
  );
}
