// BulkBridge Campaign State Machine
// Strict state transition rules, boundary validation, and event handling.

import { CampaignStatus, BulkCampaign, CampaignParticipant, SupplierQuotation } from '../types';

export const VALID_CAMPAIGN_TRANSITIONS: Record<CampaignStatus, CampaignStatus[]> = {
  DRAFT: ['OPEN', 'CANCELLED'],
  OPEN: ['THRESHOLD_REACHED', 'CANCELLED', 'EXPIRED'],
  THRESHOLD_REACHED: ['OPEN', 'AWAITING_SUPPLIER_QUOTATION', 'CANCELLED', 'EXPIRED'],
  AWAITING_SUPPLIER_QUOTATION: ['AWAITING_PARTICIPANT_APPROVAL', 'REJECTED', 'CANCELLED'],
  AWAITING_PARTICIPANT_APPROVAL: ['CONFIRMED', 'AWAITING_SUPPLIER_QUOTATION', 'CANCELLED'],
  CONFIRMED: ['PURCHASING', 'CANCELLED'],
  PURCHASING: ['PARTIALLY_FULFILLED', 'FULFILLED', 'CANCELLED'],
  PARTIALLY_FULFILLED: ['FULFILLED', 'CANCELLED'],
  FULFILLED: ['CLOSED'],
  CLOSED: [],
  CANCELLED: [],
  EXPIRED: [],
  REJECTED: ['DRAFT', 'CANCELLED'],
};

export function canTransitionCampaign(from: CampaignStatus, to: CampaignStatus): boolean {
  const allowed = VALID_CAMPAIGN_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

export function validateCampaignTransition(
  campaign: BulkCampaign,
  targetStatus: CampaignStatus,
  actorRole: string
): { isValid: boolean; error?: string } {
  if (!canTransitionCampaign(campaign.status, targetStatus)) {
    return {
      isValid: false,
      error: `Invalid transition from "${campaign.status}" to "${targetStatus}".`,
    };
  }

  // Role permissions check
  if (targetStatus === 'OPEN' && !['ORGANIZER', 'ADMIN'].includes(actorRole)) {
    return { isValid: false, error: 'Only organizers or administrators can publish a campaign.' };
  }

  if (targetStatus === 'CONFIRMED') {
    // Check if all participants approved
    const unapproved = campaign.participants.filter((p) => !p.approvedTerms);
    if (unapproved.length > 0) {
      return {
        isValid: false,
        error: `Cannot confirm campaign: ${unapproved.length} participant(s) have not approved the commercial terms.`,
      };
    }
  }

  if (targetStatus === 'PURCHASING' && !['ORGANIZER', 'ADMIN'].includes(actorRole)) {
    return { isValid: false, error: 'Only the campaign coordinator can generate the purchase order.' };
  }

  return { isValid: true };
}

/**
 * Evaluates whether adding or withdrawing quantity alters campaign status between OPEN and THRESHOLD_REACHED
 */
export function evaluateThresholdState(campaign: BulkCampaign): CampaignStatus {
  if (['DRAFT', 'CANCELLED', 'EXPIRED', 'REJECTED', 'CLOSED'].includes(campaign.status)) {
    return campaign.status;
  }

  if (campaign.currentQuantity >= campaign.targetQuantity) {
    if (campaign.status === 'OPEN') {
      return 'THRESHOLD_REACHED';
    }
  } else {
    if (campaign.status === 'THRESHOLD_REACHED') {
      return 'OPEN';
    }
  }

  return campaign.status;
}

/**
 * Handles supplier quotation submission or revision.
 * If revised, resets participant approvals and transitions to AWAITING_PARTICIPANT_APPROVAL.
 */
export function processSupplierQuotation(
  campaign: BulkCampaign,
  quotation: SupplierQuotation
): { updatedCampaign: BulkCampaign; requiresReapproval: boolean } {
  const isRevision = !!campaign.quotation && campaign.quotation.unitPricePaise !== quotation.unitPricePaise;

  const updatedParticipants = campaign.participants.map((p) => ({
    ...p,
    approvedTerms: isRevision ? false : p.approvedTerms,
  }));

  const updatedCampaign: BulkCampaign = {
    ...campaign,
    quotation,
    participants: updatedParticipants,
    status: 'AWAITING_PARTICIPANT_APPROVAL',
    updatedAt: new Date().toISOString(),
  };

  return {
    updatedCampaign,
    requiresReapproval: isRevision,
  };
}
