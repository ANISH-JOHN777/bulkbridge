import React from 'react';
import { useApp } from '../../context/AppContext';
import { CreditNote } from '../../types';
import { formatINR } from '../../services/financialEngine';
import { DataTable, Column } from '../common/DataTable';
import { RotateCcw, FileText, CheckCircle2 } from 'lucide-react';

export const RefundCreditNotes: React.FC = () => {
  const { state } = useApp();

  const columns: Column<CreditNote>[] = [
    {
      header: 'Credit Note #',
      accessor: 'creditNoteNumber',
      className: 'font-mono font-bold text-slate-900',
    },
    {
      header: 'Buyer Store',
      accessor: 'buyerOrganizationName',
      sortKey: 'buyerOrganizationName',
    },
    {
      header: 'Amount (INR)',
      accessor: (row) => (
        <span className="font-mono font-bold text-emerald-700">
          {formatINR(row.amountPaise)}
        </span>
      ),
      sortKey: 'amountPaise',
    },
    {
      header: 'Issued Reason',
      accessor: 'reason',
      sortKey: 'reason',
    },
    {
      header: 'Issued Date',
      accessor: (row) => new Date(row.issuedAt).toLocaleDateString(),
      sortKey: 'issuedAt',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Refunds & Credit Notes Ledger</h1>
        <p className="text-xs text-slate-500 mt-1">
          Statutory register of issued credit adjustments, transit damage reimbursements, and refund disbursements.
        </p>
      </div>

      <DataTable
        data={state.creditNotes}
        columns={columns}
        searchPlaceholder="Search credit notes by reference or store..."
        filename="credit_notes_ledger.csv"
      />
    </div>
  );
};
