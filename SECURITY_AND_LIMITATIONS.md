# BulkBridge — Security, Compliance & Simulation Limitations

> **CRITICAL DEMO DISCLOSURE:**  
> BulkBridge is operating in **DEMONSTRATION MODE**. All financial transactions, GST calculations, payment gateways, and banking interactions are simulated. **No real money is transferred, and no real credit card numbers, CVVs, UPI PINs, or banking credentials are ever collected or processed.**

---

## 1. Simulated Payment Rails & Financial Safeguards

### What Is Simulated:
1. **Payment Methods:**
   - UPI (Virtual Payment Address simulation)
   - Credit / Debit Cards (Mock 16-digit card checkout)
   - Net Banking (Simulated retail and corporate bank portals)
   - NEFT / RTGS Bank Transfers (Simulated UTR tracking and clearance)
2. **Deterministic Scenarios:**
   - The demo checkout modal provides developer controls to force `SUCCESS`, `FAILED` (issuer decline / timeout), `PENDING` (manual clearance required), or `PARTIAL` payment outcomes.
3. **Idempotency & Double-Spending Prevention:**
   - Every simulated payment attempt generates a UUID-based idempotency key.
   - The application checks the invoice's `outstandingBalancePaise` before accepting funds. Attempting to pay an already settled invoice is blocked.

### What Is NOT Implemented (Production Requirements):
- **Escrow / Custodial Accounts:** BulkBridge does not hold real customer deposits or operate an authorized payment aggregator escrow account under Reserve Bank of India (RBI) regulations.
- **PCI-DSS Compliance:** The mock checkout form intentionally does not collect real card CVVs or cardholder numbers. A production deployment requires PCI-DSS certified tokenization (e.g., Stripe Elements, Razorpay Custom Checkout).
- **Bank Webhook Handlers:** In production, payment statuses must be updated via server-to-server cryptographically signed webhooks (HMAC SHA-256) rather than client-side promises.

---

## 2. Authentication & Authorization Boundaries

### Demonstration Architecture:
- In this demonstration build, authentication is handled via a **client-side role switcher** powered by React state and browser storage.
- All predefined demo accounts share a standard mock credential (`DemoUser2026!`).
- Protected views verify the active user role before rendering dashboard components.

### Production Security Deficits & Roadmap:
1. **Client-Side Role Enforcement is Not Security:**
   - Client-side role checks provide user experience differentiation, but do not prevent malicious tampering via browser developer tools.
2. **Production Authentication Roadmap:**
   - Replace with an enterprise identity provider (OAuth 2.0 / OpenID Connect with Auth0, AWS Cognito, or Keycloak).
   - Enforce server-side JSON Web Token (JWT) verification on all API endpoints.
   - Implement strict **PostgreSQL Row-Level Security (RLS)** ensuring tenant organization `$org_id` isolation.

---

## 3. Data Persistence & Multi-Tenant Isolation

### Demonstration Storage:
- State is serialized as JSON in browser `localStorage` (`bulkbridge_demo_state_v1.0`).
- Mutations are preserved across page refreshes on the local machine.
- Clicking **"Reset Demo Data"** restores pristine factory seed records.

### Limitations:
- **No Multi-User Synchronization:** Two different browser instances or devices do not share a synchronized state.
- **Storage Limits:** Browser localStorage is limited to ~5MB.

### Production Database Architecture:
- Migrate to **PostgreSQL 16** with Prisma or Drizzle ORM.
- Implement database transactions (`BEGIN...COMMIT`) to ensure atomic execution of purchase order generation, inventory decrementing, and invoice creation.

---

## 4. Tax & Regulatory Disclosures (GSTIN & E-Invoicing)

### Demonstration Context:
- GSTINs displayed (e.g., `29ABCDE1234F1Z5`) are **fictional demonstration identifiers** strictly formatted according to Indian 15-character GSTIN schema rules (State Code + PAN + Entity Number + Check Digit).
- GST calculations (CGST 2.5% + SGST 2.5% for intra-state, IGST 5% for inter-state) are illustrative commercial models.

### Production E-Invoicing Compliance:
- Production deployment requires direct integration with the **GST Network (GSTN) / Invoice Registration Portal (IRP)** via authorized GSP (GST Suvidha Provider) APIs.
- Mandatory generation of signed Invoice Reference Numbers (IRNs) and digitally signed QR codes for B2B invoices exceeding statutory turnover thresholds.

---

## 5. Security & Environment Configuration

### Required & Optional Environment Variables

When deploying the production backend and cloud infrastructure, the following environment variables are required:

| Variable Name | Required / Optional | Purpose |
| :--- | :--- | :--- |
| `VITE_APP_MODE` | Optional (defaults to `demo`) | Sets `demo` or `production` UI badges. |
| `DATABASE_URL` | Required in Production | PostgreSQL connection string with TLS `sslmode=require`. |
| `JWT_SECRET` | Required in Production | 256-bit secret key for signing session tokens. |
| `RAZORPAY_KEY_ID` | Optional in Production | Payment gateway public API key. |
| `RAZORPAY_KEY_SECRET` | Optional in Production | Payment gateway server webhook secret. |
| `GSTN_CLIENT_ID` | Optional in Production | Official E-Invoicing API credentials. |
| `GSTN_CLIENT_SECRET` | Optional in Production | Official E-Invoicing API client secret. |
| `SENTRY_DSN` | Optional | Application telemetry and error tracking. |

---

## 6. Responsible Disclosure

For questions or security disclosures regarding BulkBridge architecture, contact the architecture team at:  
`security@bulkbridge.demo`
