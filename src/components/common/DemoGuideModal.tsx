import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Play,
  CheckCircle,
  ArrowRight,
  ShieldAlert,
  Layers,
  Sparkles,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';

interface StepInfo {
  step: number;
  title: string;
  role: string;
  description: string;
  targetView: string;
}

export const DEMO_SCENARIO_STEPS: StepInfo[] = [
  {
    step: 1,
    title: 'Log in as Purchasing Syndicate Coordinator',
    role: 'ORGANIZER (Priya Sharma)',
    description: 'Access the organizer dashboard to oversee bulk purchasing syndicates, aggregate orders, and invite regional retailers.',
    targetView: 'organizer-overview',
  },
  {
    step: 2,
    title: 'Inspect 9W LED Bulbs Campaign (CMP-2026-001)',
    role: 'ORGANIZER (Priya Sharma)',
    description: 'Review the campaign parameters: supplier Apex Lumens, base price ₹1,000/carton, MOQ 10, target 100 cartons with 4 discount tiers (0%, 5%, 8%, 12%).',
    targetView: 'campaign-detail',
  },
  {
    step: 3,
    title: 'Retailer A (GreenMart) Pledges 20 Cartons',
    role: 'RETAILER (Rajesh Kumar)',
    description: 'GreenMart joins the campaign pledging 20 cartons (1,000 bulbs). Initial base subtotal: ₹20,000.',
    targetView: 'campaign-detail',
  },
  {
    step: 4,
    title: 'Retailer B (Sri Lakshmi Stores) Pledges 35 Cartons',
    role: 'RETAILER (Suresh Raman)',
    description: 'Sri Lakshmi Stores commits 35 cartons. Total pledged reaches 55 cartons, unlocking the 5% tier automatically!',
    targetView: 'campaign-detail',
  },
  {
    step: 5,
    title: 'Retailer C (Metro Home Supplies) Pledges 45 Cartons',
    role: 'RETAILER (Vikram Joshi)',
    description: 'Metro Home commits 45 cartons. Combined demand hits 100 cartons exactly, crossing the cooperative threshold!',
    targetView: 'campaign-detail',
  },
  {
    step: 6,
    title: 'Verify Consolidated Quantity Reaches 100 Cartons',
    role: 'ORGANIZER / ALL BUYERS',
    description: 'The campaign dashboard reflects 100 cartons total with real-time progress bar at 100% of threshold.',
    targetView: 'campaign-detail',
  },
  {
    step: 7,
    title: 'Verify 8% Discount Tier Unlocked',
    role: 'ORGANIZER / SYSTEM',
    description: 'Deterministic tier schedule evaluates: 100-199 units unlocks 8% discount (₹8,000 total savings on ₹1,00,000 gross).',
    targetView: 'campaign-detail',
  },
  {
    step: 8,
    title: 'Supplier (Apex Lumens) Confirms Availability & Quotation',
    role: 'SUPPLIER (Anand Singhania)',
    description: 'Supplier reviews aggregated 100-carton volume, locks unit price at ₹1,000 with 8% discount and confirms delivery logistics.',
    targetView: 'supplier-campaigns',
  },
  {
    step: 9,
    title: 'Coordinator Generates Consolidated Purchase Order',
    role: 'ORGANIZER (Priya Sharma)',
    description: 'Purchasing coordinator issues unified PO to Apex Lumens and generates individual itemized allocations.',
    targetView: 'organizer-campaigns',
  },
  {
    step: 10,
    title: 'Retailers Review & Approve Final Commercial Allocations',
    role: 'ALL 3 RETAILERS',
    description: 'Each buyer reviews their transparent allocated discount, proportional shipping, and tax base, providing formal sign-off.',
    targetView: 'campaign-detail',
  },
  {
    step: 11,
    title: 'Separate Participant Invoices Generated',
    role: 'FINANCE & RETAILERS',
    description: 'Itemized invoices generated for GreenMart (₹19,620), Lakshmi Stores (₹34,335), and Metro Home (₹44,145).',
    targetView: 'retailer-invoices',
  },
  {
    step: 12,
    title: 'Retailer A (GreenMart) Completes Simulated Payment',
    role: 'RETAILER A (GreenMart)',
    description: 'Rajesh pays ₹19,620 via UPI simulator. Invoice immediately settles to PAID with zero outstanding balance.',
    targetView: 'retailer-payments',
  },
  {
    step: 13,
    title: 'Retailer B Simulates Failed Payment then Retries',
    role: 'RETAILER B (Sri Lakshmi)',
    description: 'Credit card attempt fails due to simulated limit. Retailer retries via NEFT bank transfer and settles successfully.',
    targetView: 'retailer-payments',
  },
  {
    step: 14,
    title: 'Retailer C Simulates Pending Payment & Settlement',
    role: 'RETAILER C (Metro Home)',
    description: 'Submits NEFT transfer marked as PENDING. The settlement control resolves the clearance cycle to SUCCESS.',
    targetView: 'retailer-payments',
  },
  {
    step: 15,
    title: 'Confirm Invoice Balances & Ledger Reconciliation',
    role: 'FINANCE (Meera Nambiar)',
    description: 'All 3 invoices are verified as settled. Payment ledger matches allocated balances down to 0 paise.',
    targetView: 'finance-invoices',
  },
  {
    step: 16,
    title: 'Warehouse Operator Initiates Fulfillment',
    role: 'WAREHOUSE (Dinesh Yadav)',
    description: 'Warehouse supervisor stages 100 cartons of 9W LED bulbs at Pune fulfillment center for carrier pickup.',
    targetView: 'warehouse-overview',
  },
  {
    step: 17,
    title: 'Dispatch Shipment & Assign Tracking',
    role: 'WAREHOUSE (Dinesh Yadav)',
    description: 'Generates shipment manifest with BlueDart / VRL logistics, updates status to DISPATCHED with live tracking.',
    targetView: 'warehouse-shipments',
  },
  {
    step: 18,
    title: 'Deliver Consignment to Retail Stores',
    role: 'WAREHOUSE & BUYERS',
    description: 'Marks shipment as DELIVERED upon physical receipt and inspection at retailer storefronts.',
    targetView: 'warehouse-shipments',
  },
  {
    step: 19,
    title: 'Verify Inventory Movements Ledger',
    role: 'WAREHOUSE (Dinesh Yadav)',
    description: 'Stock ledger records negative 100 cartons movement linked directly to the order and shipment IDs.',
    targetView: 'warehouse-inventory',
  },
  {
    step: 20,
    title: 'Finance Dashboard Zero-Residual Reconciliation Audit',
    role: 'FINANCE (Meera Nambiar)',
    description: 'Financial dashboard confirms: Consolidated PO = Sum(Invoices) = Received Payments. Discrepancy = ₹0.00.',
    targetView: 'finance-reconciliation',
  },
  {
    step: 21,
    title: 'Audit Log Verification & Timeline Inspection',
    role: 'AUDITOR (Kavita Iyer)',
    description: 'Read-only compliance auditor inspects the complete append-only trail covering all actors and state changes.',
    targetView: 'admin-audit',
  },
];

export const DemoGuideModal: React.FC = () => {
  const {
    demoGuideOpen,
    demoGuideStep,
    setDemoGuideOpen,
    setDemoGuideStep,
    runDemoScenarioStep,
  } = useApp();

  if (!demoGuideOpen) return null;

  const currentStepInfo = DEMO_SCENARIO_STEPS.find((s) => s.step === demoGuideStep) || DEMO_SCENARIO_STEPS[0];
  const progressPercent = Math.round((demoGuideStep / DEMO_SCENARIO_STEPS.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">BulkBridge Canonical Demo Scenario</h3>
              <p className="text-xs text-slate-300">
                End-to-End Collective Purchasing & Billing Walkthrough (21 Steps)
              </p>
            </div>
          </div>
          <button
            onClick={() => setDemoGuideOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5">
          <div
            className="bg-emerald-500 h-1.5 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Active Step Highlight Card */}
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
                Step {currentStepInfo.step} of 21
              </span>
              <span className="text-xs font-medium text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                Active Role: <strong className="text-slate-900">{currentStepInfo.role}</strong>
              </span>
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">{currentStepInfo.title}</h4>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">{currentStepInfo.description}</p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => runDemoScenarioStep(currentStepInfo.step)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-xl shadow-sm transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Execute Step {currentStepInfo.step}</span>
              </button>

              {demoGuideStep < 21 ? (
                <button
                  onClick={() => {
                    const next = demoGuideStep + 1;
                    runDemoScenarioStep(next);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm rounded-xl transition-all"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <span className="text-sm font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Scenario Complete!
                </span>
              )}
            </div>
          </div>

          {/* Quick Step Selector List */}
          <div>
            <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
              Jump to any Scenario Phase
            </h5>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {DEMO_SCENARIO_STEPS.map((step) => {
                const isCurrent = step.step === demoGuideStep;
                const isPassed = step.step < demoGuideStep;

                return (
                  <button
                    key={step.step}
                    onClick={() => runDemoScenarioStep(step.step)}
                    className={`w-full text-left px-3.5 py-2 rounded-xl flex items-center justify-between transition-colors text-xs ${
                      isCurrent
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold'
                        : isPassed
                        ? 'text-slate-500 hover:bg-slate-50'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          isCurrent
                            ? 'bg-emerald-600 text-white'
                            : isPassed
                            ? 'bg-slate-200 text-slate-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {step.step}
                      </span>
                      <span className="truncate">{step.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                      {step.role.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Clicking 'Execute Step' automatically switches roles and updates demo state.</span>
          <button
            onClick={() => setDemoGuideOpen(false)}
            className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-slate-700 font-medium transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
