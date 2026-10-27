import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ParticipantOrder, ShipmentStatus } from '../../types';
import { formatINR } from '../../services/financialEngine';
import { StatusBadge } from '../common/StatusBadge';
import { DataTable, Column } from '../common/DataTable';
import {
  Truck,
  Package,
  CheckCircle2,
  Clock,
  X,
  ExternalLink,
  Plus,
} from 'lucide-react';

export const SupplierOrders: React.FC = () => {
  const {
    state,
    currentOrg,
    createShipment,
    updateShipmentStatus,
  } = useApp();

  const myOrders = state.orders.filter((o) => o.supplierId === currentOrg.id);
  const myShipments = state.shipments.filter((s) => s.supplierId === currentOrg.id);

  const [shipmentModalOpen, setShipmentModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ParticipantOrder | null>(null);
  const [carrierName, setCarrierName] = useState('BlueDart Apex Surface');
  const [trackingNumber, setTrackingNumber] = useState('');

  const handleOpenShipment = (order: ParticipantOrder) => {
    setSelectedOrder(order);
    setTrackingNumber(`TRK-${Math.floor(10000000 + Math.random() * 90000000)}`);
    setShipmentModalOpen(true);
  };

  const handleCreateShipmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    createShipment(selectedOrder.id, carrierName, trackingNumber, []);
    setShipmentModalOpen(false);
  };

  const columns: Column<ParticipantOrder>[] = [
    {
      header: 'Order #',
      accessor: 'orderNumber',
      className: 'font-mono font-semibold text-slate-900',
    },
    {
      header: 'Buyer Store',
      accessor: (row) => (
        <div>
          <div className="font-semibold text-slate-900">{row.organizationName}</div>
          <div className="text-[10px] text-slate-400">
            {row.deliveryAddress.city}, {row.deliveryAddress.state}
          </div>
        </div>
      ),
      sortKey: 'organizationName',
    },
    {
      header: 'Product & Qty',
      accessor: (row) => (
        <div>
          <div className="font-medium text-slate-800">{row.productName}</div>
          <div className="text-xs font-bold text-slate-900 font-mono">
            {row.quantity} {row.unitOfMeasure}
          </div>
        </div>
      ),
      sortKey: 'quantity',
    },
    {
      header: 'Total Landed Value',
      accessor: (row) => (
        <span className="font-mono font-bold text-slate-900">
          {formatINR(row.finalPayablePaise)}
        </span>
      ),
      sortKey: 'finalPayablePaise',
    },
    {
      header: 'Fulfillment Status',
      accessor: (row) => <StatusBadge status={row.orderStatus} size="sm" />,
      sortKey: 'orderStatus',
    },
    {
      header: 'Payment Status',
      accessor: (row) => <StatusBadge status={row.paymentStatus} size="sm" />,
      sortKey: 'paymentStatus',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Factory Purchase Orders & Dispatch</h1>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch consignments, stage bulk pick-ups, and track live carrier manifests.
          </p>
        </div>
      </div>

      {/* Orders Table */}
      <DataTable
        data={myOrders}
        columns={columns}
        searchPlaceholder="Search orders by order #, buyer, or product..."
        statusFilterKey="orderStatus"
        statusOptions={['CONFIRMED', 'PROCESSING', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED']}
        filename={`supplier_orders_${currentOrg.id}.csv`}
        actions={(row) => {
          const hasShipment = !!row.shipmentId;
          const shipment = state.shipments.find((s) => s.id === row.shipmentId);

          return (
            <div className="flex items-center justify-end gap-2">
              {!hasShipment && ['CONFIRMED', 'PROCESSING'].includes(row.orderStatus) && (
                <button
                  onClick={() => handleOpenShipment(row)}
                  className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Dispatch</span>
                </button>
              )}
              {hasShipment && shipment && shipment.status !== 'DELIVERED' && (
                <button
                  onClick={() =>
                    updateShipmentStatus(
                      shipment.id,
                      shipment.status === 'DISPATCHED' ? 'IN_TRANSIT' : 'DELIVERED',
                      'Destination Hub'
                    )
                  }
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  {shipment.status === 'DISPATCHED' ? 'Mark In Transit' : 'Mark Delivered'}
                </button>
              )}
              {hasShipment && shipment && shipment.status === 'DELIVERED' && (
                <span className="text-xs text-emerald-700 font-semibold px-2 py-0.5 rounded bg-emerald-50">
                  Delivered
                </span>
              )}
            </div>
          );
        }}
      />

      {/* Create Shipment Modal */}
      {shipmentModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-mono text-emerald-600 font-bold uppercase">
                  Consignment Dispatch
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Order {selectedOrder.orderNumber}
                </h3>
                <p className="text-xs text-slate-500">
                  Deliver to: {selectedOrder.organizationName} ({selectedOrder.deliveryAddress.city})
                </p>
              </div>
              <button
                onClick={() => setShipmentModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateShipmentSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Commercial Carrier Partner
                </label>
                <select
                  value={carrierName}
                  onChange={(e) => setCarrierName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                >
                  <option>BlueDart Apex Surface</option>
                  <option>Delhivery B2B Logistics</option>
                  <option>VRL Logistics Surface Express</option>
                  <option>Safexpress Commercial Freight</option>
                  <option>TCI Freight Logistics</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Airway Bill / Tracking Docket #
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 font-semibold"
                  required
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Product:</span>
                  <span className="font-medium text-slate-900">{selectedOrder.productName}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Dispatched Units:</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {selectedOrder.quantity} {selectedOrder.unitOfMeasure}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShipmentModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  Confirm Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
