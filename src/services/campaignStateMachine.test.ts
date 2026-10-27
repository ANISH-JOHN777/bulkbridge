import { describe, it, expect } from 'vitest';
import {
  canTransitionCampaign,
  validateCampaignTransition,
  evaluateThresholdState,
  processSupplierQuotation,
} from './campaignStateMachine';
import { BulkCampaign, SupplierQuotation } from '../types';

describe('Campaign State Machine', () => {
  const dummyCampaign: BulkCampaign = {
    id: 'c1',
    campaignNumber: 'CMP-2026-001',
    title: 'LED Bulbs Bulk Campaign',
    productId: 'p1',
    productName: '9W LED Bulbs (Carton of 50)',
    productSku: 'ELEC-LED-009W',
    category: 'ELECTRICAL_LIGHTING',
    supplierId: 's1',
    supplierName: 'Apex Lumens & Lighting',
    organizerId: 'u1',
    organizerName: 'Priya Sharma (Coop Lead)',
    status: 'OPEN',
    targetQuantity: 100,
    currentQuantity: 80,
    unitOfMeasure: 'Carton (50 pcs)',
    basePricePaise: 100000,
    currentDiscountPercent: 5,
    discountSchedule: [],
    allocationMethod: 'PROPORTIONAL_QUANTITY',
    startDate: '2026-03-01',
    endDate: '2026-04-15',
    withdrawalDeadline: '2026-04-10',
    deliveryTerms: 'Ex-works factory warehouse Pune',
    disclosedPolicy: 'Withdrawals permitted until quotation acceptance.',
    participants: [
      {
        organizationId: 'ret-1',
        organizationName: 'GreenMart Retail',
        buyerUserId: 'b1',
        buyerUserName: 'Rajesh Kumar',
        requestedQuantity: 80,
        deliveryAddress: { street: '12 MG Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560001' },
        allocatedDiscountPaise: 0,
        allocatedShippingPaise: 0,
        taxableBasePaise: 0,
        taxPaise: 0,
        finalPayablePaise: 0,
        approvedTerms: false,
        joinedAt: '2026-03-05',
      },
    ],
    createdAt: '2026-03-01',
    updatedAt: '2026-03-05',
  };

  it('validates allowed and forbidden transitions', () => {
    expect(canTransitionCampaign('DRAFT', 'OPEN')).toBe(true);
    expect(canTransitionCampaign('OPEN', 'THRESHOLD_REACHED')).toBe(true);
    expect(canTransitionCampaign('OPEN', 'PURCHASING')).toBe(false); // Invalid shortcut
    expect(canTransitionCampaign('CLOSED', 'OPEN')).toBe(false); // Terminal state
  });

  it('dynamically flips status between OPEN and THRESHOLD_REACHED based on pledged quantities', () => {
    // Current is 80, target is 100 -> stays OPEN
    expect(evaluateThresholdState(dummyCampaign)).toBe('OPEN');

    // Add 20 units -> reaches 100
    const reachedCampaign: BulkCampaign = { ...dummyCampaign, currentQuantity: 100 };
    expect(evaluateThresholdState(reachedCampaign)).toBe('THRESHOLD_REACHED');

    // Withdraw 10 units from reached campaign -> drops back to OPEN
    const droppedCampaign: BulkCampaign = {
      ...dummyCampaign,
      status: 'THRESHOLD_REACHED',
      currentQuantity: 90,
    };
    expect(evaluateThresholdState(droppedCampaign)).toBe('OPEN');
  });

  it('prevents confirmation if participants have not approved commercial quotation terms', () => {
    const unapprovedCampaign: BulkCampaign = {
      ...dummyCampaign,
      status: 'AWAITING_PARTICIPANT_APPROVAL',
      participants: [{ ...dummyCampaign.participants[0], approvedTerms: false }],
    };

    const validation = validateCampaignTransition(unapprovedCampaign, 'CONFIRMED', 'ORGANIZER');
    expect(validation.isValid).toBe(false);
    expect(validation.error).toContain('participant(s) have not approved');

    // Once approved, validation succeeds
    const approvedCampaign: BulkCampaign = {
      ...unapprovedCampaign,
      participants: [{ ...dummyCampaign.participants[0], approvedTerms: true }],
    };
    const validResult = validateCampaignTransition(approvedCampaign, 'CONFIRMED', 'ORGANIZER');
    expect(validResult.isValid).toBe(true);
  });

  it('resets approvals if supplier revises quotation prices', () => {
    const initialQuotation: SupplierQuotation = {
      quotationNumber: 'QT-001',
      unitPricePaise: 100000,
      appliedDiscountPercent: 8,
      deliveryChargePaise: 150000,
      deliveryTerms: 'Factory Pune',
      paymentTerms: '50% advance',
      validUntil: '2026-04-30',
      leadTimeDays: 7,
      status: 'ACCEPTED',
      submittedAt: '2026-03-10',
    };

    const campaignWithApproved: BulkCampaign = {
      ...dummyCampaign,
      quotation: initialQuotation,
      participants: [{ ...dummyCampaign.participants[0], approvedTerms: true }],
    };

    const revisedQuotation: SupplierQuotation = {
      ...initialQuotation,
      unitPricePaise: 105000, // Price increased
      revisionNotes: 'Raw material aluminum increase',
    };

    const { updatedCampaign, requiresReapproval } = processSupplierQuotation(
      campaignWithApproved,
      revisedQuotation
    );

    expect(requiresReapproval).toBe(true);
    expect(updatedCampaign.participants[0].approvedTerms).toBe(false);
    expect(updatedCampaign.status).toBe('AWAITING_PARTICIPANT_APPROVAL');
  });
});
