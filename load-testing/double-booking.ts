import http from "k6/http";
import { check } from "k6";
import { Counter } from "k6/metrics";

const successfulBookings = new Counter("successful_bookings");
const rejectedBookings = new Counter("rejected_bookings");
const unexpectedResponses = new Counter("unexpected_responses");

const BASE_URL = __ENV.BASE_URL;

export const options = {
  scenarios: {
    booking_race: {
      executor: "per-vu-iterations",
      vus: 100,
      iterations: 1,
      maxDuration: "30s",
    },
  },

  thresholds: {
    successful_bookings: ["count==1"],
    rejected_bookings: ["count==99"],
    unexpected_responses: ["count==0"],
    http_req_duration: ["p(95)<1000"],
  },
};

export default function () {
  const payload = JSON.stringify({
    slotId: "cmsuobct5000w017t16cqm0j4",
    inviteeEmail: `loadtest-${__VU}@example.com`,
    inviteeName: `Load Test User ${__VU}`,
    inviteeNotes: "k6 double-booking concurrency test",
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
      "x-user-id": "1",
    },
  };

  const response = http.post(`${BASE_URL}/bookings/new`, payload, params);

  if (response.status === 201) {
    successfulBookings.add(1);
  } else if (response.status === 400 || response.status === 409) {
    rejectedBookings.add(1);
  } else {
    unexpectedResponses.add(1);
  }

  check(response, {
    "valid booking response": (r) =>
      r.status === 201 || r.status === 400 || r.status === 409,
  });
}
