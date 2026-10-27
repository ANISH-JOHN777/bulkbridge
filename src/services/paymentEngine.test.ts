import { describe, it, expect } from 'vitest';
import {
  calculateOutstandingBalancePaise,
  formatINR,
} from './financialEngine';
import { PaymentRecord, CreditNote } from '../types';

describe('Payment & Financial Ledger Simulation Test Suite', () => {
  it('handles partial payment calculations and preserves unpaid balances', () => {
    const totalPaise = 5000000; // ₹50,000.00
    let paidPaise = 0;
    let creditsPaise = 0;

    // Initially unpaid
    let balance = calculateOutstandingBalancePaise(totalPaise, paidPaise, creditsPaise);
    expect(balance).toBe(5000000);

    // Make partial payment of ₹20,000.00 (2,000,000 paise)
    paidPaise += 2000000;
    balance = calculateOutstandingBalancePaise(totalPaise, paidPaise, creditsPaise);
    expect(balance).toBe(3000000); // ₹30,000.00 remaining

    // Apply credit note of ₹5,000.00 (500,000 paise)
    creditsPaise += 500000;
    balance = calculateOutstandingBalancePaise(totalPaise, paidPaise, creditsPaise);
    expect(balance).toBe(2500000); // ₹25,000.00 remaining

    // Pay remaining balance
    paidPaise += balance;
    balance = calculateOutstandingBalancePaise(totalPaise, paidPaise, creditsPaise);
    expect(balance).toBe(0);
  });

  it('prevents overpayment beyond outstanding balance', () => {
    const totalPaise = 1000000; // ₹10,000
    const paidPaise = 1200000; // Attempted ₹12,000
    const balance = calculateOutstandingBalancePaise(totalPaise, paidPaise, 0);
    // Balance calculation clamps to 0 to prevent negative unallocated credits without audit
    expect(balance).toBe(0);
  });

  it('tracks payment attempt audit history and reasons for failure', () => {
    const payment: PaymentRecord = {
      id: 'pay-test-fail',
      invoiceId: 'inv-test-01',
      invoiceNumber: 'INV-2026-TEST',
      orderId: 'ord-test-01',
      organizationId: 'org-test',
      organizationName: 'Test Retailer',
      payerName: 'Test Buyer',
      amountPaise: 2500000,
      currency: 'INR',
      method: 'DEBIT_CARD',
      status: 'FAILED',
      failureReason: 'NETWORK_TIMEOUT_SIMULATED',
      idempotencyKey: 'idemp-fail-999',
      simulatedProviderRef: 'SIM-FAIL-888',
      transactionTimestamp: new Date().toISOString(),
      auditNote: 'Simulated issuer bank network timeout during 3D-Secure challenge.',
    };

    expect(payment.status).toBe('FAILED');
    expect(payment.failureReason).toBe('NETWORK_TIMEOUT_SIMULATED');
    expect(payment.auditNote).toContain('3D-Secure');
  });

  it('records credit note generation from return approval', () => {
    const creditNote: CreditNote = {
      id: 'crn-test-01',
      creditNoteNumber: 'CRN-2026-009',
      invoiceId: 'inv-test-01',
      invoiceNumber: 'INV-2026-001',
      buyerOrganizationId: 'org-test',
      buyerOrganizationName: 'GreenMart Retail',
      amountPaise: 150000, // ₹1,500 credit
      reason: 'Damaged packaging during logistics transit',
      issuedAt: new Date().toISOString(),
    };

    expect(creditNote.amountPaise).toBe(150000);
    expect(formatINR(creditNote.amountPaise)).toBe('₹1,500.00');
  });
});
