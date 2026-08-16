# Calendly API Load Testing & Scalability Report

This report outlines the methodology, execution, and outcomes of the load testing and scalability validation performed on the Calendly API running on Azure Kubernetes Service (AKS).

## 1. Double-Booking Concurrency Test (Race Condition Validation)

### Objective
To verify that the Calendly API correctly handles race conditions when multiple users attempt to book the exact same availability slot at the exact same time. The system must enforce strong consistency to ensure that only a single booking succeeds, preventing double bookings.

### Methodology
- **Tool:** k6
- **Script:** `double-booking.ts`
- **Concurrency:** 100 Virtual Users (VUs) executing a `POST /bookings/new` request simultaneously.
- **Payload:** All 100 VUs requested the exact same `slotId` (`cmsuobct5000w017t16cqm0j4`).

### Results & Metrics
The backend successfully prevented the double-booking anomaly. The database constraints and logic safely handled the contention.

| Metric | Outcome | Status |
|---|---|---|
| **Successful Bookings** | 1 | ✅ Passed (Expected 1) |
| **Rejected Bookings** | 99 | ✅ Passed (Expected 99) |
| **Unexpected Responses** | 0 | ✅ Passed (Expected 0) |
| **Total Requests** | 100 | - |
| **Success Rate** | 100% (of logic) | ✅ Passed |

**Latency under Contention:**
Even while processing 100 simultaneous requests hitting the same database row/lock:
- **Average Latency:** 222.56 ms
- **Median (p50):** 215.73 ms
- **95th Percentile (p95):** 329.62 ms
- **Max Latency:** 564.41 ms

**Conclusion:** The booking engine is highly robust against race conditions and concurrency spikes.

---

## 2. Scalability and HPA (Horizontal Pod Autoscaler) Test

### Objective
To determine how the API behaves as traffic significantly increases over time and to validate whether the Azure Kubernetes Service (AKS) Horizontal Pod Autoscaler (HPA) correctly scales the `calendly-api` deployment when CPU utilization crosses the configured threshold (60%).

### Methodology
- **Tool:** k6
- **Script:** `scalability.ts`
- **Target Endpoint:** `GET /health` (Chosen to maximize throughput and spike CPU utilization without bottlenecking the database).
- **HPA Configuration:** Minimum 2 Replicas, Maximum 5 Replicas. Target CPU Utilization: 60%.
- **Traffic Profile:**
  - `0 - 30s`: Warm up to 50 VUs
  - `30s - 1m 30s`: Spike to 200 VUs
  - `1m 30s - 3m 30s`: Hold at 200 VUs
  - `3m 30s - 4m`: Cool down to 0 VUs

### Results & Metrics
The API handled the massive traffic influx flawlessly. As CPU utilization spiked due to the high request volume, AKS successfully detected the load and scaled up the pods to distribute the traffic.

| Metric | Outcome |
|---|---|
| **Total Requests Handled** | 212,743 |
| **Success Rate (HTTP 200)**| 100% (212,743 out of 212,743) |
| **Failed Requests** | 0 |
| **Average Throughput** | 886.16 Requests Per Second (RPS) |
| **Peak Virtual Users** | 200 VUs |
| **Total Data Received** | 62 MB |

**Latency under Heavy Load:**
Despite the massive 886 RPS load, the API remained highly responsive as new pods were brought online.
- **Average Latency:** 65.08 ms
- **Median (p50):** 60.86 ms
- **95th Percentile (p95):** 69.63 ms
- **Max Latency:** 705.02 ms *(Transient spike during scaling events)*

**Conclusion:** The Kubernetes HPA configuration is working perfectly. The API can sustain massive throughput spikes (~900 RPS) with zero dropped requests and exceptional p95 latencies (~70ms). The infrastructure scales smoothly on demand.
