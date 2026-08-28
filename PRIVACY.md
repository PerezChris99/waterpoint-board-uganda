# Privacy

WaterPoint Board Uganda is a demonstration platform built around fictional seed data for one small community. It is designed to collect the minimum data necessary to operate:

- Account holders: name, email, hashed password, role.
- Reports: issue category, description, optional image, optional contact details, approximate location where relevant.
- Verifications and maintenance records: notes tied to a water point, not to private individuals.
- Audit logs: actor, action, entity type/id, and a hashed IP address (`ip_hash`) — never the raw IP.

We do not collect health data, payment data, or government identifiers. Public users can withdraw eligible pending reports. Administrators can review and moderate submitted content.

This document will be expanded in Phase 9 alongside the security hardening pass.
