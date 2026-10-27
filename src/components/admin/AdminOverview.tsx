import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR, formatQuantity } from '../../services/financialEngine';
import { StatusBadge } from '../common/StatusBadge';
import {
  ShieldCheck,
  Building2,
  Users,
  Layers,
  BarChart3,
  TrendingUp,
  Activity,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const AdminOverview: React.FC = () => {
  const { state, setActiveView, setDemoGuideOpen } = useApp();

  const totalGMVPaise = state.invoices.reduce((sum, i) => sum + i.grandTotalPaise, 0);
  const totalSavingsPaise = state.orders.reduce((sum, o) => sum + o.discountPaise, 0);
  const totalBusinesses = state.organizations.length;
  const verifiedCount = state.organizations.filter((o) => o.isVerified).length;
  const activeCampaigns = state.campaigns.filter((c) => ['OPEN', 'THRESHOLD_REACHED'].includes(c.status));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Platform Governance & Administration</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-xs font-semibold">
              Super Admin
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise administration across 16 registered B2B organizations, 42 catalog SKUs, and zero-residual escrow billing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('admin-analytics')}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Platform Analytics</span>
          </button>
          <button
            onClick={() => setActiveView('admin-audit')}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Activity className="w-4 h-4" />
            <span>Append-Only Audit Log</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Platform GMV</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {formatINR(totalGMVPaise)}
          </div>
          <div className="text-[11px] text-slate-500">Gross marketplace transaction value</div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Delivered Cooperative Savings</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono">
            {formatINR(totalSavingsPaise)}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold">Saved by participating retailers</div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Registered Businesses</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {totalBusinesses}
          </div>
          <div className="text-[11px] text-slate-500">{verifiedCount} KYC verified accounts</div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Active Bulk Syndicates</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-700 font-mono">
            {activeCampaigns.length}
          </div>
          <div className="text-[11px] text-slate-500">Pooling cooperative volume</div>
        </div>
      </div>

      {/* Quick Nav Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div
          onClick={() => setActiveView('admin-users')}
          className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xs hover:shadow-md cursor-pointer transition-shadow space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900">User & Organization Directory</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Manage 7 pre-seeded demo user accounts and 16 B2B organizations across retail, wholesale, and manufacturing.
          </p>
          <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1 pt-1">
            <span>Manage accounts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        <div
          onClick={() => setActiveView('admin-verification')}
          className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xs hover:shadow-md cursor-pointer transition-shadow space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900">KYC Verification Queues</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Inspect pending GSTIN validations, factory manufacturing licenses, and cooperative credit eligibility.
          </p>
          <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1 pt-1">
            <span>Review queues</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        <div
          onClick={() => setActiveView('admin-audit')}
          className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xs hover:shadow-md cursor-pointer transition-shadow space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
            <Activity className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900">Append-Only Audit Trail</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Immutable log of {state.auditEvents.length} state transitions, quotation locks, payments, and dispatch check-points.
          </p>
          <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1 pt-1">
            <span>Inspect audit trail</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
