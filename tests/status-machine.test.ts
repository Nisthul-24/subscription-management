import { describe, it, expect } from 'vitest';
import {
  validateSubscriptionTransition,
  getSubscriptionNextStatus,
  validateInvoiceTransition,
  getInvoiceNextStatus,
} from '../src/lib/status-machine';

describe('Status Machine Transitions', () => {
  describe('Subscription Transitions', () => {
    const permissivePlan = { pausable: true, closableEarly: true };
    const restrictivePlan = { pausable: false, closableEarly: false };

    it('allows valid forward lifecycle path: DRAFT -> QUOTATION -> CONFIRMED -> ACTIVE', () => {
      const step1 = validateSubscriptionTransition('DRAFT', 'submit_quotation', permissivePlan);
      expect(step1.valid).toBe(true);
      expect(step1.nextStatus).toBe('QUOTATION');

      const step2 = validateSubscriptionTransition('QUOTATION', 'confirm', permissivePlan);
      expect(step2.valid).toBe(true);
      expect(step2.nextStatus).toBe('CONFIRMED');

      const step3 = validateSubscriptionTransition('CONFIRMED', 'activate', permissivePlan);
      expect(step3.valid).toBe(true);
      expect(step3.nextStatus).toBe('ACTIVE');
    });

    it('enforces plan pause restrictions', () => {
      // Allowed with permissive plan
      const allowed = validateSubscriptionTransition('ACTIVE', 'pause', permissivePlan);
      expect(allowed.valid).toBe(true);
      expect(allowed.nextStatus).toBe('PAUSED');

      // Rejected when plan pausable = false
      const blocked = validateSubscriptionTransition('ACTIVE', 'pause', restrictivePlan);
      expect(blocked.valid).toBe(false);
      expect(blocked.error).toContain('does not allow pausing');
    });

    it('enforces plan early close restrictions', () => {
      // Allowed when closableEarly = true
      const allowed = validateSubscriptionTransition('ACTIVE', 'close', permissivePlan);
      expect(allowed.valid).toBe(true);
      expect(allowed.nextStatus).toBe('CLOSED');

      // Rejected when closableEarly = false
      const blocked = validateSubscriptionTransition('ACTIVE', 'close', restrictivePlan);
      expect(blocked.valid).toBe(false);
      expect(blocked.error).toContain('does not allow early closing');
    });

    it('rejects invalid or illegal transitions', () => {
      // Cannot jump from DRAFT to ACTIVE directly
      const directActivate = validateSubscriptionTransition('DRAFT', 'activate', permissivePlan);
      expect(directActivate.valid).toBe(false);

      // Cannot perform actions on CLOSED subscription
      const onClosed = validateSubscriptionTransition('CLOSED', 'activate', permissivePlan);
      expect(onClosed.valid).toBe(false);
    });
  });

  describe('Invoice Transitions', () => {
    it('allows DRAFT -> CONFIRMED -> PAID', () => {
      const step1 = validateInvoiceTransition('DRAFT', 'confirm');
      expect(step1.valid).toBe(true);
      expect(step1.nextStatus).toBe('CONFIRMED');

      const step2 = validateInvoiceTransition('CONFIRMED', 'mark_paid');
      expect(step2.valid).toBe(true);
      expect(step2.nextStatus).toBe('PAID');
    });

    it('allows cancelling from DRAFT or CONFIRMED', () => {
      expect(validateInvoiceTransition('DRAFT', 'cancel').valid).toBe(true);
      expect(validateInvoiceTransition('CONFIRMED', 'cancel').valid).toBe(true);
    });

    it('prevents cancelling or changing a PAID invoice', () => {
      expect(validateInvoiceTransition('PAID', 'cancel').valid).toBe(false);
      expect(getInvoiceNextStatus('PAID', 'confirm')).toBe(null);
    });
  });
});
