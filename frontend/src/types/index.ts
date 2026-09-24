export type UserRole = 'STUDENT' | 'STAFF' | 'MANAGER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  phone?: string;
  avatarUrl?: string;
}

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type TicketStatus =
  | 'NEW'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'WAITING_FOR_STUDENT'
  | 'RESOLVED'
  | 'CLOSED'
  | 'REOPENED'
  | 'ESCALATED';

export type SlaStatus = 'ON_TRACK' | 'AT_RISK' | 'BREACHED' | 'COMPLETED';

export interface Category {
  id: number;
  name: string;
  code: string;
  description?: string;
  default_sla_hours: number;
  is_active: boolean;
}

export interface Ticket {
  id: string;
  ticket_number: string;
  student_id: string;
  category_id: number;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  assigned_to?: string | null;
  sla_due_at: string;
  sla_breached: boolean;
  resolved_at?: string | null;
  closed_at?: string | null;
  resolution_notes?: string | null;
  created_at: string;
  updated_at: string;

  // Enriched joins & metrics
  student_name?: string;
  student_email?: string;
  student_dept?: string;
  student_phone?: string;
  category_name?: string;
  category_code?: string;
  assigned_to_name?: string | null;
  assigned_to_email?: string | null;
  assigned_to_dept?: string | null;

  slaStatus: SlaStatus;
  slaRemainingFormatted: string;
  slaPercentRemaining: number;
  slaIsAtRisk: boolean;
  ageFormatted: string;
  ageBracket: '0-1d' | '1-3d' | '3-7d' | '7+d';
  ageHours: number;

  comments?: Comment[];
  history?: HistoryEvent[];
  attachments?: Attachment[];
}

export interface Comment {
  id: string;
  ticket_id: string;
  user_id: string;
  comment: string;
  is_internal: boolean;
  created_at: string;
  author_name: string;
  author_role: UserRole;
  author_avatar?: string;
}

export interface HistoryEvent {
  id: string;
  ticket_id: string;
  user_id: string;
  action: string;
  old_value?: string | null;
  new_value?: string | null;
  created_at: string;
  actor_name: string;
  actor_role: UserRole;
}

export interface Attachment {
  id: string;
  ticket_id: string;
  uploaded_by: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  created_at: string;
  uploaded_by_name?: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  ticket_id?: string | null;
  ticket_number?: string | null;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface StudentDashboardStats {
  role: 'STUDENT';
  openRequests: number;
  awaitingResponse: number;
  resolved: number;
  totalRequests: number;
}

export interface StaffDashboardStats {
  role: 'STAFF';
  assigned: number;
  inProgress: number;
  waiting: number;
  dueSoon: number;
  slaBreached: number;
  totalAssignedEver: number;
}

export interface ManagerDashboardStats {
  role: 'MANAGER';
  totalTickets: number;
  open: number;
  slaAtRisk: number;
  slaBreached: number;
  resolved: number;
  avgResolutionHours: number;
}

export type DashboardStats = StudentDashboardStats | StaffDashboardStats | ManagerDashboardStats;

export interface StaffWorkloadItem {
  id: string;
  name: string;
  email: string;
  department: string;
  phone?: string;
  avatarUrl?: string;
  assigned: number;
  inProgress: number;
  waiting: number;
  overdue: number;
  resolved: number;
  totalOpen: number;
}

export interface ReportAnalytics {
  byCategory: { name: string; code: string; count: number }[];
  byPriority: { priority: string; count: number }[];
  byStatus: { status: string; count: number }[];
  volumeOverTime: { date: string; created: number; resolved: number }[];
  slaPerformance: { name: string; count: number; color: string }[];
  ageingDistribution: { bracket: string; count: number }[];
}
