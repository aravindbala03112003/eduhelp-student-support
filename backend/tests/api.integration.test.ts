import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Server } from 'http';
import app from '../src/app.js';
import { pool } from '../src/config/db.js';

describe('EduHelp End-to-End REST API Integration Tests', () => {
  let server: Server;
  let baseUrl: string;

  let studentToken: string;
  let studentId: string;

  let otherStudentToken: string;
  let otherStudentId: string;

  let staffToken: string;
  let staffId: string;

  let managerToken: string;
  let managerId: string;

  beforeAll(async () => {
    // Start server on ephemeral port
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const addr = server.address() as any;
        baseUrl = `http://localhost:${addr.port}/api`;
        resolve();
      });
    });

    // 1. Authenticate Demo Student
    const studentRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@eduhelp.demo', password: 'password123' }),
    });
    const studentData = await studentRes.json();
    studentToken = studentData.data.token;
    studentId = studentData.data.user.id;

    // 2. Authenticate Other Student (Sneha)
    const otherRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'sneha.student@eduhelp.demo', password: 'password123' }),
    });
    const otherData = await otherRes.json();
    otherStudentToken = otherData.data.token;
    otherStudentId = otherData.data.user.id;

    // 3. Authenticate Support Staff (Priya)
    const staffRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'staff@eduhelp.demo', password: 'password123' }),
    });
    const staffData = await staffRes.json();
    staffToken = staffData.data.token;
    staffId = staffData.data.user.id;

    // 4. Authenticate Manager
    const managerRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'manager@eduhelp.demo', password: 'password123' }),
    });
    const managerData = await managerRes.json();
    managerToken = managerData.data.token;
    managerId = managerData.data.user.id;
  });

  afterAll(async () => {
    server.close();
    await pool.end();
  });

  // -------------------------------------------------------------
  // AUTHENTICATION & SESSIONS
  // -------------------------------------------------------------
  describe('Authentication & Roles', () => {
    it('successfully logs in with valid credentials and receives JWT', () => {
      expect(studentToken).toBeDefined();
      expect(typeof studentToken).toBe('string');
    });

    it('rejects login with invalid password returning 401', async () => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'student@eduhelp.demo', password: 'wrongpassword' }),
      });
      const data = await res.json();
      expect(res.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.message).toContain('Invalid email or password');
    });

    it('returns current session profile on /auth/me', async () => {
      const res = await fetch(`${baseUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.email).toBe('student@eduhelp.demo');
      expect(data.data.role).toBe('STUDENT');
    });
  });

  // -------------------------------------------------------------
  // AUTHORIZATION & RBAC GUARDS
  // -------------------------------------------------------------
  describe('Authorization & RBAC Restrictions', () => {
    it('blocks student from accessing manager-only workload endpoint returning 403', async () => {
      const res = await fetch(`${baseUrl}/staff/workload`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const data = await res.json();
      expect(res.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.message).toContain('Forbidden');
    });

    it('blocks student from creating internal staff notes returning 403', async () => {
      // Find a ticket
      const myTicketsRes = await fetch(`${baseUrl}/tickets/my`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const myTickets = await myTicketsRes.json();
      const ticketId = myTickets.data[0].id;

      const res = await fetch(`${baseUrl}/tickets/${ticketId}/internal-notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify({ comment: 'Illegal student internal note' }),
      });
      const data = await res.json();
      expect(res.status).toBe(403);
      expect(data.success).toBe(false);
    });

    it('blocks student A from viewing student B ticket details returning 403', async () => {
      // Find other student's ticket
      const otherTicketsRes = await fetch(`${baseUrl}/tickets/my`, {
        headers: { Authorization: `Bearer ${otherStudentToken}` },
      });
      const otherTickets = await otherTicketsRes.json();
      const foreignTicketId = otherTickets.data[0].id;

      // Student A tries to access
      const res = await fetch(`${baseUrl}/tickets/${foreignTicketId}`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const data = await res.json();
      expect(res.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.message).toContain('not authorized to view this ticket');
    });
  });

  // -------------------------------------------------------------
  // TICKET CREATION & VALIDATION
  // -------------------------------------------------------------
  describe('Ticket Creation & Zod Validation', () => {
    let createdTicketId: string;

    it('rejects ticket creation with missing/invalid fields returning 400 with Zod details', async () => {
      const res = await fetch(`${baseUrl}/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify({
          category_id: 1,
          subject: 'Hi', // Too short (< 5 chars)
          description: '', // Empty
          priority: 'INVALID_PRIORITY',
        }),
      });
      const data = await res.json();
      expect(res.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.errors).toBeDefined();
      expect(Array.isArray(data.errors)).toBe(true);
    });

    it('successfully creates a ticket with human-readable EDU-YYYYMMDD-XXXX number and SLA', async () => {
      // Get category ID
      const catRes = await fetch(`${baseUrl}/categories`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const catData = await catRes.json();
      const categoryId = catData.data[0].id;

      const res = await fetch(`${baseUrl}/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify({
          category_id: categoryId,
          subject: 'Automated Test Ticket - Transcript Request',
          description: 'This is an end-to-end integration test request for official transcripts.',
          priority: 'URGENT',
        }),
      });

      const data = await res.json();
      expect(res.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.ticket_number).toMatch(/^EDU-\d{8}-\d{4}$/);
      expect(data.data.status).toBe('NEW');
      expect(data.data.priority).toBe('URGENT');
      expect(data.data.slaStatus).toBe('ON_TRACK');

      createdTicketId = data.data.id;
    });

    // -------------------------------------------------------------
    // TICKET WORKFLOW, ASSIGNMENT & LIFECYCLE
    // -------------------------------------------------------------
    it('allows manager to assign ticket to staff, transitioning to ASSIGNED', async () => {
      const res = await fetch(`${baseUrl}/tickets/${createdTicketId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${managerToken}`,
        },
        body: JSON.stringify({ assigned_to: staffId }),
      });

      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.assigned_to).toBe(staffId);
      expect(data.data.status).toBe('ASSIGNED');
    });

    it('allows staff to transition status to IN_PROGRESS', async () => {
      const res = await fetch(`${baseUrl}/tickets/${createdTicketId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${staffToken}`,
        },
        body: JSON.stringify({ status: 'IN_PROGRESS' }),
      });

      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('IN_PROGRESS');
    });

    // -------------------------------------------------------------
    // INTERNAL NOTES STRICT DATA SECLUSION
    // -------------------------------------------------------------
    it('staff adds an internal note, visible to staff but strictly stripped for student', async () => {
      const noteRes = await fetch(`${baseUrl}/tickets/${createdTicketId}/internal-notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${staffToken}`,
        },
        body: JSON.stringify({ comment: 'Secret internal staff investigation note' }),
      });
      expect(noteRes.status).toBe(201);

      // 1. Staff requests ticket -> note MUST be present
      const staffView = await fetch(`${baseUrl}/tickets/${createdTicketId}`, {
        headers: { Authorization: `Bearer ${staffToken}` },
      });
      const staffTicket = await staffView.json();
      const staffComments = staffTicket.data.comments;
      const internalNoteForStaff = staffComments.find((c: any) => c.is_internal === true);
      expect(internalNoteForStaff).toBeDefined();
      expect(internalNoteForStaff.comment).toContain('Secret internal staff investigation note');

      // 2. Student requests same ticket -> note MUST BE COMPLETELY ABSENT
      const studentView = await fetch(`${baseUrl}/tickets/${createdTicketId}`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const studentTicket = await studentView.json();
      const studentComments = studentTicket.data.comments;
      const internalNoteForStudent = studentComments.find((c: any) => c.is_internal === true);
      expect(internalNoteForStudent).toBeUndefined(); // Strictly hidden!
    });

    // -------------------------------------------------------------
    // RESOLUTION & STUDENT REOPEN
    // -------------------------------------------------------------
    it('allows staff to resolve ticket with resolution remarks', async () => {
      const res = await fetch(`${baseUrl}/tickets/${createdTicketId}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${staffToken}`,
        },
        body: JSON.stringify({ resolution_notes: 'Transcript issued and sealed in registrar office.' }),
      });

      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('RESOLVED');
      expect(data.data.resolved_at).toBeDefined();
    });

    it('allows student to reopen the resolved ticket with explanation', async () => {
      const res = await fetch(`${baseUrl}/tickets/${createdTicketId}/reopen`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify({ reason: 'Official stamp is missing on the second page of transcript.' }),
      });

      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('REOPENED');
    });
  });
});
