import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "About the WaterPoint Board Uganda demonstration project.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-semibold">About this project</h1>
      <p className="mt-4 text-black/70 dark:text-white/70">
        WaterPoint Board Uganda is a full-stack demonstration platform for tracking the
        operational status of community water points — boreholes, shallow wells, protected
        springs, tap stands, and rainwater harvesting tanks — in one small, fictional Ugandan
        community.
      </p>
      <p className="mt-4 text-black/70 dark:text-white/70">
        It models a realistic workflow: community members report issues, caretakers triage and
        resolve them, and administrators oversee users, water points, and analytics. Every
        interaction is backed by a real database and a role-based access control system.
      </p>
      <p className="mt-4 text-black/70 dark:text-white/70">
        This platform does not certify water quality or drinking-water safety, does not detect
        contamination, and does not replace local water authorities or government systems.
      </p>
    </main>
  );
}
