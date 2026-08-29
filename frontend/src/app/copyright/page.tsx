import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Copyright & Licensing",
  description: "Copyright ownership and licensing terms for WaterPoint Board Uganda.",
};

export default function CopyrightPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold">Copyright &amp; Licensing</h1>
      <p className="mt-2 text-sm text-black/50 dark:text-white/50">Last updated: August 2026</p>

      <div className="mt-8 space-y-6 text-black/75 dark:text-white/75">
        <section>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Ownership</h2>
          <p className="mt-2">
            &copy; {new Date().getFullYear()} Perez Chris. All rights reserved. WaterPoint Board
            Uganda — including its design, source code, database schema, and branding — is the
            original work of Perez Chris, built under{" "}
            <a href="https://kcsaas.vercel.app" target="_blank" rel="noopener noreferrer" className="underline">
              kcsaas
            </a>
            .
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Adoption by governments and NGOs</h2>
          <p className="mt-2">
            This platform was built with public-sector and NGO adoption in mind. District water
            offices, national water ministries, and NGOs running WASH programmes are welcome to
            enquire about a licensed deployment for their own communities — with their own real data,
            branding, and infrastructure. Contact us using the contact icons in the site footer to
            discuss adoption, customization, or a managed deployment.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">What is not permitted</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Copying, redistributing, or reselling the platform&rsquo;s source code without permission.</li>
            <li>Removing or altering copyright and attribution notices.</li>
            <li>Presenting a derivative of this platform as your own original work.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Map and routing credits</h2>
          <p className="mt-2">
            The live map uses{" "}
            <a href="https://maplibre.org" target="_blank" rel="noopener noreferrer" className="underline">
              MapLibre GL JS
            </a>{" "}
            with free vector tiles from{" "}
            <a href="https://openfreemap.org" target="_blank" rel="noopener noreferrer" className="underline">
              OpenFreeMap
            </a>
            , built on map data &copy;{" "}
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              OpenStreetMap contributors
            </a>
            . Road directions are calculated by the free{" "}
            <a href="https://project-osrm.org" target="_blank" rel="noopener noreferrer" className="underline">
              OSRM
            </a>{" "}
            routing service.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Demo data disclaimer</h2>
          <p className="mt-2">
            All water point, report, and user data visible on the public demo instance is fictional
            and generated for demonstration purposes only. See our{" "}
            <a href="/data-methodology" className="underline">
              data methodology
            </a>{" "}
            page for details.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Photo credits</h2>
          <p className="mt-2">
            The home page hero slideshow uses real photographs of water access in Uganda, sourced
            from Wikimedia Commons under free licenses:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              &ldquo;A young child fetching water from a borehole in a rural setting&rdquo; by Mmukwa59 —{" "}
              <a
                href="https://commons.wikimedia.org/wiki/File:A_young_child_fetching_water_from_a_borehole_in_a_rural_setting.jpg"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                CC0, via Wikimedia Commons
              </a>
              .
            </li>
            <li>
              &ldquo;Children fetching water from taps in rhino camp&rdquo; by Ronaldladu John —{" "}
              <a
                href="https://commons.wikimedia.org/wiki/File:Children_fetching_water_from_taps_in_rhino_camp.jpg"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                CC BY-SA 4.0, via Wikimedia Commons
              </a>
              .
            </li>
            <li>
              &ldquo;A girl pumping a borehole&rdquo; by Mozerayayena —{" "}
              <a
                href="https://commons.wikimedia.org/wiki/File:A_girl_pumping_a_borehole.jpg"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                CC BY-SA 4.0, via Wikimedia Commons
              </a>
              .
            </li>
            <li>
              &ldquo;Girls carrying jerrycans of water on the head&rdquo; by Denis Kasozi —{" "}
              <a
                href="https://commons.wikimedia.org/wiki/File:Girls_carrying_jerrycans_of_water_on_the_head_06.jpg"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                CC BY-SA 4.0, via Wikimedia Commons
              </a>
              .
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
