import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentRecord } from '../../types';
import { formatINR } from '../../services/financialEngine';
import { StatusBadge } from '../common/StatusBadge';
import { DataTable, Column } from '../common/DataTable';
import {
  CreditCard,
  RefreshCw,
  CheckCircle2,
  Clock,
  RotateCcw,
  X,
} from 'lucide-react';

export const PaymentRegister: React.FC = () => {
  const {
    state,
    resolvePendingPayment,
    retryPayment,
    issueRefund,
  } = useApp();

  const [refundPayment, setRefundPayment] = useState<PaymentRecord | null>(null);
  const [refundAmountRupees, setRefundAmountRupees] = useState<number>(1000);
  const [refundReason, setRefundReason] = useState<string>('Damaged units during monsoon transit');

  const handleRefundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundPayment) return;
    issueRefund(refundPayment.id, refundAmountRupees * 100, refundReason);
    setRefundPayment(null);
  };

  const columns: Column<PaymentRecord>[] = [
    {
      header: 'Provider Ref / ID',
      accessor: (row) => (
        <div>
          <div className="font-mono font-bold text-slate-900">{row.simulatedProviderRef}</div>
          <div className="text-[10px] text-slate-400 font-mono">Invoice: {row.invoiceNumber}</div>
        </div>
      ),
      sortKey: 'simulatedProviderRef',
    },
    {
      header: 'Buyer Organization',
      accessor: (row) => (
        <div>
          <div className="font-semibold text-slate-800">{row.organizationName}</div>
          <div className="text-[10px] text-slate-400">Payer: {row.payerName}</div>
        </div>
      ),
      sortKey: 'organizationName',
    },
    {
      header: 'Gateway Method',
      accessor: (row) => (
        <span className="font-medium text-slate-800 text-[11px] uppercase">
          {row.method.replace(/_/g, ' ')}
        </span>
      ),
      sortKey: 'method',
    },
    {
      header: 'Amount (INR)',
      accessor: (row) => (
        <span className="font-mono font-bold text-slate-900">
          {formatINR(row.amountPaise)}
        </span>
      ),
      sortKey: 'amountPaise',
    },
    {
      header: 'Status',
      accessor: (row) => <StatusBadge status={row.status} size="sm" />,
      sortKey: 'status',
    },
    {
      header: 'Timestamp',
      accessor: (row) => new Date(row.transactionTimestamp).toLocaleString(),
      sortKey: 'transactionTimestamp',
    },
    {
      header: 'Failure Reason / Audit',
      accessor: (row) => (
        <span className="text-[11px] text-slate-500 line-clamp-1">
          {row.failureReason || row.auditNote || 'Cleared'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payment Attempts & Transactions</h1>
          <p className="text-xs text-slate-500 mt-1">
            Audit register of simulated payments across all gateway rails (UPI, Net Banking, Cards, NEFT/RTGS).
          </p>
        </div>
      </div>

      <DataTable
        data={state.payments}
        columns={columns}
        searchPlaceholder="Search transactions by reference, buyer, or invoice..."
        statusFilterKey="status"
        statusOptions={['SUCCESS', 'FAILED', 'PENDING', 'REFUNDED']}
        filename="payment_register.csv"
        actions={(payment) => (
          <div className="flex items-center justify-end gap-1.5">
            {payment.status === 'PENDING' && (
              <button
                onClick={() => resolvePendingPayment(payment.id)}
                className="flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shadow-xs"
                title="Resolve pending bank clearance"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Resolve</span>
              </button>
            )}
            {payment.status === 'FAILED' && (
              <button
                onClick={() => retryPayment(payment.id, payment.method, true)}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs"
                title="Retry failed transaction"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            )}
            {payment.status === 'SUCCESS' && (
              <button
                onClick={() => {
                  setRefundPayment(payment);
                  setRefundAmountRupees(Math.round(payment.amountPaise / 100));
                }}
                className="flex items-center gap-1 px-2.5 py-1 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-medium"
                title="Issue partial or full refund"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Refund</span>
              </button>
            )}
          </div>
        )}
      />

      {/* Mock Refund Modal */}
      {refundPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Issue Simulated Refund</h3>
              <button
                onClick={() => setRefundPayment(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Record a refund transaction linked to {refundPayment.simulatedProviderRef} ({refundPayment.organizationName}).
            </p>

            <form onSubmit={handleRefundSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Refund Amount (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  max={refundPayment.amountPaise / 100}
                  value={refundAmountRupees}
                  onChange={(e) => setRefundAmountRupees(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold font-mono text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Reason for Refund</label>
                <input
                  type="text"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRefundPayment(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  Process Refund
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
