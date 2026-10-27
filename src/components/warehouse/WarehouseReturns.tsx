import React from 'react';
import { useApp } from '../../context/AppContext';
import { ReturnCase } from '../../types';
import { formatINR } from '../../services/financialEngine';
import { StatusBadge } from '../common/StatusBadge';
import { DataTable, Column } from '../common/DataTable';
import { RotateCcw, CheckCircle2, XCircle, FileText } from 'lucide-react';

export const WarehouseReturns: React.FC = () => {
  const { state, approveReturnRequest } = useApp();

  const columns: Column<ReturnCase>[] = [
    {
      header: 'Case #',
      accessor: 'returnNumber',
      className: 'font-mono font-semibold text-slate-900',
    },
    {
      header: 'Buyer Store',
      accessor: 'buyerOrganizationName',
      sortKey: 'buyerOrganizationName',
    },
    {
      header: 'Product & Qty',
      accessor: (row) => (
        <div>
          <div className="font-semibold text-slate-800">{row.productName}</div>
          <div className="font-mono text-xs text-rose-700 font-bold">{row.quantityReturned} units returned</div>
        </div>
      ),
      sortKey: 'quantityReturned',
    },
    {
      header: 'Claim Reason',
      accessor: (row) => (
        <span className="text-[11px] font-semibold text-slate-700">
          {row.reason.replace(/_/g, ' ')}
        </span>
      ),
      sortKey: 'reason',
    },
    {
      header: 'Claimed Date',
      accessor: (row) => new Date(row.claimedAt).toLocaleDateString(),
      sortKey: 'claimedAt',
    },
    {
      header: 'Status',
      accessor: (row) => <StatusBadge status={row.status} size="sm" />,
      sortKey: 'status',
    },
    {
      header: 'Credit Note / Refund',
      accessor: (row) => (
        <span className="font-mono font-bold text-emerald-700">
          {row.refundAmountPaise ? formatINR(row.refundAmountPaise) : 'Pending'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Damage Claims, Returns & Credit Notes</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review buyer damage inspection reports, approve legitimate returns, and issue Credit Notes.
          </p>
        </div>
      </div>

      <DataTable
        data={state.returns}
        columns={columns}
        searchPlaceholder="Search return claims by case #, store, or product..."
        statusFilterKey="status"
        statusOptions={['PENDING_REVIEW', 'APPROVED', 'REJECTED']}
        filename="return_claims.csv"
        actions={(row) => (
          <div className="flex items-center justify-end gap-1.5">
            {row.status === 'PENDING_REVIEW' && (
              <button
                onClick={() => approveReturnRequest(row.id)}
                className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approve & Issue Credit</span>
              </button>
            )}
          </div>
        )}
      />
    </div>
  );
};
