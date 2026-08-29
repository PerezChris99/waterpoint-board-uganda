import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How WaterPoint Board Uganda collects, uses, and protects data.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold">Privacy Policy</h1>
      <p className="mt-2 text-sm text-black/50 dark:text-white/50">Last updated: August 2026</p>

      <div className="mt-8 space-y-6 text-black/75 dark:text-white/75">
        <section>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">What we collect</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <strong>Account holders:</strong> name, email address, a securely hashed password
              (never the password itself), role, and an optional village.
            </li>
            <li>
              <strong>Reports:</strong> issue category, description, an optional reporter name, and
              an optional linked account if the reporter is signed in.
            </li>
            <li>
              <strong>Maintenance logs:</strong> the action taken, notes, the water point involved,
              and the caretaker who logged it.
            </li>
            <li>
              <strong>Audit logs:</strong> who did what, when, and to which record — used strictly
              for accountability, never for profiling.
            </li>
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">What we do not collect</h2>
          <p className="mt-2">
            We do not collect health data, payment information, or national identification numbers.
            Water point coordinates identify infrastructure, not people.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Location, on the map page</h2>
          <p className="mt-2">
            The map page can ask your browser to share your device&rsquo;s precise (GPS) location, so
            we can show water points near you and draw a route to one you pick. This is entirely
            opt-in — your browser shows its own permission prompt, and nothing happens if you decline.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Your location is used only in your browser to work out distances to nearby water points.</li>
            <li>
              Our servers never receive or store your location. It is not linked to your account,
              logged, or shared with anyone on our side.
            </li>
            <li>
              If you ask for directions, your coordinates and the water point&rsquo;s coordinates are
              sent directly from your browser to{" "}
              <a href="https://project-osrm.org" target="_blank" rel="noopener noreferrer" className="underline">
                OSRM
              </a>
              , a free, independent routing service, solely to calculate that one route. Map tiles are
              served by{" "}
              <a href="https://openfreemap.org" target="_blank" rel="noopener noreferrer" className="underline">
                OpenFreeMap
              </a>
              . Neither service receives your name, email, or account details from us.
            </li>
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">How data is used</h2>
          <p className="mt-2">
            Data is used exclusively to operate the reporting and maintenance workflow: showing
            caretakers the reports assigned to their water points, letting administrators oversee
            users and infrastructure, and powering the public map and statistics pages with
            aggregate, non-personal figures. We do not sell data, run advertising, or share data with
            third parties.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Security</h2>
          <p className="mt-2">
            Passwords are hashed with bcrypt and never stored or logged in plain text. Sessions use
            signed, HTTP-only cookies. Access to every record is enforced by role-based permissions
            checked on every request. See our{" "}
            <a href="/data-methodology" className="underline">
              data methodology
            </a>{" "}
            page for more on how the underlying data is produced.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Your rights</h2>
          <p className="mt-2">
            Account holders may request access to, correction of, or deletion of their personal
            account data at any time by contacting us using the contact icons in the site footer.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Public demo instance</h2>
          <p className="mt-2">
            The publicly hosted demo of this platform runs on fictional seed data for a composite,
            invented community. A production deployment for a real district, NGO, or government body
            would be provisioned with its own database and would follow this same policy for the real
            data it holds.
          </p>
        </section>
      </div>
    </main>
  );
}
