import React from 'react';
import { useApp } from '../../context/AppContext';
import { InventoryMovement } from '../../types';
import { formatQuantity } from '../../services/financialEngine';
import { DataTable, Column } from '../common/DataTable';
import { Package, TrendingUp, TrendingDown, ArrowDownRight, ArrowUpRight } from 'lucide-react';

export const InventoryLedgerView: React.FC = () => {
  const { state } = useApp();

  const columns: Column<InventoryMovement>[] = [
    {
      header: 'SKU & Product',
      accessor: (row) => (
        <div>
          <div className="font-mono font-bold text-slate-900">{row.productSku}</div>
          <div className="text-[11px] text-slate-600 truncate max-w-xs">{row.productName}</div>
        </div>
      ),
      sortKey: 'productSku',
    },
    {
      header: 'Warehouse Location',
      accessor: 'warehouseLocation',
      sortKey: 'warehouseLocation',
    },
    {
      header: 'Quantity Change',
      accessor: (row) => {
        const isPositive = row.quantityChange > 0;
        return (
          <span
            className={`font-mono font-bold flex items-center gap-1 ${
              isPositive ? 'text-emerald-700' : 'text-slate-800'
            }`}
          >
            {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            {isPositive ? `+${row.quantityChange}` : row.quantityChange}
          </span>
        );
      },
      sortKey: 'quantityChange',
    },
    {
      header: 'Balance After',
      accessor: (row) => (
        <span className="font-mono font-semibold text-slate-900">
          {formatQuantity(row.balanceAfter)}
        </span>
      ),
      sortKey: 'balanceAfter',
    },
    {
      header: 'Movement Reason',
      accessor: (row) => (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 uppercase">
          {row.reason.replace(/_/g, ' ')}
        </span>
      ),
      sortKey: 'reason',
    },
    {
      header: 'Responsible Actor',
      accessor: 'actor',
      sortKey: 'actor',
    },
    {
      header: 'Timestamp',
      accessor: (row) => new Date(row.timestamp).toLocaleString(),
      sortKey: 'timestamp',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Perpetual Inventory Stock Ledger</h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable movement audit tracking dispatch deductions, factory receipts, and return restocks across regional warehouses.
          </p>
        </div>
      </div>

      <DataTable
        data={state.inventoryMovements}
        columns={columns}
        searchPlaceholder="Search inventory by SKU, product, or warehouse..."
        statusFilterKey="reason"
        statusOptions={['INITIAL_STOCK', 'CAMPAIGN_FULFILLMENT', 'SUPPLIER_RESTOCK', 'RETURN_RESTOCK', 'DAMAGE_WRITE_OFF']}
        filename="inventory_movement_ledger.csv"
      />
    </div>
  );
};
