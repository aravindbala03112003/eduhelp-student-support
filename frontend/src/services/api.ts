import axios from 'axios';
import {
  Ticket,
  Category,
  DashboardStats,
  ReportAnalytics,
  StaffWorkloadItem,
  NotificationItem,
} from '../types/index.js';

const api = axios.create({
  baseURL: '/api',
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
      // Don't auto-redirect if on login page already
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('eduhelp_token');
        localStorage.removeItem('eduhelp_user');
        window.location.href = '/login';
      }
    }
    const message = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export default api;

// Category Service
export const getCategories = async (): Promise<Category[]> => {
  const res = await api.get('/categories');
  return res.data.data;
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
  const res = await api.get('/tickets', { params });
  return res.data;
};

export const getMyTickets = async (params?: { status?: string; search?: string }): Promise<Ticket[]> => {
  const res = await api.get('/tickets/my', { params });
  return res.data.data;
};

export const getAssignedTickets = async (params?: { status?: string; priority?: string; search?: string }): Promise<Ticket[]> => {
  const res = await api.get('/tickets/assigned', { params });
  return res.data.data;
};

export const getTicketById = async (id: string): Promise<Ticket> => {
  const res = await api.get(`/tickets/${id}`);
  return res.data.data;
};

export const createTicket = async (payload: {
  category_id: number;
  subject: string;
  description: string;
  priority: string;
}): Promise<Ticket> => {
  const res = await api.post('/tickets', payload);
  return res.data.data;
};

export const updateTicketStatus = async (id: string, status: string, resolution_notes?: string): Promise<Ticket> => {
  const res = await api.patch(`/tickets/${id}/status`, { status, resolution_notes });
  return res.data.data;
};

export const updateTicketPriority = async (id: string, priority: string): Promise<Ticket> => {
  const res = await api.patch(`/tickets/${id}/priority`, { priority });
  return res.data.data;
};

export const assignTicket = async (id: string, assigned_to: string): Promise<Ticket> => {
  const res = await api.post(`/tickets/${id}/assign`, { assigned_to });
  return res.data.data;
};

export const resolveTicket = async (id: string, resolution_notes: string): Promise<Ticket> => {
  const res = await api.post(`/tickets/${id}/resolve`, { resolution_notes });
  return res.data.data;
};

export const escalateTicket = async (id: string, reason?: string): Promise<Ticket> => {
  const res = await api.post(`/tickets/${id}/escalate`, { reason });
  return res.data.data;
};

export const reopenTicket = async (id: string, reason: string): Promise<Ticket> => {
  const res = await api.post(`/tickets/${id}/reopen`, { reason });
  return res.data.data;
};

export const addComment = async (id: string, comment: string): Promise<any> => {
  const res = await api.post(`/tickets/${id}/comments`, { comment });
  return res.data.data;
};

export const addInternalNote = async (id: string, comment: string): Promise<any> => {
  const res = await api.post(`/tickets/${id}/internal-notes`, { comment });
  return res.data.data;
};

// Dashboard & Analytics Services
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const res = await api.get('/dashboard/stats');
  return res.data.data;
};

export const getReportsAnalytics = async (): Promise<ReportAnalytics> => {
  const res = await api.get('/reports/analytics');
  return res.data.data;
};

export const getStaffWorkload = async (): Promise<StaffWorkloadItem[]> => {
  const res = await api.get('/staff/workload');
  return res.data.data;
};

// Notifications Service
export const getNotifications = async (): Promise<NotificationItem[]> => {
  const res = await api.get('/notifications');
  return res.data.data;
};

export const markNotificationRead = async (id: string): Promise<void> => {
  await api.patch(`/notifications/${id}/read`);
};

export const markAllNotificationsRead = async (): Promise<void> => {
  await api.patch('/notifications/read-all');
};
