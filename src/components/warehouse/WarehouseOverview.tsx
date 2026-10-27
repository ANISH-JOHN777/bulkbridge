import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatQuantity } from '../../services/financialEngine';
import { StatusBadge } from '../common/StatusBadge';
import {
  Truck,
  Package,
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

export const WarehouseOverview: React.FC = () => {
  const { state, setActiveView } = useApp();

  const totalShipments = state.shipments.length;
  const inTransitCount = state.shipments.filter((s) => s.status === 'IN_TRANSIT').length;
  const deliveredCount = state.shipments.filter((s) => s.status === 'DELIVERED').length;
  const pendingPickingCount = state.shipments.filter((s) => ['CONFIRMED', 'PICKING', 'PACKED'].includes(s.status)).length;
  const pendingReturnsCount = state.returns.filter((r) => r.status === 'PENDING_REVIEW').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Central Logistics & Warehouse Fulfillment</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-xs font-semibold">
              Logistics Terminal
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage collective bulk dispatches, multi-carrier manifests (BlueDart, Delhivery, VRL, Safexpress), and inventory stock ledgers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('warehouse-shipments')}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Truck className="w-4 h-4" />
            <span>Track All Shipments</span>
          </button>
          <button
            onClick={() => setActiveView('warehouse-inventory')}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Package className="w-4 h-4" />
            <span>Inventory Ledger</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Staging & Picking</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-700 font-mono">
            {pendingPickingCount}
          </div>
          <div className="text-[11px] text-slate-500">Orders being picked & packed</div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Active in Transit</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {inTransitCount}
          </div>
          <div className="text-[11px] text-slate-500">Dispatched with commercial carriers</div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Completed Deliveries</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono">
            {deliveredCount}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold">Confirmed store delivery receipts</div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Pending Damage Claims</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-700 font-mono">
            {pendingReturnsCount}
          </div>
          <div className="text-[11px] text-slate-500">Damage reports awaiting review</div>
        </div>
      </div>

      {/* Live Carrier Dispatches Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Live Shipments & Manifests</h3>
            <p className="text-xs text-slate-500">Real-time carrier tracking for collective bulk orders</p>
          </div>
          <button
            onClick={() => setActiveView('warehouse-shipments')}
            className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
          >
            Manage shipments →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Shipment #</th>
                <th className="py-3 px-4">Order Ref</th>
                <th className="py-3 px-4">Carrier & Tracking</th>
                <th className="py-3 px-4">Destination Store</th>
                <th className="py-3 px-4">Est. Delivery</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.shipments.slice(0, 5).map((shp) => (
                <tr key={shp.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{shp.shipmentNumber}</td>
                  <td className="py-3 px-4 font-mono text-slate-600">{shp.orderNumber}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800">{shp.carrierName}</div>
                    <div className="font-mono text-[10px] text-slate-400">{shp.trackingNumber}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-medium">{shp.buyerOrganizationName}</td>
                  <td className="py-3 px-4 text-slate-600">{shp.estimatedDeliveryDate}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={shp.status} size="sm" />
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
