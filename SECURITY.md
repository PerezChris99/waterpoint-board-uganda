# Security Policy

WaterPoint Board Uganda is intended to become critical public infrastructure. Security defects must be handled through responsible disclosure.

## Reporting

Do not publish credentials, personal data, exploit code, or sensitive infrastructure details in a public issue. Report security vulnerabilities privately through GitHub's private vulnerability reporting mechanism when enabled.

## Security requirements

Production changes must pass dependency review, secret scanning, CodeQL, production dependency audit, application tests and build, database migration checks, and authorization review for privileged endpoints.

## Secrets

Never commit credentials, database URLs containing passwords, API keys, private certificates, JWT secrets, or production exports.

## Incident handling

Security incidents must be recorded, contained, investigated, remediated, and followed by a documented post-incident review. Rotate affected credentials and invalidate sessions when compromise is suspected.
