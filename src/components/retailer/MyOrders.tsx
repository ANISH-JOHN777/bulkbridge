import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ParticipantOrder } from '../../types';
import { formatINR } from '../../services/financialEngine';
import { StatusBadge } from '../common/StatusBadge';
import { DataTable, Column } from '../common/DataTable';
import {
  FileText,
  Truck,
  CheckCircle2,
  Clock,
  X,
  Building2,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';

export const MyOrders: React.FC = () => {
  const { state, currentOrg, setActiveView, submitReturnRequest } = useApp();

  const myOrders = state.orders.filter((o) => o.organizationId === currentOrg.id);

  const [selectedOrder, setSelectedOrder] = useState<ParticipantOrder | null>(null);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returnQty, setReturnQty] = useState(1);
  const [returnReason, setReturnReason] = useState<any>('DAMAGED_IN_TRANSIT');

  const columns: Column<ParticipantOrder>[] = [
    {
      header: 'Order #',
      accessor: 'orderNumber',
      className: 'font-mono font-semibold text-slate-900',
    },
    {
      header: 'Campaign & Product',
      accessor: (row) => (
        <div>
          <div className="font-semibold text-slate-800">{row.productName}</div>
          <div className="text-[10px] text-slate-400">
            {row.campaignNumber} • {row.supplierName}
          </div>
        </div>
      ),
      sortKey: 'productName',
    },
    {
      header: 'Quantity',
      accessor: (row) => `${row.quantity} ${row.unitOfMeasure}`,
      sortKey: 'quantity',
    },
    {
      header: 'Gross Total',
      accessor: (row) => formatINR(row.subtotalPaise),
      sortKey: 'subtotalPaise',
    },
    {
      header: 'Final Payable',
      accessor: (row) => (
        <span className="font-bold text-slate-900 font-mono">
          {formatINR(row.finalPayablePaise)}
        </span>
      ),
      sortKey: 'finalPayablePaise',
    },
    {
      header: 'Order Status',
      accessor: (row) => <StatusBadge status={row.orderStatus} size="sm" />,
      sortKey: 'orderStatus',
    },
    {
      header: 'Payment',
      accessor: (row) => <StatusBadge status={row.paymentStatus} size="sm" />,
      sortKey: 'paymentStatus',
    },
  ];

  const handleReturnSubmit = () => {
    if (!selectedOrder) return;
    submitReturnRequest(selectedOrder.id, selectedOrder.productId, returnQty, returnReason);
    setReturnModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Purchase Orders</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track consolidated orders, allocated payment balances, and delivery progression timelines.
          </p>
        </div>
      </div>

      {/* Orders DataTable */}
      <DataTable
        data={myOrders}
        columns={columns}
        searchPlaceholder="Search orders by order #, product, or campaign..."
        statusFilterKey="orderStatus"
        statusOptions={['CONFIRMED', 'PROCESSING', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED']}
        filename={`orders_${currentOrg.id}.csv`}
        onRowClick={(order) => setSelectedOrder(order)}
        actions={(row) => (
          <button
            onClick={() => setSelectedOrder(row)}
            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium transition-colors"
          >
            Timeline
          </button>
        )}
      />

      {/* Order Detail & Timeline Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-200">
                <div>
                  <span className="font-mono text-xs text-emerald-700 font-bold uppercase">
                    Order Details
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">{selectedOrder.orderNumber}</h3>
                  <p className="text-xs text-slate-500">
                    Campaign: {selectedOrder.campaignNumber} ({selectedOrder.campaignTitle})
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status and Summary Cards */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Order Status</span>
                  <div>
                    <StatusBadge status={selectedOrder.orderStatus} size="sm" />
                  </div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Payment Status</span>
                  <div>
                    <StatusBadge status={selectedOrder.paymentStatus} size="sm" />
                  </div>
                </div>
              </div>

              {/* Financial Allocation Itemization */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <h4 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider mb-2">
                  Itemized Financial Breakdown
                </h4>
                <div className="flex justify-between text-slate-600">
                  <span>Unit Base Price:</span>
                  <span className="font-mono">{formatINR(selectedOrder.unitPricePaise)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Quantity Ordered:</span>
                  <span className="font-mono">{selectedOrder.quantity} {selectedOrder.unitOfMeasure}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Base Gross Subtotal:</span>
                  <span className="font-mono">{formatINR(selectedOrder.subtotalPaise)}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Allocated Bulk Discount:</span>
                  <span className="font-mono">-{formatINR(selectedOrder.discountPaise)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Allocated Proportional Shipping:</span>
                  <span className="font-mono">{formatINR(selectedOrder.shippingPaise)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST Tax (5%):</span>
                  <span className="font-mono">{formatINR(selectedOrder.taxPaise)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
                  <span>Final Payable Amount:</span>
                  <span className="font-mono text-emerald-700">
                    {formatINR(selectedOrder.finalPayablePaise)}
                  </span>
                </div>
                <div className="flex justify-between text-blue-700 text-xs">
                  <span>Amount Settled:</span>
                  <span className="font-mono">{formatINR(selectedOrder.amountPaidPaise)}</span>
                </div>
                <div className="flex justify-between font-bold text-xs text-amber-700">
                  <span>Outstanding Balance:</span>
                  <span className="font-mono">{formatINR(selectedOrder.outstandingBalancePaise)}</span>
                </div>
              </div>

              {/* Order Progression Timeline */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                  Fulfillment & Delivery Timeline
                </h4>
                <div className="relative pl-6 space-y-4 border-l-2 border-slate-200 ml-2">
                  {selectedOrder.timeline.map((event, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-white" />
                      <div className="text-xs font-bold text-slate-900 capitalize">
                        {event.status.toLowerCase().replace(/_/g, ' ')}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {new Date(event.timestamp).toLocaleString()} • Actor: {event.actor}
                      </div>
                      {event.note && (
                        <div className="text-xs text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100 mt-1">
                          {event.note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-2">
              {selectedOrder.orderStatus === 'DELIVERED' && (
                <button
                  onClick={() => setReturnModalOpen(true)}
                  className="px-3 py-2 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Report Damage / Return</span>
                </button>
              )}
              {selectedOrder.invoiceId && (
                <button
                  onClick={() => {
                    setActiveView('retailer-invoices', selectedOrder.invoiceId);
                    setSelectedOrder(null);
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold ml-auto transition-colors"
                >
                  View Invoice
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Return / Damage Request Modal */}
      {returnModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Report Damaged Goods / Return</h3>
              <button
                onClick={() => setReturnModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Submit a formal damage claim or return request for order {selectedOrder.orderNumber}. Warehouse and finance will inspect and issue a Credit Note.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Quantity Damaged ({selectedOrder.unitOfMeasure})
              </label>
              <input
                type="number"
                min="1"
                max={selectedOrder.quantity}
                value={returnQty}
                onChange={(e) => setReturnQty(Math.max(1, Math.min(selectedOrder.quantity, Number(e.target.value))))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold font-mono text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Reason for Claim
              </label>
              <select
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
              >
                <option value="DAMAGED_IN_TRANSIT">Water / Impact Damage in Transit</option>
                <option value="DEFECTIVE_PRODUCT">Manufacturing Defect / Non-functional</option>
                <option value="WRONG_SPECIFICATION">Specification Mismatch</option>
                <option value="SHORTAGE">Quantity Shortage upon Delivery</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setReturnModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleReturnSubmit}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                Submit Claim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
