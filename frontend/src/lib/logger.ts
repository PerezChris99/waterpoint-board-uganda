// Structured, leveled logging that plays well with serverless log aggregators (Vercel captures
// stdout/stderr automatically and can forward it to a log drain) — gives every log line a
// consistent JSON shape (timestamp, level, message, structured context) instead of ad-hoc
// console.log/console.error calls scattered through route handlers.
//
// This deliberately does NOT integrate a specific error-tracking SaaS (e.g. Sentry): most of
// them require their own vendor SDK to correctly speak their ingestion protocol (envelopes,
// session tracking, source-mapped stack traces, etc.) — hand-rolling that wire protocol without
// the SDK would be fragile and effectively unverifiable without real production credentials.
// To add real error-tracking coverage, install `@sentry/nextjs` and follow
// https://docs.sentry.io/platforms/javascript/guides/nextjs/ — Sentry auto-instruments
// `console.error` once configured, so every logger.error() call below is picked up for free
// with no further changes needed here.

type LogLevel = "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

function write(level: LogLevel, message: string, context?: LogContext): void {
  const line = JSON.stringify({ timestamp: new Date().toISOString(), level, message, ...context });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  info: (message: string, context?: LogContext): void => write("info", message, context),
  warn: (message: string, context?: LogContext): void => write("warn", message, context),
  error: (message: string, context?: LogContext): void => write("error", message, context),
};
