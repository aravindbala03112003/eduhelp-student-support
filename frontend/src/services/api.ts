import axios from 'axios';
import {
  Ticket,
  Category,
  DashboardStats,
  ReportAnalytics,
  StaffWorkloadItem,
  NotificationItem,
} from '../types/index.js';
import { demoStore, DEMO_CATEGORIES, DEMO_USERS } from './demoStore.js';

const api = axios.create({
  baseURL: import.meta.env?.VITE_API_BASE_URL || '/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Bearer token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('eduhelp_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (!window.location.hash.includes('/login') && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('eduhelp_token');
        localStorage.removeItem('eduhelp_user');
        window.location.hash = '/login';
      }
    }
    const message = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export default api;

const isNetworkError = (err: any) => {
  return (
    !err?.response ||
    err?.message === 'Network Error' ||
    err?.code === 'ERR_NETWORK' ||
    err?.message?.includes('Network Error') ||
    localStorage.getItem('eduhelp_token')?.startsWith('demo-token-')
  );
};

const getCurrentUser = () => {
  const saved = localStorage.getItem('eduhelp_user');
  return saved ? JSON.parse(saved) : DEMO_USERS.student;
};

// Category Service
export const getCategories = async (): Promise<Category[]> => {
  try {
    const res = await api.get('/categories');
    return res.data.data;
  } catch (err) {
    if (isNetworkError(err)) return DEMO_CATEGORIES;
    throw err;
  }
};

// Ticket Services
export interface GetTicketsParams {
  status?: string;
  priority?: string;
  category_id?: number | string;
  assigned_to?: string;
  sla_status?: string;
  search?: string;
  sort_by?: string;
  sort_order?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export const getTickets = async (params?: GetTicketsParams): Promise<{ data: Ticket[]; pagination: any }> => {
  try {
    const res = await api.get('/tickets', { params });
    return res.data;
  } catch (err) {
    if (isNetworkError(err)) return demoStore.getTickets(params);
    throw err;
  }
};

export const getMyTickets = async (params?: { status?: string; search?: string }): Promise<Ticket[]> => {
  try {
    const res = await api.get('/tickets/my', { params });
    return res.data.data;
  } catch (err) {
    if (isNetworkError(err)) {
      const user = getCurrentUser();
      return demoStore.getMyTickets(user.id);
    }
    throw err;
  }
};

export const getAssignedTickets = async (params?: { status?: string; priority?: string; search?: string }): Promise<Ticket[]> => {
  try {
    const res = await api.get('/tickets/assigned', { params });
    return res.data.data;
  } catch (err) {
    if (isNetworkError(err)) {
      const user = getCurrentUser();
      return demoStore.getAssignedTickets(user.id);
    }
    throw err;
  }
};

export const getTicketById = async (id: string): Promise<Ticket> => {
  try {
    const res = await api.get(`/tickets/${id}`);
    return res.data.data;
  } catch (err) {
    if (isNetworkError(err)) {
      const user = getCurrentUser();
      const ticket = demoStore.getTicketById(id, user.role);
      if (ticket) return ticket;
    }
    throw err;
  }
};

export const createTicket = async (payload: {
  category_id: number;
  subject: string;
  description: string;
  priority: string;
}): Promise<Ticket> => {
  try {
    const res = await api.post('/tickets', payload);
    return res.data.data;
  } catch (err) {
    if (isNetworkError(err)) {
      const user = getCurrentUser();
      return demoStore.createTicket(payload, user);
    }
    throw err;
  }
};

export const updateTicketStatus = async (id: string, status: string, resolution_notes?: string): Promise<Ticket> => {
  try {
    const res = await api.patch(`/tickets/${id}/status`, { status, resolution_notes });
    return res.data.data;
  } catch (err) {
    if (isNetworkError(err)) {
      const user = getCurrentUser();
      return demoStore.updateStatus(id, status, user, resolution_notes);
    }
    throw err;
  }
};

export const updateTicketPriority = async (id: string, priority: string): Promise<Ticket> => {
  try {
    const res = await api.patch(`/tickets/${id}/priority`, { priority });
    return res.data.data;
  } catch (err) {
    if (isNetworkError(err)) {
      const t = demoStore.getTicketById(id);
      if (t) {
        t.priority = priority as any;
        return t;
      }
    }
    throw err;
  }
};

export const assignTicket = async (id: string, assigned_to: string, staffName?: string): Promise<Ticket> => {
  try {
    const res = await api.post(`/tickets/${id}/assign`, { assigned_to });
    return res.data.data;
  } catch (err) {
    if (isNetworkError(err)) {
      const user = getCurrentUser();
      return demoStore.assignTicket(id, assigned_to, staffName || 'Priya Sharma', user);
    }
    throw err;
  }
};

export const reassignTicket = async (id: string, assigned_to: string, reason?: string, staffName?: string): Promise<Ticket> => {
  try {
    const res = await api.post(`/tickets/${id}/reassign`, { assigned_to, reason });
    return res.data.data;
  } catch (err) {
    if (isNetworkError(err)) {
      const user = getCurrentUser();
      return demoStore.assignTicket(id, assigned_to, staffName || 'Priya Sharma', user);
    }
    throw err;
  }
};

export const resolveTicket = async (id: string, resolution_notes: string): Promise<Ticket> => {
  try {
    const res = await api.post(`/tickets/${id}/resolve`, { resolution_notes });
    return res.data.data;
  } catch (err) {
    if (isNetworkError(err)) {
      const user = getCurrentUser();
      return demoStore.updateStatus(id, 'RESOLVED', user, resolution_notes);
    }
    throw err;
  }
};

export const escalateTicket = async (id: string, escalation_reason?: string): Promise<Ticket> => {
  try {
    const res = await api.post(`/tickets/${id}/escalate`, { escalation_reason: escalation_reason || 'Manual escalation' });
    return res.data.data;
  } catch (err) {
    if (isNetworkError(err)) {
      const user = getCurrentUser();
      return demoStore.escalateTicket(id, escalation_reason || 'Manual escalation', user);
    }
    throw err;
  }
};

export const reopenTicket = async (id: string, reason: string): Promise<Ticket> => {
  try {
    const res = await api.post(`/tickets/${id}/reopen`, { reason });
    return res.data.data;
  } catch (err) {
    if (isNetworkError(err)) {
      const user = getCurrentUser();
      return demoStore.reopenTicket(id, reason, user);
    }
    throw err;
  }
};

export const addComment = async (id: string, comment: string, is_internal: boolean = false): Promise<any> => {
  try {
    const endpoint = is_internal ? `/tickets/${id}/internal-notes` : `/tickets/${id}/comments`;
    const res = await api.post(endpoint, { comment });
    return res.data.data;
  } catch (err) {
    if (isNetworkError(err)) {
      const user = getCurrentUser();
      return demoStore.addComment(id, comment, is_internal, user);
    }
    throw err;
  }
};

export const addInternalNote = async (id: string, comment: string): Promise<any> => {
  return addComment(id, comment, true);
};

// Dashboard Services
export const getDashboardStats = async (role?: string): Promise<DashboardStats> => {
  try {
    const res = await api.get('/dashboard/stats');
    return res.data.data;
  } catch (err) {
    if (isNetworkError(err)) return demoStore.getDashboardStats(role);
    throw err;
  }
};

export const getDashboardCharts = async (): Promise<any> => {
  try {
    const res = await api.get('/dashboard/charts');
    return res.data.data;
  } catch (err) {
    if (isNetworkError(err)) return demoStore.getReportsAnalytics();
    throw err;
  }
};

export const getStaffWorkload = async (): Promise<StaffWorkloadItem[]> => {
  try {
    const res = await api.get('/staff/workload');
    return res.data.data;
  } catch (err) {
    if (isNetworkError(err)) return demoStore.getStaffWorkload();
    throw err;
  }
};

export const getReports = async (): Promise<ReportAnalytics> => {
  try {
    const res = await api.get('/reports');
    return res.data.data;
  } catch (err) {
    if (isNetworkError(err)) {
      return demoStore.getReportsAnalytics();
    }
    throw err;
  }
};

export const getReportsAnalytics = async (): Promise<ReportAnalytics> => {
  return getReports();
};

export const getNotifications = async (): Promise<NotificationItem[]> => {
  try {
    const res = await api.get('/notifications');
    return res.data.data;
  } catch (err) {
    if (isNetworkError(err)) {
      const user = getCurrentUser();
      return [
        {
          id: 'n-1',
          user_id: user.id,
          ticket_id: 't-101',
          ticket_number: 'EDU-20260924-0001',
          title: 'Ticket In Progress',
          message: 'Your ticket EDU-20260924-0001 is being processed by Priya Sharma.',
          is_read: false,
          created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        },
        {
          id: 'n-2',
          user_id: user.id,
          ticket_id: 't-102',
          ticket_number: 'EDU-20260924-0002',
          title: 'Action Required',
          message: 'Ticket EDU-20260924-0002 requires additional information from you.',
          is_read: false,
          created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        },
      ];
    }
    throw err;
  }
};

export const markNotificationRead = async (id: string): Promise<void> => {
  try {
    await api.patch(`/notifications/${id}/read`);
  } catch (err) {
    // silently ignore in demo mode
  }
};

export const markAllNotificationsRead = async (): Promise<void> => {
  try {
    await api.patch('/notifications/read-all');
  } catch (err) {
    // silently ignore in demo mode
  }
};
