// BulkBridge Centralized Financial Calculation Engine
// Strictly uses integer arithmetic (paise: 1 INR = 100 paise) to prevent floating point inaccuracies.

import { AllocationMethod, DiscountTier } from '../types';

export interface ParticipantDemand {
  organizationId: string;
  quantity: number;
  baseUnitPricePaise: number;
}

export interface ParticipantAllocationResult {
  organizationId: string;
  quantity: number;
  baseSubtotalPaise: number;
  allocatedDiscountPaise: number;
  discountedSubtotalPaise: number;
  allocatedShippingPaise: number;
  taxableBasePaise: number;
  taxRatePercent: number;
  cgstPaise: number;
  sgstPaise: number;
  igstPaise: number;
  totalTaxPaise: number;
  finalPayablePaise: number;
}

export interface ConsolidatedCalculationResult {
  totalQuantity: number;
  baseSubtotalPaise: number;
  effectiveDiscountPercent: number;
  totalDiscountPaise: number;
  discountedSubtotalPaise: number;
  totalShippingPaise: number;
  taxableBasePaise: number;
  totalTaxPaise: number;
  grandTotalPaise: number;
  allocations: ParticipantAllocationResult[];
  reconciliationAudit: {
    isSubtotalReconciled: boolean;
    isDiscountReconciled: boolean;
    isShippingReconciled: boolean;
    isTaxReconciled: boolean;
    isGrandTotalReconciled: boolean;
    subtotalDiscrepancyPaise: number;
    discountDiscrepancyPaise: number;
    shippingDiscrepancyPaise: number;
    taxDiscrepancyPaise: number;
    grandTotalDiscrepancyPaise: number;
  };
}

/**
 * Evaluates the unlocked discount percentage based on aggregated quantity and discount schedule.
 */
export function evaluateDiscountTier(
  totalQuantity: number,
  tiers: DiscountTier[]
): { currentDiscountPercent: number; nextTier?: { quantityNeeded: number; discountPercent: number } } {
  if (!tiers || tiers.length === 0 || totalQuantity <= 0) {
    return { currentDiscountPercent: 0 };
  }

  // Sort tiers ascending by minQuantity
  const sortedTiers = [...tiers].sort((a, b) => a.minQuantity - b.minQuantity);

  let currentTierIndex = -1;
  for (let i = 0; i < sortedTiers.length; i++) {
    if (totalQuantity >= sortedTiers[i].minQuantity) {
      if (sortedTiers[i].maxQuantity === undefined || totalQuantity <= (sortedTiers[i].maxQuantity as number)) {
        currentTierIndex = i;
      }
    }
  }

  const currentDiscountPercent = currentTierIndex >= 0 ? sortedTiers[currentTierIndex].discountPercent : 0;

  // Determine next tier
  let nextTier: { quantityNeeded: number; discountPercent: number } | undefined = undefined;
  for (let i = 0; i < sortedTiers.length; i++) {
    if (sortedTiers[i].minQuantity > totalQuantity) {
      nextTier = {
        quantityNeeded: sortedTiers[i].minQuantity - totalQuantity,
        discountPercent: sortedTiers[i].discountPercent,
      };
      break;
    }
  }

  return { currentDiscountPercent, nextTier };
}

/**
 * Calculates item subtotal in paise.
 */
export function calculateItemSubtotalPaise(quantity: number, unitPricePaise: number): number {
  return Math.round(quantity * unitPricePaise);
}

/**
 * Centralized consolidated financial calculation with deterministic allocation
 * and zero-residual rounding adjustment.
 */
export function calculateConsolidatedAllocation(
  demands: ParticipantDemand[],
  discountPercent: number,
  totalShippingPaise: number,
  taxRatePercent: number,
  allocationMethod: AllocationMethod = 'PROPORTIONAL_QUANTITY',
  isInterState: boolean = false
): ConsolidatedCalculationResult {
  const totalQuantity = demands.reduce((acc, d) => acc + d.quantity, 0);
  const baseSubtotalPaise = demands.reduce(
    (acc, d) => acc + calculateItemSubtotalPaise(d.quantity, d.baseUnitPricePaise),
    0
  );

  // Consolidated discount in paise
  const totalDiscountPaise = Math.round((baseSubtotalPaise * discountPercent) / 100);
  const discountedSubtotalPaise = baseSubtotalPaise - totalDiscountPaise;

  // Initial proportional allocation passes
  let runningAllocatedDiscount = 0;
  let runningAllocatedShipping = 0;
  let runningTaxableBase = 0;
  let runningTax = 0;
  let runningGrandTotal = 0;

  const rawAllocations = demands.map((demand, index) => {
    const demandSubtotal = calculateItemSubtotalPaise(demand.quantity, demand.baseUnitPricePaise);

    // Compute fraction based on selected allocation method
    let fraction = 0;
    if (allocationMethod === 'PROPORTIONAL_VALUE' && baseSubtotalPaise > 0) {
      fraction = demandSubtotal / baseSubtotalPaise;
    } else if (allocationMethod === 'PROPORTIONAL_QUANTITY' && totalQuantity > 0) {
      fraction = demand.quantity / totalQuantity;
    } else if (allocationMethod === 'EQUAL' && demands.length > 0) {
      fraction = 1 / demands.length;
    }

    const allocatedDiscount = Math.round(totalDiscountPaise * fraction);
    const allocatedShipping = Math.round(totalShippingPaise * fraction);
    const discountedBase = demandSubtotal - allocatedDiscount;
    const taxableBase = discountedBase; // tax calculated on discounted product value

    const taxAmount = Math.round((taxableBase * taxRatePercent) / 100);
    const cgst = isInterState ? 0 : Math.round(taxAmount / 2);
    const sgst = isInterState ? 0 : taxAmount - cgst;
    const igst = isInterState ? taxAmount : 0;

    const finalPayable = discountedBase + allocatedShipping + taxAmount;

    runningAllocatedDiscount += allocatedDiscount;
    runningAllocatedShipping += allocatedShipping;
    runningTaxableBase += taxableBase;
    runningTax += taxAmount;
    runningGrandTotal += finalPayable;

    return {
      organizationId: demand.organizationId,
      quantity: demand.quantity,
      baseSubtotalPaise: demandSubtotal,
      allocatedDiscountPaise: allocatedDiscount,
      discountedSubtotalPaise: discountedBase,
      allocatedShippingPaise: allocatedShipping,
      taxableBasePaise: taxableBase,
      taxRatePercent,
      cgstPaise: cgst,
      sgstPaise: sgst,
      igstPaise: igst,
      totalTaxPaise: taxAmount,
      finalPayablePaise: finalPayable,
    };
  });

  // Calculate consolidated tax directly to ensure macro agreement
  const consolidatedTaxPaise = Math.round((discountedSubtotalPaise * taxRatePercent) / 100);
  const grandTotalPaise = discountedSubtotalPaise + totalShippingPaise + consolidatedTaxPaise;

  // Deterministic Zero-Residual Rounding Policy:
  // Any residual paisa discrepancy between the sum of allocations and consolidated total
  // is assigned to the participant with the largest requested quantity.
  if (rawAllocations.length > 0) {
    let largestIdx = 0;
    for (let i = 1; i < rawAllocations.length; i++) {
      if (rawAllocations[i].quantity > rawAllocations[largestIdx].quantity) {
        largestIdx = i;
      }
    }

    // Adjust discount residual
    const discountResidual = totalDiscountPaise - runningAllocatedDiscount;
    if (discountResidual !== 0) {
      rawAllocations[largestIdx].allocatedDiscountPaise += discountResidual;
      rawAllocations[largestIdx].discountedSubtotalPaise -= discountResidual;
      rawAllocations[largestIdx].taxableBasePaise -= discountResidual;
    }

    // Adjust shipping residual
    const shippingResidual = totalShippingPaise - runningAllocatedShipping;
    if (shippingResidual !== 0) {
      rawAllocations[largestIdx].allocatedShippingPaise += shippingResidual;
    }

    // Recompute largest participant's tax & final payable
    const target = rawAllocations[largestIdx];
    const recomputedTax = Math.round((target.taxableBasePaise * taxRatePercent) / 100);
    target.totalTaxPaise = recomputedTax;
    target.cgstPaise = isInterState ? 0 : Math.round(recomputedTax / 2);
    target.sgstPaise = isInterState ? 0 : recomputedTax - target.cgstPaise;
    target.igstPaise = isInterState ? recomputedTax : 0;
    target.finalPayablePaise = target.discountedSubtotalPaise + target.allocatedShippingPaise + recomputedTax;

    // Check sum of tax residual
    const sumAllocatedTax = rawAllocations.reduce((sum, a) => sum + a.totalTaxPaise, 0);
    const taxResidual = consolidatedTaxPaise - sumAllocatedTax;
    if (taxResidual !== 0) {
      target.totalTaxPaise += taxResidual;
      if (isInterState) {
        target.igstPaise += taxResidual;
      } else {
        target.sgstPaise += taxResidual;
      }
      target.finalPayablePaise += taxResidual;
    }
  }

  // Audit reconciliation sums
  const sumSubtotal = rawAllocations.reduce((acc, a) => acc + a.baseSubtotalPaise, 0);
  const sumDiscount = rawAllocations.reduce((acc, a) => acc + a.allocatedDiscountPaise, 0);
  const sumShipping = rawAllocations.reduce((acc, a) => acc + a.allocatedShippingPaise, 0);
  const sumTax = rawAllocations.reduce((acc, a) => acc + a.totalTaxPaise, 0);
  const sumGrandTotal = rawAllocations.reduce((acc, a) => acc + a.finalPayablePaise, 0);

  const subtotalDiscrepancy = baseSubtotalPaise - sumSubtotal;
  const discountDiscrepancy = totalDiscountPaise - sumDiscount;
  const shippingDiscrepancy = totalShippingPaise - sumShipping;
  const taxDiscrepancy = consolidatedTaxPaise - sumTax;
  const grandTotalDiscrepancy = grandTotalPaise - sumGrandTotal;

  return {
    totalQuantity,
    baseSubtotalPaise,
    effectiveDiscountPercent: discountPercent,
    totalDiscountPaise,
    discountedSubtotalPaise,
    totalShippingPaise,
    taxableBasePaise: discountedSubtotalPaise,
    totalTaxPaise: consolidatedTaxPaise,
    grandTotalPaise,
    allocations: rawAllocations,
    reconciliationAudit: {
      isSubtotalReconciled: subtotalDiscrepancy === 0,
      isDiscountReconciled: discountDiscrepancy === 0,
      isShippingReconciled: shippingDiscrepancy === 0,
      isTaxReconciled: taxDiscrepancy === 0,
      isGrandTotalReconciled: grandTotalDiscrepancy === 0,
      subtotalDiscrepancyPaise: subtotalDiscrepancy,
      discountDiscrepancyPaise: discountDiscrepancy,
      shippingDiscrepancyPaise: shippingDiscrepancy,
      taxDiscrepancyPaise: taxDiscrepancy,
      grandTotalDiscrepancyPaise: grandTotalDiscrepancy,
    },
  };
}

/**
 * Currency formatter for Indian Rupees (INR)
 * Extensible for other currencies.
 */
export function formatINR(paise: number, includeDecimals = true): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  }).format(rupees);
}

/**
 * Formats a raw number of units with commas
 */
export function formatQuantity(qty: number): string {
  return new Intl.NumberFormat('en-IN').format(qty);
}

/**
 * Calculates remaining balance after payments
 */
export function calculateOutstandingBalancePaise(
  grandTotalPaise: number,
  amountPaidPaise: number,
  creditNotePaise: number = 0
): number {
  const balance = grandTotalPaise - amountPaidPaise - creditNotePaise;
  return Math.max(0, balance);
}
