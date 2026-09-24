# EduHelp — Student Support & Ticket Management

> 🌐 **Live Web Application**: **[https://aravindbala03112003.github.io/eduhelp-student-support/](https://aravindbala03112003.github.io/eduhelp-student-support/)**  
> 📦 **GitHub Repository**: [https://github.com/aravindbala03112003/eduhelp-student-support](https://github.com/aravindbala03112003/eduhelp-student-support)  
> 🏷️ **Tagline**: *"One place for every student request."*  
> 🎓 **Prepared for**: Edumerge Solutions Technical / Product Engineering Assessment  
> ⚙️ **Technology Stack**: React 18, Vite, TypeScript, Tailwind CSS, Recharts, Node.js, Express, PostgreSQL 18, Flutter (Android), Vitest.

---

### 🚀 Instant Live Demo
Click the live link above to test the full SaaS application directly in your browser with **1-Click Demo Logins** for Student, Support Staff, and Operations Manager. All features (Request Creation, Dynamic SLA calculation, Recharts Analytics, Ageing, Staff Workload, and Dark/Light Mode) are completely interactive.

---

## 1. Overview
**EduHelp** is an enterprise-grade institutional support and service management platform designed specifically for colleges, universities, and multi-campus educational institutions. It replaces fragmented email threads, scattered WhatsApp groups, and chaotic physical helpdesks with a single, transparent, SLA-governed support system.

Students raise requests across ten administrative and academic departments (Fees, Attendance, Examinations, ID Cards, Certificates, Hostel, Transport, etc.). Support staff triage, investigate, and resolve issues with complete audit tracking, while academic and administrative managers oversee real-time workload distribution, ageing queues, and SLA compliance metrics.

---

## 2. Problem Statement
Educational institutions often suffer from severe operational friction in student services:
1. **Lack of Accountability**: Student inquiries sent to generic department inboxes get lost, dropped, or forgotten without ownership.
2. **Opaque SLAs & Ageing**: Students have no visibility into when requests will be processed, leading to repeated physical visits and duplicate submissions.
3. **No Centralized Visibility for Leadership**: Deans, Registrars, and Administrative Directors lack macro-level visibility into staff capacity, department backlogs, or recurring student pain points.
4. **Data Security & Privacy**: Students frequently see each other's sensitive requests or internal department comments when using ad-hoc tools.

---

## 3. Product Goals
- **Single Source of Truth**: Centralize every institutional request into human-readable ticket numbers (`EDU-YYYYMMDD-XXXX`).
- **Enforced SLAs**: Server-calculated deadlines based on priority (`LOW` 72h, `MEDIUM` 48h, `HIGH` 24h, `URGENT` 8h) with proactive "At Risk" and "Breached" detection.
- **Strict Role-Based Access Control (RBAC)**: Backend-enforced authorization across Student, Staff, and Manager personas with airtight seclusion of internal staff notes.
- **Unified Full-Stack Architecture**: A single, robust Node.js/PostgreSQL REST API serving both a desktop/mobile-responsive React Web App and a companion Flutter Android app.

---

## 4. Features

### For Students
- **Smart Request Creation**: Multi-field submission with category selection, priority-based SLA target preview, subject, description, and file attachment support.
- **Live Ticket Tracker**: Real-time progress updates, public staff responses, and time-remaining countdown badges.
- **Reopen Workflow**: Students can reopen resolved tickets within 7 days if their issue persists, automatically transitioning the ticket back to `IN_PROGRESS`.
- **Mobile Companion Client**: An Android Flutter application for on-the-go tracking, notifications, and response submissions.

### For Support Staff
- **"My Work" Focused Queue**: Dedicated operational dashboard sorting assigned tickets by urgency, SLA remaining, and status.
- **State Transition Controls**: Step-by-step lifecycle actions (`Start Work`, `Request Info`, `Resolve`, `Escalate`).
- **Internal Staff Notes**: Private collaboration notes visible exclusively to staff and managers; strictly excluded from student queries.
- **Audit Timeline**: Visual chronological history recording every change of status, assignment, and priority.

### For Operations Managers
- **Executive Analytics Dashboard**: Real-time KPI summaries (Total Volume, Open Backlog, SLA At Risk, SLA Breached, Resolved Count, Average Resolution Time).
- **Interactive Visualizations**: Recharts visualizations for Ticket Volume trends, SLA Performance breakdowns, Category distributions, and Ageing histograms (`0–1d`, `1–3d`, `3–7d`, `7+d`).
- **Staff Workload Balancer**: Institutional staff capacity matrix displaying assigned, in-progress, overdue, and completed ticket counts per staff member.
- **Reassignment & Escalation**: Instant one-click ticket reassignment and emergency escalation workflows.

---

## 5. User Roles & Permissions

| Capability | STUDENT | STAFF | MANAGER |
| :--- | :---: | :---: | :---: |
| Raise new ticket | ✅ | ❌ | ❌ |
| View own tickets | ✅ | ❌ | ❌ |
| View assigned tickets | ❌ | ✅ | ✅ |
| View all institutional tickets | ❌ | ❌ | ✅ |
| Public comments & replies | ✅ | ✅ | ✅ |
| Internal staff notes | ❌ (Strictly blocked) | ✅ | ✅ |
| Change ticket status | ❌ (Reopen only) | ✅ (Permitted transitions) | ✅ |
| Assign / Reassign tickets | ❌ | ❌ | ✅ |
| Escalate tickets | ❌ | ✅ | ✅ |
| Executive reports & analytics | ❌ | ❌ | ✅ |
| Staff workload monitoring | ❌ | ❌ | ✅ |

---

## 6. User Journeys

```
STUDENT JOURNEY:
[Login] ──> [Student Dashboard] ──> [Create Request] (SLA calculated) ──> [Ticket Details]
                 │                                                            ▲
                 └──> [View Active Requests] ─────────────────────────────────┤
                                                                               │
                                  [Receive Staff Response] <───────────────────┘
                                                │
                                  [Verify & Resolve / Reopen]

STAFF JOURNEY:
[Login] ──> [Staff "My Work" Dashboard] ──> [Select Assigned Ticket]
                 │                                    │
                 └──> [Filter Queue (SLA/Priority)]  ├──> [Add Internal Note]
                                                      ├──> [Request Info from Student]
                                                      └──> [Resolve Ticket]

MANAGER JOURNEY:
[Login] ──> [Executive Dashboard] ──> [Inspect Staff Workload & SLA Breaches]
                 │                                    │
                 └──> [All Institutional Tickets] ───┴──> [Reassign / Escalate Overdue Ticket]
```

---

## 7. Tech Stack

### Web Frontend
- **Framework**: React 18 with Vite 6 & TypeScript 5.8
- **Styling**: Vanilla Tailwind CSS + Tokenized CSS Variables (Dark/Light mode support)
- **Icons**: `lucide-react`
- **Charts**: `recharts` 2.15
- **Routing**: `react-router-dom` 6.29
- **HTTP Client**: Axios with Bearer JWT interceptors

### Shared Backend
- **Runtime**: Node.js v24 LTS + Express.js 4 + TypeScript 5.8 (executed with `tsx`)
- **Database**: PostgreSQL 18.0 Relational Database with connection pooling (`pg`)
- **Authentication**: JWT (`jsonwebtoken`) + Salted one-way hashing (`bcrypt`)
- **Validation**: Strict runtime validation schemas (`zod`)
- **Testing**: `vitest` integration & unit test suite

### Companion Mobile App
- **Framework**: Flutter 3.35.6 / Dart 3.9.2
- **Architecture**: Material 3 Design matching EduHelp brand guidelines
- **Platform**: Android (Debug & Release APK targets)
- **State & Storage**: `http` REST client + `shared_preferences` secure token storage

---

## 8. Architecture

EduHelp uses a **single backend architecture**. Both the React Web client and Flutter Android client communicate with the exact same Express REST API endpoints and PostgreSQL database.

```
React Web Client (Port 5173) ────────┐
                                     ├──> Express REST API (Port 5000) ───> PostgreSQL 18 (Port 5432)
Flutter Android Client (Mobile) ─────┘
```

For complete architecture diagrams, refer to [docs/architecture.md](file:///c:/Users/Asus/Desktop/EDUHELP/docs/architecture.md).

---

## 9. Database Design

Fully normalized 3NF relational schema with 7 core tables:
1. `users`: System users with hashed passwords, roles (`STUDENT`, `STAFF`, `MANAGER`), and departments.
2. `categories`: Support departments (Fees, Attendance, Examinations, etc.) with default SLA thresholds.
3. `tickets`: Central ticket entity containing human-readable ticket numbers (`EDU-YYYYMMDD-XXXX`), status, priority, `sla_due_at`, `sla_breached`, timestamps, and foreign keys.
4. `ticket_comments`: Public communication and private staff notes (flagged by `is_internal`).
5. `ticket_history`: Immutable audit trail recording user, action, `old_value`, `new_value`, and timestamp.
6. `attachments`: Uploaded document metadata linked to tickets.
7. `notifications`: In-app notification center alerts.

---

## 10. API Overview

### Authentication
- `POST /api/auth/login` — Authenticate user, returns user object and Bearer JWT.
- `GET /api/auth/me` — Validate token and return current session user profile.

### Tickets (Students, Staff & Managers)
- `POST /api/tickets` — Student raises ticket; calculates `sla_due_at` automatically.
- `GET /api/tickets/my` — Fetch tickets raised by current student.
- `GET /api/tickets/assigned` — Fetch tickets assigned to current staff member.
- `GET /api/tickets` — Manager fetches all institutional tickets with search, filtering, and pagination.
- `GET /api/tickets/:id` — Retrieve comprehensive ticket details, public comments, and audit timeline.
- `POST /api/tickets/:id/comments` — Post a public reply (Student, Staff, or Manager).
- `POST /api/tickets/:id/internal-notes` — Post an internal note (Staff & Managers only; rejected for Students).
- `PATCH /api/tickets/:id/status` — Execute valid state transition (`LifecycleService`).
- `PATCH /api/tickets/:id/priority` — Update ticket priority (recalculates SLA due time).
- `POST /api/tickets/:id/assign` — Manager assigns ticket to a staff member.
- `POST /api/tickets/:id/resolve` — Staff/Manager resolves a ticket.
- `POST /api/tickets/:id/reopen` — Student reopens an eligible resolved ticket.
- `POST /api/tickets/:id/escalate` — Escalate ticket to high priority emergency queue.

### Analytics & Reports (Manager Only)
- `GET /api/dashboard/stats` — Executive summary KPI cards.
- `GET /api/dashboard/charts` — Aggregated datasets for Recharts visualizations.
- `GET /api/staff/workload` — Staff workload distribution matrix.
- `GET /api/reports` — Institutional operational summary with CSV export capability.

---

## 11. Security Implementation
1. **Password Hashing**: `bcrypt` with work factor 10. Passwords are never stored in plaintext and never leaked in SQL query projections.
2. **JWT Authentication**: Cryptographically signed tokens with expiration; validated by Express middleware.
3. **Backend-Enforced Authorization**: Frontend role guards are backed by server-side RBAC middleware (`requireRole`).
4. **Internal Notes Seclusion**: Hardcoded SQL filter `WHERE (is_internal = false OR $userRole != 'STUDENT')`. Students cannot access internal notes under any circumstance.
5. **SQL Injection Prevention**: 100% parameterized queries using `pg` placeholders (`$1, $2, ...`).
6. **Environment Isolation**: No hardcoded credentials; all secrets stored in `.env` and excluded via `.gitignore`.

---

## 12. SLA Engine Design
- **Deterministic Window**:
  - `URGENT`: 8 hours
  - `HIGH`: 24 hours
  - `MEDIUM`: 48 hours
  - `LOW`: 72 hours
- **SLA Status Calculation**:
  - **On Track**: Remaining time $\ge 20\%$ of total window.
  - **At Risk**: Ticket is open and remaining time $< 20\%$ of window.
  - **Breached**: Current time $> sla\_due\_at$ and ticket is unresolved.

---

## 13. Ticket Lifecycle State Machine
```
NEW ──> ASSIGNED ──> IN_PROGRESS ──> WAITING_FOR_STUDENT ──> IN_PROGRESS ──> RESOLVED ──> CLOSED
 │                                                                             │
 └──> ESCALATED ──> IN_PROGRESS                                                └──> REOPENED ──> IN_PROGRESS
```
Arbitrary transitions (e.g. `NEW` directly to `RESOLVED`, or transitions out of terminal state `CLOSED`) are strictly rejected with HTTP 400.

---

## 14. Demo Accounts

All demo accounts are pre-seeded in the database with the default password: `password123`

| Persona | Role | Email | Password | Department |
| :--- | :--- | :--- | :--- | :--- |
| **Aarav Sharma** | `STUDENT` | `student@eduhelp.demo` | `password123` | Computer Science |
| **Priya Patel** | `STAFF` | `staff@eduhelp.demo` | `password123` | Academic Registrar |
| **Dr. Rajesh Verma**| `MANAGER` | `manager@eduhelp.demo` | `password123` | Institutional Operations |

> **Pro Tip**: The Web Login screen features **1-Click Demo Login** buttons for instant demonstration to interviewers.

---

## 15. Setup & Running Instructions

### Prerequisites
- Node.js v18+ (tested on Node.js v24)
- PostgreSQL 14+ (tested on PostgreSQL 18 on port 5432)
- Flutter SDK (for mobile app, tested on Flutter 3.35.6)

### 1. Database Setup
Ensure PostgreSQL is running locally on port 5432. Create database `eduhelp`:
```sql
CREATE DATABASE eduhelp;
```
Configure `backend/.env`:
```env
PORT=5000
DATABASE_URL=postgresql://<DB_USER>:<DB_PASSWORD>@localhost:5432/eduhelp
JWT_SECRET=<YOUR_SECURE_JWT_SECRET_KEY>
NODE_ENV=development
```

Initialize schema and seed realistic demo data (10 students, 4 staff, 1 manager, 24 tickets across all states):
```bash
cd backend
npm install
npm run db:init
npm run db:seed
```

### 2. Run Backend API
```bash
cd backend
npm run dev
```
*Backend runs on `http://localhost:5000`. Health check: `http://localhost:5000/api/health`.*

### 3. Run Automated Tests
```bash
cd backend
npm test
```
*Executes all 23 Vitest automated tests covering SLA calculations, lifecycle transitions, and API authorization.*

### 4. Run React Web Application
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

### 5. Run Flutter Mobile App & APK
```bash
cd mobile
flutter pub get
flutter test
flutter build apk --debug
```
*The compiled Android APK is also directly downloadable from the Web App at `/mobile/eduhelp-companion-v1.0.0.apk`.*

---

## 16. Edge Cases Handled
1. **Student Access to Another Student's Ticket**: Returns HTTP 403 Forbidden.
2. **Student Attempting to Post Internal Note**: Returns HTTP 403 Forbidden.
3. **Invalid Lifecycle State Transition**: Centralized `LifecycleService` validates state graph and rejects illegal jumps with HTTP 400.
4. **Duplicate Ticket Numbers**: Atomic sequence generator in `ticketNumber.service.ts` guarantees unique `EDU-YYYYMMDD-XXXX` formats.
5. **SLA Breach Detection**: Server-computed at-risk thresholds and automated breach flags prevent client clock manipulation.
6. **Vite Watcher File Lock on Large Binaries**: Watcher ignores binary APK builds to eliminate Node.js Windows `EBUSY` crashes.

---

## 17. Trade-offs & Future Improvements
- **WebSockets vs Polling**: The MVP utilizes periodic REST polling and proactive re-fetching rather than WebSockets to prioritize architecture simplicity and reliable testability. WebSockets can be introduced using Socket.io or Server-Sent Events (SSE).
- **File Upload Storage**: Attachments are stored as local URLs and metadata records in PostgreSQL. In enterprise cloud deployments, this would map to an AWS S3 or Google Cloud Storage bucket with signed upload URLs.
- **Push Notifications**: Mobile notifications currently sync via the shared REST API notification center. Production deployment would integrate Firebase Cloud Messaging (FCM).

---

## 18. Additional Documentation
- [docs/architecture.md](file:///c:/Users/Asus/Desktop/EDUHELP/docs/architecture.md) — Comprehensive technical design, ER diagrams, and lifecycle state machines.
- [docs/approach.md](file:///c:/Users/Asus/Desktop/EDUHELP/docs/approach.md) — Product decisions, user journeys, SLA strategy, and engineering trade-offs.
- [docs/AI_USAGE_REPORT.md](file:///c:/Users/Asus/Desktop/EDUHELP/docs/AI_USAGE_REPORT.md) — Authentic AI-assisted engineering report detailing prompt workflows, challenges, and validations.
