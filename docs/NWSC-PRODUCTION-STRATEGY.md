# From Portfolio Demo to Production: Problem Audit & NWSC Alignment

> Research + gap analysis produced 2026-09-10. This document is the reference for turning
> WaterPoint Board Uganda from a portfolio/demo project into a system that could realistically be
> piloted with, or adjacent to, Uganda's **National Water and Sewerage Corporation (NWSC)**. It
> does not itself grant any partnership, data license, or legal standing — those require real
> institutional engagement (see "What this can't do alone" at the end).

---

## 1. The real-world problem space

### 1.1 Who does what in Uganda's water sector today

| Layer | Who's responsible | Notes |
| --- | --- | --- |
| Large/medium towns (piped, metered) | **NWSC** — serves ~225 towns, ~18M people (2024), targeting 25M by 2029 | Commercially run parastatal, billing-driven, own customer portal (`apps.nwsc.co.ug`) |
| Small towns (5,000–30,000 people) | Local governments + private operators under 3–5yr contracts | Water Authorities created since ~2000; OBA-subsidized in places |
| Rural areas / point sources (boreholes, springs, shallow wells) | **District Local Governments** (District Water Offices) via the Ministry of Water and Environment (MWE) / Directorate of Water Development (DWD) | This is the layer this project's data model actually mirrors (`WaterPoint`, caretaker, village/parish/sub-county) |
| Policy & regulation | MWE / DWD | **No independent economic or water-quality regulator exists** in Uganda — NWSC proposes its own tariffs, subject to MWE approval |

Key fact: **NWSC's core mandate and billing systems cover piped/metered connections in towns — not the rural point-source water points (boreholes, protected springs, shallow wells) this project models.** Those are a District Local Government responsibility, coordinated by MWE/DWD, with functionality data historically collected through periodic (not real-time) surveys.

However, NWSC has been explicitly expanding into this gap since 2015: it announced plans to serve rural areas, and in 2018 launched a project targeting **12,000 villages** for water connection. NWSC also increasingly runs **community management contracts** and rural growth-centre schemes. This is the actual seam where a tool like this could plug in — not as a replacement for NWSC's metered-billing core, but as the **field data / community-reporting layer for the point-source and newly-onboarded rural assets NWSC and DLGs are jointly extending into.**

### 1.2 Documented, sourced problems this kind of platform can plausibly help with

1. **No unified, real-time functionality data for rural water points.** MWE's national water point data has historically come from periodic census-style surveys, not continuous reporting — so a borehole can sit broken for weeks before anyone official knows. A structured `Report` → `MaintenanceLog` pipeline with per-water-point status and `lastVerifiedAt` freshness is a direct answer to this — this is the single strongest fit in the whole platform.
2. **Non-revenue water (NRW) is still high** — NWSC-wide NRW was ~34% in 2024 (target 30% by 2029), driven partly by leakage that goes unreported for a long time in under-monitored network segments. Community-sourced leak/damage reports (this platform's `PHYSICAL_DAMAGE`/`NO_WATER`/`LOW_PRESSURE` issue types) are a cheap, crowd-sourced early-warning signal that complements NWSC's own network monitoring — but only for assets it operates; for rural point sources, NRW isn't the right frame (there's no metered network), functionality is.
3. **No official, published national regulator for water quality/service — DWD is meant to monitor NWSC's water quality but MWE itself states this monitoring is "insufficient" outside NWSC-operated areas, and district-level water-quality data is scarce.** This project **cannot legally or technically become a water-quality certifier** (no lab integration, no sampling chain of custody) — but it can carry the "reported/community-observed contamination concern" signal that routes to whoever has authority to actually test the water, which is exactly the honest, non-overreaching framing already in [docs/DATA-METHODOLOGY.md](DATA-METHODOLOGY.md).
4. **Fragmented caretaker/handpump-mechanic accountability.** Uganda's rural water model relies on trained caretakers/Hand Pump Mechanics Associations (HPMAs) per water point or per parish — but there's often no shared digital record of who is assigned where, what they've done, or how fast they respond. This project's `caretakerId` per `WaterPoint` + `MaintenanceLog` is a direct digitization of that existing (paper-based) accountability structure.
5. **Weak feedback loop from communities to local government / utility.** Uganda's water sector customer satisfaction data (NWSC's own 2009-10 survey) shows complaints cluster around "responsiveness in resolving complaints" and "slow/erratic" service — a public, timestamped, anonymous-allowed reporting channel with visible status (`OPEN → ACKNOWLEDGED → IN_PROGRESS → RESOLVED`) is a low-cost accountability/transparency mechanism local governments and NWSC's own customer-relations teams have historically lacked at the point-source level.
6. **No public transparency layer.** Citizens today have essentially no way to see "is the water point near me currently working" without walking there. A public, no-login-required directory (which this project already has) is a real, currently-unmet need, especially in the 12,000-village NWSC rural-onboarding pipeline where infrastructure is new and trust needs to be built.

### 1.3 What NWSC itself already has (so we don't duplicate it)

- A customer self-service portal (`apps.nwsc.co.ug`) for **billed, metered accounts** — new connections, bill payment, account management. This project should **not** try to replace or duplicate billing; that's regulated, revenue-critical infrastructure NWSC will never hand to a third-party demo app.
- Its own water-quality testing service marketed to customers (`nwsc.co.ug/water-quality-tests`) — again, a paid, lab-backed service this project cannot and should not imitate; the honest role for this platform is *routing community reports* toward such services, never asserting a result itself.
- Large donor-funded infrastructure expansion (French AFD, KfW, EIB — €480M Katosi network expansion, 2026-2027) that is about **production/network capacity**, not about community reporting — no overlap/competition there.

### 1.4 Where the genuine, non-duplicative opportunity is

**The realistic, honest positioning is: a community water-point functionality & reporting layer for rural/peri-urban point sources — a "last-mile transparency and accountability tool" — that could complement, not replace, NWSC's own metered/billed network and MWE's periodic national water-point census.** That is a materially different, smaller, more honest claim than "an NWSC platform," and it's the only positioning that doesn't require pretending to have authority (billing, water-quality certification, regulatory power) this project cannot legally or technically have without a real institutional partner.

---

## 2. Gap analysis: portfolio demo → something a real pilot could use

Everything below is grouped by whether it blocks a **real institutional pilot** (with a district, an NGO, or an NWSC rural-expansion team) vs. general production hardening.

### 2.1 Blocking for any real pilot (data & trust)

- **Fictional seed data must not silently coexist with real data.** Today `seed.ts` is the only thing that "resets the baseline," and the whole README/DATA-METHODOLOGY framing is built around **deterministic fictional data**. A real pilot needs a clean environment with zero fictional water points, plus a documented, auditable **data import/verification workflow** for real water points (who added it, what evidence, who verified it) — the schema has no `verifiedBy`/`verificationMethod`/source-of-truth provenance fields today, only `source: String` (freeform) and `lastVerifiedAt`.
- **No offline/low-connectivity support.** Rural caretakers and community members are the primary real users, and rural Uganda has patchy mobile data coverage. Today this is a pure online Next.js app with no offline queueing, no SMS/USSD fallback. A real pilot in this space (see mWater, FLOW, Water Point Data Exchange, Whave — all real prior art in this exact space) almost always needs an SMS/USSD reporting channel as a fallback, because that's what actually reaches rural users without smartphones/data bundles.
- **No moderation/anti-abuse pipeline for anonymous reports.** Right now anonymous reporting is rate-limited but has no spam/malicious-report triage queue distinct from real reports — a real deployment facing the public needs a review step before a false "contamination" report becomes visible/actionable, to avoid panic or reputational harm to a real caretaker/institution.
- **No real legal/liability framing.** `docs/PRIVACY.md`/`docs/SECURITY.md` are written for a demo. A real pilot needs actual Terms of Use disclaiming that status reports are community-sourced (not lab-verified), a real data controller identified under Uganda's **Data Protection and Privacy Act, 2019** (NWSC or the district would likely need to be the data controller, not an individual developer), and a lawful basis for collecting names/villages/phone numbers of real people.
- **No institutional authentication/ownership model.** Today `Role` is a flat `ADMIN | CARETAKER | MEMBER` with no concept of "which district / which NWSC branch / which NGO" owns a given water point or caretaker. A real multi-institution pilot (even just one district + NWSC's rural unit) needs an `Organization`/`District` tenancy concept so data ownership, escalation paths, and admin scoping are correct — right now a single global `ADMIN` role sees and controls everything, which does not map to how districts/NWSC actually operate (decentralized authority).

### 2.2 Production hardening (would matter even without NWSC)

- **In-memory rate limiting (`rate-limit.ts`)** won't survive Vercel's multi-instance serverless model at real traffic — needs a shared store (Redis/Upstash) once this isn't single-demo-instance traffic.
- **No structured logging/observability/error tracking** (e.g. Sentry) — right now `console.error` in `apiErrorResponse` is the only signal.
- **No automated backups/point-in-time-recovery story** documented for the Postgres database beyond "Neon" defaults — a real pilot holding real community data needs an explicit backup/retention policy.
- **No SLA/escalation timers.** Reports have a `status` but nothing tracks "this report has been OPEN for 14 days with no caretaker action" — real accountability needs time-based escalation (e.g., auto-notify a district admin if a report is unactioned past a threshold).
- **No notification channel at all** (no email/SMS to caretakers when a new report lands, no notification to the reporter when their report is resolved) — today everything is pull-based (must log in and check the dashboard).
- **Accessibility/localization for real users**: no Luganda/other local-language support, and literacy/smartphone-access constraints in rural Uganda are real — a genuine pilot likely needs a simplified low-literacy/icon-driven reporting flow and/or the SMS/USSD channel mentioned above as the primary channel, with the web app as the admin/dashboard layer.

### 2.3 What's already in good shape (keep, don't rebuild)

- Core data model shape (`WaterPoint`/`Report`/`MaintenanceLog`/`AuditLog`) already matches the real-world workflow closely — this is the project's strongest asset.
- RBAC pattern (`requireRole()` + server-side re-check on every mutation, `tokenVersion` invalidation) is a genuinely solid, defensible security pattern — no rework needed, just extend it with an org/tenancy dimension.
- Validation-everywhere (Zod), consistent API error shape, audit logging of sensitive actions — all directly reusable in a production posture.
- The project's existing honesty/scope discipline (`DATA-METHODOLOGY.md`'s explicit "what this does NOT do" section) is exactly the right instinct and should be *carried forward*, not dropped, when repositioning as production — the fix is to make the real claims narrower and truer, not to start overclaiming (e.g., never claim water-quality certification even in "prod mode").

---

## 3. Recommended phased roadmap

This is a proposal, not yet implemented — sequencing matters because institutional buy-in (Phase 0) determines whether Phases 2+ are worth building at all.

**Phase 0 — Positioning & institutional validation (no code)**
Reframe the pitch from "NWSC platform" to "community water-point transparency & reporting layer for rural/peri-urban point sources, positioned to complement NWSC's rural-expansion program and MWE's water-point census." Validate with at least one real stakeholder conversation (a district water office, an NGO already doing WASH work, or NWSC's rural/community-programs unit) before investing in Phases 2-4 — this determines real requirements (SMS channel priority, tenancy model, data ownership) instead of guessing.

**Phase 1 — Remove demo-only framing, keep scope-honest**
- Update README/DATA-METHODOLOGY language from "portfolio/demonstration project" to reflect real pilot intent, while *keeping* the "not a certification/regulatory system" disclaimers front and center.
- Add data provenance fields to `WaterPoint`/`Report` (verification method, verifier identity, source citation) so real vs. seed data is distinguishable and auditable.
- Add an `Organization`/`District` tenancy model so RBAC and data ownership match real institutional boundaries.

**Phase 2 — Trust & moderation**
- Anonymous-report moderation queue before publication.
- Time-based escalation on stale `OPEN` reports.
- Notification channel (email at minimum; SMS as stretch) for caretakers/reporters.

**Phase 3 — Reach**
- SMS/USSD reporting channel (Africa's Talking or similar Uganda-compatible gateway) as the primary channel for rural users without data.
- Localization (Luganda + other major local languages) for the public-facing reporting flow.

**Phase 4 — Operational hardening**
- Shared-store rate limiting, structured logging/error tracking, documented backup/retention policy, formal Terms of Use + Data Protection Act–compliant privacy notice with a named data controller.

---

## 4. What this project (and this document) cannot do alone

- It cannot grant an actual partnership, MOU, data-sharing agreement, or endorsement from NWSC or any Ugandan government body — that requires real-world outreach by the project owner, not code or documentation.
- It cannot become a water-quality regulator or certifier — no Ugandan law assigns that role to a community app, and claiming it would be both false and a genuine public-health liability.
- It cannot replace NWSC's metered billing/customer system — that's commercially and legally out of scope for a third-party tool.
- Real personal data (names, phone numbers, precise home/village locations of real vulnerable communities) triggers real legal obligations under Uganda's Data Protection and Privacy Act, 2019, the moment this stops being fictional seed data — that's a legal/process decision for the project owner, not something this document can resolve.

---

## 5. Sources consulted

- Wikipedia: [Water supply and sanitation in Uganda](https://en.wikipedia.org/wiki/Water_supply_and_sanitation_in_Uganda), [National Water and Sewerage Corporation](https://en.wikipedia.org/wiki/National_Water_and_Sewerage_Corporation)
- [nwsc.co.ug](https://www.nwsc.co.ug/) (official NWSC site — service offerings, consultancy arm, customer portal)
- This repository's own [README.md](../README.md), [docs/ARCHITECTURE.md](ARCHITECTURE.md), [docs/DATA-METHODOLOGY.md](DATA-METHODOLOGY.md), and `prisma/schema.prisma`
