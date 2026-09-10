# Privacy

WaterPoint Board Uganda is production-ready software. The publicly hosted instance currently runs
on a placeholder demonstration water-point dataset (see [DATA-METHODOLOGY.md](DATA-METHODOLOGY.md))
while real, verified data is onboarded; account holders are real people with private login
credentials. It is designed to collect the minimum data necessary to operate:

- **Account holders:** name, email, hashed password (bcrypt), role, optional village.
- **Reports:** issue category, description, optional reporter name, optional linked account.
- **Maintenance logs:** action, notes, tied to a water point and the caretaker who logged it.
- **Audit logs:** actor, action, entity type/id, timestamp, and non-sensitive metadata — never
  passwords, tokens, or secrets.

We do not collect health data, payment data, government identifiers, or precise personal location
data (water point coordinates are approximate, and site-level detail is currently placeholder
data pending real verification). Administrators can review report content and manage user roles;
there is no automated profiling or third-party data sharing.

Since the water-point dataset on the public instance is still placeholder/seed data, this
document intentionally stays short — a production deployment handling real personal data at scale
would need a fuller policy, data retention schedule, and deletion workflow.

## Uganda's Data Protection and Privacy Act, 2019

This platform is designed with Uganda's Data Protection and Privacy Act, 2019 ("the DPPA") in
mind. Its regulator is the National Information Technology Authority, Uganda (NITA-U).

- **Data controller:** on this public instance, WaterPoint Board Uganda (operated by Perez
  Chris) is the data controller for account and report data. **A real production deployment for an
  actual district, NGO, or government body must register its own named data controller with
  NITA-U** and update this notice with that entity's name and contact details — this notice is a
  starting point, not a substitute for that registration.
- **Lawful basis:** account data is processed with the account holder's consent, given at
  registration; anonymous report data is processed on the basis of legitimate interest in
  community water-point transparency.
- **Data subject rights:** under the DPPA, a data subject may request access to, correction of, or
  deletion of their personal data, and may object to further processing.
- **Cross-border storage:** this instance is hosted on infrastructure (Vercel, Neon) that may
  store data outside Uganda. A real deployment should confirm its hosting provider and region meet
  the DPPA's cross-border transfer requirements before handling real personal data — see the
  "Data retention and backups" section of [DEPLOYMENT.md](DEPLOYMENT.md).
