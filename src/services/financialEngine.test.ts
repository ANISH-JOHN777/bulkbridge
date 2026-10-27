import { describe, it, expect } from 'vitest';
import {
  evaluateDiscountTier,
  calculateConsolidatedAllocation,
  calculateOutstandingBalancePaise,
  formatINR,
} from './financialEngine';
import { DiscountTier } from '../types';

describe('Financial Calculation Engine', () => {
  const sampleTiers: DiscountTier[] = [
    { id: 't1', minQuantity: 1, maxQuantity: 49, discountPercent: 0, description: 'Base retail tier' },
    { id: 't2', minQuantity: 50, maxQuantity: 99, discountPercent: 5, description: 'Bulk Starter 5%' },
    { id: 't3', minQuantity: 100, maxQuantity: 199, discountPercent: 8, description: 'Cooperative Volume 8%' },
    { id: 't4', minQuantity: 200, discountPercent: 12, description: 'Factory Wholesale 12%' },
  ];

  it('correctly evaluates discount tiers and determines remaining quantity to next tier', () => {
    // 20 units -> 0%
    const res20 = evaluateDiscountTier(20, sampleTiers);
    expect(res20.currentDiscountPercent).toBe(0);
    expect(res20.nextTier).toEqual({ quantityNeeded: 30, discountPercent: 5 });

    // 50 units -> 5%
    const res50 = evaluateDiscountTier(50, sampleTiers);
    expect(res50.currentDiscountPercent).toBe(5);
    expect(res50.nextTier).toEqual({ quantityNeeded: 50, discountPercent: 8 });

    // 100 units -> 8%
    const res100 = evaluateDiscountTier(100, sampleTiers);
    expect(res100.currentDiscountPercent).toBe(8);
    expect(res100.nextTier).toEqual({ quantityNeeded: 100, discountPercent: 12 });

    // 250 units -> 12%
    const res250 = evaluateDiscountTier(250, sampleTiers);
    expect(res250.currentDiscountPercent).toBe(12);
    expect(res250.nextTier).toBeUndefined();
  });

  it('accurately reproduces the canonical master prompt calculation example', () => {
    // Carton base price: ₹1,000 -> 100,000 paise
    // Retailer A: 20 cartons
    // Retailer B: 35 cartons
    // Retailer C: 45 cartons
    // Total = 100 cartons -> Unlocks 8% discount
    // Shipping total = ₹1,500 (150,000 paise) -> Retailer A (20%) gets ₹300 (30,000 paise)
    // Tax rate = 5%

    const demands = [
      { organizationId: 'retailer-a', quantity: 20, baseUnitPricePaise: 100000 },
      { organizationId: 'retailer-b', quantity: 35, baseUnitPricePaise: 100000 },
      { organizationId: 'retailer-c', quantity: 45, baseUnitPricePaise: 100000 },
    ];

    const result = calculateConsolidatedAllocation(
      demands,
      8, // 8% discount
      150000, // ₹1,500 total shipping
      5, // 5% GST
      'PROPORTIONAL_QUANTITY',
      false
    );

    expect(result.totalQuantity).toBe(100);
    expect(result.baseSubtotalPaise).toBe(10000000); // ₹100,000
    expect(result.totalDiscountPaise).toBe(800000); // 8% of 100k = ₹8,000
    expect(result.discountedSubtotalPaise).toBe(9200000); // ₹92,000

    const participantA = result.allocations.find((a) => a.organizationId === 'retailer-a')!;
    expect(participantA.quantity).toBe(20);
    expect(participantA.baseSubtotalPaise).toBe(2000000); // ₹20,000
    expect(participantA.allocatedDiscountPaise).toBe(160000); // ₹1,600
    expect(participantA.discountedSubtotalPaise).toBe(1840000); // ₹18,400
    expect(participantA.allocatedShippingPaise).toBe(30000); // ₹300
    expect(participantA.totalTaxPaise).toBe(92000); // ₹920 (5% of 18,400)
    expect(participantA.finalPayablePaise).toBe(1962000); // ₹19,620 (18,400 + 300 + 920)

    // Verify zero residual reconciliation across all 3 participants
    expect(result.reconciliationAudit.isGrandTotalReconciled).toBe(true);
    expect(result.reconciliationAudit.grandTotalDiscrepancyPaise).toBe(0);
    expect(result.reconciliationAudit.isSubtotalReconciled).toBe(true);
    expect(result.reconciliationAudit.isDiscountReconciled).toBe(true);
    expect(result.reconciliationAudit.isShippingReconciled).toBe(true);
    expect(result.reconciliationAudit.isTaxReconciled).toBe(true);
  });

  it('maintains zero-residual reconciliation even with uneven odd quantities and amounts', () => {
    // Tests difficult odd numbers that would normally cause 1 or 2 paisa rounding drift
    const oddDemands = [
      { organizationId: 'buyer-1', quantity: 13, baseUnitPricePaise: 99999 },
      { organizationId: 'buyer-2', quantity: 17, baseUnitPricePaise: 99999 },
      { organizationId: 'buyer-3', quantity: 31, baseUnitPricePaise: 99999 },
    ];

    const result = calculateConsolidatedAllocation(
      oddDemands,
      7.5,
      33333,
      18,
      'PROPORTIONAL_QUANTITY',
      false
    );

    const sumAllocations = result.allocations.reduce((sum, a) => sum + a.finalPayablePaise, 0);
    expect(sumAllocations).toBe(result.grandTotalPaise);
    expect(result.reconciliationAudit.grandTotalDiscrepancyPaise).toBe(0);
  });

  it('correctly calculates outstanding balance and formats currency', () => {
    const grandTotal = 1962000; // ₹19,620.00
    const partialPaid = 1000000; // ₹10,000.00
    const creditNote = 100000; // ₹1,000.00

    const balance = calculateOutstandingBalancePaise(grandTotal, partialPaid, creditNote);
    expect(balance).toBe(862000); // ₹8,620.00

    const formatted = formatINR(1962000);
    expect(formatted).toContain('19,620');
  });
});
