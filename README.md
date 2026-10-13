# 📅 Distributed Appointment Booking Backend

A scalable, microservices-style **appointment scheduling backend** inspired by Calendly. Built with **Node.js, Express 5, TypeScript, Prisma, and MySQL**, it manages hosts, event types, availability rules, bookable time slots, and reservations. **Temporal.io** runs durable background workflows for slot regeneration, booking-confirmation emails, and Google Calendar synchronization, while **Redis** supports integration data used by the API and worker.

The application is containerized with Docker and Docker Compose, and includes Kubernetes manifests for deployment to **Azure Kubernetes Service (AKS)**. The focus is on reliable booking flows, timezone-aware availability, asynchronous work, and operational deployment—not just CRUD endpoints.

> **Project deployment notes:** See [`Project_Report.md`](Project_Report.md) for the deployment journey, infrastructure components, and technical challenges encountered.

---

## 📋 Table of Contents

- [🚀 Quick Start & Installation](#-quick-start--installation)
  - [Prerequisites](#prerequisites)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Configure Environment Variables](#2-configure-environment-variables)
  - [3. Start Infrastructure Dependencies](#3-start-infrastructure-dependencies)
  - [4. Install Dependencies and Prepare the Database](#4-install-dependencies-and-prepare-the-database)
  - [5. Run the API and Temporal Worker](#5-run-the-api-and-temporal-worker)
- [🏛️ Architecture Overview](#️-architecture-overview)
  - [System Context](#system-context)
  - [Request and Background-Workflow Lifecycle](#request-and-background-workflow-lifecycle)
  - [Application Layers](#application-layers)
  - [Database Schema](#database-schema)
- [✨ Standout Features](#-standout-features)
  - [1. Transactional Optimistic Booking](#1-transactional-optimistic-booking-and-double-booking-protection)
  - [2. Timezone-Aware Availability Engine](#2-timezone-aware-availability-engine)
  - [3. Durable Asynchronous Workflows with Temporal](#3-durable-asynchronous-workflows-with-temporal)
  - [4. Google Calendar Integration](#4-google-calendar-integration)
  - [5. Automated Booking Emails](#5-automated-booking-emails)
  - [6. Validation and Consistent API Errors](#6-validation-and-consistent-api-errors)
  - [7. Containerization and Kubernetes Deployment](#7-containerization-and-kubernetes-deployment)
- [📡 API Reference](#-api-reference)
- [🧪 Load Testing Results](#-load-testing-results)
- [🛠️ NPM Scripts](#️-npm-scripts)
- [📂 Project Directory Structure](#-project-directory-structure)
- [🔐 Security and Deployment Notes](#-security-and-deployment-notes)
- [📄 License](#-license)

---

## 🚀 Quick Start & Installation

### Prerequisites

Install the following tools before running the project locally:

- **[Node.js](https://nodejs.org/)**: Node.js 22 is used by the Docker images.
- **[pnpm](https://pnpm.io/)**: The repository pins `pnpm@10.33.2`.
- **[Docker](https://www.docker.com/)** and the Docker Compose plugin: Used to run MySQL, Redis, Temporal, and MailHog locally.
- **[Git](https://git-scm.com/)**: To clone the repository.
- **Google Cloud OAuth credentials** *(optional)*: Needed to enable Google Calendar integration.

### 1. Clone the Repository

```bash
git clone https://github.com/prajjwalmathur90/calendly-project.git
cd calendly-project
```

Enable the pinned package manager with Corepack if `pnpm` is not already available:

```bash
corepack enable
corepack prepare pnpm@10.33.2 --activate
```

### 2. Configure Environment Variables

Create a `.env` file in the project root. The repository does not provide a guaranteed `.env.example`, so use the following as a **local-development template** and adjust credentials to match your environment.

```env
# API server
PORT=4000
NODE_ENV=development

# MySQL — match the local Docker Compose service below
DATABASE_HOST=127.0.0.1
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=root123
DATABASE_NAME=CalendlyNodeApp
DATABASE_URL="mysql://root:root123@127.0.0.1:3306/CalendlyNodeApp"

# Slot generation horizon
SLOT_GENERATION_DAYS=30

# Temporal
TEMPORAL_ADDRESS=localhost:7233
TEMPORAL_NAMESPACE=default
TEMPORAL_TASK_QUEUE=calendly_tasks

# Redis
REDIS_URL=redis://localhost:6379

# SMTP — MailHog defaults for local development
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
EMAIL_FROM="Calendly <noreply@example.com>"

# Google Calendar OAuth — fill these in when configuring the integration
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CLIENT_URI=http://localhost:4000/integrations/google/callback
GOOGLE_SENDER_EMAIL=info@example.com
GOOGLE_REFRESH_TOKEN=
GOOGLE_CALENDAR_ID=primary
```

**Important:** The values above correspond to the local Docker Compose configuration and are for development only. Do not reuse `root123`, blank OAuth values, or example sender addresses in production. Keep `.env` out of version control.

`DATABASE_URL` is used by Prisma's runtime adapter and Prisma configuration. The individual `DATABASE_*` variables are also read by the application configuration; keep them consistent with the URL.

### 3. Start Infrastructure Dependencies

The included `docker-compose.yml` starts MySQL, Redis, Temporal Server, Temporal UI, and MailHog. It does **not** start the API or the Temporal Worker; run those from separate terminals in the next step.

```bash
docker compose up -d
```

Check that the containers are running:

```bash
docker compose ps
```

Local services and ports:

| Service | Local address | Purpose |
| :--- | :--- | :--- |
| API | `http://localhost:4000` | Express REST API (local default) |
| MySQL | `127.0.0.1:3306` | Application persistence and Temporal's local database backend |
| Redis | `localhost:6379` | Redis-backed integration data |
| Temporal Server | `localhost:7233` | Workflow orchestration endpoint |
| Temporal UI | `http://localhost:8080` | Inspect workflows and worker activity |
| MailHog UI | `http://localhost:8025` | Inspect development emails |
| MailHog SMTP | `localhost:1025` | Local SMTP endpoint |

> **Port conflict:** If MySQL is already listening on port `3306`, stop the conflicting service or change the host-side port in `docker-compose.yml` and update `DATABASE_URL` accordingly.

### 4. Install Dependencies and Prepare the Database

Install the project's locked dependencies:

```bash
pnpm install
```

Format the Prisma schema, apply migrations, and generate the Prisma client:

```bash
pnpm prisma:format
pnpm prisma:migrate
pnpm prisma:generate
```

Or run those steps through the combined script:

```bash
pnpm prisma:all
```

`prisma:migrate` runs `prisma migrate dev` and may prompt for a migration name when it detects schema changes. For an existing database, confirm that `DATABASE_URL` points to the correct local database before running migrations.

Optional: open Prisma Studio to inspect your data:

```bash
pnpm prisma:studio
```

### 5. Run the API and Temporal Worker

Start the API in **Terminal 1**:

```bash
pnpm dev
```

Start the Temporal Worker in **Terminal 2**:

```bash
pnpm dev:worker
```

The API defaults to port `4000` in local development. The production Docker/Kubernetes configuration sets the API to port `3001`.

Verify that the API is responding:

```bash
curl http://localhost:4000/health
```

Expected response shape:

```json
{
  "status": "ok!",
  "timestamp": "<ISO-8601 timestamp>"
}
```

On Windows PowerShell, `curl` may be an alias for `Invoke-WebRequest`; `curl.exe http://localhost:4000/health` explicitly invokes cURL if installed.

---

## 🏛️ Architecture Overview

### System Context

The API handles synchronous requests, while the dedicated Temporal Worker performs slower or retryable work outside the request path.

```mermaid
flowchart TD
    Client["Browser / Mobile Client / API Consumer"]

    subgraph App["Appointment Booking Backend"]
        API["Express 5 + TypeScript API"]
        Validate["Zod DTO Validation"]
        Prisma["Prisma Client"]
        DB[("MySQL")]
        TemporalClient["Temporal Client"]
        Worker["Temporal Worker"]
        SlotWorkflow["Slot Regeneration Workflow"]
        EmailWorkflow["Booking Email Workflow"]
        CalendarWorkflow["Google Calendar Workflow"]
        Redis[("Redis")]
    end

    TemporalServer["Temporal Server :7233"]
    Mail["SMTP / MailHog"]
    Google["Google Calendar API"]
    TemporalUI["Temporal UI :8080"]

    Client --> API
    API --> Validate
    Validate --> Prisma --> DB
    API --> TemporalClient --> TemporalServer
    Worker <--> TemporalServer
    Worker --> SlotWorkflow
    Worker --> EmailWorkflow
    Worker --> CalendarWorkflow
    Worker <--> Redis
    API <--> Redis
    EmailWorkflow --> Mail
    CalendarWorkflow --> Google
    TemporalUI --> TemporalServer
```

### Request and Background-Workflow Lifecycle

A typical booking request follows this path:

1. The API validates the request body using the route's Zod schema.
2. The booking service loads the requested slot inside a Prisma transaction and verifies that it exists, is still available, and has not already started.
3. The service conditionally updates the slot from `AVAILABLE` to `BOOKED`. If another concurrent request has already changed the slot, the conditional update affects zero rows and the booking is rejected.
4. The booking record is created in the same transaction.
5. After the transaction commits, the API starts Temporal workflows for slot regeneration, confirmation email delivery, and Google Calendar event creation.
6. The worker executes workflow activities and can retry configured activities if they fail.

This separation keeps external calls and other background work out of the database transaction and synchronous booking path.

### Application Layers

The project separates responsibilities into these main layers:

```text
HTTP Request
    │
    ▼
Express Routers ──► Middleware / Zod Validation
    │
    ▼
Controllers
    │
    ▼
Services ──► Temporal Client (for asynchronous tasks)
    │
    ▼
Repositories
    │
    ▼
Prisma Client ──► MySQL

Temporal Server ──► Temporal Worker ──► Activities
                                      ├── Slot generation
                                      ├── Booking confirmation email
                                      └── Google Calendar event creation
```

- **Routers** register endpoint paths and attach middleware.
- **Middleware** validates request bodies, handles identity context on protected route groups, and standardizes unknown-route/error handling.
- **Controllers** translate HTTP requests into service calls and HTTP responses.
- **Services** own business rules, slot generation, booking transactions, and integrations.
- **Repositories** encapsulate database queries and transactional operations.
- **Temporal workflows and activities** run retryable work independently from the API process.

### Database Schema

The Prisma schema defines the following core entities:

```mermaid
erDiagram
    User ||--o{ EventTypes : creates
    User ||--o{ AvailabiltyRules : defines
    User ||--o{ AvailabiltyException : overrides
    User ||--o{ Slots : hosts
    User ||--o{ Booking : hosts
    EventTypes ||--o{ Slots : generates
    EventTypes ||--o{ Booking : categorizes
    Slots ||--o{ Booking : reserves

    User {
        int id PK
        string email UK
        string name
        string slug UK
        string timezone
    }
    EventTypes {
        int id PK
        int hostId FK
        string title
        string slug
        int durationMinutes
        boolean isActive
        int bufferBeforeMinutes
        int bufferAfterMinutes
    }
    AvailabiltyRules {
        int id PK
        int userId FK
        int weekday
        string startTime
        string endTime
        string timezone
    }
    AvailabiltyException {
        int id PK
        int userId FK
        date date
        string type
        string startTime
        string endTime
    }
    Slots {
        string id PK
        int hostId FK
        int eventId FK
        datetime startAt
        datetime endAt
        string status
    }
    Booking {
        int id PK
        int hostId FK
        int eventTypeId FK
        string slotId FK
        string inviteeEmail
        string inviteeName
        string status
        string calendarEventId
    }
```

Key data-integrity details include unique host slugs, unique event slugs per host, a unique `(eventId, startAt, endAt)` constraint for slots, indexes used for availability/booking lookups, and relational foreign keys.

---

## ✨ Standout Features

### 1. Transactional Optimistic Booking and Double-Booking Protection

The main booking flow uses a database transaction and a **conditional state transition** rather than relying on an in-memory check alone:

- Reads the target slot and checks that it is available and in the future.
- Updates the slot only when its current status is still `AVAILABLE`.
- Requires exactly one row to be updated before creating the booking record.
- Creates the booking in the same transaction as the slot-state transition.
- Rejects a competing request when the slot is no longer available.

The repository also contains a pessimistic-locking implementation using `SELECT ... FOR UPDATE` for comparison, while the exposed booking controller calls the optimistic flow.

### 2. Timezone-Aware Availability Engine

Hosts can define recurring weekly availability and date-specific exceptions. Slot generation:

- Uses host and rule timezones to interpret local availability windows.
- Applies exceptions for holidays, blocked periods, or extra availability.
- Splits clean time windows according to each event type's duration.
- Accounts for buffers before and after meetings.
- Excludes past or already-booked overlapping slots.
- Upserts valid slots and marks stale generated slots as `BLOCKED` rather than deleting them.
- Regenerates a configurable future horizon, defaulting to **30 days**.

### 3. Durable Asynchronous Workflows with Temporal

A dedicated Temporal Worker runs workflows for:

- `regenerateHostSlotsWorkflow` — recalculate availability after relevant changes or bookings.
- `sendBookingConfirmationEmailWorkflow` — send booking-confirmation emails.
- `createGoogleCalendarEventWorkflow` — create calendar events and persist returned calendar identifiers/meeting links.

The workflows delegate work to activities, with retry policies configured for the slot-regeneration and integration workflows. The API and worker can be run as separate processes and are deployed as distinct containers in the Kubernetes setup.

### 4. Google Calendar Integration

The project includes a Google OAuth callback and Calendar API integration for creating calendar events and saving event/meeting details against a booking. To configure it locally:

1. Create OAuth credentials in Google Cloud Console and enable the required Calendar API.
2. Configure the OAuth redirect URI to match `GOOGLE_CLIENT_URI` (locally, `http://localhost:4000/integrations/google/callback`).
3. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and the relevant sender/calendar settings in `.env`.
4. Run `pnpm google:setup` to print the setup authorization URL and complete the OAuth flow.

Google Calendar integration is optional for local startup; leave credentials unconfigured when testing the core scheduling flow only.

### 5. Automated Booking Emails

Booking confirmation is dispatched through a Temporal workflow and SMTP mailer. The local Compose setup uses **MailHog** so emails can be inspected without sending real messages:

- SMTP endpoint: `localhost:1025`
- Web UI: `http://localhost:8025`

For production, replace MailHog with an approved SMTP provider and configure credentials using deployment secrets.

### 6. Validation and Consistent API Errors

- Zod schemas validate create/update payloads on event, availability, and booking routes.
- A common not-found handler catches unmatched routes.
- A centralized error handler maps known API errors to their status codes and returns a consistent error shape.
- The `/health` endpoint is used by Kubernetes readiness and liveness probes.

### 7. Containerization and Kubernetes Deployment

The repository includes separate Dockerfiles for the API and Temporal Worker and a `k8s/` directory for Kubernetes resources. The deployment report documents an Azure-based setup containing:

- **Azure Container Registry (ACR)** for application images.
- **Azure Kubernetes Service (AKS)** to orchestrate the API, worker, Temporal components, and supporting services.
- **Azure Database for MySQL Flexible Server** for persistent data.
- Kubernetes Secrets for sensitive connection strings and credentials.

The API Deployment manifest defines two replicas, a LoadBalancer Service, `/health` probes, and CPU/memory requests and limits. The API image uses Node 22 Alpine; the Worker image uses Node 22 Slim to accommodate its runtime requirements.

---

## 📡 API Reference

The local API base URL is `http://localhost:4000` unless `PORT` is overridden. These endpoints are based on the routers registered in `src/app.ts`.

### Health Check

| Method | Endpoint | Identity Header | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Not required | Returns API health and an ISO timestamp |

### Users (`/users`)

| Method | Endpoint | Identity Header | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/users` | Not applied by this router | List users |
| `GET` | `/users/:id` | Not applied by this router | Fetch a user by ID |
| `POST` | `/users/new` | Not applied by this router | Create a user; request validated with Zod |
| `PATCH` | `/users/:id` | Not applied by this router | Update user details; request validated with Zod |
| `DELETE` | `/users/:id` | Not applied by this router | Delete a user |

### Event Types (`/events`)

All routes in this group use the `requireUserId` middleware and expect a numeric `X-User-Id` header.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/events` | List event types for the current host |
| `GET` | `/events/:id` | Fetch an event type |
| `POST` | `/events/new` | Create an event type |
| `PATCH` | `/events/:id` | Update an event type |
| `DELETE` | `/events/:id` | Delete an event type |

### Availability (`/availability`)

All routes in this group require `X-User-Id`.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/availability/rules` | List weekly availability rules |
| `POST` | `/availability/rules/new` | Create an availability rule |
| `PATCH` | `/availability/rules/:id` | Update an availability rule |
| `DELETE` | `/availability/rules/:id` | Delete an availability rule |
| `GET` | `/availability/exceptions` | List date-specific availability exceptions |
| `POST` | `/availability/exceptions/new` | Create an availability exception |
| `PATCH` | `/availability/exceptions/:id` | Update an availability exception |
| `DELETE` | `/availability/exceptions/:id` | Delete an availability exception |

### Public Event Lookup (`/public`)

| Method | Endpoint | Identity Header | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/public/users/:userId/events/:slug` | Not required by this router | Fetch a public event page by host ID and event slug |

### Bookings (`/bookings`)

All routes in this group require `X-User-Id`.

| Method | Endpoint | Query Parameters | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/bookings` | `from`, `to`, `status` *(optional)* | List bookings for the current host; optional filters apply to slot date and booking status |
| `POST` | `/bookings/new` | — | Book an available slot using the optimistic transactional flow |

### Google Calendar (`/integrations/google`)

| Method | Endpoint | Identity Header | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/integrations/google/callback` | Not required by this router | Handle the OAuth callback and exchange the authorization code |

Example health request:

```bash
curl -i http://localhost:4000/health
```

Example request to a route that expects host identity:

```bash
curl -i \
  -H "X-User-Id: 1" \
  http://localhost:4000/events
```

> `X-User-Id` is a required identity context for protected route groups, not an authentication credential. Review the [Security and Deployment Notes](#-security-and-deployment-notes) before exposing the API publicly.

---

## 🧪 Load Testing Results

The project includes a `load-testing/` directory with k6-based load-test assets. The following are recorded results from the project's reported test runs; performance depends on the endpoint mix, database state, cluster sizing, network, and test configuration. These numbers are **test observations, not a production-capacity guarantee**.

### Scalability Test

| Metric | Observed result |
| :--- | ---: |
| Maximum concurrent virtual users | 200 |
| Test duration | Approximately 4 minutes |
| Total requests | 212,743 |
| Average throughput | Approximately 886 requests/second |
| Average latency | 65.08 ms |
| 95th-percentile latency | 69.63 ms |
| Maximum latency | 705.02 ms |
| Request success rate | 100% in the recorded run |

### Concurrent Booking / Double-Booking Test

| Metric | Observed result |
| :--- | ---: |
| Concurrent virtual users | 100 |
| Iterations | 1 per virtual user |
| Successful booking | 1 |
| Rejected competing bookings | 99 |
| Average latency | 222.56 ms |
| Median latency | 215.73 ms |
| 90th-percentile latency | 324.05 ms |
| 95th-percentile latency | 329.62 ms |
| Maximum latency | 564.41 ms |

The contention test exercises the conditional slot-state transition: one request wins the available slot, while concurrent attempts that observe the changed state are rejected. A complete benchmark should also record the exact cluster node size, replica count, request mix, and database configuration alongside the results.

---

## 🛠️ NPM Scripts

The following scripts are defined in `package.json`:

```bash
# Local development
pnpm dev                 # Run the API with nodemon + tsx
pnpm dev:worker          # Run the Temporal Worker with live reload

# Build and production execution
pnpm build               # Generate Prisma client and compile TypeScript
pnpm start               # Run the compiled API
pnpm start:worker        # Run the compiled Temporal Worker

# Prisma / database
pnpm prisma:format       # Format schema.prisma
pnpm prisma:migrate      # Run prisma migrate dev
pnpm prisma:generate     # Generate the Prisma client
pnpm prisma:all          # Format, migrate, and generate
pnpm prisma:studio       # Open Prisma Studio

# Google Calendar
pnpm google:setup        # Print the Google OAuth setup URL
```

---

## 📂 Project Directory Structure

```text
calendly-project/
├── k8s/                         # Kubernetes manifests for deployment
├── load-testing/                # k6 load-testing assets and scenarios
├── prisma/
│   ├── migrations/               # Versioned database migrations
│   └── schema.prisma             # Relational data model
├── src/
│   ├── app.ts                    # Express application and route mounting
│   ├── server.ts                 # API entrypoint and dependency initialization
│   ├── config/                   # Environment and database configuration
│   ├── controllers/              # HTTP controllers
│   ├── dtos/                     # Zod request schemas / DTOs
│   ├── mailer/                   # Email sending logic
│   ├── middlewares/              # Request identity, validation, errors, not-found handler
│   ├── repositories/              # Prisma queries and transaction operations
│   ├── routers/                  # User, event, availability, booking, and integration routes
│   ├── services/                 # Booking, slot generation, Redis, and Calendar logic
│   ├── temporal/
│   │   ├── activities/           # Workflow activities
│   │   ├── workflows/            # Slot, email, and Calendar workflows
│   │   ├── client.ts             # Workflow client integration
│   │   └── worker.ts             # Temporal Worker entrypoint
│   └── utils/                    # Shared response and API-error utilities
├── temporal/
│   └── dynamicConfig/            # Temporal Server development configuration
├── Dockerfile                    # API container image
├── Dockerfile.worker             # Temporal Worker container image
├── docker-compose.yml            # Local infrastructure dependencies
├── package.json                  # Commands and dependencies
├── pnpm-lock.yaml                # Locked dependency tree
├── prisma.config.ts              # Prisma schema, migrations, and DB URL config
├── Project_Report.md              # Deployment report and technical challenges
└── README.md                      # Project documentation
```

---

## 🔐 Security and Deployment Notes

- **Trust boundary for `X-User-Id`:** The current `requireUserId` middleware checks that this header contains a numeric value; it does not independently validate a session or signed token. Deploy the API behind an authenticated, trusted gateway that strips client-supplied identity headers and injects the verified user ID. Do not expose protected routes directly to untrusted clients in this state.
- **User routes:** The `/users` router does not apply `requireUserId` in its route definitions. Enforce the intended access policy at the gateway or add explicit authentication and authorization before production exposure.
- **Secrets:** Keep database passwords, Google OAuth credentials, refresh tokens, and SMTP credentials in environment-specific secret storage. Never commit a populated `.env` file.
- **Local database credentials:** The credentials in `docker-compose.yml` are convenience settings for a local environment only. Change them for any shared or deployed environment.
- **Database connectivity:** Configure MySQL firewall/network access so only authorized application components can connect. Prefer private networking between AKS and the managed database.
- **Error details:** The API includes error stack details only when `NODE_ENV=development`. Use `NODE_ENV=production` in deployed environments.
- **Kubernetes secrets and probes:** The API manifest imports configuration from a Kubernetes Secret and uses `/health` for readiness/liveness probes. Ensure every referenced Secret exists before deploying.
- **Google Calendar and SMTP:** Validate OAuth redirect URIs and use production credentials/providers when moving away from local development.

---

## 📄 License

The `package.json` currently declares the **ISC** license.
