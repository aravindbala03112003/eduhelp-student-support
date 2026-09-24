import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const createTicketSchema = z.object({
  category_id: z.number({ required_error: 'Category is required' }).int().positive(),
  subject: z.string().trim().min(5, 'Subject must be at least 5 characters').max(200, 'Subject must not exceed 200 characters'),
  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(3000, 'Description must not exceed 3000 characters'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'], { required_error: 'Priority is required' }),
});

export const updateStatusSchema = z.object({
  status: z.enum(['NEW', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_FOR_STUDENT', 'RESOLVED', 'CLOSED', 'REOPENED', 'ESCALATED']),
  resolution_notes: z.string().trim().optional(),
});

export const updatePrioritySchema = z.object({
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
});

export const assignTicketSchema = z.object({
  assigned_to: z.string().uuid('Please select a valid staff member'),
});

export const resolveTicketSchema = z.object({
  resolution_notes: z.string().trim().min(5, 'Resolution notes must be at least 5 characters'),
});

export const escalateTicketSchema = z.object({
  reason: z.string().trim().min(5, 'Please provide an escalation rationale').optional(),
});

export const reopenTicketSchema = z.object({
  reason: z.string().trim().min(5, 'Please provide a reason for reopening this request'),
});

export const createCommentSchema = z.object({
  comment: z.string().trim().min(1, 'Comment cannot be empty').max(2000, 'Comment must not exceed 2000 characters'),
});

export const createInternalNoteSchema = z.object({
  comment: z.string().trim().min(1, 'Internal note cannot be empty').max(2000, 'Internal note must not exceed 2000 characters'),
});
