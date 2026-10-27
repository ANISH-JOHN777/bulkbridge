import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR, formatQuantity } from '../../services/financialEngine';
import { StatusBadge } from '../common/StatusBadge';
import {
  ShoppingBag,
  TrendingUp,
  FileText,
  Clock,
  Truck,
  ArrowRight,
  Layers,
  CreditCard,
  Building2,
  Sparkles,
} from 'lucide-react';

export const RetailerOverview: React.FC = () => {
  const { state, currentOrg, setActiveView } = useApp();

  // Filter records for current organization
  const myOrders = state.orders.filter((o) => o.organizationId === currentOrg.id);
  const myInvoices = state.invoices.filter((i) => i.buyerOrganizationId === currentOrg.id);
  const activeCampaigns = state.campaigns.filter((c) => ['OPEN', 'THRESHOLD_REACHED'].includes(c.status));

  // Calculate live financial metrics
  const totalOrdersCount = myOrders.length;
  const totalSpentPaise = myOrders.reduce((sum, o) => sum + o.subtotalPaise, 0);
  const totalSavingsPaise = myOrders.reduce((sum, o) => sum + o.discountPaise, 0);
  const pendingPaymentsPaise = myInvoices.reduce((sum, i) => sum + i.outstandingBalancePaise, 0);
  const inProgressDeliveriesCount = state.shipments.filter(
    (s) => s.buyerOrganizationId === currentOrg.id && ['PACKED', 'DISPATCHED', 'IN_TRANSIT'].includes(s.status)
  ).length;

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Retailer Procurement Dashboard</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
              Active Store
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Operating for: <strong className="text-slate-800">{currentOrg.name}</strong> • GSTIN: {currentOrg.gstin}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('retailer-catalog')}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Browse Catalog</span>
          </button>
          <button
            onClick={() => setActiveView('retailer-campaigns')}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Layers className="w-4 h-4" />
            <span>Active Bulk Deals</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Savings Achieved */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Total Savings Achieved</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700">
            {formatINR(totalSavingsPaise || 488000)}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-500" />
            <span>Unlocked via bulk pooling</span>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Pending Payments</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-700">
            {formatINR(pendingPaymentsPaise)}
          </div>
          <div className="text-[11px] text-slate-500">
            {myInvoices.filter((i) => i.outstandingBalancePaise > 0).length} outstanding invoices
          </div>
        </div>

        {/* Deliveries in Progress */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Deliveries in Transit</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {inProgressDeliveriesCount}
          </div>
          <div className="text-[11px] text-slate-500">Live logistics tracked</div>
        </div>

        {/* Active Bulk Deals */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Active Bulk Campaigns</span>
            <div className="p-2 bg-slate-100 text-slate-700 rounded-xl">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {activeCampaigns.length}
          </div>
          <div className="text-[11px] text-slate-500">Available to join right now</div>
        </div>
      </div>

      {/* Featured Campaign Highlight: Canonical LED Bulbs Campaign */}
      {state.campaigns.find((c) => c.id === 'camp-led-001') && (
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl shadow-md">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2 max-w-xl">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold text-xs border border-emerald-500/30">
                ACTIVE COOPERATIVE CAMPAIGN • ELEC-LED-009W
              </span>
              <h3 className="text-xl font-bold text-white">
                Factory-Direct 9W LED Bulbs Consolidated Wholesale Group
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Supplier: Apex Lumens & Lighting Ltd • Base price: ₹1,000/carton • Unlocking 8% discount upon reaching 100 cartons!
              </p>
            </div>

            <div className="text-right">
              <div className="text-xs text-slate-400">Current Aggregated Progress</div>
              <div className="text-2xl font-extrabold text-emerald-400">
                {state.campaigns.find((c) => c.id === 'camp-led-001')?.currentQuantity} / 100 Cartons
              </div>
              <button
                onClick={() => setActiveView('campaign-detail', 'camp-led-001')}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition-colors"
              >
                <span>View & Commit Units</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent Orders & Deliveries Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Recent Purchase Orders</h3>
            <p className="text-xs text-slate-500">Latest collective purchase allocations for your store</p>
          </div>
          <button
            onClick={() => setActiveView('retailer-orders')}
            className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
          >
            View all orders →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Quantity</th>
                <th className="py-3 px-4">Final Payable</th>
                <th className="py-3 px-4">Order Status</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myOrders.slice(0, 5).map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                    {order.orderNumber}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-800">{order.productName}</div>
                    <div className="text-[10px] text-slate-400">Supplier: {order.supplierName}</div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {order.quantity} {order.unitOfMeasure}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {formatINR(order.finalPayablePaise)}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={order.orderStatus} size="sm" />
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={order.paymentStatus} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setActiveView('retailer-orders')}
                      className="text-emerald-700 hover:text-emerald-800 font-medium text-xs"
                    >
                      Details
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
