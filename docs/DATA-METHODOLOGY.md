# Data Methodology

> The public instance now runs on real, imported water point data (see "Real water point data"
> below). Local development and CI still use a fictional, deterministic seed fixture for testing
> — see "Development/test seed data" below for that distinction. For the wider production roadmap,
> see [docs/NWSC-PRODUCTION-STRATEGY.md](NWSC-PRODUCTION-STRATEGY.md).

## What this platform shows

WaterPoint Board Uganda displays **community-reported** operational information about real water
points nationwide. Every status shown is a report, not a guarantee:

> "Reported available on 28 August 2026."

We deliberately avoid absolute claims such as "This water is safe."

## Real water point data

The public instance's ~98,700 water points are imported from the **Water Point Data Exchange**
(WPDx, [waterpointdata.org](https://www.waterpointdata.org/)) — a free, open aggregator of
field-collected water point data used by governments and NGOs across the water sector. Uganda's
records in WPDx come from Uganda's own Ministry of Water and Environment (a 2009 nationwide
census) plus later surveys by Water For People, The Water Trust, IRC, World Vision,
YouthMappers, and other WASH-sector organizations, spanning 2005–2025. Used here in line with
WPDx's open-data access terms (freely explorable/downloadable at
[waterpointdata.org/access-data](https://www.waterpointdata.org/access-data/)).

Coordinates, water point technology (borehole, protected well, spring, tap stand, rainwater
tank), and administrative location (district/sub-county/parish) are carried over as reported.
**Functionality status is treated differently depending on age**, in keeping with this project's
honesty-first data policy:

- If a water point's most recent WPDx field report is from **2016 or later**, its reported
  functional/non-functional status is carried over, tagged `verificationMethod =
  EXTERNAL_DATASET` and `lastVerifiedAt` set to the real report date.
- If a water point's only status evidence is **older than that** — which is true for the large
  majority of records, since 79% of Uganda's WPDx data comes from the 2009 census — its status is
  set to **`NEEDS_VERIFICATION`** rather than carrying forward a stale claim as if it were
  current. A 17+ year old "functional" or "needs repair" reading is not treated as today's truth.

This reuses the platform's existing data-provenance fields (see "Data provenance" below) rather
than inventing new mechanics — an imported record is honestly one more kind of provenance,
alongside a caretaker's own update or a community report.

Re-running the import (`npm run db:import-real-water-points`) is idempotent: it re-derives the
same water points from WPDx and only adds ones not already present by their WPDx ID.

## Development/test seed data

Separately from the real data above, `npm run db:seed` still populates a small, fixed,
deterministic **fictional** dataset (153 water points, 24 users, hundreds of reports/maintenance
logs) used only for local development and CI test runs — it is never run against the live
deployment. Login credentials for any seeded accounts are environment-configured and private to
the operator, not published.

## Statuses

- Reported available
- Partially available
- Reported unavailable
- Under maintenance
- Needs verification

## Data freshness

Each water point tracks `lastVerifiedAt`. The public directory and detail pages surface this so
users can judge how recent the reported status is before relying on it.

## Data provenance

Every status update also records *how* and *by whom* it was last confirmed, so real deployments
can distinguish a rigorous check from a casual one:

- `verificationMethod` — one of: field visit, district survey, caretaker update, community report,
  admin override, or self-reported.
- `verifiedBy` — the user account that made the update (a caretaker's own status change, or an
  admin override).

This is **provenance metadata, not a quality guarantee** — "field visit" means someone recorded
that they visited, not that the platform independently verified it. See "What this platform does
not do" below.

## Language

The public reporting form is available in English and Luganda (a language toggle appears on the
form itself). The Luganda translations are a good-faith starting point for demonstration purposes
and have **not been reviewed by a native speaker** — anyone deploying this for real use in Uganda
should have the translations checked before relying on them.

## Moderation of anonymous reports

Anyone can report an issue on a water point without creating an account. To reduce the risk of
unmoderated, potentially false claims being shown as public fact, every report submitted without
an authenticated session starts with `moderationStatus = PENDING_REVIEW` and is **excluded from
all public-facing surfaces** (the water point detail page and the public insights/statistics feed)
until a caretaker (for their own assigned water points) or an admin approves or rejects it.
Reports submitted by a logged-in account (any role) are auto-approved, since the account is
already a known, non-anonymous identity. Caretakers and admins always see every report — including
ones pending review — in their dashboards, so review happens promptly rather than silently.

## Seed data

The platform ships with a **fixed, deterministic** seed dataset generated by
`frontend/prisma/seed.ts`:

- **153 fictional water points** (boreholes, shallow wells, protected springs, tap stands, and
  rainwater tanks) distributed across 24 real Ugandan towns and cities — including all five
  divisions of Kampala, Wakiso, Entebbe, and Mukono in the central region; Jinja, Iganga, Mbale,
  Tororo, and Soroti in the east; Lira, Gulu, Kitgum, and Arua in the north; and Hoima, Fort
  Portal, Kasese, Mbarara, Kabale, and Masaka in the west, with Moroto in the northeast. Each
  town/division uses its real approximate coordinates (with a small jitter of a few kilometres) so
  the map reflects genuine national coverage — heavier around Kampala and its surrounding
  metropolitan area, as in real life. The exact site within each town, its name, and its
  operational details remain fictional demonstration data.
- **24 fictional user accounts**: 1 admin, 8 caretakers, 15 community members.
- **Hundreds of fictional reports** spread realistically over roughly the last two years, with a
  realistic status mix (mostly resolved, some open/in-progress).
- **Hundreds of fictional maintenance log entries** tied to caretaker activity.


The script uses a seeded pseudo-random generator, so re-running it always reproduces the exact
same dataset — nothing is randomized between runs, and the application itself never modifies the
core water-point list. Only new reports, maintenance logs, and user registrations grow through
normal use; the seed script is the only thing that resets the baseline.

### Login credentials

There are no public demo credentials. The seed script (`frontend/prisma/seed.ts`) refuses to run
unless `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` are set in the operator's own untracked `.env` (see
`.env.example`) — only the person who runs the seed knows the admin login. Optional
`SEED_CARETAKER_*`/`SEED_MEMBER_*` env vars give that same operator one working caretaker and
member login too. Every other seeded caretaker/member account exists only to attribute the
placeholder water points/reports/maintenance logs to *someone* — each gets a random, undisclosed
password generated at seed time, and nobody is meant to log into them. Real deployments should
register real users through the normal sign-up flow instead of relying on seeded accounts at all.

## What this platform does not do

- It does not certify water quality or drinking-water safety.
- It does not detect contamination.
- It does not predict infrastructure failure.
- It does not replace local water authorities or government systems.
- It is not a national-scale platform.

All current and future seed data is clearly fictional and created for demonstration purposes
only. It does not represent verified official information about any real water point in Uganda.
