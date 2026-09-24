import { describe, it, expect } from 'vitest';
import {
  calculateSlaDueDate,
  computeTicketSla,
  computeTicketAge,
  SLA_HOURS,
} from '../src/services/sla.service.js';

describe('SLA Service Unit Tests', () => {
  it('correctly calculates SLA due dates for all priority levels', () => {
    const baseDate = new Date('2026-09-24T10:00:00Z');

    const lowDue = calculateSlaDueDate('LOW', baseDate);
    expect(lowDue.getTime() - baseDate.getTime()).toBe(72 * 60 * 60 * 1000);

    const medDue = calculateSlaDueDate('MEDIUM', baseDate);
    expect(medDue.getTime() - baseDate.getTime()).toBe(48 * 60 * 60 * 1000);

    const highDue = calculateSlaDueDate('HIGH', baseDate);
    expect(highDue.getTime() - baseDate.getTime()).toBe(24 * 60 * 60 * 1000);

    const urgentDue = calculateSlaDueDate('URGENT', baseDate);
    expect(urgentDue.getTime() - baseDate.getTime()).toBe(8 * 60 * 60 * 1000);
  });

  it('correctly classifies SLA as ON_TRACK when ample time remains', () => {
    const createdAt = new Date('2026-09-24T10:00:00Z');
    const slaDueAt = new Date('2026-09-26T10:00:00Z'); // 48 hours total
    const now = new Date('2026-09-24T14:00:00Z'); // 4 hours in (44h left = ~91% remaining)

    const result = computeTicketSla(createdAt, slaDueAt, 'IN_PROGRESS', null, now);
    expect(result.status).toBe('ON_TRACK');
    expect(result.slaBreached).toBe(false);
    expect(result.isAtRisk).toBe(false);
    expect(result.timeRemainingFormatted).toContain('SLA due in 44h 0m');
  });

  it('correctly triggers AT_RISK when remaining time is <= 20%', () => {
    const createdAt = new Date('2026-09-24T10:00:00Z');
    const slaDueAt = new Date('2026-09-25T10:00:00Z'); // 24 hours total
    // 20% of 24h is 4.8h. If 4 hours remain:
    const now = new Date('2026-09-25T06:00:00Z'); // 4h remaining (16.6% remaining)

    const result = computeTicketSla(createdAt, slaDueAt, 'IN_PROGRESS', null, now);
    expect(result.status).toBe('AT_RISK');
    expect(result.isAtRisk).toBe(true);
    expect(result.slaBreached).toBe(false);
  });

  it('correctly marks SLA as BREACHED when due date has elapsed for open ticket', () => {
    const createdAt = new Date('2026-09-24T10:00:00Z');
    const slaDueAt = new Date('2026-09-24T18:00:00Z'); // 8h urgent SLA
    const now = new Date('2026-09-24T20:15:00Z'); // 2h 15m overdue

    const result = computeTicketSla(createdAt, slaDueAt, 'IN_PROGRESS', null, now);
    expect(result.status).toBe('BREACHED');
    expect(result.slaBreached).toBe(true);
    expect(result.timeRemainingFormatted).toBe('SLA breached by 2h 15m');
  });

  it('correctly marks terminal resolved ticket as COMPLETED', () => {
    const createdAt = new Date('2026-09-24T10:00:00Z');
    const slaDueAt = new Date('2026-09-25T10:00:00Z');
    const resolvedAt = new Date('2026-09-24T16:00:00Z'); // Resolved 6 hours in
    const now = new Date('2026-09-26T10:00:00Z');

    const result = computeTicketSla(createdAt, slaDueAt, 'RESOLVED', resolvedAt, now);
    expect(result.status).toBe('COMPLETED');
    expect(result.slaBreached).toBe(false);
    expect(result.timeRemainingFormatted).toBe('Resolved within SLA');
  });

  it('accurately computes ticket age brackets (0-1d, 1-3d, 3-7d, 7+d)', () => {
    const now = new Date('2026-09-24T12:00:00Z');

    // 2 hours ago
    const age2h = computeTicketAge(new Date(now.getTime() - 2 * 60 * 60 * 1000), now);
    expect(age2h.ageBracket).toBe('0-1d');
    expect(age2h.ageFormatted).toBe('2 hours');

    // 2 days ago
    const age2d = computeTicketAge(new Date(now.getTime() - 48 * 60 * 60 * 1000), now);
    expect(age2d.ageBracket).toBe('1-3d');
    expect(age2d.ageFormatted).toBe('2 days');

    // 5 days ago
    const age5d = computeTicketAge(new Date(now.getTime() - 120 * 60 * 60 * 1000), now);
    expect(age5d.ageBracket).toBe('3-7d');

    // 10 days ago
    const age10d = computeTicketAge(new Date(now.getTime() - 240 * 60 * 60 * 1000), now);
    expect(age10d.ageBracket).toBe('7+d');
  });
});
