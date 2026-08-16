# Calendly Microservices Architecture & Deployment Report

## I. Executive Summary
This project is a highly scalable, microservices-based appointment scheduling platform inspired by Calendly. It is designed to handle user configurations, real-time availability processing, and calendar integrations efficiently. 

The application was built from the ground up utilizing modern backend technologies and has been fully containerized and deployed to a production environment on Microsoft Azure Kubernetes Service (AKS).

**Technology Stack:**
* **Backend:** Node.js, Express, TypeScript
* **Database & ORM:** Azure Database for MySQL Flexible Server, Prisma ORM
* **Background Processing:** Temporal.io, Redis
* **Containerization:** Docker, Docker Compose
* **Orchestration:** Kubernetes (AKS)
* **Cloud Provider:** Microsoft Azure (ACR, AKS, MySQL)

---

## II. Core Application Features

The platform provides a comprehensive suite of features essential for appointment scheduling:

1. **User Management & Profiles**
   * Secure user registration and profile management.
   * Unique slugs for personalized booking pages.
   * Timezone-aware configurations.

2. **Event Type Configuration**
   * Hosts can create multiple event types (e.g., "15 Min Catch-up", "1 Hour Deep Dive").
   * Customizable meeting durations and physical/virtual locations.
   * Buffer times (before/after) to prevent back-to-back meeting burnout.

3. **Availability Engine**
   * Granular availability rules defined per weekday and timezone.
   * Support for availability exceptions (e.g., blocking off specific dates for holidays).

4. **Real-time Slot Generation**
   * Intelligent slot generation triggered dynamically.
   * Leverages background processing to recalculate and cache available slots without blocking the main API thread.

5. **Optimistic Booking System**
   * Users can book slots with immediate feedback.
   * Prevents double-booking through strict database constraints and transactional integrity.

6. **Integrations & Notifications**
   * **Google Calendar OAuth:** Seamless synchronization with Google Calendar.
   * **Email Notifications:** Automated email dispatching for booking confirmations using Nodemailer (mocked via Mailhog in development).

---

## III. System Architecture

The architecture is split into robust, decoupled services communicating via well-defined interfaces.

### 1. API Server (Express.js)
The core REST API handles synchronous client requests. It validates inputs (using Zod), authenticates users, and interacts with the MySQL database. Long-running tasks are offloaded by the API to the Temporal service.

### 2. Background Worker (Temporal.io)
Temporal manages all asynchronous background workflows. The dedicated Temporal Worker listens to task queues to execute activities such as:
* Recalculating and generating available slots when a host changes their availability.
* Triggering external API calls (Google Calendar).
* Sending email notifications.
This decoupling ensures the API remains fast and responsive.

### 3. Data Persistence (Prisma + MySQL)
Prisma provides type-safe database queries and seamless schema migrations. The relational model enforces referential integrity across Users, Event Types, Availability Rules, and Bookings.

---

## IV. Production Deployment Journey

Transitioning the application from local development to a production-grade cloud environment involved several orchestrated steps:

1. **Containerization**
   * Authored optimized `Dockerfile` and `Dockerfile.worker` using `node:22-alpine` and `node:22-slim` (Debian-based, to support Temporal's native glibc requirements).
   * Implemented multi-stage builds and `pnpm install --prod` to minimize the production image footprint.

2. **Azure Infrastructure Provisioning**
   * **Azure Container Registry (ACR):** Provisioned to securely host and distribute the Docker images.
   * **Azure Database for MySQL:** Deployed a Flexible Server to ensure high availability and automated backups for persistent data.
   * **Azure Kubernetes Service (AKS):** Spun up a scalable Kubernetes cluster in the `southindia` region to orchestrate the microservices.

3. **Kubernetes Configuration**
   * Translated the local `docker-compose` setup into robust Kubernetes manifests.
   * Configured Deployments and Services for:
     * `calendly-api` (The Express Server)
     * `calendly-worker` (The Temporal Worker)
     * `temporal` (The Temporal Server)
     * `temporal-ui` (The Temporal Web Dashboard)
     * `redis` (In-memory datastore for Temporal)
     * `mailhog` (SMTP mock server)
   * Securely injected connection strings using Kubernetes `Secret` and mapped environment variables.

---

## V. Technical Challenges & Solutions

Deploying complex microservices often reveals intricate bugs. We successfully diagnosed and resolved several critical issues:

* **Temporal Worker Path Resolution in Production:**
  * **Challenge:** The Temporal worker crashed with `ENOENT` because it was trying to read `.ts` workflow files in the compiled production environment.
  * **Solution:** Dynamically adjusted the `workflowsPath` in `worker.ts` to require `.js` extensions when `NODE_ENV === "production"`.

* **Kubernetes Service Link Collisions:**
  * **Challenge:** The `temporal-ui` pod crashed (`CrashLoopBackOff`) because Kubernetes automatically injected conflicting environment variables (e.g., `TEMPORAL_PORT="tcp://10...`), which broke the UI's internal YAML parser.
  * **Solution:** Disabled service link injection in the pod spec (`enableServiceLinks: false`), allowing the UI to boot cleanly.

* **Prisma v7 Configuration Strictness:**
  * **Challenge:** Prisma v7 introduced breaking changes, moving the `url` property out of `schema.prisma` and into `prisma.config.ts`. The deployment failed because the config file was not copied into the Docker runner stage, and a faulty `PrismaMariaDb` adapter was causing connection pool timeouts.
  * **Solution:** Reverted to the native Prisma Rust engine, removed the faulty adapter, and ensured `prisma.config.ts` was properly copied into the Docker image, allowing flawless interaction with Azure MySQL.

* **Azure MySQL Security:**
  * **Challenge:** Ensuring the database was secure yet accessible to both the AKS cluster and the local developer.
  * **Solution:** Leveraged the Azure CLI to precisely configure the Flexible Server Firewall, whitelisting the local developer's IP while keeping external traffic blocked.
