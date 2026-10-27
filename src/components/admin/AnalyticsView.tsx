import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR, formatQuantity } from '../../services/financialEngine';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  CheckCircle2,
  AlertCircle,
  Truck,
  Layers,
  Sparkles,
  DollarSign,
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { state } = useApp();

  // Aggregate Category Breakdown from Products & Orders
  const categoryStats = useMemo(() => {
    const stats: Record<string, { label: string; count: number; spendPaise: number; savingsPaise: number }> = {
      ELECTRICAL_LIGHTING: { label: 'Electrical & Lighting', count: 0, spendPaise: 0, savingsPaise: 0 },
      FMCG_GROCERY: { label: 'FMCG & Groceries', count: 0, spendPaise: 0, savingsPaise: 0 },
      PACKAGING_MATERIALS: { label: 'Packaging Materials', count: 0, spendPaise: 0, savingsPaise: 0 },
      HARDWARE_CONSTRUCTION: { label: 'Hardware & Pipes', count: 0, spendPaise: 0, savingsPaise: 0 },
      AGRICULTURAL: { label: 'Agricultural Inputs', count: 0, spendPaise: 0, savingsPaise: 0 },
      TEXTILES_GARMENTS: { label: 'Textiles & Garments', count: 0, spendPaise: 0, savingsPaise: 0 },
      OFFICE_SUPPLIES: { label: 'Office Supplies', count: 0, spendPaise: 0, savingsPaise: 0 },
      ELECTRONICS_ACCESSORIES: { label: 'Electronics & Cables', count: 0, spendPaise: 0, savingsPaise: 0 },
    };

    state.orders.forEach((order) => {
      const prod = state.products.find((p) => p.id === order.productId);
      const cat = prod?.category || 'ELECTRICAL_LIGHTING';
      if (stats[cat]) {
        stats[cat].count += order.quantity;
        stats[cat].spendPaise += order.subtotalPaise;
        stats[cat].savingsPaise += order.discountPaise;
      }
    });

    return Object.values(stats);
  }, [state.orders, state.products]);

  // Payment rail breakdown
  const paymentMethodStats = useMemo(() => {
    const methods: Record<string, { success: number; failed: number; totalPaise: number }> = {
      UPI: { success: 0, failed: 0, totalPaise: 0 },
      NET_BANKING: { success: 0, failed: 0, totalPaise: 0 },
      BANK_TRANSFER_NEFT: { success: 0, failed: 0, totalPaise: 0 },
      CREDIT_CARD: { success: 0, failed: 0, totalPaise: 0 },
      WALLET: { success: 0, failed: 0, totalPaise: 0 },
    };

    state.payments.forEach((p) => {
      if (!methods[p.method]) return;
      if (p.status === 'SUCCESS') {
        methods[p.method].success += 1;
        methods[p.method].totalPaise += p.amountPaise;
      } else if (p.status === 'FAILED') {
        methods[p.method].failed += 1;
      }
    });

    return Object.entries(methods).map(([key, data]) => ({
      method: key.replace(/_/g, ' '),
      ...data,
    }));
  }, [state.payments]);

  // Supplier Fulfillment Performance
  const supplierStats = useMemo(() => {
    const map: Record<string, { total: number; delivered: number; inTransit: number }> = {};

    state.shipments.forEach((s) => {
      if (!map[s.supplierName]) {
        map[s.supplierName] = { total: 0, delivered: 0, inTransit: 0 };
      }
      map[s.supplierName].total += 1;
      if (s.status === 'DELIVERED') map[s.supplierName].delivered += 1;
      if (['DISPATCHED', 'IN_TRANSIT'].includes(s.status)) map[s.supplierName].inTransit += 1;
    });

    return Object.entries(map).map(([name, data]) => ({
      name,
      ...data,
      rate: Math.round((data.delivered / data.total) * 100) || 100,
    }));
  }, [state.shipments]);

  const maxCategorySpend = Math.max(...categoryStats.map((c) => c.spendPaise), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Procurement & Billing Analytics</h1>
        <p className="text-xs text-slate-500 mt-1">
          Deterministic business intelligence computed in real-time from active campaigns, invoices, and logistics check-points.
        </p>
      </div>

      {/* Grid: 2 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Spend & Savings Breakdown */}
        <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Order Volume & Savings by Category</h3>
              <p className="text-xs text-slate-500">Gross contract spend vs collective discount unlocked</p>
            </div>
            <span className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <BarChart3 className="w-4 h-4" />
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {categoryStats.map((cat, idx) => {
              const barWidth = Math.max(8, Math.round((cat.spendPaise / maxCategorySpend) * 100));
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-800">{cat.label}</span>
                    <span className="font-mono text-slate-600 font-semibold">
                      {formatINR(cat.spendPaise)}
                      {cat.savingsPaise > 0 && (
                        <span className="text-emerald-700 font-bold ml-1.5">
                          (Saved {formatINR(cat.savingsPaise)})
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                    <div
                      className="bg-slate-900 h-2 rounded-l-full"
                      style={{ width: `${barWidth}%` }}
                    />
                    {cat.savingsPaise > 0 && (
                      <div
                        className="bg-emerald-500 h-2 rounded-r-full"
                        style={{ width: `${Math.min(25, Math.round((cat.savingsPaise / cat.spendPaise) * 100))}%` }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Rails Success vs Failure Rates */}
        <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Payment Gateway Reliability</h3>
              <p className="text-xs text-slate-500">Success vs failed transactions across simulation methods</p>
            </div>
            <span className="p-2 bg-blue-50 text-blue-700 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {paymentMethodStats.map((rail, idx) => {
              const total = rail.success + rail.failed;
              const rate = total > 0 ? Math.round((rail.success / total) * 100) : 100;

              return (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl space-y-1 text-xs">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-800">{rail.method}</span>
                    <span className="font-mono text-emerald-700">{formatINR(rail.totalPaise)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>
                      {rail.success} Succeeded • {rail.failed} Declined
                    </span>
                    <span className="font-semibold text-slate-900">{rate}% Success Rate</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden flex">
                    <div className="bg-emerald-500 h-1.5" style={{ width: `${rate}%` }} />
                    <div className="bg-rose-500 h-1.5" style={{ width: `${100 - rate}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Supplier Fulfillment Performance Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Manufacturer Dispatch & Fulfillment SLA</h3>
            <p className="text-xs text-slate-500">Tracked deliveries and dispatch accuracy by factory</p>
          </div>
          <span className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
            <Truck className="w-4 h-4" />
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {supplierStats.map((sup, idx) => (
            <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <h4 className="font-bold text-slate-900 leading-snug">{sup.name}</h4>
              <div className="flex justify-between text-slate-600">
                <span>Total Consignments:</span>
                <span className="font-bold text-slate-900 font-mono">{sup.total}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivered Store Receipts:</span>
                <span className="font-bold text-emerald-700 font-mono">{sup.delivered}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Currently in Transit:</span>
                <span className="font-bold text-blue-700 font-mono">{sup.inTransit}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold">
                <span>Fulfillment SLA:</span>
                <span className="text-emerald-800">{sup.rate}% Completed</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
