// BulkBridge Storage & Repository Service
// Provides persistent storage across reloads, versioned seed initialization, and demo reset.

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
} from '../types';

import {
  SEED_USERS,
  SEED_ORGANIZATIONS,
  SEED_PRODUCTS,
  SEED_CAMPAIGNS,
  SEED_ORDERS,
  SEED_INVOICES,
  SEED_PAYMENTS,
  SEED_SHIPMENTS,
  SEED_INVENTORY_MOVEMENTS,
  SEED_RETURNS,
  SEED_CREDIT_NOTES,
  SEED_NOTIFICATIONS,
  SEED_AUDIT_EVENTS,
  SEED_SUPPORT_CASES,
} from './mockDataSeed';

const STORAGE_VERSION = 'bulkbridge_v1.2_seed';

export interface AppStateData {
  version: string;
  currentUser: User;
  users: User[];
  organizations: Organization[];
  products: Product[];
  campaigns: BulkCampaign[];
  orders: ParticipantOrder[];
  invoices: Invoice[];
  payments: PaymentRecord[];
  shipments: Shipment[];
  inventoryMovements: InventoryMovement[];
  returns: ReturnCase[];
  creditNotes: CreditNote[];
  notifications: NotificationItem[];
  auditEvents: AuditEvent[];
  supportCases: SupportCase[];
}

const STORAGE_KEY = 'bulkbridge_app_state';

/**
 * Initializes or loads persistent state.
 */
export function loadInitialState(): AppStateData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: AppStateData = JSON.parse(raw);
      if (parsed && parsed.version === STORAGE_VERSION) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not parse stored BulkBridge state, falling back to seed data:', err);
  }

  // Fallback to fresh seed state
  const freshState = getFreshSeedState();
  saveStateToStorage(freshState);
  return freshState;
}

/**
 * Generates fresh seed data.
 */
export function getFreshSeedState(): AppStateData {
  return {
    version: STORAGE_VERSION,
    currentUser: SEED_USERS[0], // Default to Admin, easily switchable via Quick Switcher
    users: [...SEED_USERS],
    organizations: [...SEED_ORGANIZATIONS],
    products: [...SEED_PRODUCTS],
    campaigns: JSON.parse(JSON.stringify(SEED_CAMPAIGNS)),
    orders: JSON.parse(JSON.stringify(SEED_ORDERS)),
    invoices: JSON.parse(JSON.stringify(SEED_INVOICES)),
    payments: JSON.parse(JSON.stringify(SEED_PAYMENTS)),
    shipments: JSON.parse(JSON.stringify(SEED_SHIPMENTS)),
    inventoryMovements: JSON.parse(JSON.stringify(SEED_INVENTORY_MOVEMENTS)),
    returns: JSON.parse(JSON.stringify(SEED_RETURNS)),
    creditNotes: JSON.parse(JSON.stringify(SEED_CREDIT_NOTES)),
    notifications: JSON.parse(JSON.stringify(SEED_NOTIFICATIONS)),
    auditEvents: JSON.parse(JSON.stringify(SEED_AUDIT_EVENTS)),
    supportCases: JSON.parse(JSON.stringify(SEED_SUPPORT_CASES)),
  };
}

/**
 * Saves current application state to browser storage.
 */
export function saveStateToStorage(state: AppStateData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to persist BulkBridge state to localStorage:', err);
  }
}

/**
 * Resets storage back to clean initial seed data.
 */
export function resetStorageToSeed(): AppStateData {
  const fresh = getFreshSeedState();
  saveStateToStorage(fresh);
  return fresh;
}

/**
 * Exports current database state as downloadable JSON.
 */
export function exportStateAsJSON(state: AppStateData): string {
  return JSON.stringify(state, null, 2);
}

/**
 * Imports state from JSON string.
 */
export function importStateFromJSON(jsonString: string): AppStateData | null {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed && parsed.users && parsed.campaigns) {
      saveStateToStorage(parsed);
      return parsed;
    }
  } catch (err) {
    console.error('Invalid JSON imported:', err);
  }
  return null;
}
