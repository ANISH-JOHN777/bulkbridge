import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR, formatQuantity } from '../../services/financialEngine';
import { StatusBadge } from '../common/StatusBadge';
import {
  Layers,
  Users,
  TrendingDown,
  Clock,
  Sparkles,
  Scale,
  Plus,
  ArrowRight,
  FileCheck,
} from 'lucide-react';

export const OrganizerOverview: React.FC = () => {
  const { state, setActiveView, setDemoGuideOpen } = useApp();

  const activeCampaigns = state.campaigns.filter((c) =>
    ['OPEN', 'THRESHOLD_REACHED', 'AWAITING_SUPPLIER_QUOTATION', 'AWAITING_PARTICIPANT_APPROVAL'].includes(c.status)
  );

  const totalDemandUnits = state.campaigns.reduce((sum, c) => sum + c.currentQuantity, 0);
  const totalSavingsGeneratedPaise = state.orders.reduce((sum, o) => sum + o.discountPaise, 0);
  const totalParticipantsCount = new Set(
    state.campaigns.flatMap((c) => c.participants.map((p) => p.organizationId))
  ).size;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Purchasing Syndicate Coordinator</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-xs font-semibold">
              Cooperative Lead
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Aggregate small retailer orders, negotiate factory-direct volume discounts, and issue consolidated purchase orders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('organizer-campaigns')}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Launch Bulk Campaign</span>
          </button>
          <button
            onClick={() => setActiveView('organizer-comparison')}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Scale className="w-4 h-4" />
            <span>Supplier Comparison</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Active Demand Pools</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {activeCampaigns.length}
          </div>
          <div className="text-[11px] text-slate-500">Currently aggregating regional volume</div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Aggregated Demand</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {formatQuantity(totalDemandUnits)} Units
          </div>
          <div className="text-[11px] text-slate-500">Across {totalParticipantsCount} independent stores</div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Delivered Member Savings</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono">
            {formatINR(totalSavingsGeneratedPaise)}
          </div>
          <div className="text-[11px] text-slate-500">Zero-interest cooperative benefit</div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Pending Approvals</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-700 font-mono">
            {state.campaigns.filter((c) => c.status === 'AWAITING_PARTICIPANT_APPROVAL').length}
          </div>
          <div className="text-[11px] text-slate-500">Awaiting buyer quotation approval</div>
        </div>
      </div>

      {/* Guided Scenario Card */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> Canonical Demo Journey
          </span>
          <h3 className="text-lg font-bold text-white">
            Run LED Bulb 3-Buyer Collective Procurement Scenario
          </h3>
          <p className="text-xs text-slate-300">
            Pledge 20 + 35 + 45 = 100 cartons, unlock 8% discount, confirm supplier terms, and generate PO.
          </p>
        </div>
        <button
          onClick={() => setDemoGuideOpen(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          Open 21-Step Guide
        </button>
      </div>

      {/* Active Campaigns Management Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Cooperative Campaign Monitor</h3>
            <p className="text-xs text-slate-500">Live threshold progress, supplier quotes, and PO generation triggers</p>
          </div>
          <button
            onClick={() => setActiveView('organizer-campaigns')}
            className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
          >
            Manage all campaigns →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Ref #</th>
                <th className="py-3 px-4">Campaign Title</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Progress</th>
                <th className="py-3 px-4">Unlocked Tier</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.campaigns.slice(0, 6).map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{c.campaignNumber}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{c.title}</td>
                  <td className="py-3 px-4 text-slate-600">{c.supplierName}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    {c.currentQuantity} / {c.targetQuantity} {c.unitOfMeasure}
                  </td>
                  <td className="py-3 px-4 font-bold text-emerald-700 font-mono">
                    {c.currentDiscountPercent}% Off
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={c.status} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setActiveView('campaign-detail', c.id)}
                      className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
