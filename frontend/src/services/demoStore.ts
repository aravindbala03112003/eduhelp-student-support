import {
  Ticket,
  Category,
  User,
  DashboardStats,
  ReportAnalytics,
  StaffWorkloadItem,
  NotificationItem,
  Comment,
  HistoryEvent,
} from '../types/index.js';

// Seeded Users
export const DEMO_USERS: Record<string, User> = {
  student: {
    id: '11111111-1111-1111-1111-111111111101',
    name: 'Aarav Patel',
    email: 'student@eduhelp.demo',
    role: 'STUDENT',
    department: 'Computer Science & Engineering',
    phone: '+91 99000 11111',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
  },
  staff: {
    id: '22222222-2222-2222-2222-222222222201',
    name: 'Priya Sharma',
    email: 'staff@eduhelp.demo',
    role: 'STAFF',
    department: 'Registrar & Examination Services',
    phone: '+91 98111 22334',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
  },
  manager: {
    id: '33333333-3333-3333-3333-333333333301',
    name: 'Dr. Rajeshwar Rao',
    email: 'manager@eduhelp.demo',
    role: 'MANAGER',
    department: 'Student Affairs & Administration',
    phone: '+91 98765 43210',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  },
};

export const DEMO_CATEGORIES: Category[] = [
  { id: 1, name: 'Fees & Accounts', code: 'FEES', description: 'Tuition fees, receipts, installment requests, scholarship adjustments', default_sla_hours: 48, is_active: true },
  { id: 2, name: 'Attendance & Leave', code: 'ATTENDANCE', description: 'Attendance discrepancies, medical leave approvals, on-duty approvals', default_sla_hours: 24, is_active: true },
  { id: 3, name: 'ID Card & Access', code: 'ID_CARD', description: 'Lost ID card reissue, RFID access errors, digital badge updates', default_sla_hours: 24, is_active: true },
  { id: 4, name: 'Official Documents', code: 'DOCUMENTS', description: 'Bonafide letters, medium of instruction letters, fee estimate letters', default_sla_hours: 48, is_active: true },
  { id: 5, name: 'Certificates & Transcripts', code: 'CERTIFICATES', description: 'Grade sheets, provisional certificates, character certificates', default_sla_hours: 72, is_active: true },
  { id: 6, name: 'Examination & Grades', code: 'EXAMINATION', description: 'Re-evaluation, hall tickets, exam schedule conflicts, backlog queries', default_sla_hours: 24, is_active: true },
  { id: 7, name: 'Hostel & Mess', code: 'HOSTEL', description: 'Room allocation, maintenance repairs, mess rebate, roommate issues', default_sla_hours: 24, is_active: true },
  { id: 8, name: 'Campus Transport', code: 'TRANSPORT', description: 'Bus pass renewal, route modifications, transit schedules', default_sla_hours: 48, is_active: true },
  { id: 9, name: 'Technical Support', code: 'TECH_SUPPORT', description: 'Portal login issues, LMS access, campus Wi-Fi credentials', default_sla_hours: 12, is_active: true },
  { id: 10, name: 'Administrative & Other', code: 'OTHER', description: 'General inquiries, sports department requests, extracurricular claims', default_sla_hours: 72, is_active: true },
];

export const INITIAL_DEMO_TICKETS: Ticket[] = [
  {
    id: 't-101',
    ticket_number: 'EDU-20260924-0001',
    student_id: DEMO_USERS.student.id,
    student_name: 'Aarav Patel',
    student_email: 'student@eduhelp.demo',
    student_dept: 'Computer Science',
    category_id: 6,
    category_name: 'Examination & Grades',
    category_code: 'EXAMINATION',
    subject: 'Urgent: Hall Ticket not generated for upcoming end-term exams',
    description: 'My end-term examinations commence next Monday. When accessing the student portal, the system throws an error stating "Hall ticket unavailable". Fee dues have already been cleared.',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    assigned_to: DEMO_USERS.staff.id,
    assigned_to_name: 'Priya Sharma',
    sla_due_at: new Date(Date.now() + 18 * 3600 * 1000).toISOString(),
    sla_breached: false,
    slaStatus: 'ON_TRACK',
    slaRemainingFormatted: '18h remaining',
    slaPercentRemaining: 75,
    slaIsAtRisk: false,
    ageFormatted: '6 hours',
    ageBracket: '0-1d',
    ageHours: 6,
    created_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    comments: [
      {
        id: 'c-1',
        ticket_id: 't-101',
        user_id: DEMO_USERS.staff.id,
        author_name: 'Priya Sharma',
        author_role: 'STAFF',
        comment: 'We are cross-referencing your clearance with the accounts department now.',
        is_internal: false,
        created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      },
      {
        id: 'c-2',
        ticket_id: 't-101',
        user_id: DEMO_USERS.staff.id,
        author_name: 'Priya Sharma',
        author_role: 'STAFF',
        comment: 'Finance verified no backlog fees. Synchronizing ledger in ERP.',
        is_internal: true,
        created_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
      },
    ],
    history: [
      { id: 'h-1', ticket_id: 't-101', user_id: DEMO_USERS.student.id, actor_name: 'Aarav Patel', actor_role: 'STUDENT', action: 'CREATED', old_value: null, new_value: 'NEW', created_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString() },
      { id: 'h-2', ticket_id: 't-101', user_id: DEMO_USERS.manager.id, actor_name: 'Dr. Rajeshwar Rao', actor_role: 'MANAGER', action: 'ASSIGNED', old_value: null, new_value: 'Priya Sharma', created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString() },
      { id: 'h-3', ticket_id: 't-101', user_id: DEMO_USERS.staff.id, actor_name: 'Priya Sharma', actor_role: 'STAFF', action: 'STATUS_CHANGE', old_value: 'ASSIGNED', new_value: 'IN_PROGRESS', created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString() },
    ],
  },
  {
    id: 't-102',
    ticket_number: 'EDU-20260924-0002',
    student_id: DEMO_USERS.student.id,
    student_name: 'Aarav Patel',
    student_email: 'student@eduhelp.demo',
    student_dept: 'Computer Science',
    category_id: 1,
    category_name: 'Fees & Accounts',
    category_code: 'FEES',
    subject: 'Request for Scholarship Fee Receipt & Balance Settlement',
    description: 'Submitted state merit scholarship sanction letter in August. Requesting updated fee receipt reflecting the credit adjustment.',
    priority: 'MEDIUM',
    status: 'WAITING_FOR_STUDENT',
    assigned_to: DEMO_USERS.staff.id,
    assigned_to_name: 'Priya Sharma',
    sla_due_at: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
    sla_breached: false,
    slaStatus: 'AT_RISK',
    slaRemainingFormatted: '4h remaining',
    slaPercentRemaining: 8,
    slaIsAtRisk: true,
    ageFormatted: '1 day',
    ageBracket: '1-3d',
    ageHours: 44,
    created_at: new Date(Date.now() - 44 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    comments: [
      {
        id: 'c-3',
        ticket_id: 't-102',
        user_id: DEMO_USERS.staff.id,
        author_name: 'Priya Sharma',
        author_role: 'STAFF',
        comment: 'Please upload the bank transaction confirmation slip for the balance payment.',
        is_internal: false,
        created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      },
    ],
    history: [
      { id: 'h-4', ticket_id: 't-102', user_id: DEMO_USERS.student.id, actor_name: 'Aarav Patel', actor_role: 'STUDENT', action: 'CREATED', old_value: null, new_value: 'NEW', created_at: new Date(Date.now() - 44 * 3600 * 1000).toISOString() },
      { id: 'h-5', ticket_id: 't-102', user_id: DEMO_USERS.staff.id, actor_name: 'Priya Sharma', actor_role: 'STAFF', action: 'STATUS_CHANGE', old_value: 'IN_PROGRESS', new_value: 'WAITING_FOR_STUDENT', created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString() },
    ],
  },
  {
    id: 't-103',
    ticket_number: 'EDU-20260924-0003',
    student_id: DEMO_USERS.student.id,
    student_name: 'Aarav Patel',
    student_email: 'student@eduhelp.demo',
    student_dept: 'Computer Science',
    category_id: 3,
    category_name: 'ID Card & Access',
    category_code: 'ID_CARD',
    subject: 'Lost Smart Card ID — Reissue and Library RFID activation',
    description: 'Misplaced physical ID card in campus cafeteria. Requesting replacement card issuance and biometric access reactivation.',
    priority: 'LOW',
    status: 'RESOLVED',
    assigned_to: DEMO_USERS.staff.id,
    assigned_to_name: 'Priya Sharma',
    sla_due_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    sla_breached: false,
    slaStatus: 'COMPLETED',
    slaRemainingFormatted: 'Resolved',
    slaPercentRemaining: 0,
    slaIsAtRisk: false,
    ageFormatted: '2 days',
    ageBracket: '1-3d',
    ageHours: 60,
    resolved_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - 60 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    comments: [
      {
        id: 'c-4',
        ticket_id: 't-103',
        user_id: DEMO_USERS.staff.id,
        author_name: 'Priya Sharma',
        author_role: 'STAFF',
        comment: 'New smart card printed and activated. Available for collection at Academic Counter 2.',
        is_internal: false,
        created_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
      },
    ],
    history: [
      { id: 'h-6', ticket_id: 't-103', user_id: DEMO_USERS.staff.id, actor_name: 'Priya Sharma', actor_role: 'STAFF', action: 'STATUS_CHANGE', old_value: 'IN_PROGRESS', new_value: 'RESOLVED', created_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString() },
    ],
  },
  {
    id: 't-104',
    ticket_number: 'EDU-20260924-0004',
    student_id: '11111111-1111-1111-1111-111111111102',
    student_name: 'Sneha Kulkarni',
    student_email: 'sneha.student@eduhelp.demo',
    student_dept: 'Electronics & Communication',
    category_id: 7,
    category_name: 'Hostel & Mess',
    category_code: 'HOSTEL',
    subject: 'Emergency: Water supply disruption in Block C 3rd Floor',
    description: 'Hot water geyser failure and low pressure across 3rd floor washrooms.',
    priority: 'URGENT',
    status: 'ESCALATED',
    assigned_to: DEMO_USERS.staff.id,
    assigned_to_name: 'Priya Sharma',
    sla_due_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    sla_breached: true,
    slaStatus: 'BREACHED',
    slaRemainingFormatted: 'Breached by 4h',
    slaPercentRemaining: 0,
    slaIsAtRisk: true,
    ageFormatted: '12 hours',
    ageBracket: '0-1d',
    ageHours: 12,
    created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    comments: [
      {
        id: 'c-5',
        ticket_id: 't-104',
        user_id: DEMO_USERS.manager.id,
        author_name: 'Dr. Rajeshwar Rao',
        author_role: 'MANAGER',
        comment: 'Escalated due to SLA breach. Estate maintenance officer notified.',
        is_internal: true,
        created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      },
    ],
    history: [
      { id: 'h-7', ticket_id: 't-104', user_id: DEMO_USERS.manager.id, actor_name: 'Dr. Rajeshwar Rao', actor_role: 'MANAGER', action: 'ESCALATED', old_value: 'IN_PROGRESS', new_value: 'ESCALATED', created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString() },
    ],
  },
];

class DemoStore {
  private tickets: Ticket[] = [];

  constructor() {
    this.init();
  }

  private init() {
    const saved = localStorage.getItem('eduhelp_demo_tickets');
    if (saved) {
      try {
        this.tickets = JSON.parse(saved);
        return;
      } catch (e) {
        // ignore
      }
    }
    this.tickets = [...INITIAL_DEMO_TICKETS];
    this.save();
  }

  private save() {
    localStorage.setItem('eduhelp_demo_tickets', JSON.stringify(this.tickets));
  }

  getTickets(params?: any): { data: Ticket[]; pagination: any } {
    let list = [...this.tickets];

    if (params?.status) {
      list = list.filter((t) => t.status === params.status);
    }
    if (params?.priority) {
      list = list.filter((t) => t.priority === params.priority);
    }
    if (params?.category_id) {
      list = list.filter((t) => t.category_id === Number(params.category_id));
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter((t) => t.subject.toLowerCase().includes(q) || t.ticket_number.toLowerCase().includes(q));
    }

    return {
      data: list,
      pagination: { total: list.length, page: 1, limit: 50, pages: 1 },
    };
  }

  getMyTickets(userId: string): Ticket[] {
    return this.tickets.filter((t) => t.student_id === userId);
  }

  getAssignedTickets(staffId: string): Ticket[] {
    return this.tickets.filter((t) => t.assigned_to === staffId);
  }

  getTicketById(id: string, currentUserRole?: string): Ticket | null {
    const t = this.tickets.find((item) => item.id === id || item.ticket_number === id);
    if (!t) return null;

    const clone: Ticket = JSON.parse(JSON.stringify(t));
    if (currentUserRole === 'STUDENT' && clone.comments) {
      clone.comments = clone.comments.filter((c) => !c.is_internal);
    }
    return clone;
  }

  createTicket(payload: { category_id: number; subject: string; description: string; priority: string }, student: User): Ticket {
    const cat = DEMO_CATEGORIES.find((c) => c.id === payload.category_id);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randSeq = Math.floor(1000 + Math.random() * 9000);
    const ticketNumber = `EDU-${dateStr}-${randSeq}`;

    const priorityHours: Record<string, number> = { URGENT: 8, HIGH: 24, MEDIUM: 48, LOW: 72 };
    const hours = priorityHours[payload.priority] || 48;
    const slaDue = new Date(Date.now() + hours * 3600 * 1000).toISOString();

    const newTicket: Ticket = {
      id: `t-${Date.now()}`,
      ticket_number: ticketNumber,
      student_id: student.id,
      student_name: student.name,
      student_email: student.email,
      student_dept: student.department || 'General',
      category_id: payload.category_id,
      category_name: cat ? cat.name : 'General',
      category_code: cat ? cat.code : 'GEN',
      subject: payload.subject,
      description: payload.description,
      priority: payload.priority as any,
      status: 'NEW',
      assigned_to: null,
      assigned_to_name: null,
      sla_due_at: slaDue,
      sla_breached: false,
      slaStatus: 'ON_TRACK',
      slaRemainingFormatted: `${hours}h remaining`,
      slaPercentRemaining: 100,
      slaIsAtRisk: false,
      ageFormatted: 'Just now',
      ageBracket: '0-1d',
      ageHours: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      comments: [],
      history: [
        {
          id: `h-${Date.now()}`,
          ticket_id: `t-${Date.now()}`,
          user_id: student.id,
          actor_name: student.name,
          actor_role: student.role,
          action: 'CREATED',
          old_value: null,
          new_value: 'NEW',
          created_at: new Date().toISOString(),
        },
      ],
    };

    this.tickets.unshift(newTicket);
    this.save();
    return newTicket;
  }

  addComment(ticketId: string, comment: string, isInternal: boolean, user: User): Ticket {
    const t = this.tickets.find((item) => item.id === ticketId || item.ticket_number === ticketId);
    if (!t) throw new Error('Ticket not found');

    if (isInternal && user.role === 'STUDENT') {
      throw new Error('Students are not authorized to create internal notes');
    }

    if (!t.comments) t.comments = [];
    t.comments.push({
      id: `c-${Date.now()}`,
      ticket_id: t.id,
      user_id: user.id,
      author_name: user.name,
      author_role: user.role,
      comment,
      is_internal: isInternal,
      created_at: new Date().toISOString(),
    });

    if (t.status === 'WAITING_FOR_STUDENT' && user.role === 'STUDENT') {
      t.status = 'IN_PROGRESS';
      if (!t.history) t.history = [];
      t.history.push({
        id: `h-${Date.now()}`,
        ticket_id: t.id,
        user_id: user.id,
        actor_name: user.name,
        actor_role: user.role,
        action: 'STATUS_CHANGE',
        old_value: 'WAITING_FOR_STUDENT',
        new_value: 'IN_PROGRESS',
        created_at: new Date().toISOString(),
      });
    }

    t.updated_at = new Date().toISOString();
    this.save();
    return t;
  }

  updateStatus(ticketId: string, status: string, user: User, notes?: string): Ticket {
    const t = this.tickets.find((item) => item.id === ticketId || item.ticket_number === ticketId);
    if (!t) throw new Error('Ticket not found');

    const oldStatus = t.status;
    t.status = status as any;
    if (status === 'RESOLVED') {
      t.resolved_at = new Date().toISOString();
      t.slaStatus = 'COMPLETED';
    }
    t.updated_at = new Date().toISOString();

    if (!t.history) t.history = [];
    t.history.push({
      id: `h-${Date.now()}`,
      ticket_id: t.id,
      user_id: user.id,
      actor_name: user.name,
      actor_role: user.role,
      action: 'STATUS_CHANGE',
      old_value: oldStatus,
      new_value: status,
      created_at: new Date().toISOString(),
    });

    if (notes) {
      if (!t.comments) t.comments = [];
      t.comments.push({
        id: `c-${Date.now()}`,
        ticket_id: t.id,
        user_id: user.id,
        author_name: user.name,
        author_role: user.role,
        comment: `Resolution Note: ${notes}`,
        is_internal: false,
        created_at: new Date().toISOString(),
      });
    }

    this.save();
    return t;
  }

  assignTicket(ticketId: string, staffId: string, staffName: string, manager: User): Ticket {
    const t = this.tickets.find((item) => item.id === ticketId || item.ticket_number === ticketId);
    if (!t) throw new Error('Ticket not found');

    const oldAssignee = t.assigned_to_name;
    t.assigned_to = staffId;
    t.assigned_to_name = staffName;
    if (t.status === 'NEW') {
      t.status = 'ASSIGNED';
    }
    t.updated_at = new Date().toISOString();

    if (!t.history) t.history = [];
    t.history.push({
      id: `h-${Date.now()}`,
      ticket_id: t.id,
      user_id: manager.id,
      actor_name: manager.name,
      actor_role: manager.role,
      action: 'ASSIGNED',
      old_value: oldAssignee,
      new_value: staffName,
      created_at: new Date().toISOString(),
    });

    this.save();
    return t;
  }

  escalateTicket(ticketId: string, reason: string, user: User): Ticket {
    const t = this.tickets.find((item) => item.id === ticketId || item.ticket_number === ticketId);
    if (!t) throw new Error('Ticket not found');

    const oldStatus = t.status;
    t.status = 'ESCALATED';
    t.priority = 'URGENT';
    t.updated_at = new Date().toISOString();

    if (!t.history) t.history = [];
    t.history.push({
      id: `h-${Date.now()}`,
      ticket_id: t.id,
      user_id: user.id,
      actor_name: user.name,
      actor_role: user.role,
      action: 'ESCALATED',
      old_value: oldStatus,
      new_value: 'ESCALATED',
      created_at: new Date().toISOString(),
    });

    if (reason) {
      if (!t.comments) t.comments = [];
      t.comments.push({
        id: `c-${Date.now()}`,
        ticket_id: t.id,
        user_id: user.id,
        author_name: user.name,
        author_role: user.role,
        comment: `Escalation Reason: ${reason}`,
        is_internal: true,
        created_at: new Date().toISOString(),
      });
    }

    this.save();
    return t;
  }

  reopenTicket(ticketId: string, reason: string, user: User): Ticket {
    const t = this.tickets.find((item) => item.id === ticketId || item.ticket_number === ticketId);
    if (!t) throw new Error('Ticket not found');

    t.status = 'REOPENED';
    t.updated_at = new Date().toISOString();

    if (!t.comments) t.comments = [];
    t.comments.push({
      id: `c-${Date.now()}`,
      ticket_id: t.id,
      user_id: user.id,
      author_name: user.name,
      author_role: user.role,
      comment: `Reopen Reason: ${reason}`,
      is_internal: false,
      created_at: new Date().toISOString(),
    });

    if (!t.history) t.history = [];
    t.history.push({
      id: `h-${Date.now()}`,
      ticket_id: t.id,
      user_id: user.id,
      actor_name: user.name,
      actor_role: user.role,
      action: 'REOPENED',
      old_value: 'RESOLVED',
      new_value: 'REOPENED',
      created_at: new Date().toISOString(),
    });

    this.save();
    return t;
  }

  getDashboardStats(role: string = 'MANAGER'): DashboardStats {
    const total = this.tickets.length;
    const open = this.tickets.filter((t) => ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_FOR_STUDENT', 'REOPENED', 'ESCALATED'].includes(t.status)).length;
    const resolved = this.tickets.filter((t) => t.status === 'RESOLVED').length;
    const breached = this.tickets.filter((t) => t.sla_breached || t.slaStatus === 'BREACHED').length;
    const at_risk = this.tickets.filter((t) => t.slaStatus === 'AT_RISK').length;

    if (role === 'STUDENT') {
      return {
        role: 'STUDENT',
        openRequests: open,
        awaitingResponse: this.tickets.filter((t) => t.status === 'WAITING_FOR_STUDENT').length,
        resolved,
        totalRequests: total,
      };
    }

    if (role === 'STAFF') {
      return {
        role: 'STAFF',
        assigned: open,
        inProgress: this.tickets.filter((t) => t.status === 'IN_PROGRESS').length,
        waiting: this.tickets.filter((t) => t.status === 'WAITING_FOR_STUDENT').length,
        dueSoon: at_risk,
        slaBreached: breached,
        totalAssignedEver: total,
      };
    }

    return {
      role: 'MANAGER',
      totalTickets: total,
      open,
      slaAtRisk: at_risk,
      slaBreached: breached,
      resolved,
      avgResolutionHours: 14.2,
    };
  }

  getReportsAnalytics(): ReportAnalytics {
    return {
      byCategory: [
        { name: 'Fees & Accounts', code: 'FEES', count: 8 },
        { name: 'Examination & Grades', code: 'EXAM', count: 6 },
        { name: 'Hostel & Mess', code: 'HOSTEL', count: 4 },
        { name: 'ID Card & Access', code: 'ID_CARD', count: 3 },
        { name: 'Official Documents', code: 'DOCS', count: 3 },
      ],
      byPriority: [
        { priority: 'LOW', count: 5 },
        { priority: 'MEDIUM', count: 11 },
        { priority: 'HIGH', count: 6 },
        { priority: 'URGENT', count: 2 },
      ],
      byStatus: [
        { status: 'NEW', count: 3 },
        { status: 'ASSIGNED', count: 4 },
        { status: 'IN_PROGRESS', count: 8 },
        { status: 'WAITING_FOR_STUDENT', count: 3 },
        { status: 'RESOLVED', count: 4 },
        { status: 'ESCALATED', count: 2 },
      ],
      volumeOverTime: [
        { date: '18 Sep', created: 4, resolved: 3 },
        { date: '19 Sep', created: 6, resolved: 5 },
        { date: '20 Sep', created: 5, resolved: 6 },
        { date: '21 Sep', created: 8, resolved: 4 },
        { date: '22 Sep', created: 7, resolved: 6 },
        { date: '23 Sep', created: 9, resolved: 8 },
        { date: '24 Sep', created: 5, resolved: 4 },
      ],
      slaPerformance: [
        { name: 'On Track', count: 16, color: '#10B981' },
        { name: 'At Risk', count: 4, color: '#F59E0B' },
        { name: 'Breached', count: 4, color: '#E11D48' },
      ],
      ageingDistribution: [
        { bracket: '0–1 day', count: 12 },
        { bracket: '1–3 days', count: 7 },
        { bracket: '3–7 days', count: 3 },
        { bracket: '7+ days', count: 2 },
      ],
    };
  }

  getStaffWorkload(): StaffWorkloadItem[] {
    return [
      {
        id: DEMO_USERS.staff.id,
        name: DEMO_USERS.staff.name,
        email: DEMO_USERS.staff.email,
        department: DEMO_USERS.staff.department || 'Registrar',
        avatarUrl: DEMO_USERS.staff.avatarUrl,
        assigned: 5,
        inProgress: 3,
        waiting: 1,
        overdue: 1,
        resolved: 12,
        totalOpen: 5,
      },
      {
        id: '22222222-2222-2222-2222-222222222202',
        name: 'Ananya Verma',
        email: 'ananya.staff@eduhelp.demo',
        department: 'Student Accounts & Finance',
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
        assigned: 4,
        inProgress: 2,
        waiting: 1,
        overdue: 0,
        resolved: 9,
        totalOpen: 4,
      },
      {
        id: '22222222-2222-2222-2222-222222222203',
        name: 'Vikram Joshi',
        email: 'vikram.staff@eduhelp.demo',
        department: 'Hostel & Facilities',
        avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
        assigned: 3,
        inProgress: 2,
        waiting: 0,
        overdue: 1,
        resolved: 7,
        totalOpen: 3,
      },
      {
        id: '22222222-2222-2222-2222-222222222204',
        name: 'Kavita Nair',
        email: 'kavita.staff@eduhelp.demo',
        department: 'IT & Digital Infrastructure',
        avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
        assigned: 2,
        inProgress: 1,
        waiting: 0,
        overdue: 0,
        resolved: 8,
        totalOpen: 2,
      },
    ];
  }
}

export const demoStore = new DemoStore();
