export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type SlaStatus = 'ON_TRACK' | 'AT_RISK' | 'BREACHED' | 'COMPLETED';

export const SLA_HOURS: Record<Priority, number> = {
  LOW: 72,
  MEDIUM: 48,
  HIGH: 24,
  URGENT: 8,
};

export function calculateSlaDueDate(priority: Priority, fromDate: Date = new Date()): Date {
  const hours = SLA_HOURS[priority] || 48;
  return new Date(fromDate.getTime() + hours * 60 * 60 * 1000);
}

export interface SlaCalculationResult {
  status: SlaStatus;
  slaBreached: boolean;
  timeRemainingMs: number;
  timeRemainingFormatted: string;
  totalDurationMs: number;
  percentRemaining: number;
  isAtRisk: boolean;
}

export function computeTicketSla(
  createdAt: Date,
  slaDueAt: Date,
  ticketStatus: string,
  resolvedAt?: Date | null,
  currentDate: Date = new Date()
): SlaCalculationResult {
  const totalDurationMs = slaDueAt.getTime() - createdAt.getTime();
  const isTerminal = ['RESOLVED', 'CLOSED'].includes(ticketStatus);

  if (isTerminal) {
    const finalDate = resolvedAt || currentDate;
    const finalDiffMs = slaDueAt.getTime() - finalDate.getTime();
    const breached = finalDiffMs < 0;

    return {
      status: 'COMPLETED',
      slaBreached: breached,
      timeRemainingMs: 0,
      timeRemainingFormatted: breached ? 'Resolved after SLA breach' : 'Resolved within SLA',
      totalDurationMs,
      percentRemaining: 0,
      isAtRisk: false,
    };
  }

  const timeRemainingMs = slaDueAt.getTime() - currentDate.getTime();
  const percentRemaining = totalDurationMs > 0 ? (timeRemainingMs / totalDurationMs) * 100 : 0;

  if (timeRemainingMs <= 0) {
    const breachedMs = Math.abs(timeRemainingMs);
    const hours = Math.floor(breachedMs / (1000 * 60 * 60));
    const minutes = Math.floor((breachedMs % (1000 * 60 * 60)) / (1000 * 60));

    return {
      status: 'BREACHED',
      slaBreached: true,
      timeRemainingMs,
      timeRemainingFormatted: `SLA breached by ${hours}h ${minutes}m`,
      totalDurationMs,
      percentRemaining: 0,
      isAtRisk: false,
    };
  }

  // At risk if < 20% remaining
  const isAtRisk = percentRemaining <= 20;
  const hours = Math.floor(timeRemainingMs / (1000 * 60 * 60));
  const minutes = Math.floor((timeRemainingMs % (1000 * 60 * 60)) / (1000 * 60));

  return {
    status: isAtRisk ? 'AT_RISK' : 'ON_TRACK',
    slaBreached: false,
    timeRemainingMs,
    timeRemainingFormatted: `SLA due in ${hours}h ${minutes}m`,
    totalDurationMs,
    percentRemaining: Math.round(percentRemaining),
    isAtRisk,
  };
}

export function computeTicketAge(createdAt: Date, currentDate: Date = new Date()): {
  ageFormatted: string;
  ageBracket: '0-1d' | '1-3d' | '3-7d' | '7+d';
  ageHours: number;
} {
  const diffMs = Math.max(0, currentDate.getTime() - createdAt.getTime());
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  let ageBracket: '0-1d' | '1-3d' | '3-7d' | '7+d';
  if (days < 1) ageBracket = '0-1d';
  else if (days < 3) ageBracket = '1-3d';
  else if (days < 7) ageBracket = '3-7d';
  else ageBracket = '7+d';

  let ageFormatted: string;
  if (days >= 1) {
    ageFormatted = `${days} day${days > 1 ? 's' : ''}`;
  } else if (hours >= 1) {
    ageFormatted = `${hours} hour${hours > 1 ? 's' : ''}`;
  } else {
    const minutes = Math.floor(diffMs / (1000 * 60));
    ageFormatted = `${Math.max(1, minutes)} min${minutes > 1 ? 's' : ''}`;
  }

  return { ageFormatted, ageBracket, ageHours: hours };
}
