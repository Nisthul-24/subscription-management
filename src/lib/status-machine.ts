/**
 * Status machine for Subscription and Invoice status transitions.
 * Enforces valid transitions only.
 */

import type { SubscriptionStatus, InvoiceStatus } from './types';

// ─── SUBSCRIPTION STATUS MACHINE ────────────────────────────────────────────────

type SubscriptionAction = 'submit_quotation' | 'confirm' | 'activate' | 'pause' | 'resume' | 'close';

const SUBSCRIPTION_TRANSITIONS: Record<SubscriptionStatus, Partial<Record<SubscriptionAction, SubscriptionStatus>>> = {
  DRAFT: {
    submit_quotation: 'QUOTATION',
  },
  QUOTATION: {
    confirm: 'CONFIRMED',
  },
  CONFIRMED: {
    activate: 'ACTIVE',
  },
  ACTIVE: {
    pause: 'PAUSED',
    close: 'CLOSED',
  },
  PAUSED: {
    resume: 'ACTIVE',
    close: 'CLOSED',
  },
  CLOSED: {},
};

export function getSubscriptionNextStatus(
  currentStatus: SubscriptionStatus,
  action: SubscriptionAction
): SubscriptionStatus | null {
  const transitions = SUBSCRIPTION_TRANSITIONS[currentStatus];
  return transitions?.[action] ?? null;
}

export function getAvailableSubscriptionActions(
  currentStatus: SubscriptionStatus,
  planRules: {
    pausable: boolean;
    closableEarly: boolean;
    renewable: boolean;
  }
): SubscriptionAction[] {
  const allActions = Object.keys(SUBSCRIPTION_TRANSITIONS[currentStatus] || {}) as SubscriptionAction[];

  return allActions.filter((action) => {
    if (action === 'pause' && !planRules.pausable) return false;
    if (action === 'close' && currentStatus === 'ACTIVE' && !planRules.closableEarly) return false;
    return true;
  });
}

export function validateSubscriptionTransition(
  currentStatus: SubscriptionStatus,
  action: SubscriptionAction,
  planRules: {
    pausable: boolean;
    closableEarly: boolean;
  }
): { valid: boolean; nextStatus: SubscriptionStatus | null; error?: string } {
  const nextStatus = getSubscriptionNextStatus(currentStatus, action);

  if (!nextStatus) {
    return {
      valid: false,
      nextStatus: null,
      error: `Cannot perform '${action}' on subscription with status '${currentStatus}'`,
    };
  }

  // Check plan rules
  if (action === 'pause' && !planRules.pausable) {
    return { valid: false, nextStatus: null, error: 'This plan does not allow pausing' };
  }

  if (action === 'close' && currentStatus === 'ACTIVE' && !planRules.closableEarly) {
    return { valid: false, nextStatus: null, error: 'This plan does not allow early closing' };
  }

  return { valid: true, nextStatus };
}

// ─── INVOICE STATUS MACHINE ────────────────────────────────────────────────────

type InvoiceAction = 'confirm' | 'cancel' | 'mark_paid';

const INVOICE_TRANSITIONS: Record<InvoiceStatus, Partial<Record<InvoiceAction, InvoiceStatus>>> = {
  DRAFT: {
    confirm: 'CONFIRMED',
    cancel: 'CANCELLED',
  },
  CONFIRMED: {
    cancel: 'CANCELLED',
    mark_paid: 'PAID',
  },
  PAID: {},
  CANCELLED: {},
};

export function getInvoiceNextStatus(
  currentStatus: InvoiceStatus,
  action: InvoiceAction
): InvoiceStatus | null {
  const transitions = INVOICE_TRANSITIONS[currentStatus];
  return transitions?.[action] ?? null;
}

export function validateInvoiceTransition(
  currentStatus: InvoiceStatus,
  action: InvoiceAction
): { valid: boolean; nextStatus: InvoiceStatus | null; error?: string } {
  const nextStatus = getInvoiceNextStatus(currentStatus, action);

  if (!nextStatus) {
    return {
      valid: false,
      nextStatus: null,
      error: `Cannot perform '${action}' on invoice with status '${currentStatus}'`,
    };
  }

  return { valid: true, nextStatus };
}
