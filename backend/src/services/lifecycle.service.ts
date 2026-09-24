export type TicketStatus =
  | 'NEW'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'WAITING_FOR_STUDENT'
  | 'RESOLVED'
  | 'CLOSED'
  | 'REOPENED'
  | 'ESCALATED';

export type UserRole = 'STUDENT' | 'STAFF' | 'MANAGER';

// Define permissible state transitions
export const ALLOWED_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  NEW: ['ASSIGNED', 'IN_PROGRESS', 'ESCALATED'],
  ASSIGNED: ['IN_PROGRESS', 'WAITING_FOR_STUDENT', 'ESCALATED'],
  IN_PROGRESS: ['WAITING_FOR_STUDENT', 'RESOLVED', 'ESCALATED'],
  WAITING_FOR_STUDENT: ['IN_PROGRESS', 'ESCALATED'],
  RESOLVED: ['CLOSED', 'REOPENED', 'IN_PROGRESS'],
  CLOSED: [], // Terminal state, no further transitions
  REOPENED: ['IN_PROGRESS', 'WAITING_FOR_STUDENT', 'RESOLVED', 'ESCALATED'],
  ESCALATED: ['IN_PROGRESS', 'RESOLVED'],
};

export interface TransitionValidationResult {
  isValid: boolean;
  reason?: string;
}

export function validateStatusTransition(
  currentStatus: TicketStatus,
  nextStatus: TicketStatus,
  userRole: UserRole,
  isOwnerStudent: boolean = false
): TransitionValidationResult {
  if (currentStatus === nextStatus) {
    return { isValid: false, reason: `Ticket is already in ${currentStatus} status.` };
  }

  // Check if target status is in the graph of allowed transitions
  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(nextStatus)) {
    return {
      isValid: false,
      reason: `Invalid lifecycle transition from ${currentStatus} to ${nextStatus}. Allowed: ${allowed.join(', ') || 'None (Terminal state)'}.`,
    };
  }

  // Role-specific constraints
  if (userRole === 'STUDENT') {
    if (!isOwnerStudent) {
      return { isValid: false, reason: 'Students can only modify their own tickets.' };
    }
    // Students can only REOPEN a RESOLVED ticket, or CLOSE an eligible RESOLVED ticket
    if (currentStatus === 'RESOLVED' && (nextStatus === 'REOPENED' || nextStatus === 'CLOSED')) {
      return { isValid: true };
    }
    // Answering when in WAITING_FOR_STUDENT can transition to IN_PROGRESS
    if (currentStatus === 'WAITING_FOR_STUDENT' && nextStatus === 'IN_PROGRESS') {
      return { isValid: true };
    }
    return {
      isValid: false,
      reason: `Students cannot change ticket status from ${currentStatus} to ${nextStatus}.`,
    };
  }

  if (userRole === 'STAFF') {
    // Staff cannot reopen a closed ticket or arbitrarily bypass states
    return { isValid: true };
  }

  if (userRole === 'MANAGER') {
    return { isValid: true };
  }

  return { isValid: false, reason: 'Unauthorized role for status transition.' };
}
