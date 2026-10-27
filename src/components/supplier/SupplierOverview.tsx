import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR, formatQuantity } from '../../services/financialEngine';
import { StatusBadge } from '../common/StatusBadge';
import {
  Package,
  Layers,
  Truck,
  TrendingUp,
  FileCheck,
  Scale,
  Building2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const SupplierOverview: React.FC = () => {
  const { state, currentOrg, setActiveView } = useApp();

  const myProducts = state.products.filter((p) => p.supplierId === currentOrg.id);
  const myCampaigns = state.campaigns.filter((c) => c.supplierId === currentOrg.id);
  const myOrders = state.orders.filter((o) => o.supplierId === currentOrg.id);
  const myShipments = state.shipments.filter((s) => s.supplierId === currentOrg.id);

  const activeQuotationsCount = myCampaigns.filter(
    (c) => c.status === 'THRESHOLD_REACHED' || c.status === 'AWAITING_SUPPLIER_QUOTATION'
  ).length;

  const totalMonthlyVolumePaise = myOrders.reduce((sum, o) => sum + o.subtotalPaise, 0);
  const totalReceivablesPaise = myOrders.reduce((sum, o) => sum + o.outstandingBalancePaise, 0);
  const totalUnitsInCatalog = myProducts.reduce((sum, p) => sum + p.availableStock, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Manufacturer & Supplier Hub</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-xs font-semibold">
              Verified Factory
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manufacturing Portal for: <strong className="text-slate-800">{currentOrg.name}</strong> • GSTIN: {currentOrg.gstin}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('supplier-catalog')}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Package className="w-4 h-4" />
            <span>Manage Catalog</span>
          </button>
          <button
            onClick={() => setActiveView('supplier-campaigns')}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Layers className="w-4 h-4" />
            <span>Review Demand Syndicates</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Quotation Inquiries */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Pending Quotation Reviews</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {activeQuotationsCount}
          </div>
          <div className="text-[11px] text-slate-500">Threshold reached pools awaiting sign-off</div>
        </div>

        {/* Monthly Contracted Volume */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Contracted Order Value</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono">
            {formatINR(totalMonthlyVolumePaise)}
          </div>
          <div className="text-[11px] text-slate-500">Aggregated via BulkBridge syndicates</div>
        </div>

        {/* Outstanding Receivables */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Pending Receivables</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {formatINR(totalReceivablesPaise)}
          </div>
          <div className="text-[11px] text-slate-500">Secured via platform escrow billing</div>
        </div>

        {/* Stock Availability */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Factory Stock Units</span>
            <div className="p-2 bg-slate-100 text-slate-700 rounded-xl">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {formatQuantity(totalUnitsInCatalog)}
          </div>
          <div className="text-[11px] text-slate-500">Across {myProducts.length} active SKUs</div>
        </div>
      </div>

      {/* Campaigns Awaiting Quotation or Fulfillment */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Aggregated Buyer Campaigns for Your Factory
            </h3>
            <p className="text-xs text-slate-500">
              Review pledged cooperative demand, confirm price tiers, and lock lead times
            </p>
          </div>
          <button
            onClick={() => setActiveView('supplier-campaigns')}
            className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
          >
            Manage Quotations →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Campaign Ref</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Consolidated Demand</th>
                <th className="py-3 px-4">Target Volume</th>
                <th className="py-3 px-4">Current Tier</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myCampaigns.slice(0, 5).map((camp) => (
                <tr key={camp.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    {camp.campaignNumber}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">{camp.productName}</td>
                  <td className="py-3 px-4 font-bold text-emerald-800 font-mono">
                    {camp.currentQuantity} {camp.unitOfMeasure}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">
                    {camp.targetQuantity} {camp.unitOfMeasure}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900 font-mono">
                    {camp.currentDiscountPercent}% Off
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={camp.status} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setActiveView('campaign-detail', camp.id)}
                      className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      Review
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
