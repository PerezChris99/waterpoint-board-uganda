import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL;
if (!BASE_URL) throw new Error("BASE_URL is required");

export const options = {
  scenarios: {
    national_read: {
      executor: "constant-vus",
      vus: Number(__ENV.VUS || 20),
      duration: __ENV.DURATION || "2m",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<1500", "p(99)<3000"],
  },
};

export default function () {
  const responses = [
    http.get(`${BASE_URL}/api/water-points`),
    http.get(`${BASE_URL}/api/health`),
  ];

  responses.forEach((response) => {
    check(response, {
      "status is not server error": (r) => r.status < 500,
      "response completed": (r) => r.timings.duration < 5000,
    });
  });

  sleep(1);
}
