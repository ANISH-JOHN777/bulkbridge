import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../services/financialEngine';
import { DataTable, Column } from '../common/DataTable';
import { StatusBadge } from '../common/StatusBadge';
import {
  Scale,
  DollarSign,
  CheckCircle2,
  Clock,
  Building2,
  FileText,
} from 'lucide-react';

export const SupplierReconciliation: React.FC = () => {
  const { state, currentOrg } = useApp();

  const myOrders = state.orders.filter((o) => o.supplierId === currentOrg.id);
  const myInvoices = state.invoices.filter((i) => i.supplierOrganizationId === currentOrg.id);

  const totalInvoicedPaise = myInvoices.reduce((sum, i) => sum + i.grandTotalPaise, 0);
  const totalSettledPaise = myInvoices.reduce((sum, i) => sum + i.amountPaidPaise, 0);
  const totalPendingPaise = myInvoices.reduce((sum, i) => sum + i.outstandingBalancePaise, 0);

  const columns: Column<any>[] = [
    {
      header: 'Invoice #',
      accessor: 'invoiceNumber',
      className: 'font-mono font-semibold text-slate-900',
    },
    {
      header: 'Buyer Organization',
      accessor: 'buyerOrganizationName',
      sortKey: 'buyerOrganizationName',
    },
    {
      header: 'Issue / Due Date',
      accessor: (row) => `${row.issueDate} / ${row.dueDate}`,
    },
    {
      header: 'Billed Value',
      accessor: (row) => (
        <span className="font-mono font-bold text-slate-900">
          {formatINR(row.grandTotalPaise)}
        </span>
      ),
      sortKey: 'grandTotalPaise',
    },
    {
      header: 'Settled to Supplier',
      accessor: (row) => (
        <span className="font-mono text-emerald-700 font-semibold">
          {formatINR(row.amountPaidPaise)}
        </span>
      ),
      sortKey: 'amountPaidPaise',
    },
    {
      header: 'Escrow Receivable',
      accessor: (row) => (
        <span className="font-mono text-amber-700 font-semibold">
          {formatINR(row.outstandingBalancePaise)}
        </span>
      ),
      sortKey: 'outstandingBalancePaise',
    },
    {
      header: 'Settlement Status',
      accessor: (row) => <StatusBadge status={row.status} size="sm" />,
      sortKey: 'status',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Supplier Settlements & Payouts</h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor escrow releases, participant invoice settlements, and verified ledger reconciliations.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
          <span className="text-slate-400 text-xs">Total Invoiced Volume</span>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {formatINR(totalInvoicedPaise)}
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
          <span className="text-slate-400 text-xs">Total Disbursed Payouts</span>
          <div className="text-2xl font-black text-emerald-700 font-mono">
            {formatINR(totalSettledPaise)}
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
          <span className="text-slate-400 text-xs">Pending Escrow Settlements</span>
          <div className="text-2xl font-black text-amber-700 font-mono">
            {formatINR(totalPendingPaise)}
          </div>
        </div>
      </div>

      <DataTable
        data={myInvoices}
        columns={columns}
        searchPlaceholder="Search settlements by invoice, buyer..."
        statusFilterKey="status"
        statusOptions={['PAID', 'PARTIALLY_PAID', 'UNPAID', 'OVERDUE']}
        filename={`supplier_reconciliation_${currentOrg.id}.csv`}
      />
    </div>
  );
};
