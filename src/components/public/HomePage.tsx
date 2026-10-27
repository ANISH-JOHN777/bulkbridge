import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../services/financialEngine';
import {
  ArrowRight,
  TrendingDown,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Building,
  Truck,
  Users,
  Layers,
  Sparkles,
  HelpCircle,
  BarChart,
  FileText,
  Calculator,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { setActiveView, setDemoGuideOpen, switchUser } = useApp();

  // Savings Calculator interactive state
  const [calcMonthlySpend, setCalcMonthlySpend] = useState<number>(500000); // ₹5,00,000 / mo
  const [calcCategory, setCalcCategory] = useState<'ELECTRICAL' | 'FMCG' | 'PACKAGING' | 'AGRO'>('ELECTRICAL');

  const discountMap = {
    ELECTRICAL: 0.08,
    FMCG: 0.06,
    PACKAGING: 0.10,
    AGRO: 0.07,
  };

  const estimatedMonthlySavings = Math.round(calcMonthlySpend * discountMap[calcCategory]);
  const estimatedAnnualSavings = estimatedMonthlySavings * 12;

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does BulkBridge aggregate purchasing without merging business identities?',
      a: 'BulkBridge maintains independent financial and legal identities for every participating business. Demand is pooled into a single campaign to unlock supplier volume tiers, but individual purchase orders, tax invoices with distinct GSTINs, and payment records remain separate and protected.',
    },
    {
      q: 'How are discounts, shipping, and tax allocated among participants?',
      a: 'Allocations are governed by strict, transparent calculation rules using integer paise precision. Volume discounts and shared logistics are allocated proportionally to quantity or value as disclosed in the campaign terms, with deterministic zero-residual rounding.',
    },
    {
      q: 'Is real money processed in this demonstration?',
      a: 'No. This application runs in a simulated demonstration mode. Fictional GSTINs, simulated payment gateways (UPI, Cards, Net Banking, NEFT), and test records are used. No actual banking credentials or funds are collected.',
    },
    {
      q: 'What happens if a supplier revises quotation prices after demand is locked?',
      a: 'The campaign state machine strictly requires participant re-approval. If commercial quotation terms materially change, approved statuses reset and participants must review their updated allocation before orders can proceed.',
    },
    {
      q: 'Can suppliers see individual competitor prices or customer trade data?',
      a: 'No. BulkBridge enforces strict organization isolation. Suppliers only view aggregated demand quotas and direct purchase orders assigned to their catalog. Retailers cannot see confidential competitor margins.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 bg-gradient-to-b from-white via-slate-50 to-slate-100 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Enterprise Collaborative Procurement & Smart Billing</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              The Smarter Way for Businesses to <span className="text-emerald-600">Buy Together</span>.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Combine purchasing power, unlock volume discounts, and manage every order, invoice, and payment from one transparent platform.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button
                onClick={() => setActiveView('retailer-campaigns')}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl shadow-md transition-all hover:shadow-lg"
              >
                <span>Explore Bulk Deals</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setDemoGuideOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl shadow-md transition-all"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Try Interactive Demo</span>
              </button>
            </div>

            {/* Quick Demo Credentials Reminder */}
            <div className="pt-4 text-xs text-slate-500 flex items-center justify-center gap-2">
              <span>Quick switch roles anytime:</span>
              <button
                onClick={() => switchUser('user-organizer')}
                className="underline hover:text-slate-800 font-medium"
              >
                Organizer
              </button>
              <span>•</span>
              <button
                onClick={() => switchUser('user-buyer-1')}
                className="underline hover:text-slate-800 font-medium"
              >
                Retailer
              </button>
              <span>•</span>
              <button
                onClick={() => switchUser('user-supplier')}
                className="underline hover:text-slate-800 font-medium"
              >
                Supplier
              </button>
              <span>•</span>
              <button
                onClick={() => switchUser('user-finance')}
                className="underline hover:text-slate-800 font-medium"
              >
                Finance
              </button>
            </div>
          </div>

          {/* Interactive Collective Purchasing Demonstration Widget */}
          <div className="mt-14 max-w-4xl mx-auto p-6 sm:p-8 bg-white border border-slate-200 rounded-3xl shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="font-bold text-sm text-slate-800">
                  Live Mechanism: How 3 Independent Retailers Unlock 8% Factory Discount
                </h3>
              </div>
              <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-semibold">
                CMP-2026-001 (LED Bulbs)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-1">
                <div className="text-[11px] font-semibold text-slate-500 uppercase">Retailer A (GreenMart)</div>
                <div className="text-2xl font-black text-slate-900">20 Cartons</div>
                <div className="text-xs text-slate-600">Alone: 0% discount</div>
                <div className="text-[11px] text-emerald-700 font-semibold pt-1">
                  In Pool: Saves ₹1,600
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-1">
                <div className="text-[11px] font-semibold text-slate-500 uppercase">Retailer B (Sri Lakshmi)</div>
                <div className="text-2xl font-black text-slate-900">35 Cartons</div>
                <div className="text-xs text-slate-600">Alone: 0% discount</div>
                <div className="text-[11px] text-emerald-700 font-semibold pt-1">
                  In Pool: Saves ₹2,800
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-1">
                <div className="text-[11px] font-semibold text-slate-500 uppercase">Retailer C (Metro Home)</div>
                <div className="text-2xl font-black text-slate-900">45 Cartons</div>
                <div className="text-xs text-slate-600">Alone: 0% discount</div>
                <div className="text-[11px] text-emerald-700 font-semibold pt-1">
                  In Pool: Saves ₹3,600
                </div>
              </div>
            </div>

            {/* Aggregated Progress Banner */}
            <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs text-slate-300 font-medium">Combined Order Volume</div>
                <div className="text-xl font-bold flex items-center gap-2">
                  <span>100 Cartons (5,000 Units)</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-900 text-xs font-black">
                    8% TIER UNLOCKED
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-300 font-medium">Collective Savings</div>
                <div className="text-xl font-extrabold text-emerald-400">₹8,000.00 Saved</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Savings Calculator */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Calculate Your Procurement Savings
            </h2>
            <p className="text-sm text-slate-600">
              See how collective purchasing power drives wholesale manufacturer pricing for your retail business.
            </p>
          </div>

          <div className="p-8 bg-slate-50 border border-slate-200 rounded-3xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Controls */}
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  1. Select Product Category
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'ELECTRICAL', label: 'Electrical & Lighting (8%)' },
                    { id: 'FMCG', label: 'FMCG & Groceries (6%)' },
                    { id: 'PACKAGING', label: 'Packaging & Cartons (10%)' },
                    { id: 'AGRO', label: 'Agro Chemicals (7%)' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCalcCategory(cat.id as any)}
                      className={`p-3 rounded-xl border text-left font-medium transition-all ${
                        calcCategory === cat.id
                          ? 'border-emerald-600 bg-white text-emerald-800 shadow-sm'
                          : 'border-slate-200 text-slate-700 hover:bg-white'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    2. Monthly Purchasing Spend
                  </label>
                  <span className="text-sm font-bold text-slate-900 font-mono">
                    {formatINR(calcMonthlySpend * 100, false)}
                  </span>
                </div>
                <input
                  type="range"
                  min="100000"
                  max="5000000"
                  step="50000"
                  value={calcMonthlySpend}
                  onChange={(e) => setCalcMonthlySpend(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>₹1 Lakh</span>
                  <span>₹25 Lakhs</span>
                  <span>₹50 Lakhs</span>
                </div>
              </div>
            </div>

            {/* Savings Result Card */}
            <div className="p-6 bg-slate-900 text-white rounded-2xl flex flex-col justify-between space-y-6 shadow-xl">
              <div>
                <span className="text-xs text-emerald-400 uppercase tracking-widest font-bold">
                  Estimated Unlocked Savings
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
                  {formatINR(estimatedAnnualSavings * 100, false)}
                  <span className="text-sm font-normal text-slate-400"> / year</span>
                </div>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Based on average {Math.round(discountMap[calcCategory] * 100)}% tier savings plus consolidated freight efficiencies.
                </p>
              </div>

              <div className="p-3 bg-slate-800 rounded-xl space-y-1 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Monthly Cost Reduction:</span>
                  <span className="font-bold text-emerald-400">
                    {formatINR(estimatedMonthlySavings * 100, false)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Zero-interest settlement:</span>
                  <span>Transparent 14-day terms</span>
                </div>
              </div>

              <button
                onClick={() => setActiveView('retailer-catalog')}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition-colors text-center"
              >
                Browse Eligible Products
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (4 Steps) */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              How Collaborative Purchasing Works
            </h2>
            <p className="text-sm text-slate-600">
              Four structured phases from initial syndicate pooling to itemized delivery and zero-residual billing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Aggregate Demand',
                desc: 'Organizers or retailers launch a bulk campaign. Regional shops pledge unit quantities without merging their financial identity.',
                icon: Users,
              },
              {
                step: '02',
                title: 'Unlock Factory Tiers',
                desc: 'As combined volume crosses thresholds, tiered factory discounts (5%, 8%, 12%) unlock automatically in real-time.',
                icon: TrendingDown,
              },
              {
                step: '03',
                title: 'Approve Allocations',
                desc: 'Suppliers confirm terms. Each buyer reviews their itemized price, proportional shipping share, and exact GST tax base.',
                icon: ShieldCheck,
              },
              {
                step: '04',
                title: 'Fulfilled & Settled',
                desc: 'Suppliers dispatch consolidated shipments. Individual pro-forma invoices settle seamlessly with exact financial reconciliation.',
                icon: Truck,
              },
            ].map((s, idx) => {
              const Icon = s.icon;
              return (
                <div
                  key={idx}
                  className="p-6 bg-white border border-slate-200 rounded-2xl relative shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 font-bold text-sm">
                      <Icon className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-emerald-600 font-bold uppercase">
                        Phase {s.step}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 mt-0.5">{s.title}</h4>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Dual Value Proposition: Retailers vs Suppliers */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Retailer Benefits */}
            <div className="p-8 bg-slate-50 border border-slate-200 rounded-3xl space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  R
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">For Independent Retailers</h3>
                  <p className="text-xs text-slate-500">Supermarkets, electrical dealers, agro stores</p>
                </div>
              </div>
              <ul className="space-y-3 text-xs text-slate-700">
                {[
                  'Access high-volume factory wholesale rates with manageable small MOQs.',
                  'Transparent, disclosed logistics allocation—never subsidize another business.',
                  'Individual pro-forma tax invoices with your own verified GSTIN.',
                  'Simulated instant checkout via UPI, Net Banking, Card, or NEFT.',
                  'Damage reporting, inspection logs, and credit note reimbursement workflows.',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => {
                  switchUser('user-buyer-1');
                  setActiveView('retailer-overview');
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-xl transition-colors"
              >
                Launch Retailer Workspace
              </button>
            </div>

            {/* Supplier Benefits */}
            <div className="p-8 bg-slate-50 border border-slate-200 rounded-3xl space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                  S
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">For Manufacturers & Millers</h3>
                  <p className="text-xs text-slate-500">Factories, refineries, agricultural chemical mills</p>
                </div>
              </div>
              <ul className="space-y-3 text-xs text-slate-700">
                {[
                  'Predictable, consolidated orders with zero individual retail credit risk.',
                  'Single consolidated purchase order (PO) simplifies production scheduling.',
                  'Direct communication channel with cooperative purchasing coordinators.',
                  'Integrated shipment tracking with Delhivery, BlueDart, VRL Logistics.',
                  'Automated zero-residual settlement reconciliation and receivables register.',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => {
                  switchUser('user-supplier');
                  setActiveView('supplier-overview');
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-xl transition-colors"
              >
                Launch Supplier Workspace
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-600">
              Everything you need to know about BulkBridge cooperative purchasing mechanics and financial safety.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-semibold text-sm text-slate-900"
                  >
                    <span>{faq.q}</span>
                    <ChevronRight
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        isOpen ? 'rotate-90 text-emerald-600' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">BulkBridge</span>
            <span>•</span>
            <span>Enterprise B2B Collaborative Procurement Platform</span>
          </div>
          <div className="text-center sm:text-right">
            <span>Illustrative Demonstration Platform • Operating in Simulated Demo Mode</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
