import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentRecord, Invoice } from '../../types';
import { formatINR } from '../../services/financialEngine';
import { StatusBadge } from '../common/StatusBadge';
import { DataTable, Column } from '../common/DataTable';
import { PaymentCheckoutModal } from '../common/PaymentCheckoutModal';
import {
  CreditCard,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  ShieldCheck,
  Building2,
  DollarSign,
} from 'lucide-react';

export const MyPayments: React.FC = () => {
  const {
    state,
    currentOrg,
    resolvePendingPayment,
    retryPayment,
  } = useApp();

  const myPayments = state.payments.filter((p) => p.organizationId === currentOrg.id);
  const myInvoices = state.invoices.filter((i) => i.buyerOrganizationId === currentOrg.id);
  const unpaidInvoices = myInvoices.filter((i) => i.outstandingBalancePaise > 0);

  const [checkoutInvoice, setCheckoutInvoice] = useState<Invoice | null>(null);

  const totalPaidPaise = myPayments
    .filter((p) => p.status === 'SUCCESS')
    .reduce((sum, p) => sum + p.amountPaise, 0);

  const columns: Column<PaymentRecord>[] = [
    {
      header: 'Simulated Ref / ID',
      accessor: (row) => (
        <div>
          <div className="font-mono font-bold text-slate-900">{row.simulatedProviderRef}</div>
          <div className="text-[10px] text-slate-400 font-mono">Invoice: {row.invoiceNumber}</div>
        </div>
      ),
      sortKey: 'simulatedProviderRef',
    },
    {
      header: 'Method',
      accessor: (row) => (
        <span className="font-medium text-slate-800 uppercase text-[11px]">
          {row.method.replace(/_/g, ' ')}
        </span>
      ),
      sortKey: 'method',
    },
    {
      header: 'Amount',
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
      header: 'Audit Note / Failure Reason',
      accessor: (row) => (
        <span className="text-[11px] text-slate-500 line-clamp-1">
          {row.failureReason || row.auditNote || 'Simulated transaction cleared'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payments & Settlements</h1>
          <p className="text-xs text-slate-500 mt-1">
            Simulated transaction attempts, idempotent retries, and instant settlement clearance controls.
          </p>
        </div>
        <div className="flex items-center gap-4 p-3 bg-white border border-slate-200 rounded-2xl shadow-xs text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Paid</span>
            <span className="text-lg font-black text-emerald-700 font-mono">
              {formatINR(totalPaidPaise)}
            </span>
          </div>
        </div>
      </div>

      {/* Unpaid Invoices Quick Pay Strip */}
      {unpaidInvoices.length > 0 && (
        <div className="p-5 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Outstanding Invoices Awaiting Settlement ({unpaidInvoices.length})</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {unpaidInvoices.map((inv) => (
              <div
                key={inv.id}
                className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-xs flex items-center justify-between"
              >
                <div>
                  <div className="font-mono font-bold text-xs text-slate-900">
                    {inv.invoiceNumber}
                  </div>
                  <div className="text-[11px] text-slate-500">Due: {inv.dueDate}</div>
                  <div className="text-xs font-bold text-amber-800 font-mono mt-1">
                    Due: {formatINR(inv.outstandingBalancePaise)}
                  </div>
                </div>
                <button
                  onClick={() => setCheckoutInvoice(inv)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  Pay Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Attempts History Table */}
      <DataTable
        data={myPayments}
        columns={columns}
        searchPlaceholder="Search payments by provider ref, invoice, or method..."
        statusFilterKey="status"
        statusOptions={['SUCCESS', 'FAILED', 'PENDING', 'REFUNDED']}
        filename={`payments_${currentOrg.id}.csv`}
        actions={(payment) => (
          <div className="flex items-center justify-end gap-1.5">
            {payment.status === 'FAILED' && (
              <button
                onClick={() => retryPayment(payment.id, payment.method, true)}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors"
                title="Retry failed payment with simulated success"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry</span>
              </button>
            )}
            {payment.status === 'PENDING' && (
              <button
                onClick={() => resolvePendingPayment(payment.id)}
                className="flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-medium transition-colors"
                title="Resolve pending bank clearance"
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>Resolve</span>
              </button>
            )}
          </div>
        )}
      />

      {/* Checkout Simulator Modal */}
      {checkoutInvoice && (
        <PaymentCheckoutModal
          invoice={checkoutInvoice}
          isOpen={!!checkoutInvoice}
          onClose={() => setCheckoutInvoice(null)}
        />
      )}
    </div>
  );
};
