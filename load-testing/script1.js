import http from "k6/http";
import { sleep } from "k6";
import { Rate } from "k6/metrics";

export let errorRate = new Rate("errors");

export let options = {
  vus: 100,
  duration: "1m",
  thresholds: {
    errors: ["rate<0.01"],
    http_req_duration: ["p(95)<500"],
  },
};

export default function () {
  const response = http.get("http://localhost:3001/users");
  let succes = response.status === 200;
  errorRate.add(!succes);
  sleep(1 / 100);
}
