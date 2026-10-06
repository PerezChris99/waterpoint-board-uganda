# National Operations Runbook

This is the operational baseline for a nationwide deployment. It explicitly separates software controls from infrastructure controls.

## Availability targets

Initial target:
- Availability: 99.9% monthly
- RPO: 15 minutes or better
- RTO: 60 minutes or better

These are service objectives, not claims that the current public demo already meets them.

## Release path

feature/* -> perez -> main -> production.

Every promotion requires green CI, database migration verification, security checks, and a successful production smoke test. Emergency changes require a documented incident/change record and post-change review.

## Database

Production uses versioned Prisma migrations only. Never use prisma db push against production.

For the existing database, establish the migration baseline exactly once:

    cd frontend
    npx prisma migrate resolve --applied 00000000000000_initial

Only perform that operation after independently confirming that the existing production schema matches the baseline migration. A mismatch must be reconciled with a dedicated migration; never force the baseline.

Future schema changes are created with prisma migrate dev in development and applied with prisma migrate deploy in controlled environments.

## Identity and privileged access

Administrators and other privileged operators must enable authenticator-app MFA before being granted production access. Password recovery invalidates active sessions and clears MFA so the verified recovery email can be used to re-enrol MFA. Disable MFA only through the authenticated security page and record the event in the audit log.

## Backup and recovery

A nationwide deployment must have:
1. provider PITR enabled;
2. an independent periodic logical backup;
3. encrypted backup storage;
4. documented retention;
5. restore verification at least quarterly;
6. a named operational owner;
7. a disaster-recovery environment or documented rebuild procedure.

The repository cannot truthfully claim these infrastructure controls are complete because they depend on the selected hosting/database accounts.

## Monitoring

Monitor HTTP 5xx and latency, authentication failures, database errors and latency, rate-limit blocks, cron failures, notification failures, report backlog, overdue escalations, data-verification backlog, and deployment failures.

## Incident response

1. Detect and classify.
2. Protect users/data and contain the fault.
3. Preserve logs/audit evidence.
4. Restore service or roll back.
5. Verify integrity.
6. Communicate impact through the institutional owner.
7. Record root cause and corrective actions.

## National data governance

The deployment authority must define authoritative ownership for administrative geography, water-point identifiers, verification authority, data retention, access requests, corrections, exports, and inter-agency sharing before the platform is designated as an official national system.

## Honesty policy

The software may not claim that external datasets are verified field truth. Imported records retain provenance and stale/verification status. Availability, security certification, compliance, backup, and disaster-recovery claims must be backed by actual infrastructure evidence.


Dependency maintenance is automated in CI and high/critical known advisories are treated as release blockers.
