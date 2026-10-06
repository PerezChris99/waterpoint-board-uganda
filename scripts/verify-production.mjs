const base = process.env.PRODUCTION_URL;
if (!base) throw new Error("PRODUCTION_URL is required");

const url = base.replace(/\/$/, "");
const response = await fetch(`${url}/api/health`, { cache: "no-store" });
const body = await response.text();

console.log(`health: HTTP ${response.status}`);
console.log(body);

if (!response.ok) {
  throw new Error("Production readiness check failed: /api/health is not ready");
}
