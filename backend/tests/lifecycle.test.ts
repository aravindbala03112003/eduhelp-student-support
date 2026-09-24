import { describe, it, expect } from 'vitest';
import { validateStatusTransition } from '../src/services/lifecycle.service.js';

describe('Ticket Lifecycle State Machine Unit Tests', () => {
  it('allows valid standard progressive transitions for staff/manager', () => {
    // NEW -> ASSIGNED
    expect(validateStatusTransition('NEW', 'ASSIGNED', 'MANAGER').isValid).toBe(true);

    // ASSIGNED -> IN_PROGRESS
    expect(validateStatusTransition('ASSIGNED', 'IN_PROGRESS', 'STAFF').isValid).toBe(true);

    // IN_PROGRESS -> WAITING_FOR_STUDENT
    expect(validateStatusTransition('IN_PROGRESS', 'WAITING_FOR_STUDENT', 'STAFF').isValid).toBe(true);

    // WAITING_FOR_STUDENT -> IN_PROGRESS
    expect(validateStatusTransition('WAITING_FOR_STUDENT', 'IN_PROGRESS', 'STAFF').isValid).toBe(true);

    // IN_PROGRESS -> RESOLVED
    expect(validateStatusTransition('IN_PROGRESS', 'RESOLVED', 'STAFF').isValid).toBe(true);

    // RESOLVED -> CLOSED
    expect(validateStatusTransition('RESOLVED', 'CLOSED', 'MANAGER').isValid).toBe(true);
  });

  it('allows escalation from open states', () => {
    expect(validateStatusTransition('NEW', 'ESCALATED', 'MANAGER').isValid).toBe(true);
    expect(validateStatusTransition('ASSIGNED', 'ESCALATED', 'MANAGER').isValid).toBe(true);
    expect(validateStatusTransition('IN_PROGRESS', 'ESCALATED', 'STAFF').isValid).toBe(true);
    expect(validateStatusTransition('WAITING_FOR_STUDENT', 'ESCALATED', 'STAFF').isValid).toBe(true);
  });

  it('strictly rejects arbitrary invalid transitions', () => {
    // NEW directly to CLOSED
    const res1 = validateStatusTransition('NEW', 'CLOSED', 'MANAGER');
    expect(res1.isValid).toBe(false);
    expect(res1.reason).toContain('Invalid lifecycle transition');

    // WAITING_FOR_STUDENT directly to RESOLVED without IN_PROGRESS
    const res2 = validateStatusTransition('WAITING_FOR_STUDENT', 'RESOLVED', 'STAFF');
    expect(res2.isValid).toBe(false);

    // CLOSED is terminal state
    const res3 = validateStatusTransition('CLOSED', 'IN_PROGRESS', 'MANAGER');
    expect(res3.isValid).toBe(false);
  });

  it('enforces student permissions strictly', () => {
    // Student attempting to mark IN_PROGRESS -> RESOLVED (allowed for staff, disallowed for student)
    const studentResolve = validateStatusTransition('IN_PROGRESS', 'RESOLVED', 'STUDENT', true);
    expect(studentResolve.isValid).toBe(false);
    expect(studentResolve.reason).toContain('Students cannot change ticket status');

    // Student attempting to change status of another student ticket
    const nonOwner = validateStatusTransition('RESOLVED', 'REOPENED', 'STUDENT', false);
    expect(nonOwner.isValid).toBe(false);
    expect(nonOwner.reason).toContain('Students can only modify their own tickets');

    // Student reopening own RESOLVED ticket (Allowed!)
    const studentReopen = validateStatusTransition('RESOLVED', 'REOPENED', 'STUDENT', true);
    expect(studentReopen.isValid).toBe(true);

    // Student closing own RESOLVED ticket (Allowed!)
    const studentClose = validateStatusTransition('RESOLVED', 'CLOSED', 'STUDENT', true);
    expect(studentClose.isValid).toBe(true);
  });
});
