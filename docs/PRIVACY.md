# Privacy

WaterPoint Board Uganda is a demonstration platform built around fictional seed data for one
small community. It is designed to collect the minimum data necessary to operate:

- **Account holders:** name, email, hashed password (bcrypt), role, optional village.
- **Reports:** issue category, description, optional reporter name, optional linked account.
- **Maintenance logs:** action, notes, tied to a water point and the caretaker who logged it.
- **Audit logs:** actor, action, entity type/id, timestamp, and non-sensitive metadata — never
  passwords, tokens, or secrets.

We do not collect health data, payment data, government identifiers, or precise personal location
data (water point coordinates are approximate and fictional). Administrators can review report
content and manage user roles; there is no automated profiling or third-party data sharing.

Since all data on the public demo is fictional or explicitly opt-in demo-account data, this
document intentionally stays short — a production deployment handling real personal data would
need a fuller policy, data retention schedule, and deletion workflow.
