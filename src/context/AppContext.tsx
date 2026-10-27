// BulkBridge Central Reactive App Context
// Connects state across all 7 workspaces with real state transitions, financial calculations, and audit logging.

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Organization,
  Product,
  BulkCampaign,
  ParticipantOrder,
  Invoice,
  PaymentRecord,
  Shipment,
  InventoryMovement,
  ReturnCase,
  CreditNote,
  NotificationItem,
  AuditEvent,
  SupportCase,
  PaymentMethodType,
  ShipmentStatus,
  OrderStatus,
  CampaignStatus,
} from '../types';

import {
  loadInitialState,
  saveStateToStorage,
  resetStorageToSeed,
  AppStateData,
} from '../services/storageService';

import {
  calculateConsolidatedAllocation,
  evaluateDiscountTier,
  calculateOutstandingBalancePaise,
} from '../services/financialEngine';

import {
  canTransitionCampaign,
  evaluateThresholdState,
  processSupplierQuotation,
} from '../services/campaignStateMachine';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface AppContextType {
  state: AppStateData;
  currentUser: User;
  currentOrg: Organization;
  toasts: ToastMessage[];
  activeView: string;
  activeCampaignId?: string;
  activeInvoiceId?: string;
  activeOrderId?: string;
  demoGuideOpen: boolean;
  demoGuideStep: number;
  setActiveView: (view: string, detailId?: string) => void;
  setDemoGuideOpen: (open: boolean) => void;
  setDemoGuideStep: (step: number) => void;
  switchUser: (userId: string) => void;
  addToast: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
  resetDemo: () => void;

  // Domain Actions
  createCampaign: (campaign: Partial<BulkCampaign>) => void;
  joinCampaign: (campaignId: string, quantity: number, variantId?: string, address?: any) => void;
  withdrawFromCampaign: (campaignId: string, orgId: string) => void;
  submitSupplierQuotation: (campaignId: string, quotation: any) => void;
  approveParticipantTerms: (campaignId: string, orgId: string) => void;
  generatePurchaseOrder: (campaignId: string) => void;
  recordPaymentAttempt: (
    invoiceId: string,
    amountPaise: number,
    method: PaymentMethodType,
    scenario: 'SUCCESS' | 'FAILED' | 'PENDING' | 'PARTIAL'
  ) => { success: boolean; message: string; payment?: PaymentRecord };
  resolvePendingPayment: (paymentId: string) => void;
  retryPayment: (paymentId: string, method: PaymentMethodType, forceSuccess?: boolean) => void;
  issueRefund: (paymentId: string, amountPaise: number, reason: string) => void;
  createShipment: (orderId: string, carrierName: string, trackingNumber: string, items: any[]) => void;
  updateShipmentStatus: (shipmentId: string, newStatus: ShipmentStatus, location: string, notes?: string) => void;
  submitReturnRequest: (orderId: string, productId: string, quantity: number, reason: any) => void;
  approveReturnRequest: (returnId: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  runDemoScenarioStep: (step: number) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppStateData>(loadInitialState);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [activeView, setActiveViewState] = useState<string>('public-home');
  const [activeCampaignId, setActiveCampaignId] = useState<string | undefined>('camp-led-001');
  const [activeInvoiceId, setActiveInvoiceId] = useState<string | undefined>(undefined);
  const [activeOrderId, setActiveOrderId] = useState<string | undefined>(undefined);
  const [demoGuideOpen, setDemoGuideOpen] = useState<boolean>(false);
  const [demoGuideStep, setDemoGuideStep] = useState<number>(1);

  // Sync to local storage on state change
  useEffect(() => {
    saveStateToStorage(state);
  }, [state]);

  const addToast = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const setActiveView = (view: string, detailId?: string) => {
    setActiveViewState(view);
    if (view === 'campaign-detail' && detailId) {
      setActiveCampaignId(detailId);
    } else if (view === 'invoice-detail' && detailId) {
      setActiveInvoiceId(detailId);
    } else if (view === 'order-detail' && detailId) {
      setActiveOrderId(detailId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentUser = state.currentUser;
  const currentOrg = state.organizations.find((o) => o.id === currentUser.organizationId) || state.organizations[0];

  const switchUser = (userId: string) => {
    const user = state.users.find((u) => u.id === userId);
    if (user) {
      setState((prev) => ({ ...prev, currentUser: user }));
      addToast('Role Switched', `Now operating as ${user.name} (${user.role})`, 'info');
      // Navigate to appropriate workspace
      switch (user.role) {
        case 'RETAILER':
          setActiveViewState('retailer-overview');
          break;
        case 'ORGANIZER':
          setActiveViewState('organizer-overview');
          break;
        case 'SUPPLIER':
          setActiveViewState('supplier-overview');
          break;
        case 'FINANCE':
          setActiveViewState('finance-overview');
          break;
        case 'WAREHOUSE':
          setActiveViewState('warehouse-overview');
          break;
        case 'ADMIN':
          setActiveViewState('admin-overview');
          break;
        case 'AUDITOR':
          setActiveViewState('admin-audit');
          break;
        default:
          setActiveViewState('public-home');
      }
    }
  };

  const resetDemo = () => {
    const fresh = resetStorageToSeed();
    setState(fresh);
    setDemoGuideStep(1);
    addToast('Demo State Reset', 'The demonstration database has been restored to initial factory seed records.', 'success');
  };

  const logAudit = (
    action: string,
    entityType: 'CAMPAIGN' | 'ORDER' | 'INVOICE' | 'PAYMENT' | 'SHIPMENT' | 'USER' | 'QUOTATION' | 'RETURN',
    entityId: string,
    previousState: string,
    newState: string,
    reason: string
  ) => {
    const event: AuditEvent = {
      id: 'aud-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action,
      entityType,
      entityId,
      previousState,
      newState,
      reason,
      timestamp: new Date().toISOString(),
    };
    return event;
  };

  // Join Campaign Action
  const joinCampaign = (campaignId: string, quantity: number, variantId?: string, address?: any) => {
    const campaign = state.campaigns.find((c) => c.id === campaignId);
    if (!campaign) {
      addToast('Error', 'Campaign not found.', 'error');
      return;
    }

    if (!['OPEN', 'THRESHOLD_REACHED'].includes(campaign.status)) {
      addToast('Cannot Join', `Campaign is in status ${campaign.status} and cannot accept new commitments.`, 'error');
      return;
    }

    const existingIndex = campaign.participants.findIndex((p) => p.organizationId === currentOrg.id);
    const prevQty = existingIndex >= 0 ? campaign.participants[existingIndex].requestedQuantity : 0;
    const diffQty = quantity - prevQty;
    const newTotalQty = campaign.currentQuantity + diffQty;

    // Evaluate discount tier
    const { currentDiscountPercent, nextTier } = evaluateDiscountTier(newTotalQty, campaign.discountSchedule);

    // Build or update participant list
    let updatedParticipants = [...campaign.participants];
    const defaultAddress = address || {
      street: currentOrg.address.street,
      city: currentOrg.address.city,
      state: currentOrg.address.state,
      pincode: currentOrg.address.pincode,
    };

    if (existingIndex >= 0) {
      updatedParticipants[existingIndex] = {
        ...updatedParticipants[existingIndex],
        requestedQuantity: quantity,
        variantId,
        deliveryAddress: defaultAddress,
        approvedTerms: false,
      };
    } else {
      updatedParticipants.push({
        organizationId: currentOrg.id,
        organizationName: currentOrg.name,
        buyerUserId: currentUser.id,
        buyerUserName: currentUser.name,
        requestedQuantity: quantity,
        variantId,
        deliveryAddress: defaultAddress,
        allocatedDiscountPaise: 0,
        allocatedShippingPaise: 0,
        taxableBasePaise: 0,
        taxPaise: 0,
        finalPayablePaise: 0,
        approvedTerms: false,
        joinedAt: new Date().toISOString(),
      });
    }

    // Run centralized allocation calculation
    const demands = updatedParticipants.map((p) => ({
      organizationId: p.organizationId,
      quantity: p.requestedQuantity,
      baseUnitPricePaise: campaign.basePricePaise,
    }));

    const totalShippingPaise = 150000; // Sample ₹1,500 shipping
    const calcResult = calculateConsolidatedAllocation(
      demands,
      currentDiscountPercent,
      totalShippingPaise,
      5, // 5% GST
      campaign.allocationMethod
    );

    // Update participant calculated allocations
    updatedParticipants = updatedParticipants.map((p) => {
      const alloc = calcResult.allocations.find((a) => a.organizationId === p.organizationId);
      if (alloc) {
        return {
          ...p,
          allocatedDiscountPaise: alloc.allocatedDiscountPaise,
          allocatedShippingPaise: alloc.allocatedShippingPaise,
          taxableBasePaise: alloc.taxableBasePaise,
          taxPaise: alloc.totalTaxPaise,
          finalPayablePaise: alloc.finalPayablePaise,
        };
      }
      return p;
    });

    let newStatus = campaign.status;
    if (newTotalQty >= campaign.targetQuantity && campaign.status === 'OPEN') {
      newStatus = 'THRESHOLD_REACHED';
    }

    const updatedCampaign: BulkCampaign = {
      ...campaign,
      currentQuantity: newTotalQty,
      currentDiscountPercent,
      nextTier,
      status: newStatus,
      participants: updatedParticipants,
      updatedAt: new Date().toISOString(),
    };

    const audit = logAudit(
      'JOIN_CAMPAIGN',
      'CAMPAIGN',
      campaign.id,
      `${campaign.currentQuantity} units`,
      `${newTotalQty} units`,
      `${currentOrg.name} committed ${quantity} units`
    );

    setState((prev) => ({
      ...prev,
      campaigns: prev.campaigns.map((c) => (c.id === campaignId ? updatedCampaign : c)),
      auditEvents: [audit, ...prev.auditEvents],
    }));

    addToast(
      'Joined Campaign Successfully',
      `${quantity} cartons pledged for ${campaign.title}. Current tier: ${currentDiscountPercent}%.`,
      'success'
    );
  };

  // Withdraw from Campaign
  const withdrawFromCampaign = (campaignId: string, orgId: string) => {
    const campaign = state.campaigns.find((c) => c.id === campaignId);
    if (!campaign) return;

    if (!['OPEN', 'THRESHOLD_REACHED'].includes(campaign.status)) {
      addToast('Cannot Withdraw', 'Withdrawals are locked after supplier quotation confirmation.', 'error');
      return;
    }

    const participant = campaign.participants.find((p) => p.organizationId === orgId);
    if (!participant) return;

    const newParticipants = campaign.participants.filter((p) => p.organizationId !== orgId);
    const newQuantity = campaign.currentQuantity - participant.requestedQuantity;
    const { currentDiscountPercent, nextTier } = evaluateDiscountTier(newQuantity, campaign.discountSchedule);

    let newStatus = campaign.status;
    if (newQuantity < campaign.targetQuantity && campaign.status === 'THRESHOLD_REACHED') {
      newStatus = 'OPEN';
    }

    const updatedCampaign: BulkCampaign = {
      ...campaign,
      participants: newParticipants,
      currentQuantity: newQuantity,
      currentDiscountPercent,
      nextTier,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    const audit = logAudit(
      'WITHDRAW_CAMPAIGN',
      'CAMPAIGN',
      campaign.id,
      `${campaign.currentQuantity} units`,
      `${newQuantity} units`,
      `${participant.organizationName} withdrew ${participant.requestedQuantity} units`
    );

    setState((prev) => ({
      ...prev,
      campaigns: prev.campaigns.map((c) => (c.id === campaignId ? updatedCampaign : c)),
      auditEvents: [audit, ...prev.auditEvents],
    }));

    addToast('Withdrawn', `Withdrew commitment from ${campaign.title}.`, 'info');
  };

  // Create Campaign
  const createCampaign = (campaignData: Partial<BulkCampaign>) => {
    const id = 'camp-' + Date.now();
    const campaignNumber = `CMP-2026-${String(state.campaigns.length + 1).padStart(3, '0')}`;
    const newCamp: BulkCampaign = {
      id,
      campaignNumber,
      title: campaignData.title || 'New Bulk Purchasing Campaign',
      productId: campaignData.productId || state.products[0].id,
      productName: campaignData.productName || state.products[0].name,
      productSku: campaignData.productSku || state.products[0].sku,
      category: campaignData.category || state.products[0].category,
      supplierId: campaignData.supplierId || state.products[0].supplierId,
      supplierName: campaignData.supplierName || state.products[0].supplierName,
      organizerId: currentUser.id,
      organizerName: currentUser.name,
      status: 'OPEN',
      targetQuantity: campaignData.targetQuantity || 100,
      currentQuantity: 0,
      unitOfMeasure: campaignData.unitOfMeasure || state.products[0].unitOfMeasure,
      basePricePaise: campaignData.basePricePaise || state.products[0].basePricePaise,
      currentDiscountPercent: 0,
      discountSchedule: campaignData.discountSchedule || [
        { id: 't1', minQuantity: 1, maxQuantity: 49, discountPercent: 0 },
        { id: 't2', minQuantity: 50, maxQuantity: 99, discountPercent: 5 },
        { id: 't3', minQuantity: 100, maxQuantity: 199, discountPercent: 8 },
        { id: 't4', minQuantity: 200, discountPercent: 12 },
      ],
      allocationMethod: campaignData.allocationMethod || 'PROPORTIONAL_QUANTITY',
      startDate: new Date().toISOString().split('T')[0],
      endDate: campaignData.endDate || '2026-04-30',
      withdrawalDeadline: campaignData.withdrawalDeadline || '2026-04-20',
      deliveryTerms: campaignData.deliveryTerms || 'Consolidated hub dispatch',
      disclosedPolicy: campaignData.disclosedPolicy || 'Transparent per-unit shared logistics allocation.',
      participants: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const audit = logAudit('CREATE_CAMPAIGN', 'CAMPAIGN', id, 'NONE', 'OPEN', 'Created new bulk campaign');
    setState((prev) => ({
      ...prev,
      campaigns: [newCamp, ...prev.campaigns],
      auditEvents: [audit, ...prev.auditEvents],
    }));
    addToast('Campaign Published', `${newCamp.title} is now open for participant orders!`, 'success');
  };

  // Submit Supplier Quotation
  const submitSupplierQuotation = (campaignId: string, quotation: any) => {
    const campaign = state.campaigns.find((c) => c.id === campaignId);
    if (!campaign) return;

    const { updatedCampaign, requiresReapproval } = processSupplierQuotation(campaign, quotation);
    const audit = logAudit(
      'SUBMIT_QUOTATION',
      'QUOTATION',
      campaign.id,
      campaign.status,
      updatedCampaign.status,
      `Quotation ${quotation.quotationNumber} submitted at ₹${quotation.unitPricePaise / 100}/unit`
    );

    setState((prev) => ({
      ...prev,
      campaigns: prev.campaigns.map((c) => (c.id === campaignId ? updatedCampaign : c)),
      auditEvents: [audit, ...prev.auditEvents],
    }));

    addToast(
      'Quotation Confirmed',
      requiresReapproval
        ? 'Quotation terms submitted with revisions. Participants have been notified for re-approval.'
        : 'Quotation confirmed! Awaiting participant allocations approval.',
      'success'
    );
  };

  // Approve Participant Terms
  const approveParticipantTerms = (campaignId: string, orgId: string) => {
    const campaign = state.campaigns.find((c) => c.id === campaignId);
    if (!campaign) return;

    const updatedParticipants = campaign.participants.map((p) => {
      if (p.organizationId === orgId) {
        return {
          ...p,
          approvedTerms: true,
          approvalTimestamp: new Date().toISOString(),
        };
      }
      return p;
    });

    const allApproved = updatedParticipants.every((p) => p.approvedTerms);
    const newStatus: CampaignStatus = allApproved ? 'CONFIRMED' : campaign.status;

    const updatedCampaign: BulkCampaign = {
      ...campaign,
      participants: updatedParticipants,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    const audit = logAudit(
      'APPROVE_TERMS',
      'CAMPAIGN',
      campaign.id,
      'PENDING_APPROVAL',
      newStatus,
      `${orgId} approved final allocation and commercial terms`
    );

    setState((prev) => ({
      ...prev,
      campaigns: prev.campaigns.map((c) => (c.id === campaignId ? updatedCampaign : c)),
      auditEvents: [audit, ...prev.auditEvents],
    }));

    addToast('Allocation Approved', 'Commercial terms and final allocated amounts approved.', 'success');
  };

  // Generate Purchase Order & Invoices
  const generatePurchaseOrder = (campaignId: string) => {
    const campaign = state.campaigns.find((c) => c.id === campaignId);
    if (!campaign) return;

    if (campaign.status !== 'CONFIRMED' && campaign.status !== 'AWAITING_PARTICIPANT_APPROVAL') {
      addToast('Cannot Generate PO', 'Campaign must be confirmed before purchase order generation.', 'error');
      return;
    }

    const poNumber = `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const poId = `po-${Date.now()}`;

    // Generate individual participant orders and invoices
    const newOrders: ParticipantOrder[] = [];
    const newInvoices: Invoice[] = [];

    campaign.participants.forEach((p, idx) => {
      const orderId = `ord-${Date.now()}-${idx}`;
      const orderNumber = `ORD-2026-${Math.floor(2000 + Math.random() * 8000)}`;
      const invoiceId = `inv-${Date.now()}-${idx}`;
      const invoiceNumber = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      const order: ParticipantOrder = {
        id: orderId,
        orderNumber,
        campaignId: campaign.id,
        campaignNumber: campaign.campaignNumber,
        campaignTitle: campaign.title,
        organizationId: p.organizationId,
        organizationName: p.organizationName,
        buyerUserId: p.buyerUserId,
        supplierId: campaign.supplierId,
        supplierName: campaign.supplierName,
        productId: campaign.productId,
        productName: campaign.productName,
        quantity: p.requestedQuantity,
        unitOfMeasure: campaign.unitOfMeasure,
        unitPricePaise: campaign.basePricePaise,
        subtotalPaise: p.requestedQuantity * campaign.basePricePaise,
        discountPaise: p.allocatedDiscountPaise,
        shippingPaise: p.allocatedShippingPaise,
        taxableBasePaise: p.taxableBasePaise,
        taxRatePercent: 5,
        taxPaise: p.taxPaise,
        finalPayablePaise: p.finalPayablePaise,
        amountPaidPaise: 0,
        outstandingBalancePaise: p.finalPayablePaise,
        orderStatus: 'CONFIRMED',
        paymentStatus: 'UNPAID',
        invoiceId,
        deliveryAddress: p.deliveryAddress,
        createdAt: new Date().toISOString(),
        timeline: [
          { status: 'DRAFT', timestamp: p.joinedAt, actor: p.buyerUserName, note: 'Joined campaign' },
          { status: 'CONFIRMED', timestamp: new Date().toISOString(), actor: currentUser.name, note: 'PO Generated' },
        ],
      };

      const buyerOrg = state.organizations.find((o) => o.id === p.organizationId);
      const supplierOrg = state.organizations.find((o) => o.id === campaign.supplierId);
      const isInterState = buyerOrg?.address.state !== supplierOrg?.address.state;

      const cgst = isInterState ? 0 : Math.round(p.taxPaise / 2);
      const sgst = isInterState ? 0 : p.taxPaise - cgst;
      const igst = isInterState ? p.taxPaise : 0;

      const invoice: Invoice = {
        id: invoiceId,
        invoiceNumber,
        orderId,
        campaignId: campaign.id,
        campaignNumber: campaign.campaignNumber,
        buyerOrganizationId: p.organizationId,
        buyerOrganizationName: p.organizationName,
        buyerGstin: buyerOrg?.gstin || '29AAACG1234D1Z5',
        buyerAddress: p.deliveryAddress,
        supplierOrganizationId: campaign.supplierId,
        supplierOrganizationName: campaign.supplierName,
        supplierGstin: supplierOrg?.gstin || '27AAACA9876P1ZX',
        supplierAddress: supplierOrg?.address || { street: 'MIDC', city: 'Pune', state: 'Maharashtra', pincode: '410501', country: 'India' },
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        items: [
          {
            id: 'item-1',
            description: `${campaign.productName} (${campaign.unitOfMeasure})`,
            sku: campaign.productSku,
            quantity: p.requestedQuantity,
            unitOfMeasure: campaign.unitOfMeasure,
            unitPricePaise: campaign.basePricePaise,
            subtotalPaise: p.requestedQuantity * campaign.basePricePaise,
            discountPaise: p.allocatedDiscountPaise,
            taxableBasePaise: p.taxableBasePaise,
            taxRatePercent: 5,
            cgstPaise: cgst,
            sgstPaise: sgst,
            igstPaise: igst,
            totalPaise: p.finalPayablePaise - p.allocatedShippingPaise,
          },
        ],
        subtotalPaise: p.requestedQuantity * campaign.basePricePaise,
        totalDiscountPaise: p.allocatedDiscountPaise,
        allocatedShippingPaise: p.allocatedShippingPaise,
        otherChargesPaise: 0,
        taxableBasePaise: p.taxableBasePaise,
        totalTaxPaise: p.taxPaise,
        cgstTotalPaise: cgst,
        sgstTotalPaise: sgst,
        igstTotalPaise: igst,
        grandTotalPaise: p.finalPayablePaise,
        amountPaidPaise: 0,
        outstandingBalancePaise: p.finalPayablePaise,
        status: 'UNPAID',
        isInterState,
        disclaimer: 'Illustrative B2B Commercial Pro-Forma Invoice generated by BulkBridge simulation engine.',
      };

      p.invoiceId = invoiceId;
      p.orderId = orderId;
      newOrders.push(order);
      newInvoices.push(invoice);
    });

    const updatedCampaign: BulkCampaign = {
      ...campaign,
      status: 'PURCHASING',
      purchaseOrderId: poId,
      updatedAt: new Date().toISOString(),
    };

    const audit = logAudit(
      'GENERATE_PO',
      'ORDER',
      poNumber,
      'CONFIRMED',
      'PURCHASING',
      `Generated consolidated PO ${poNumber} and ${newInvoices.length} participant invoices.`
    );

    setState((prev) => ({
      ...prev,
      campaigns: prev.campaigns.map((c) => (c.id === campaignId ? updatedCampaign : c)),
      orders: [...newOrders, ...prev.orders],
      invoices: [...newInvoices, ...prev.invoices],
      auditEvents: [audit, ...prev.auditEvents],
    }));

    addToast(
      'Consolidated PO Generated',
      `PO ${poNumber} created. Generated ${newInvoices.length} itemized participant invoices.`,
      'success'
    );
  };

  // Record Simulated Payment
  const recordPaymentAttempt = (
    invoiceId: string,
    amountPaise: number,
    method: PaymentMethodType,
    scenario: 'SUCCESS' | 'FAILED' | 'PENDING' | 'PARTIAL'
  ) => {
    const invoice = state.invoices.find((inv) => inv.id === invoiceId);
    if (!invoice) {
      return { success: false, message: 'Invoice not found.' };
    }

    // Check duplicate payment prevention if already fully paid
    if (invoice.outstandingBalancePaise <= 0 && scenario === 'SUCCESS') {
      addToast('Payment Rejected', 'This invoice has already been fully paid.', 'warning');
      return { success: false, message: 'Invoice is already fully settled.' };
    }

    const paymentId = 'pay-' + Date.now();
    const idempotencyKey = `idemp-${method.toLowerCase()}-${Date.now()}`;
    const providerRef = `SIM-${method}-${Math.floor(10000000 + Math.random() * 90000000)}`;

    let status: 'SUCCESS' | 'FAILED' | 'PENDING' = 'SUCCESS';
    let failureReason: string | undefined = undefined;
    let effectiveAmount = amountPaise;

    if (scenario === 'FAILED') {
      status = 'FAILED';
      failureReason = 'Simulated issuing bank network error / insufficient corporate credit.';
    } else if (scenario === 'PENDING') {
      status = 'PENDING';
    } else if (scenario === 'PARTIAL') {
      status = 'SUCCESS';
      effectiveAmount = Math.round(amountPaise / 2); // Pay 50%
    }

    const payment: PaymentRecord = {
      id: paymentId,
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      orderId: invoice.orderId,
      organizationId: invoice.buyerOrganizationId,
      organizationName: invoice.buyerOrganizationName,
      amountPaise: effectiveAmount,
      currency: 'INR',
      method,
      status,
      idempotencyKey,
      simulatedProviderRef: providerRef,
      transactionTimestamp: new Date().toISOString(),
      failureReason,
      payerName: currentUser.name,
      auditNote: status === 'PENDING' ? 'Awaiting bank clearance confirmation' : undefined,
    };

    let updatedInvoice = { ...invoice };
    let updatedOrder = state.orders.find((o) => o.id === invoice.orderId);

    if (status === 'SUCCESS') {
      const newPaid = invoice.amountPaidPaise + effectiveAmount;
      const newBalance = calculateOutstandingBalancePaise(invoice.grandTotalPaise, newPaid);
      const newStatus = newBalance === 0 ? 'PAID' : 'PARTIALLY_PAID';

      updatedInvoice = {
        ...invoice,
        amountPaidPaise: newPaid,
        outstandingBalancePaise: newBalance,
        status: newStatus as any,
      };

      if (updatedOrder) {
        updatedOrder = {
          ...updatedOrder,
          amountPaidPaise: newPaid,
          outstandingBalancePaise: newBalance,
          paymentStatus: newStatus as any,
          timeline: [
            ...updatedOrder.timeline,
            {
              status: updatedOrder.orderStatus,
              timestamp: new Date().toISOString(),
              note: `Simulated payment of ₹${effectiveAmount / 100} recorded (${method})`,
              actor: currentUser.name,
            },
          ],
        };
      }
    }

    const audit = logAudit(
      status === 'SUCCESS' ? 'RECORD_PAYMENT' : status === 'FAILED' ? 'PAYMENT_FAILED_ATTEMPT' : 'PAYMENT_PENDING_SUBMITTED',
      'PAYMENT',
      paymentId,
      invoice.status,
      updatedInvoice.status,
      `Simulated ${method} payment of ₹${effectiveAmount / 100} (${status})`
    );

    setState((prev) => ({
      ...prev,
      payments: [payment, ...prev.payments],
      invoices: prev.invoices.map((inv) => (inv.id === invoiceId ? updatedInvoice : inv)),
      orders: updatedOrder ? prev.orders.map((o) => (o.id === updatedOrder!.id ? updatedOrder! : o)) : prev.orders,
      auditEvents: [audit, ...prev.auditEvents],
    }));

    if (status === 'SUCCESS') {
      addToast(
        'Payment Successful',
        `₹${effectiveAmount / 100} paid for ${invoice.invoiceNumber}. Remaining: ₹${updatedInvoice.outstandingBalancePaise / 100}.`,
        'success'
      );
    } else if (status === 'FAILED') {
      addToast('Payment Failed', failureReason || 'Transaction was declined by simulated gateway.', 'error');
    } else {
      addToast('Payment Submitted (Pending)', 'Transaction submitted. Awaiting simulated bank verification.', 'warning');
    }

    return { success: status === 'SUCCESS', message: failureReason || 'Transaction processed.', payment };
  };

  // Resolve Pending Payment (Demo control)
  const resolvePendingPayment = (paymentId: string) => {
    const payment = state.payments.find((p) => p.id === paymentId);
    if (!payment || payment.status !== 'PENDING') return;

    const invoice = state.invoices.find((inv) => inv.id === payment.invoiceId);
    if (!invoice) return;

    const updatedPayment: PaymentRecord = {
      ...payment,
      status: 'SUCCESS',
      resolvedAt: new Date().toISOString(),
      auditNote: 'Simulated bank settlement cleared successfully.',
    };

    const newPaid = invoice.amountPaidPaise + payment.amountPaise;
    const newBalance = calculateOutstandingBalancePaise(invoice.grandTotalPaise, newPaid);
    const newStatus = newBalance === 0 ? 'PAID' : 'PARTIALLY_PAID';

    const updatedInvoice = {
      ...invoice,
      amountPaidPaise: newPaid,
      outstandingBalancePaise: newBalance,
      status: newStatus as any,
    };

    let updatedOrder = state.orders.find((o) => o.id === invoice.orderId);
    if (updatedOrder) {
      updatedOrder = {
        ...updatedOrder,
        amountPaidPaise: newPaid,
        outstandingBalancePaise: newBalance,
        paymentStatus: newStatus as any,
      };
    }

    const audit = logAudit(
      'RESOLVE_PENDING_PAYMENT',
      'PAYMENT',
      paymentId,
      'PENDING',
      'SUCCESS',
      `Resolved pending payment for ${invoice.invoiceNumber}`
    );

    setState((prev) => ({
      ...prev,
      payments: prev.payments.map((p) => (p.id === paymentId ? updatedPayment : p)),
      invoices: prev.invoices.map((inv) => (inv.id === invoice.id ? updatedInvoice : inv)),
      orders: updatedOrder ? prev.orders.map((o) => (o.id === updatedOrder!.id ? updatedOrder! : o)) : prev.orders,
      auditEvents: [audit, ...prev.auditEvents],
    }));

    addToast('Pending Payment Cleared', `Payment of ₹${payment.amountPaise / 100} has settled.`, 'success');
  };

  // Retry Failed Payment
  const retryPayment = (paymentId: string, method: PaymentMethodType, forceSuccess = true) => {
    const oldPayment = state.payments.find((p) => p.id === paymentId);
    if (!oldPayment) return;

    recordPaymentAttempt(
      oldPayment.invoiceId,
      oldPayment.amountPaise,
      method,
      forceSuccess ? 'SUCCESS' : 'FAILED'
    );
  };

  // Issue Refund
  const issueRefund = (paymentId: string, amountPaise: number, reason: string) => {
    const payment = state.payments.find((p) => p.id === paymentId);
    if (!payment) return;

    const refundId = 'ref-' + Date.now();
    const updatedPayment: PaymentRecord = {
      ...payment,
      status: 'REFUNDED',
      refundRef: refundId,
      refundedAmountPaise: amountPaise,
      refundTimestamp: new Date().toISOString(),
    };

    const invoice = state.invoices.find((inv) => inv.id === payment.invoiceId);
    let updatedInvoice = invoice;
    if (invoice) {
      const newPaid = Math.max(0, invoice.amountPaidPaise - amountPaise);
      const newBalance = calculateOutstandingBalancePaise(invoice.grandTotalPaise, newPaid);
      updatedInvoice = {
        ...invoice,
        amountPaidPaise: newPaid,
        outstandingBalancePaise: newBalance,
        status: 'REFUNDED',
      };
    }

    const audit = logAudit(
      'PROCESS_REFUND',
      'PAYMENT',
      paymentId,
      payment.status,
      'REFUNDED',
      `Processed simulated refund of ₹${amountPaise / 100}: ${reason}`
    );

    setState((prev) => ({
      ...prev,
      payments: prev.payments.map((p) => (p.id === paymentId ? updatedPayment : p)),
      invoices: updatedInvoice ? prev.invoices.map((inv) => (inv.id === updatedInvoice!.id ? updatedInvoice! : inv)) : prev.invoices,
      auditEvents: [audit, ...prev.auditEvents],
    }));

    addToast('Refund Processed', `Simulated refund of ₹${amountPaise / 100} completed.`, 'info');
  };

  // Create Shipment
  const createShipment = (orderId: string, carrierName: string, trackingNumber: string, items: any[]) => {
    const order = state.orders.find((o) => o.id === orderId);
    if (!order) return;

    const shipmentId = 'shp-' + Date.now();
    const shipmentNumber = `SHP-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newShipment: Shipment = {
      id: shipmentId,
      shipmentNumber,
      orderId: order.id,
      orderNumber: order.orderNumber,
      campaignId: order.campaignId,
      supplierId: order.supplierId,
      supplierName: order.supplierName,
      buyerOrganizationId: order.organizationId,
      buyerOrganizationName: order.organizationName,
      carrierName,
      trackingNumber,
      status: 'PICKING',
      items: items.length > 0 ? items : [{
        productId: order.productId,
        productName: order.productName,
        orderedQuantity: order.quantity,
        dispatchedQuantity: order.quantity,
        deliveredQuantity: 0,
      }],
      estimatedDeliveryDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      timeline: [
        { status: 'CONFIRMED', timestamp: new Date().toISOString(), location: 'Factory Dispatch Bay' },
        { status: 'PICKING', timestamp: new Date().toISOString(), location: 'Warehouse Staging' },
      ],
      isPartial: false,
    };

    const updatedOrder: ParticipantOrder = {
      ...order,
      orderStatus: 'PROCESSING',
      shipmentId,
      timeline: [
        ...order.timeline,
        { status: 'PROCESSING', timestamp: new Date().toISOString(), note: `Shipment ${shipmentNumber} created`, actor: currentUser.name },
      ],
    };

    const audit = logAudit('CREATE_SHIPMENT', 'SHIPMENT', shipmentId, 'NONE', 'PICKING', `Carrier: ${carrierName}, Tracking: ${trackingNumber}`);

    setState((prev) => ({
      ...prev,
      shipments: [newShipment, ...prev.shipments],
      orders: prev.orders.map((o) => (o.id === orderId ? updatedOrder : o)),
      auditEvents: [audit, ...prev.auditEvents],
    }));

    addToast('Shipment Created', `Shipment ${shipmentNumber} assigned to ${carrierName}.`, 'success');
  };

  // Update Shipment Status
  const updateShipmentStatus = (shipmentId: string, newStatus: ShipmentStatus, location: string, notes?: string) => {
    const shipment = state.shipments.find((s) => s.id === shipmentId);
    if (!shipment) return;

    const updatedTimeline = [
      ...shipment.timeline,
      { status: newStatus, timestamp: new Date().toISOString(), location, notes },
    ];

    const updatedShipment: Shipment = {
      ...shipment,
      status: newStatus,
      timeline: updatedTimeline,
      actualDeliveryDate: newStatus === 'DELIVERED' ? new Date().toISOString() : shipment.actualDeliveryDate,
    };

    // Update corresponding order
    let updatedOrder = state.orders.find((o) => o.id === shipment.orderId);
    let newInventoryMovements = [...state.inventoryMovements];

    if (updatedOrder) {
      const mappedOrderStatus: OrderStatus = 
        newStatus === 'DISPATCHED' ? 'DISPATCHED' :
        newStatus === 'IN_TRANSIT' ? 'IN_TRANSIT' :
        newStatus === 'DELIVERED' ? 'DELIVERED' :
        newStatus === 'PARTIALLY_DELIVERED' ? 'PARTIALLY_DELIVERED' : 'PROCESSING';

      updatedOrder = {
        ...updatedOrder,
        orderStatus: mappedOrderStatus,
        timeline: [
          ...updatedOrder.timeline,
          { status: mappedOrderStatus, timestamp: new Date().toISOString(), note: `${newStatus} at ${location}`, actor: currentUser.name },
        ],
      };

      // Record inventory movement on dispatch if not already recorded
      if (newStatus === 'DISPATCHED') {
        const prod = state.products.find((p) => p.id === updatedOrder!.productId);
        if (prod) {
          const mov: InventoryMovement = {
            id: 'mov-' + Date.now(),
            productId: prod.id,
            productSku: prod.sku,
            productName: prod.name,
            warehouseLocation: location || 'Central Warehouse',
            quantityChange: -updatedOrder.quantity,
            balanceAfter: Math.max(0, prod.availableStock - updatedOrder.quantity),
            reason: 'CAMPAIGN_FULFILLMENT',
            relatedOrderId: updatedOrder.id,
            relatedShipmentId: shipment.id,
            actor: currentUser.name,
            timestamp: new Date().toISOString(),
          };
          newInventoryMovements = [mov, ...newInventoryMovements];
        }
      }
    }

    const audit = logAudit('UPDATE_SHIPMENT', 'SHIPMENT', shipmentId, shipment.status, newStatus, `Status updated to ${newStatus} at ${location}`);

    setState((prev) => ({
      ...prev,
      shipments: prev.shipments.map((s) => (s.id === shipmentId ? updatedShipment : s)),
      orders: updatedOrder ? prev.orders.map((o) => (o.id === updatedOrder!.id ? updatedOrder! : o)) : prev.orders,
      inventoryMovements: newInventoryMovements,
      auditEvents: [audit, ...prev.auditEvents],
    }));

    addToast('Shipment Updated', `Shipment status is now ${newStatus}.`, 'info');
  };

  // Submit Return Claim
  const submitReturnRequest = (orderId: string, productId: string, quantity: number, reason: any) => {
    const order = state.orders.find((o) => o.id === orderId);
    if (!order) return;

    const returnId = 'ret-' + Date.now();
    const returnNumber = `RET-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newReturn: ReturnCase = {
      id: returnId,
      returnNumber,
      orderId: order.id,
      orderNumber: order.orderNumber,
      invoiceId: order.invoiceId || '',
      buyerOrganizationId: order.organizationId,
      buyerOrganizationName: order.organizationName,
      productId,
      productName: order.productName,
      quantityReturned: quantity,
      reason,
      claimedAt: new Date().toISOString(),
      status: 'PENDING_REVIEW',
    };

    const audit = logAudit('SUBMIT_RETURN_CLAIM', 'RETURN', returnId, 'NONE', 'PENDING_REVIEW', `Claim for ${quantity} units: ${reason}`);

    setState((prev) => ({
      ...prev,
      returns: [newReturn, ...prev.returns],
      auditEvents: [audit, ...prev.auditEvents],
    }));

    addToast('Return Claim Submitted', `Case ${returnNumber} is under warehouse & supplier review.`, 'info');
  };

  // Approve Return Request
  const approveReturnRequest = (returnId: string) => {
    const ret = state.returns.find((r) => r.id === returnId);
    if (!ret) return;

    const creditNoteId = 'crn-' + Date.now();
    const creditNoteNumber = `CRN-2026-${Math.floor(100 + Math.random() * 900)}`;
    const creditAmountPaise = 250000; // Sample ₹2,500

    const creditNote: CreditNote = {
      id: creditNoteId,
      creditNoteNumber,
      invoiceId: ret.invoiceId,
      invoiceNumber: 'INV',
      buyerOrganizationId: ret.buyerOrganizationId,
      buyerOrganizationName: ret.buyerOrganizationName,
      amountPaise: creditAmountPaise,
      reason: `Approved return ${ret.returnNumber} (${ret.reason})`,
      issuedAt: new Date().toISOString(),
    };

    const updatedReturn: ReturnCase = {
      ...ret,
      status: 'APPROVED',
      creditNoteId,
      refundAmountPaise: creditAmountPaise,
      inspectionNotes: 'Damage verified. Credit note generated.',
    };

    const audit = logAudit('APPROVE_RETURN', 'RETURN', returnId, 'PENDING_REVIEW', 'APPROVED', `Credit note ${creditNoteNumber} issued`);

    setState((prev) => ({
      ...prev,
      returns: prev.returns.map((r) => (r.id === returnId ? updatedReturn : r)),
      creditNotes: [creditNote, ...prev.creditNotes],
      auditEvents: [audit, ...prev.auditEvents],
    }));

    addToast('Return Approved', `Credit Note ${creditNoteNumber} for ₹${creditAmountPaise / 100} has been issued.`, 'success');
  };

  const markNotificationAsRead = (id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    }));
  };

  const markAllNotificationsAsRead = () => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, isRead: true })),
    }));
  };

  // Automated 21-Step Canonical LED Bulb Scenario Runner
  const runDemoScenarioStep = (step: number) => {
    setDemoGuideStep(step);
    switch (step) {
      case 1:
        // Step 1: Log in as Organizer
        switchUser('user-organizer');
        setActiveViewState('organizer-overview');
        break;
      case 2:
        // Step 2: Review or open LED bulb campaign
        setActiveView('campaign-detail', 'camp-led-001');
        break;
      case 3:
        // Step 3: Switch to Retailer A (GreenMart)
        switchUser('user-buyer-1');
        setActiveView('campaign-detail', 'camp-led-001');
        break;
      case 4:
        // Step 4: Switch to Retailer B (Sri Lakshmi Stores)
        switchUser('user-buyer-2');
        setActiveView('campaign-detail', 'camp-led-001');
        break;
      case 5:
        // Step 5: Switch to Retailer C (Metro Home Supplies) and pledge 45 units to reach 100 cartons!
        switchUser('user-buyer-3');
        joinCampaign('camp-led-001', 45);
        setActiveView('campaign-detail', 'camp-led-001');
        break;
      case 6:
        // Step 6: Verify 100 cartons reached & 8% tier unlocked
        setActiveView('campaign-detail', 'camp-led-001');
        break;
      case 7:
        // Step 7: Verify tier schedule
        break;
      case 8:
        // Step 8: Log in as Supplier & confirm quotation
        switchUser('user-supplier');
        submitSupplierQuotation('camp-led-001', {
          quotationNumber: 'QT-2026-991',
          unitPricePaise: 100000,
          appliedDiscountPercent: 8,
          deliveryChargePaise: 150000,
          deliveryTerms: 'Factory gate delivery to regional hubs',
          paymentTerms: 'Payment via BulkBridge escrow simulated billing',
          validUntil: '2026-04-30',
          leadTimeDays: 7,
          status: 'ACCEPTED',
          submittedAt: new Date().toISOString(),
        });
        setActiveView('supplier-campaigns');
        break;
      case 9:
        // Step 9: Switch to Organizer & generate PO
        switchUser('user-organizer');
        generatePurchaseOrder('camp-led-001');
        setActiveView('organizer-campaigns');
        break;
      case 10:
        // Step 10: Retailers approve final allocation
        approveParticipantTerms('camp-led-001', 'org-greenmart');
        approveParticipantTerms('camp-led-001', 'org-lakshmi');
        approveParticipantTerms('camp-led-001', 'org-metrohome');
        break;
      case 11:
        // Step 11: View generated invoices
        switchUser('user-buyer-1');
        setActiveViewState('retailer-invoices');
        break;
      case 12:
        // Step 12: Complete successful payment for Retailer A
        const greenmartInv = state.invoices.find((i) => i.buyerOrganizationId === 'org-greenmart' && i.status === 'UNPAID') || state.invoices[0];
        if (greenmartInv) {
          recordPaymentAttempt(greenmartInv.id, greenmartInv.outstandingBalancePaise, 'UPI', 'SUCCESS');
        }
        break;
      case 13:
        // Step 13: Switch to Retailer B, simulate failed payment then retry successfully
        switchUser('user-buyer-2');
        const lakshmiInv = state.invoices.find((i) => i.buyerOrganizationId === 'org-lakshmi') || state.invoices[1];
        if (lakshmiInv) {
          const res = recordPaymentAttempt(lakshmiInv.id, lakshmiInv.outstandingBalancePaise, 'CREDIT_CARD', 'FAILED');
          setTimeout(() => {
            if (res.payment) {
              retryPayment(res.payment.id, 'BANK_TRANSFER_NEFT', true);
            }
          }, 1500);
        }
        break;
      case 14:
        // Step 14: Switch to Retailer C, simulate pending payment then resolve
        switchUser('user-buyer-3');
        const metroInv = state.invoices.find((i) => i.buyerOrganizationId === 'org-metrohome' && i.status === 'UNPAID') || state.invoices[2];
        if (metroInv) {
          const res = recordPaymentAttempt(metroInv.id, metroInv.outstandingBalancePaise, 'BANK_TRANSFER_NEFT', 'PENDING');
          setTimeout(() => {
            if (res.payment) {
              resolvePendingPayment(res.payment.id);
            }
          }, 1500);
        }
        break;
      case 15:
        // Step 15: Check updated balances
        setActiveViewState('retailer-payments');
        break;
      case 16:
        // Step 16: Log in as Warehouse operator
        switchUser('user-warehouse');
        setActiveViewState('warehouse-overview');
        break;
      case 17:
        // Step 17: Dispatch shipment
        if (state.shipments.length > 0) {
          updateShipmentStatus(state.shipments[0].id, 'DISPATCHED', 'VRL Depot Hub', 'Handed over for bulk transport');
        }
        setActiveViewState('warehouse-shipments');
        break;
      case 18:
        // Step 18: Complete delivery
        if (state.shipments.length > 0) {
          updateShipmentStatus(state.shipments[0].id, 'DELIVERED', 'Destination Retail Store', 'All items received in pristine condition');
        }
        break;
      case 19:
        // Step 19: Inspect inventory movements
        setActiveViewState('warehouse-inventory');
        break;
      case 20:
        // Step 20: Open Finance & verify zero-residual reconciliation
        switchUser('user-finance');
        setActiveViewState('finance-reconciliation');
        break;
      case 21:
        // Step 21: Open Audit Log & inspect immutable history
        switchUser('user-auditor');
        setActiveViewState('admin-audit');
        break;
    }
  };

  return (
    <AppContext.Provider
      value={{
        state,
        currentUser,
        currentOrg,
        toasts,
        activeView,
        activeCampaignId,
        activeInvoiceId,
        activeOrderId,
        demoGuideOpen,
        demoGuideStep,
        setActiveView,
        setDemoGuideOpen,
        setDemoGuideStep,
        switchUser,
        addToast,
        removeToast,
        resetDemo,
        createCampaign,
        joinCampaign,
        withdrawFromCampaign,
        submitSupplierQuotation,
        approveParticipantTerms,
        generatePurchaseOrder,
        recordPaymentAttempt,
        resolvePendingPayment,
        retryPayment,
        issueRefund,
        createShipment,
        updateShipmentStatus,
        submitReturnRequest,
        approveReturnRequest,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        runDemoScenarioStep,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
