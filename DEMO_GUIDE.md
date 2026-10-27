# BulkBridge — Demonstration Guide & 21-Step Canonical Scenario

This guide provides a step-by-step walkthrough for evaluators, investors, and stakeholders to experience the complete collaborative purchasing journey in BulkBridge.

---

## 1. Quick Access to the 21-Step Automated Runner

BulkBridge includes a built-in automated scenario runner:
1. Open the application at **[http://localhost:5173/](http://localhost:5173/)**.
2. Click the **"21-Step Guide"** button in the top navigation bar.
3. The interactive modal will appear. You can click **"Execute Step"** to execute each step automatically or follow the manual instructions below.

---

## 2. Canonical Scenario Background: Commercial LED Bulbs

### The Business Context
Three independent retailers in Karnataka want to purchase commercial 9W LED bulbs for their retail stores. The manufacturer (**Apex Lumens & Lighting**) enforces the following volume discount schedule:

| Tier | Order Volume | Discount | Landed Unit Cost |
| :--- | :--- | :--- | :--- |
| **Tier 1 (Base)** | 1 – 49 Cartons | **0%** | ₹1,000 / carton |
| **Tier 2 (Bulk Starter)** | 50 – 99 Cartons | **5%** | ₹950 / carton |
| **Tier 3 (Cooperative Volume)** | 100 – 199 Cartons | **8%** | **₹920 / carton** |
| **Tier 4 (Factory Wholesale)** | 200+ Cartons | **12%** | ₹880 / carton |

- None of the three retailers can afford to purchase 100 cartons individually.
- By pooling their demand (20 + 35 + 45 = 100 cartons), they unlock the **8% wholesale volume discount**, saving a combined **₹8,000** on product subtotal, plus consolidated freight savings!

---

## 3. The 21-Step Walkthrough

### Step 1: Log In as the Purchasing Coordinator
- **Action:** In the top demo banner, click **"Organizer"** (or switch to `organizer@bulkbridge.demo`).
- **Result:** You arrive at the **Purchasing Coordinator Workspace**. You see active campaigns, aggregate demand counters, and pending supplier quotes.

### Step 2: Open the 9W Commercial LED Bulb Campaign
- **Action:** Click **"Campaigns"** in the sidebar, then select **"Commercial 9W LED Bulb Bulk Procurement"** (`CMP-2026-001`).
- **Result:** You see the campaign dashboard showing the tiered discount schedule, current target of 100 cartons, and active participants.

### Step 3: Switch to Retailer A (GreenMart Retail)
- **Action:** Switch role to **"Retail Shop Owner"** (Rajesh Kumar). Navigate to the LED bulb campaign.
- **Pledge:** Retailer A has pledged **20 cartons**.
- **Tier Status:** Current volume is 20 cartons. Discount is **0%** (needs 30 more cartons to unlock 5%).

### Step 4: Switch to Retailer B (Sri Lakshmi Stores)
- **Action:** Switch role to Retailer B (Lakshmi Narayan). Navigate to the LED bulb campaign.
- **Pledge:** Retailer B pledges **35 cartons**.
- **Tier Status:** Combined volume reaches **55 cartons**.
- **Result:** The system automatically unlocks **Tier 2 (5% discount)**! The progress bar shows 45 more cartons needed for Tier 3 (8%).

### Step 5: Switch to Retailer C (Metro Home Supplies) and Complete the Target
- **Action:** Switch role to Retailer C (Amit Patel). Navigate to the LED bulb campaign.
- **Action:** Click **"Join / Pledge Cartons"**, enter **45 cartons**, and confirm.
- **Result:** Combined volume reaches exactly **100 cartons**!

### Step 6: Verify 100-Carton Threshold Reached
- **Result:** The campaign state machine automatically transitions the campaign status from `OPEN` to **`THRESHOLD_REACHED`**.

### Step 7: Verify Unlocking of the 8% Volume Tier
- **Result:** The discount badge automatically updates from 5% to **8%**. The estimated group savings display **₹8,000.00**.

### Step 8: Log In as Supplier (Apex Lumens) & Submit Quotation
- **Action:** Switch role to **"Supplier"** (Suresh Patel).
- **Action:** Go to **"Campaign Tenders"** and locate `CMP-2026-001`.
- **Action:** Click **"Submit Formal Quotation"**. Review unit base price (₹1,000), 8% discount (₹920 net), and enter ₹1,500 total consolidated shipping.
- **Result:** Campaign status transitions to **`AWAITING_PARTICIPANT_APPROVAL`**.

### Step 9: Generate Consolidated Purchase Order
- **Action:** Switch back to **"Organizer"** (Priya Sharma).
- **Action:** Click **"Generate Consolidated PO"**.
- **Result:** Purchase Order `PO-2026-9001` is generated. The financial calculation engine calculates macro totals:
  - Base Subtotal: **₹100,000.00**
  - 8% Discount: **-₹8,000.00**
  - Discounted Subtotal: **₹92,000.00**
  - Consolidated Freight: **₹1,500.00**
  - 5% GST: **₹4,600.00**
  - **Macro Grand Total: ₹98,100.00**

### Step 10: Multi-Participant Proportional Allocation & Approvals
- **Validation:** Each retailer inspects their itemized breakdown and approves terms:
  - **Retailer A (20 cartons / 20% share):**
    - Subtotal: ₹20,000 | Discount: ₹1,600 | Freight: ₹300 | GST: ₹920 | **Payable: ₹19,620.00**
  - **Retailer B (35 cartons / 35% share):**
    - Subtotal: ₹35,000 | Discount: ₹2,800 | Freight: ₹525 | GST: ₹1,610 | **Payable: ₹34,335.00**
  - **Retailer C (45 cartons / 45% share):**
    - Subtotal: ₹45,000 | Discount: ₹3,600 | Freight: ₹675 | GST: ₹2,070 | **Payable: ₹44,145.00**
  - **Sum of Allocations:** ₹19,620 + ₹34,335 + ₹44,145 = **₹98,100.00** (Zero discrepancy!).
- **Action:** All participants click **"Approve Allocation"**. Campaign transitions to **`CONFIRMED`**, then **`PURCHASING`**.

### Step 11: Individual GST Invoices Generated
- **Action:** Switch to Retailer A and navigate to **"My Invoices"**.
- **Result:** Itemized invoice `INV-2026-SCEN-1` is generated with CGST (2.5%) and SGST (2.5%) breakdowns and printable layout.

### Step 12: Retailer A Completes Payment via UPI (Instant Success)
- **Action:** Click **"Pay Invoice"** on Invoice `INV-2026-SCEN-1` (₹19,620.00).
- **Action:** Select **UPI**, enter demo VPA `rajesh@upi`, and select scenario **"Force Success"**. Click **"Confirm & Pay"**.
- **Result:** Instant green success screen. Receipt issued. Invoice status changes to **`PAID`**; outstanding balance updates to **₹0.00**.

### Step 13: Retailer B Simulates Failed Payment, Then Retries
- **Action:** Switch to Retailer B (Sri Lakshmi Stores) and go to **"My Invoices"**.
- **Action:** Click **"Pay Invoice"** on Invoice `INV-2026-SCEN-2` (₹34,335.00).
- **Action:** Select **Credit Card** and choose scenario **"Force Failure"**. Click **"Confirm & Pay"**.
- **Result:** Red payment failure screen (`INSUFFICIENT_FUNDS_SIMULATED`). Invoice remains **`UNPAID`**.
- **Action:** Go to **"Payment Attempts"**, locate the failed attempt, and click **"Retry Payment"**.
- **Action:** Select **NEFT Bank Transfer** and click **"Confirm & Pay"** (Success).
- **Result:** Invoice status updates to **`PAID`**; balance becomes **₹0.00**.

### Step 14: Retailer C Simulates Pending NEFT Payment and Resolves It
- **Action:** Switch to Retailer C (Metro Home Supplies). Click **"Pay Invoice"** (₹44,145.00).
- **Action:** Select **NEFT** and scenario **"Force Pending"**. Click **"Confirm & Pay"**.
- **Result:** Amber pending notification screen (`Awaiting Bank Clearance`).
- **Action:** Switch to **"Finance Controller"**. Navigate to **"Payment Register"**, locate the pending NEFT transaction, and click **"Resolve / Mark Cleared"**.
- **Result:** Payment transitions to `SUCCESS`. Invoice updates to **`PAID`**.

### Step 15: Confirm Zero Discrepancy & Duplicate Payment Prevention
- **Validation:** Attempting to pay any of the three invoices again displays: *"Invoice is already fully settled."*

### Step 16: Log In as Warehouse Operator
- **Action:** Switch to **"Warehouse Operator"** (Ramesh Verma).
- **Result:** View packing queue for `PO-2026-9001`. 100 cartons of 9W LED bulbs ready for fulfillment.

### Step 17: Dispatch Consolidated Shipment via Carrier
- **Action:** Click **"Create Shipment"** → Assign carrier **VRL Consolidated Logistics** (Tracking: `VRL-BLR-998822`).
- **Action:** Update status from `PICKING` → `PACKED` → `DISPATCHED`.
- **Result:** Shipment timeline logs dispatch milestone at Pune Central Depot.

### Step 18: Record Delivery Confirmation
- **Action:** Update status to `DELIVERED`.
- **Result:** Order status updates to **`DELIVERED`** across all three retailers' order dashboards.

### Step 19: Inspect Perpetual Inventory Ledger
- **Action:** Go to **"Inventory Movements"** in the Warehouse workspace.
- **Result:** Perpetual stock ledger displays:
  - SKU: `ELEC-LED-009W`
  - Change: **-100 Cartons**
  - Reason: `CAMPAIGN_FULFILLMENT`
  - Balance After: `400 Cartons`
  - Actor: `Ramesh Verma`

### Step 20: Open Finance Workspace & Verify 0-Residual Reconciliation
- **Action:** Switch to **"Finance Controller"** and navigate to **"Reconciliation"**.
- **Result:** The automated reconciliation audit proves:
  - Consolidated Macro PO Total: **₹98,100.00**
  - Sum of Participant Invoices: **₹98,100.00**
  - Sum of Cleared Payments: **₹98,100.00**
  - **Residual Discrepancy: ₹0.00 (Exact zero paise match!)**

### Step 21: Inspect Tamper-Evident Audit Log
- **Action:** Switch to **"Auditor"** and navigate to **"Audit Logs"**.
- **Result:** View the chronological, append-only log of every state transition, quotation submission, payment attempt, and stock movement executed during the scenario.

---

## 4. Resetting the Demonstration

To restart the demonstration from a clean slate at any time:
1. Click the **"Reset Demo Data"** button in the top demo banner.
2. Confirm the prompt.
3. The platform instantly restores the initial factory seed dataset.
