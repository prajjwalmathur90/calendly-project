import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 50 },   // Warm up phase
    { duration: "1m", target: 200 },   // Spike traffic to trigger HPA
    { duration: "2m", target: 200 },   // Hold traffic so HPA has time to react
    { duration: "30s", target: 0 },    // Cool down
  ],
  thresholds: {
    http_req_duration: ["p(95)<1000"],
  },
};

const BASE_URL = __ENV.BASE_URL;

export default function () {
  // Hitting the health endpoint is a standard way to test base server scalability
  const response = http.get(`${BASE_URL}/health`);
  
  check(response, {
    "is status 200": (r) => r.status === 200,
  });
  
  // Minimal sleep to generate high throughput (approx 10 requests per second per VU)
  sleep(0.1); 
}
