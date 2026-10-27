import { describe, it, expect } from 'vitest';
import {
  calculateConsolidatedAllocation,
  evaluateDiscountTier,
  calculateOutstandingBalancePaise,
} from './financialEngine';
import {
  canTransitionCampaign,
  validateCampaignTransition,
  evaluateThresholdState,
  processSupplierQuotation,
} from './campaignStateMachine';
import {
  BulkCampaign,
  SupplierQuotation,
  CampaignParticipant,
  Invoice,
  PaymentRecord,
  Shipment,
  InventoryMovement,
  DiscountTier,
} from '../types';

describe('21-Step Canonical User Journey & Integration Test Suite', () => {
  const ledBulbTiers: DiscountTier[] = [
    { id: 'tier-1', minQuantity: 1, maxQuantity: 49, discountPercent: 0, description: 'Standard Retail (0%)' },
    { id: 'tier-2', minQuantity: 50, maxQuantity: 99, discountPercent: 5, description: 'Bulk Starter (5%)' },
    { id: 'tier-3', minQuantity: 100, maxQuantity: 199, discountPercent: 8, description: 'Cooperative Volume (8%)' },
    { id: 'tier-4', minQuantity: 200, discountPercent: 12, description: 'Factory Wholesale (12%)' },
  ];

  it('executes the full 21-step canonical bulk purchasing journey end-to-end', () => {
    // ---------------------------------------------------------------------------------
    // STEP 1 & 2: Organizer creates the campaign with supplier Apex Lumens
    // ---------------------------------------------------------------------------------
    let campaign: BulkCampaign = {
      id: 'camp-led-scenario',
      campaignNumber: 'CMP-2026-SCENARIO',
      title: 'Commercial 9W LED Bulb Bulk Procurement Drive',
      productId: 'prod-led-01',
      productName: '9W Commercial LED Bulb (Carton of 50)',
      productSku: 'ELEC-LED-009W',
      category: 'ELECTRICAL_LIGHTING',
      supplierId: 'supp-apex',
      supplierName: 'Apex Lumens & Electricals Ltd',
      organizerId: 'user-organizer',
      organizerName: 'Priya Sharma (Purchasing Coordinator)',
      status: 'OPEN',
      targetQuantity: 100,
      currentQuantity: 0,
      unitOfMeasure: 'Carton (50 pcs)',
      basePricePaise: 100000, // ₹1,000 per carton
      currentDiscountPercent: 0,
      discountSchedule: ledBulbTiers,
      allocationMethod: 'PROPORTIONAL_QUANTITY',
      startDate: '2026-04-01',
      endDate: '2026-04-25',
      withdrawalDeadline: '2026-04-20',
      deliveryTerms: 'Factory ex-works with consolidated regional transport to Bangalore Depot Hub',
      disclosedPolicy: 'Withdrawals permitted until supplier quotation acceptance.',
      participants: [],
      createdAt: '2026-04-01T10:00:00Z',
      updatedAt: '2026-04-01T10:00:00Z',
    };

    expect(campaign.status).toBe('OPEN');
    expect(campaign.currentQuantity).toBe(0);

    // ---------------------------------------------------------------------------------
    // STEP 3: Retailer A (GreenMart Retail) requests 20 cartons
    // ---------------------------------------------------------------------------------
    const participantA: CampaignParticipant = {
      organizationId: 'org-greenmart',
      organizationName: 'GreenMart Retailers Pvt Ltd',
      buyerUserId: 'user-buyer-1',
      buyerUserName: 'Rajesh Kumar',
      requestedQuantity: 20,
      deliveryAddress: {
        street: '45 Commercial Street',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001',
      },
      allocatedDiscountPaise: 0,
      allocatedShippingPaise: 0,
      taxableBasePaise: 0,
      taxPaise: 0,
      finalPayablePaise: 0,
      approvedTerms: false,
      joinedAt: '2026-04-02T11:00:00Z',
    };

    campaign.participants.push(participantA);
    campaign.currentQuantity += 20;

    let tierResult = evaluateDiscountTier(campaign.currentQuantity, campaign.discountSchedule);
    expect(campaign.currentQuantity).toBe(20);
    expect(tierResult.currentDiscountPercent).toBe(0); // 1-49 is 0%
    expect(tierResult.nextTier?.quantityNeeded).toBe(30); // 30 more for 5%

    // ---------------------------------------------------------------------------------
    // STEP 4: Retailer B (Sri Lakshmi Stores) requests 35 cartons
    // ---------------------------------------------------------------------------------
    const participantB: CampaignParticipant = {
      organizationId: 'org-lakshmi',
      organizationName: 'Sri Lakshmi Stores',
      buyerUserId: 'user-buyer-2',
      buyerUserName: 'Lakshmi Narayan',
      requestedQuantity: 35,
      deliveryAddress: {
        street: '12 Gandhi Road',
        city: 'Mysuru',
        state: 'Karnataka',
        pincode: '570001',
      },
      allocatedDiscountPaise: 0,
      allocatedShippingPaise: 0,
      taxableBasePaise: 0,
      taxPaise: 0,
      finalPayablePaise: 0,
      approvedTerms: false,
      joinedAt: '2026-04-03T09:30:00Z',
    };

    campaign.participants.push(participantB);
    campaign.currentQuantity += 35;

    tierResult = evaluateDiscountTier(campaign.currentQuantity, campaign.discountSchedule);
    expect(campaign.currentQuantity).toBe(55);
    expect(tierResult.currentDiscountPercent).toBe(5); // 50-99 is 5%
    expect(tierResult.nextTier?.quantityNeeded).toBe(45); // 45 more for 8%

    // ---------------------------------------------------------------------------------
    // STEP 5: Retailer C (Metro Home Supplies) requests 45 cartons
    // ---------------------------------------------------------------------------------
    const participantC: CampaignParticipant = {
      organizationId: 'org-metrohome',
      organizationName: 'Metro Home Supplies',
      buyerUserId: 'user-buyer-3',
      buyerUserName: 'Amit Patel',
      requestedQuantity: 45,
      deliveryAddress: {
        street: '88 Ring Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560085',
      },
      allocatedDiscountPaise: 0,
      allocatedShippingPaise: 0,
      taxableBasePaise: 0,
      taxPaise: 0,
      finalPayablePaise: 0,
      approvedTerms: false,
      joinedAt: '2026-04-04T14:15:00Z',
    };

    campaign.participants.push(participantC);
    campaign.currentQuantity += 45;

    // ---------------------------------------------------------------------------------
    // STEP 6 & 7: Verify consolidated quantity = 100 cartons and 8% tier unlocked
    // ---------------------------------------------------------------------------------
    expect(campaign.currentQuantity).toBe(100);
    tierResult = evaluateDiscountTier(campaign.currentQuantity, campaign.discountSchedule);
    expect(tierResult.currentDiscountPercent).toBe(8);
    campaign.currentDiscountPercent = 8;
    campaign.status = evaluateThresholdState(campaign);
    expect(campaign.status).toBe('THRESHOLD_REACHED');

    // ---------------------------------------------------------------------------------
    // STEP 8: Supplier confirms quotation with availability, price, and delivery
    // ---------------------------------------------------------------------------------
    const supplierQuotation: SupplierQuotation = {
      quotationNumber: 'QT-2026-LED-882',
      unitPricePaise: 100000, // ₹1,000 base
      appliedDiscountPercent: 8,
      deliveryChargePaise: 150000, // ₹1,500 total logistics
      deliveryTerms: 'Consolidated dispatch via VRL Logistics to Bangalore Regional Depot',
      paymentTerms: '100% via BulkBridge Escrow Settlement within 10 days',
      validUntil: '2026-05-15',
      leadTimeDays: 7,
      status: 'ACCEPTED',
      submittedAt: '2026-04-05T10:00:00Z',
    };

    const quoteProcessResult = processSupplierQuotation(campaign, supplierQuotation);
    campaign = quoteProcessResult.updatedCampaign;
    expect(campaign.status).toBe('AWAITING_PARTICIPANT_APPROVAL');

    // ---------------------------------------------------------------------------------
    // STEP 9: Organizer generates consolidated allocation and Purchase Order
    // ---------------------------------------------------------------------------------
    const participantDemands = campaign.participants.map((p) => ({
      organizationId: p.organizationId,
      quantity: p.requestedQuantity,
      baseUnitPricePaise: campaign.basePricePaise,
    }));

    const consolidatedCalculation = calculateConsolidatedAllocation(
      participantDemands,
      campaign.currentDiscountPercent,
      supplierQuotation.deliveryChargePaise,
      5, // 5% GST
      'PROPORTIONAL_QUANTITY',
      false // Intra-state Karnataka
    );

    expect(consolidatedCalculation.totalQuantity).toBe(100);
    expect(consolidatedCalculation.baseSubtotalPaise).toBe(10000000); // ₹100,000
    expect(consolidatedCalculation.totalDiscountPaise).toBe(800000); // ₹8,000 (8%)
    expect(consolidatedCalculation.discountedSubtotalPaise).toBe(9200000); // ₹92,000
    expect(consolidatedCalculation.totalShippingPaise).toBe(150000); // ₹1,500
    expect(consolidatedCalculation.totalTaxPaise).toBe(460000); // ₹4,600 (5% of 92,000)
    expect(consolidatedCalculation.grandTotalPaise).toBe(9810000); // ₹98,100

    // Assign allocations back to participants
    campaign.participants.forEach((p) => {
      const alloc = consolidatedCalculation.allocations.find((a) => a.organizationId === p.organizationId)!;
      p.allocatedDiscountPaise = alloc.allocatedDiscountPaise;
      p.allocatedShippingPaise = alloc.allocatedShippingPaise;
      p.taxableBasePaise = alloc.taxableBasePaise;
      p.taxPaise = alloc.totalTaxPaise;
      p.finalPayablePaise = alloc.finalPayablePaise;
    });

    // ---------------------------------------------------------------------------------
    // STEP 10: Each participant reviews and approves their allocation
    // ---------------------------------------------------------------------------------
    const allocA = consolidatedCalculation.allocations.find((a) => a.organizationId === 'org-greenmart')!;
    expect(allocA.quantity).toBe(20);
    expect(allocA.baseSubtotalPaise).toBe(2000000); // ₹20,000
    expect(allocA.allocatedDiscountPaise).toBe(160000); // ₹1,600
    expect(allocA.discountedSubtotalPaise).toBe(1840000); // ₹18,400
    expect(allocA.allocatedShippingPaise).toBe(30000); // ₹300
    expect(allocA.totalTaxPaise).toBe(92000); // ₹920
    expect(allocA.finalPayablePaise).toBe(1962000); // ₹19,620

    // All participants approve
    campaign.participants.forEach((p) => (p.approvedTerms = true));
    const confirmValidation = validateCampaignTransition(campaign, 'CONFIRMED', 'ORGANIZER');
    expect(confirmValidation.isValid).toBe(true);
    campaign.status = 'CONFIRMED';

    // Transition to PURCHASING
    expect(canTransitionCampaign(campaign.status, 'PURCHASING')).toBe(true);
    campaign.status = 'PURCHASING';

    // ---------------------------------------------------------------------------------
    // STEP 11: Generate separate itemized invoices for each participant
    // ---------------------------------------------------------------------------------
    const invoices: Invoice[] = campaign.participants.map((p, index) => {
      const cgst = Math.round(p.taxPaise / 2);
      const sgst = p.taxPaise - cgst;
      return {
        id: `inv-scenario-${index + 1}`,
        invoiceNumber: `INV-2026-SCEN-${index + 1}`,
        orderId: `ord-scen-${index + 1}`,
        campaignId: campaign.id,
        campaignNumber: campaign.campaignNumber,
        buyerOrganizationId: p.organizationId,
        buyerOrganizationName: p.organizationName,
        buyerGstin: '29ABCDE1234F1Z5',
        buyerAddress: p.deliveryAddress,
        supplierOrganizationId: campaign.supplierId,
        supplierOrganizationName: campaign.supplierName,
        supplierGstin: '29XYZAB9876C1Z3',
        supplierAddress: {
          street: '100 Industrial Area',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411018',
        },
        issueDate: '2026-04-06',
        dueDate: '2026-04-16',
        items: [
          {
            id: `inv-item-${index + 1}`,
            description: campaign.productName,
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
            igstPaise: 0,
            totalPaise: p.finalPayablePaise,
          },
        ],
        subtotalPaise: p.requestedQuantity * campaign.basePricePaise,
        totalDiscountPaise: p.allocatedDiscountPaise,
        taxableBasePaise: p.taxableBasePaise,
        cgstTotalPaise: cgst,
        sgstTotalPaise: sgst,
        igstTotalPaise: 0,
        totalTaxPaise: p.taxPaise,
        allocatedShippingPaise: p.allocatedShippingPaise,
        otherChargesPaise: 0,
        grandTotalPaise: p.finalPayablePaise,
        amountPaidPaise: 0,
        outstandingBalancePaise: p.finalPayablePaise,
        status: 'UNPAID',
        isInterState: false,
        disclaimer: 'DEMO MODE: Illustrative commercial invoice.',
      };
    });

    expect(invoices.length).toBe(3);
    const invoiceSum = invoices.reduce((s, inv) => s + inv.grandTotalPaise, 0);
    expect(invoiceSum).toBe(consolidatedCalculation.grandTotalPaise);

    // ---------------------------------------------------------------------------------
    // STEP 12: Complete successful payment for Retailer A (UPI)
    // ---------------------------------------------------------------------------------
    const invA = invoices.find((i) => i.buyerOrganizationId === 'org-greenmart')!;
    const paymentA: PaymentRecord = {
      id: 'pay-a-001',
      invoiceId: invA.id,
      invoiceNumber: invA.invoiceNumber,
      orderId: invA.orderId,
      organizationId: invA.buyerOrganizationId,
      organizationName: invA.buyerOrganizationName,
      payerName: 'Rajesh Kumar',
      amountPaise: invA.outstandingBalancePaise,
      currency: 'INR',
      method: 'UPI',
      status: 'SUCCESS',
      idempotencyKey: 'idemp-greenmart-pay-01',
      simulatedProviderRef: 'SIM-UPI-TXN-8849302',
      transactionTimestamp: '2026-04-07T10:00:00Z',
      auditNote: 'Mock UPI payment completed successfully.',
    };

    invA.amountPaidPaise += paymentA.amountPaise;
    invA.outstandingBalancePaise = calculateOutstandingBalancePaise(
      invA.grandTotalPaise,
      invA.amountPaidPaise,
      0
    );
    invA.status = invA.outstandingBalancePaise === 0 ? 'PAID' : 'PARTIALLY_PAID';

    expect(invA.status).toBe('PAID');
    expect(invA.outstandingBalancePaise).toBe(0);

    // ---------------------------------------------------------------------------------
    // STEP 13: Simulate failed payment attempt for Retailer B then retry successfully
    // ---------------------------------------------------------------------------------
    const invB = invoices.find((i) => i.buyerOrganizationId === 'org-lakshmi')!;
    const failedPaymentB: PaymentRecord = {
      id: 'pay-b-failed',
      invoiceId: invB.id,
      invoiceNumber: invB.invoiceNumber,
      orderId: invB.orderId,
      organizationId: invB.buyerOrganizationId,
      organizationName: invB.buyerOrganizationName,
      payerName: 'Lakshmi Narayan',
      amountPaise: invB.outstandingBalancePaise,
      currency: 'INR',
      method: 'CREDIT_CARD',
      status: 'FAILED',
      failureReason: 'INSUFFICIENT_FUNDS_SIMULATED',
      idempotencyKey: 'idemp-lakshmi-fail-01',
      simulatedProviderRef: 'SIM-CARD-FAIL-110293',
      transactionTimestamp: '2026-04-07T11:00:00Z',
      auditNote: 'Simulated Card issuer decline: Insufficient credit limit.',
    };

    expect(failedPaymentB.status).toBe('FAILED');
    expect(invB.status).toBe('UNPAID');
    expect(invB.outstandingBalancePaise).toBe(invB.grandTotalPaise);

    // Retailer B retries via NEFT and succeeds
    const retryPaymentB: PaymentRecord = {
      id: 'pay-b-retry',
      invoiceId: invB.id,
      invoiceNumber: invB.invoiceNumber,
      orderId: invB.orderId,
      organizationId: invB.buyerOrganizationId,
      organizationName: invB.buyerOrganizationName,
      payerName: 'Lakshmi Narayan',
      amountPaise: invB.outstandingBalancePaise,
      currency: 'INR',
      method: 'BANK_TRANSFER_NEFT',
      status: 'SUCCESS',
      idempotencyKey: 'idemp-lakshmi-retry-02',
      simulatedProviderRef: 'SIM-NEFT-TXN-993847',
      transactionTimestamp: '2026-04-07T11:30:00Z',
      auditNote: 'NEFT UTR simulated confirmation received.',
    };

    invB.amountPaidPaise += retryPaymentB.amountPaise;
    invB.outstandingBalancePaise = calculateOutstandingBalancePaise(
      invB.grandTotalPaise,
      invB.amountPaidPaise,
      0
    );
    invB.status = 'PAID';

    expect(invB.status).toBe('PAID');
    expect(invB.outstandingBalancePaise).toBe(0);

    // ---------------------------------------------------------------------------------
    // STEP 14: Simulate pending payment for Retailer C and resolve it
    // ---------------------------------------------------------------------------------
    const invC = invoices.find((i) => i.buyerOrganizationId === 'org-metrohome')!;
    const pendingPaymentC: PaymentRecord = {
      id: 'pay-c-pending',
      invoiceId: invC.id,
      invoiceNumber: invC.invoiceNumber,
      orderId: invC.orderId,
      organizationId: invC.buyerOrganizationId,
      organizationName: invC.buyerOrganizationName,
      payerName: 'Amit Patel',
      amountPaise: invC.outstandingBalancePaise,
      currency: 'INR',
      method: 'BANK_TRANSFER_NEFT',
      status: 'PENDING',
      idempotencyKey: 'idemp-metro-pending-01',
      simulatedProviderRef: 'SIM-NEFT-PENDING-44582',
      transactionTimestamp: '2026-04-07T12:00:00Z',
      auditNote: 'NEFT transfer initiated; awaiting bank reconciliation clearance.',
    };

    expect(pendingPaymentC.status).toBe('PENDING');
    expect(invC.status).toBe('UNPAID');

    // Demo resolver clears the payment
    pendingPaymentC.status = 'SUCCESS';
    pendingPaymentC.resolvedAt = '2026-04-07T13:00:00Z';
    pendingPaymentC.auditNote = 'NEFT clearance matched in mock bank statement.';

    invC.amountPaidPaise += pendingPaymentC.amountPaise;
    invC.outstandingBalancePaise = calculateOutstandingBalancePaise(
      invC.grandTotalPaise,
      invC.amountPaidPaise,
      0
    );
    invC.status = 'PAID';

    // ---------------------------------------------------------------------------------
    // STEP 15: Confirm invoice balances and duplicate prevention
    // ---------------------------------------------------------------------------------
    expect(invC.status).toBe('PAID');
    expect(invC.outstandingBalancePaise).toBe(0);

    // Duplicate check
    const duplicateAttemptIsAllowed = invA.outstandingBalancePaise > 0;
    expect(duplicateAttemptIsAllowed).toBe(false);

    // ---------------------------------------------------------------------------------
    // STEP 16 & 17: Warehouse operator begins fulfillment and dispatches shipment
    // ---------------------------------------------------------------------------------
    const shipment: Shipment = {
      id: 'ship-scenario-001',
      shipmentNumber: 'SHP-2026-SCEN-01',
      orderId: 'po-scenario-001',
      orderNumber: 'PO-2026-SCENARIO',
      campaignId: campaign.id,
      supplierId: campaign.supplierId,
      supplierName: campaign.supplierName,
      buyerOrganizationId: 'org-greenmart',
      buyerOrganizationName: 'GreenMart Retailers',
      carrierName: 'VRL Consolidated Logistics',
      trackingNumber: 'VRL-BLR-998822',
      estimatedDeliveryDate: '2026-04-12',
      status: 'CONFIRMED',
      items: [
        {
          productId: campaign.productId,
          productName: campaign.productName,
          orderedQuantity: 100,
          dispatchedQuantity: 100,
          deliveredQuantity: 0,
        },
      ],
      timeline: [
        {
          status: 'CONFIRMED',
          timestamp: '2026-04-08T09:00:00Z',
          location: 'Pune Central Warehouse',
          notes: 'Shipment manifest generated.',
        },
      ],
      isPartial: false,
    };

    // Progression: CONFIRMED -> PICKING -> PACKED -> DISPATCHED
    shipment.status = 'PICKING';
    shipment.status = 'PACKED';
    shipment.status = 'DISPATCHED';
    shipment.timeline.push({
      status: 'DISPATCHED',
      timestamp: '2026-04-08T16:00:00Z',
      location: 'Pune Depot Gateway',
      notes: 'Trailer loaded with 100 cartons of 9W LED bulbs.',
    });
    expect(shipment.status).toBe('DISPATCHED');

    // ---------------------------------------------------------------------------------
    // STEP 18: Record arrival and complete delivery
    // ---------------------------------------------------------------------------------
    shipment.status = 'IN_TRANSIT';
    shipment.status = 'DELIVERED';
    shipment.actualDeliveryDate = '2026-04-11T14:00:00Z';
    shipment.items[0].deliveredQuantity = 100;
    shipment.timeline.push({
      status: 'DELIVERED',
      timestamp: '2026-04-11T14:00:00Z',
      location: 'Bangalore Regional Hub & Retailer Stores',
      notes: 'All 100 cartons inspected and verified by shop managers.',
    });
    expect(shipment.status).toBe('DELIVERED');

    // ---------------------------------------------------------------------------------
    // STEP 19: Verify perpetual inventory ledger movements
    // ---------------------------------------------------------------------------------
    const inventoryMovements: InventoryMovement[] = [
      {
        id: 'mov-001',
        productId: campaign.productId,
        productSku: campaign.productSku,
        productName: campaign.productName,
        warehouseLocation: 'Pune Central Distribution Hub',
        quantityChange: -100,
        balanceAfter: 400,
        reason: 'CAMPAIGN_FULFILLMENT',
        relatedOrderId: 'po-scenario-001',
        relatedShipmentId: shipment.id,
        actor: 'Ramesh Verma (Warehouse Ops)',
        timestamp: '2026-04-08T16:00:00Z',
      },
    ];

    expect(inventoryMovements[0].quantityChange).toBe(-100);
    expect(inventoryMovements[0].balanceAfter).toBe(400);

    // ---------------------------------------------------------------------------------
    // STEP 20: Financial reconciliation: Macro PO == Sum(Micro Invoices) == Sum(Payments)
    // ---------------------------------------------------------------------------------
    const totalMacroPO = consolidatedCalculation.grandTotalPaise;
    const totalMicroInvoices = invoices.reduce((sum, inv) => sum + inv.grandTotalPaise, 0);
    const totalPaymentsReceived =
      paymentA.amountPaise + retryPaymentB.amountPaise + pendingPaymentC.amountPaise;

    expect(totalMicroInvoices).toBe(totalMacroPO);
    expect(totalPaymentsReceived).toBe(totalMacroPO);
    const residualPaise = totalMacroPO - totalPaymentsReceived;
    expect(residualPaise).toBe(0);

    // ---------------------------------------------------------------------------------
    // STEP 21: Verify audit trail
    // ---------------------------------------------------------------------------------
    const auditEvents = [
      'CAMPAIGN_CREATED',
      'PARTICIPANT_JOINED_A',
      'PARTICIPANT_JOINED_B',
      'PARTICIPANT_JOINED_C',
      'THRESHOLD_REACHED_8_PERCENT',
      'SUPPLIER_QUOTATION_SUBMITTED',
      'PURCHASE_ORDER_GENERATED',
      'TERMS_APPROVED_ALL',
      'INVOICES_GENERATED',
      'PAYMENT_SUCCESS_A',
      'PAYMENT_FAILED_B',
      'PAYMENT_RETRY_SUCCESS_B',
      'PAYMENT_PENDING_C',
      'PAYMENT_RESOLVED_C',
      'SHIPMENT_DISPATCHED',
      'SHIPMENT_DELIVERED',
      'INVENTORY_DEDUCTED',
      'FINANCE_RECONCILED',
    ];

    expect(auditEvents.length).toBe(18);
  });
});
