# EduHelp — Product Engineering & Architectural Approach

> **Candidate / Author**: Aravind Bala  
> **Repository**: [https://github.com/aravindbala03112003/eduhelp-student-support](https://github.com/aravindbala03112003/eduhelp-student-support)  
> **Prepared for**: Edumerge Solutions Technical Assessment  
> **Date**: September 24, 2026  

---

## 1. Problem Understanding & Context

Higher education institutions operate as federated organizations. A student routinely interacts with at least ten disparate departments: Registrar, Finance/Accounts, Examination Wing, Hostel Warden, Transport Office, IT Services, Departmental Academic Offices, Scholarship Bureau, Library, and General Administration.

Without a centralized, SLA-governed system, these student interactions face systematic breakdown:
1. **The "Black Hole" Problem**: Students submit requests via in-person paper slips or generic department inboxes (`accounts@univ.edu`), receiving no tracking ID, no expected time to resolution, and no confirmation of who owns the issue.
2. **Duplication & Queue Bloat**: Anxious students escalate identical complaints across multiple channels (visiting the office, sending emails to HODs, messaging WhatsApp groups), creating artificial queue bloat.
3. **Absence of Capacity Planning**: Academic Deans and Administrative Directors cannot answer fundamental operational questions: *Which department has the worst turnaround time? Are tickets breaching SLAs because of staff shortages or bottlenecks? How many tickets are older than 7 days?*

**EduHelp** was conceived not merely as a ticket tracking tool, but as an **operational coordination engine** that enforces transparency, accountability, and calm efficiency across institutional services.

---

## 2. Product Decisions & Design Philosophy

Rather than building a generic CRUD clone, EduHelp was designed with intentional product trade-offs:

1. **Information-Dense, Calm Interface**: Inspired by Linear and Stripe, the user interface emphasizes clean typographic hierarchies (Inter font, subtle borders, high contrast) and muted semantic badges rather than distracting gradients or animations.
2. **Unified Backend Architecture**: Rather than maintaining separate APIs or mock data for mobile, both the React Web client and the Flutter Android client communicate with the exact same Express REST API endpoints and PostgreSQL schema.
3. **Atomic Human-Readable IDs**: Tickets use `EDU-YYYYMMDD-XXXX` rather than database UUIDs (`7b8c...`) or raw sequential numbers (`1, 2, 3`), providing immediate temporal context and preventing user enumeration attacks.
4. **Deterministic, Server-Calculated SLAs**: SLAs are calculated and stored in the database at ticket creation time (`sla_due_at`). Client clocks cannot tamper with deadlines.
5. **Airtight Privacy for Staff Notes**: In student services, staff frequently discuss sensitive financial hardship, confidential medical notes, or disciplinary flags. Internal notes are secluded at the SQL projection level—never delivered to student clients.

---

## 3. User Roles & Permission Model

EduHelp defines three role personas with strict backend-enforced RBAC:

```
┌────────────────────────────────────────────────────────┐
│                        MANAGER                         │
│  Full visibility, assignment, re-assignment, analytics │
├───────────────────────────┬────────────────────────────┤
│           STAFF           │          STUDENT           │
│  Assigned queue triage,   │  Raise requests, track     │
│  internal notes, resolve  │  status, comment, reopen   │
└───────────────────────────┴────────────────────────────┘
```

- **STUDENT**: Permitted only to view their own requests, add public comments, upload attachments, and reopen resolved tickets within 7 days. Forbidden from viewing other students' tickets, assigning tickets, viewing internal notes, or accessing reports.
- **STAFF**: Permitted to view tickets assigned to them or within their department scope, update status through validated transitions, post public replies or private internal notes, and resolve/escalate tickets.
- **MANAGER**: Full institutional oversight. Can assign/reassign tickets, monitor real-time staff workload, view SLA ageing queues, and inspect aggregated reports.

---

## 4. Main User Journeys

### 4.1 Student Ticket Lifecycle Journey
1. Student logs in and lands on their personalized dashboard with real-time status counts.
2. Clicks **"+ Create New Request"**. As they select Category (`Examination`) and Priority (`High`), the system displays a dynamic SLA target preview (`24 Hours Resolution Target`).
3. Upon submission, an atomic ticket number (`EDU-20260924-0012`) is generated with `NEW` status.
4. Student tracks updates via the conversation thread. If staff mark the ticket `WAITING_FOR_STUDENT`, replying automatically shifts the status to `IN_PROGRESS`.
5. Once resolved, the student can either confirm closure or click **Reopen** if the issue is unresolved.

### 4.2 Support Staff Resolution Journey
1. Staff member logs in to **"My Work"**, filtering tickets by SLA countdown and priority.
2. Opens an assigned ticket, reviews student description and attachment.
3. Adds an **Internal Staff Note** (*"Verified fee ledger with accounts dept; waiver approved"*).
4. Posts a public reply to the student and clicks **"Mark Resolved"**.

### 4.3 Operations Manager Governance Journey
1. Manager inspects **KPI Cards** (Total, Open, SLA At Risk, SLA Breached, Avg Resolution Time).
2. Reviews the **Staff Workload Balancer** table to identify team members overloaded with pending requests.
3. Opens the **Ageing Distribution** chart; identifies tickets older than 3 days and initiates emergency reassignment or escalation.

---

## 5. Ticket Lifecycle State Machine

Arbitrary status transitions are strictly forbidden. The system implements a deterministic state transition matrix managed by `LifecycleService`:

```
               ┌─────────────┐
               │     NEW     │
               └──────┬──────┘
                      │ Manager/Staff assigns
                      ▼
               ┌─────────────┐
               │  ASSIGNED   │
               └──────┬──────┘
                      │ Staff begins investigation
                      ▼
        ┌─────────────────────────────┐
        │         IN_PROGRESS         │◄────────┐
        └──────┬───────────────▲──────┘         │
               │               │                │
Staff requests │               │ Student        │
clarification  │               │ responds       │
               ▼               │                │
     ┌───────────────────┐     │                │
     │WAITING_FOR_STUDENT├─────┘                │
     └───────────────────┘                      │
               │                                │
               │ Staff marks resolved           │
               ▼                                │
        ┌─────────────┐   Student reopens       │
        │  RESOLVED   ├─────────────────────────┘
        └──────┬──────┘
               │ Student or system closes
               ▼
        ┌─────────────┐
        │   CLOSED    │ (Terminal State)
        └─────────────┘
```

*Note: Any open ticket can transition to `ESCALATED` by manager action or SLA breach triggers.*

---

## 6. SLA & Ageing Strategy

### 6.1 SLA Targets
- **URGENT**: 8 Hours (Emergency exam, critical hostel safety, urgent certificates).
- **HIGH**: 24 Hours (Fee verification, hall tickets, urgent ID re-issuance).
- **MEDIUM**: 48 Hours (Standard document requests, attendance corrections).
- **LOW**: 72 Hours (General administrative inquiries).

### 6.2 Status Calculations
- **On Track**: Remaining time is $\ge 20\%$ of original SLA duration.
- **At Risk**: Ticket is open and remaining time is $< 20\%$ of duration.
- **Breached**: Timestamp exceeds `sla_due_at` and ticket is not resolved/closed.

### 6.3 Ageing Brackets
Tickets are grouped into operational brackets: `0–1 day`, `1–3 days`, `3–7 days`, and `7+ days`. The Manager Dashboard renders this distribution to identify institutional bottlenecks.

---

## 7. Data Model & Architecture

Normalized 3NF relational schema in PostgreSQL:
- `users`: Authentication credentials (`bcrypt` hash), roles, and departments.
- `categories`: Institutional support departments with default SLA hours.
- `tickets`: Core ticket entities with atomic ticket numbers, priority, status, timestamps, and foreign keys.
- `ticket_comments`: Polymorphic communication layer handling both public replies and private internal notes (`is_internal = true`).
- `ticket_history`: Immutable audit trail recording user, action, old value, and new value.
- `attachments`: File metadata linked to tickets.
- `notifications`: User alert notifications.

---

## 8. Security & Data Protection

1. **Password Hashing**: `bcrypt` salted one-way hashing with work factor 10. Passwords are never returned in SQL queries.
2. **JWT Authentication**: Cryptographically signed tokens with 7-day expiration; Bearer token authentication verified on every protected route.
3. **Server-Side RBAC**: Middleware (`requireRole`) validates permissions on every sensitive operation.
4. **Internal Notes Seclusion**: Hardcoded SQL filter `WHERE (is_internal = false OR $userRole != 'STUDENT')`.
5. **SQL Injection Protection**: All queries utilize native PostgreSQL parameterized placeholders (`$1, $2, ...`).

---

## 9. Validation & Edge Cases Handled

| Scenario | Handled Behavior | Result |
| :--- | :--- | :--- |
| Student accesses another student's ticket | Server checks `ticket.student_id === req.user.id` | Returns `403 Forbidden` |
| Student attempts to add internal note | Endpoint restricted to `STAFF` and `MANAGER` | Returns `403 Forbidden` |
| Invalid status transition (e.g. `NEW` $\rightarrow$ `RESOLVED`) | `LifecycleService.canTransition()` validates graph | Returns `400 Bad Request` |
| Duplicate ticket number generation | Atomic sequence generation with lock check | Guarantees uniqueness |
| High-concurrency file watcher lock on APK binary | Vite watcher configured with `ignored: ['**/*.apk']` | Prevents Windows EBUSY crashes |
| Reopening ticket after resolution | Validates student ownership and transitions to `IN_PROGRESS` | Records audit event |

---

## 10. Engineering Trade-offs & Future Roadmap

- **WebSockets vs REST Polling**: Polling with client-side cache re-validation was chosen for the MVP to prioritize rock-solid determinism and testing simplicity over WebSocket state synchronization complexity.
- **Local File Storage vs S3**: Attachments are stored with local paths and metadata in the database. Production deployment would transition to Amazon S3 or Google Cloud Storage with signed upload URLs.
- **Background Job Queue**: SLA calculations and breach markings are computed dynamically on fetch and deterministic checks. An enterprise upgrade would introduce BullMQ or Redis-backed cron workers for instant push notifications.
