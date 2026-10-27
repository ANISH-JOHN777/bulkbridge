import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Shipment, ShipmentStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { DataTable, Column } from '../common/DataTable';
import {
  Truck,
  CheckCircle2,
  Clock,
  Package,
  X,
  MapPin,
  ExternalLink,
} from 'lucide-react';

export const WarehouseShipments: React.FC = () => {
  const { state, updateShipmentStatus } = useApp();

  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);

  const columns: Column<Shipment>[] = [
    {
      header: 'Shipment #',
      accessor: 'shipmentNumber',
      className: 'font-mono font-semibold text-slate-900',
    },
    {
      header: 'Carrier & Tracking',
      accessor: (row) => (
        <div>
          <div className="font-semibold text-slate-800">{row.carrierName}</div>
          <div className="font-mono text-[10px] text-slate-400">{row.trackingNumber}</div>
        </div>
      ),
      sortKey: 'carrierName',
    },
    {
      header: 'Destination Store',
      accessor: 'buyerOrganizationName',
      sortKey: 'buyerOrganizationName',
    },
    {
      header: 'Supplier Factory',
      accessor: 'supplierName',
      sortKey: 'supplierName',
    },
    {
      header: 'Est. Delivery Date',
      accessor: 'estimatedDeliveryDate',
      sortKey: 'estimatedDeliveryDate',
    },
    {
      header: 'Shipment Status',
      accessor: (row) => <StatusBadge status={row.status} size="sm" />,
      sortKey: 'status',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Shipments & Carrier Dispatch</h1>
          <p className="text-xs text-slate-500 mt-1">
            Commercial logistics tracking across surface transport networks (BlueDart, Delhivery, VRL, Safexpress).
          </p>
        </div>
      </div>

      <DataTable
        data={state.shipments}
        columns={columns}
        searchPlaceholder="Search shipments by tracking #, buyer, or carrier..."
        statusFilterKey="status"
        statusOptions={['CONFIRMED', 'PICKING', 'PACKED', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED']}
        filename="warehouse_shipments.csv"
        onRowClick={(shp) => setSelectedShipment(shp)}
        actions={(shp) => (
          <div className="flex items-center justify-end gap-1.5">
            {shp.status !== 'DELIVERED' && (
              <button
                onClick={() => {
                  const nextStatus: ShipmentStatus =
                    shp.status === 'CONFIRMED' ? 'PICKING' :
                    shp.status === 'PICKING' ? 'PACKED' :
                    shp.status === 'PACKED' ? 'DISPATCHED' :
                    shp.status === 'DISPATCHED' ? 'IN_TRANSIT' : 'DELIVERED';
                  updateShipmentStatus(shp.id, nextStatus, 'Regional Hub');
                }}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors"
              >
                Advance Status
              </button>
            )}
            <button
              onClick={() => setSelectedShipment(shp)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
            >
              Timeline
            </button>
          </div>
        )}
      />

      {/* Shipment Timeline Drawer */}
      {selectedShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              <div className="flex items-start justify-between pb-4 border-b border-slate-200">
                <div>
                  <span className="font-mono text-xs text-emerald-700 font-bold uppercase">
                    Carrier Manifest Tracking
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">{selectedShipment.shipmentNumber}</h3>
                  <p className="text-xs text-slate-500">
                    Carrier: {selectedShipment.carrierName} • Docket: {selectedShipment.trackingNumber}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedShipment(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status & Destination */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Status:</span>
                  <StatusBadge status={selectedShipment.status} size="sm" />
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Destination Store:</span>
                  <span className="font-semibold text-slate-900">{selectedShipment.buyerOrganizationName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Estimated Delivery:</span>
                  <span className="font-semibold text-slate-900">{selectedShipment.estimatedDeliveryDate}</span>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                  Live Checkpoint Timeline
                </h4>
                <div className="relative pl-6 space-y-4 border-l-2 border-slate-200 ml-2">
                  {selectedShipment.timeline.map((event, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-white" />
                      <div className="text-xs font-bold text-slate-900 capitalize">
                        {event.status.toLowerCase().replace(/_/g, ' ')}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {new Date(event.timestamp).toLocaleString()} • Location: {event.location}
                      </div>
                      {event.notes && (
                        <div className="text-xs text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100 mt-1">
                          {event.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedShipment(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
