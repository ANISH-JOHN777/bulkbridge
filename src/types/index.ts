// BulkBridge Enterprise Type Definitions

export type UserRole = 
  | 'ADMIN' 
  | 'RETAILER' 
  | 'ORGANIZER' 
  | 'SUPPLIER' 
  | 'FINANCE' 
  | 'WAREHOUSE' 
  | 'AUDITOR';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId: string;
  avatarUrl?: string;
  phone?: string;
  designation?: string;
}

export type OrganizationType = 'BUYER' | 'SUPPLIER' | 'ORGANIZER_COOP' | 'PLATFORM';

export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  gstin: string; // Fictional sample GSTIN (clearly marked)
  pan: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  contactEmail: string;
  contactPhone: string;
  isVerified: boolean;
  creditLimitPaise?: number;
  availableCreditPaise?: number;
  bankAccountDetails?: {
    accountNumber: string;
    bankName: string;
    ifscCode: string;
    accountHolder: string;
  };
  industryCategory?: string;
}

export type ProductCategory = 
  | 'FMCG_GROCERY'
  | 'AGRICULTURAL'
  | 'TEXTILES_GARMENTS'
  | 'ELECTRICAL_LIGHTING'
  | 'HARDWARE_CONSTRUCTION'
  | 'PACKAGING_MATERIALS'
  | 'OFFICE_SUPPLIES'
  | 'ELECTRONICS_ACCESSORIES';

export interface DiscountTier {
  id: string;
  minQuantity: number;
  maxQuantity?: number; // undefined means unlimited
  discountPercent: number; // e.g. 5 for 5%
  description?: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  variantAttributes: Record<string, string>; // e.g. { Wattage: "9W", Color: "Cool Day White" }
  priceDeltaPaise: number; // additional or discounted paise relative to base
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  supplierId: string;
  supplierName: string;
  unitOfMeasure: string; // e.g., 'Carton (50 pcs)', 'Bag (50 kg)', 'Roll (100 m)'
  basePricePaise: number; // Stored in paise (integer)
  moq: number; // Minimum Order Quantity
  availableStock: number;
  taxRatePercent: number; // GST rate: 5, 12, 18, 28
  hsnCode: string;
  leadTimeDays: number;
  variants: ProductVariant[];
  discountTiers: DiscountTier[];
  isActive: boolean;
  description: string;
  imageUrl?: string;
  specifications: Record<string, string>;
}

export type CampaignStatus = 
  | 'DRAFT'
  | 'OPEN'
  | 'THRESHOLD_REACHED'
  | 'AWAITING_SUPPLIER_QUOTATION'
  | 'AWAITING_PARTICIPANT_APPROVAL'
  | 'CONFIRMED'
  | 'PURCHASING'
  | 'PARTIALLY_FULFILLED'
  | 'FULFILLED'
  | 'CLOSED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'REJECTED';

export type AllocationMethod = 'PROPORTIONAL_VALUE' | 'PROPORTIONAL_QUANTITY' | 'EQUAL';

export interface CampaignParticipant {
  organizationId: string;
  organizationName: string;
  buyerUserId: string;
  buyerUserName: string;
  requestedQuantity: number;
  variantId?: string;
  variantName?: string;
  notes?: string;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  allocatedDiscountPaise: number;
  allocatedShippingPaise: number;
  taxableBasePaise: number;
  taxPaise: number;
  finalPayablePaise: number;
  approvedTerms: boolean;
  approvalTimestamp?: string;
  invoiceId?: string;
  orderId?: string;
  joinedAt: string;
}

export interface SupplierQuotation {
  quotationNumber: string;
  unitPricePaise: number;
  appliedDiscountPercent: number;
  deliveryChargePaise: number;
  deliveryTerms: string;
  paymentTerms: string;
  validUntil: string;
  leadTimeDays: number;
  status: 'PENDING' | 'ACCEPTED' | 'REVISED' | 'REJECTED';
  rejectionReason?: string;
  revisionNotes?: string;
  submittedAt: string;
  confirmedAt?: string;
}

export interface BulkCampaign {
  id: string;
  campaignNumber: string; // e.g. "CMP-2026-001"
  title: string;
  productId: string;
  productName: string;
  productSku: string;
  category: ProductCategory;
  supplierId: string;
  supplierName: string;
  organizerId: string;
  organizerName: string;
  status: CampaignStatus;
  targetQuantity: number;
  currentQuantity: number;
  unitOfMeasure: string;
  basePricePaise: number;
  currentDiscountPercent: number;
  nextTier?: {
    quantityNeeded: number;
    discountPercent: number;
  };
  discountSchedule: DiscountTier[];
  allocationMethod: AllocationMethod;
  startDate: string;
  endDate: string;
  withdrawalDeadline: string;
  deliveryTerms: string;
  disclosedPolicy: string;
  participants: CampaignParticipant[];
  quotation?: SupplierQuotation;
  purchaseOrderId?: string;
  createdAt: string;
  updatedAt: string;
  cancellationReason?: string;
}

export type OrderStatus = 
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'DISPATCHED'
  | 'IN_TRANSIT'
  | 'PARTIALLY_DELIVERED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED';

export type PaymentStatus = 
  | 'UNPAID'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'OVERDUE'
  | 'REFUNDED';

export interface ParticipantOrder {
  id: string;
  orderNumber: string;
  campaignId: string;
  campaignNumber: string;
  campaignTitle: string;
  organizationId: string;
  organizationName: string;
  buyerUserId: string;
  supplierId: string;
  supplierName: string;
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  unitOfMeasure: string;
  unitPricePaise: number;
  subtotalPaise: number;
  discountPaise: number;
  shippingPaise: number;
  taxableBasePaise: number;
  taxRatePercent: number;
  taxPaise: number;
  finalPayablePaise: number;
  amountPaidPaise: number;
  outstandingBalancePaise: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  invoiceId?: string;
  shipmentId?: string;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  createdAt: string;
  timeline: {
    status: OrderStatus;
    timestamp: string;
    note?: string;
    actor: string;
  }[];
}

export interface ConsolidatedPurchaseOrder {
  id: string;
  poNumber: string; // e.g. "PO-2026-9001"
  campaignId: string;
  campaignNumber: string;
  supplierId: string;
  supplierName: string;
  organizerId: string;
  organizerName: string;
  totalQuantity: number;
  unitOfMeasure: string;
  baseSubtotalPaise: number;
  totalDiscountPaise: number;
  totalShippingPaise: number;
  totalTaxPaise: number;
  grandTotalPaise: number;
  status: 'PENDING_SUPPLIER' | 'CONFIRMED' | 'FULFILLING' | 'COMPLETED' | 'CANCELLED';
  participantOrderIds: string[];
  issuedAt: string;
  confirmedAt?: string;
  deliveryTerms: string;
  paymentTerms: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  sku: string;
  quantity: number;
  unitOfMeasure: string;
  unitPricePaise: number;
  subtotalPaise: number;
  discountPaise: number;
  taxableBasePaise: number;
  taxRatePercent: number;
  cgstPaise: number;
  sgstPaise: number;
  igstPaise: number;
  totalPaise: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. "INV-2026-0842"
  orderId: string;
  campaignId: string;
  campaignNumber: string;
  buyerOrganizationId: string;
  buyerOrganizationName: string;
  buyerGstin: string;
  buyerAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  supplierOrganizationId: string;
  supplierOrganizationName: string;
  supplierGstin: string;
  supplierAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotalPaise: number;
  totalDiscountPaise: number;
  allocatedShippingPaise: number;
  otherChargesPaise: number;
  taxableBasePaise: number;
  totalTaxPaise: number;
  cgstTotalPaise: number;
  sgstTotalPaise: number;
  igstTotalPaise: number;
  grandTotalPaise: number;
  amountPaidPaise: number;
  outstandingBalancePaise: number;
  status: PaymentStatus;
  creditNoteTotalPaise?: number;
  isInterState: boolean; // true = IGST, false = CGST + SGST
  disclaimer: string;
}

export type PaymentMethodType = 
  | 'UPI' 
  | 'CREDIT_CARD' 
  | 'DEBIT_CARD' 
  | 'NET_BANKING' 
  | 'WALLET' 
  | 'BANK_TRANSFER_NEFT';

export type PaymentAttemptStatus = 'SUCCESS' | 'FAILED' | 'PENDING' | 'REFUNDED';

export interface PaymentRecord {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  orderId: string;
  organizationId: string;
  organizationName: string;
  amountPaise: number;
  currency: 'INR';
  method: PaymentMethodType;
  status: PaymentAttemptStatus;
  idempotencyKey: string;
  simulatedProviderRef: string;
  transactionTimestamp: string;
  failureReason?: string;
  refundRef?: string;
  refundedAmountPaise?: number;
  refundTimestamp?: string;
  auditNote?: string;
  resolvedAt?: string;
  payerName: string;
}

export type ShipmentStatus = 
  | 'CONFIRMED'
  | 'PICKING'
  | 'PACKED'
  | 'DISPATCHED'
  | 'IN_TRANSIT'
  | 'PARTIALLY_DELIVERED'
  | 'DELIVERED';

export interface ShipmentItem {
  productId: string;
  productName: string;
  orderedQuantity: number;
  dispatchedQuantity: number;
  deliveredQuantity: number;
}

export interface Shipment {
  id: string;
  shipmentNumber: string; // e.g. "SHP-2026-104"
  orderId: string;
  orderNumber: string;
  campaignId: string;
  supplierId: string;
  supplierName: string;
  buyerOrganizationId: string;
  buyerOrganizationName: string;
  carrierName: string; // e.g. "Delhivery Logistics", "BlueDart Apex", "VRL Logistics"
  trackingNumber: string;
  status: ShipmentStatus;
  items: ShipmentItem[];
  estimatedDeliveryDate: string;
  actualDeliveryDate?: string;
  timeline: {
    status: ShipmentStatus;
    timestamp: string;
    location: string;
    notes?: string;
  }[];
  isPartial: boolean;
  notes?: string;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  productSku: string;
  productName: string;
  warehouseLocation: string;
  quantityChange: number; // positive for restock, negative for fulfillment
  balanceAfter: number;
  reason: 'INITIAL_STOCK' | 'CAMPAIGN_FULFILLMENT' | 'SUPPLIER_RESTOCK' | 'RETURN_RESTOCK' | 'DAMAGE_WRITE_OFF';
  relatedOrderId?: string;
  relatedShipmentId?: string;
  actor: string;
  timestamp: string;
}

export interface ReturnCase {
  id: string;
  returnNumber: string;
  orderId: string;
  orderNumber: string;
  invoiceId: string;
  buyerOrganizationId: string;
  buyerOrganizationName: string;
  productId: string;
  productName: string;
  quantityReturned: number;
  reason: 'DAMAGED_IN_TRANSIT' | 'DEFECTIVE_PRODUCT' | 'WRONG_SPECIFICATION' | 'SHORTAGE';
  claimedAt: string;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'REFUND_COMPLETED';
  inspectionNotes?: string;
  creditNoteId?: string;
  refundAmountPaise?: number;
}

export interface CreditNote {
  id: string;
  creditNoteNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  buyerOrganizationId: string;
  buyerOrganizationName: string;
  amountPaise: number;
  reason: string;
  issuedAt: string;
}

export interface NotificationItem {
  id: string;
  targetUserId?: string;
  targetRole?: UserRole;
  targetOrgId?: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  link?: string;
  isRead: boolean;
  timestamp: string;
}

export interface AuditEvent {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string; // e.g. "CREATE_CAMPAIGN", "RECORD_PAYMENT", "UPDATE_SHIPMENT"
  entityType: 'CAMPAIGN' | 'ORDER' | 'INVOICE' | 'PAYMENT' | 'SHIPMENT' | 'USER' | 'QUOTATION' | 'RETURN';
  entityId: string;
  previousState?: string;
  newState?: string;
  reason?: string;
  timestamp: string;
}

export interface SupportCase {
  id: string;
  ticketNumber: string;
  organizationId: string;
  organizationName: string;
  subject: string;
  category: 'BILLING' | 'DELIVERY' | 'PRODUCT_QUALITY' | 'TECHNICAL' | 'CAMPAIGN';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
  messages: {
    senderName: string;
    senderRole: string;
    text: string;
    timestamp: string;
  }[];
}
