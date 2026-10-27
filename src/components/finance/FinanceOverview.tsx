import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../services/financialEngine';
import { StatusBadge } from '../common/StatusBadge';
import {
  DollarSign,
  Scale,
  CreditCard,
  FileText,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export const FinanceOverview: React.FC = () => {
  const { state, setActiveView } = useApp();

  const totalInvoicedPaise = state.invoices.reduce((sum, i) => sum + i.grandTotalPaise, 0);
  const totalCollectedPaise = state.invoices.reduce((sum, i) => sum + i.amountPaidPaise, 0);
  const totalReceivablesPaise = state.invoices.reduce((sum, i) => sum + i.outstandingBalancePaise, 0);
  const totalOverduePaise = state.invoices
    .filter((i) => i.status === 'OVERDUE')
    .reduce((sum, i) => sum + i.outstandingBalancePaise, 0);

  const successfulPaymentsCount = state.payments.filter((p) => p.status === 'SUCCESS').length;
  const failedPaymentsCount = state.payments.filter((p) => p.status === 'FAILED').length;
  const pendingPaymentsCount = state.payments.filter((p) => p.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Finance & Billing Controller</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-xs font-semibold">
              Statutory Controller
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative financial dashboard for multi-organization invoices, payment ledger tracking, and zero-residual audits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('finance-reconciliation')}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Scale className="w-4 h-4" />
            <span>Zero-Residual Audit</span>
          </button>
        </div>
      </div>

      {/* Financial KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Total Invoiced Gross</span>
            <div className="p-2 bg-slate-100 text-slate-700 rounded-xl">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {formatINR(totalInvoicedPaise)}
          </div>
          <div className="text-[11px] text-slate-500">{state.invoices.length} issued invoices</div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Collected Payments</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono">
            {formatINR(totalCollectedPaise)}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold">
            {successfulPaymentsCount} successful transactions
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Outstanding Receivables</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-700 font-mono">
            {formatINR(totalReceivablesPaise)}
          </div>
          <div className="text-[11px] text-slate-500">Unpaid balance in billing cycle</div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Overdue Amount</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-700 font-mono">
            {formatINR(totalOverduePaise)}
          </div>
          <div className="text-[11px] text-rose-600 font-semibold">Past statutory due date</div>
        </div>
      </div>

      {/* Transaction & Settlement Summary Banner */}
      <div className="p-6 bg-slate-900 text-white rounded-3xl shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Central Multi-Party Reconciliation
          </span>
          <h3 className="text-lg font-bold text-white">
            Exact Macro-to-Micro Ledger Agreement
          </h3>
          <p className="text-xs text-slate-300">
            Consolidated purchase orders reconcile with participant invoices down to ₹0.00 discrepancy.
          </p>
        </div>
        <button
          onClick={() => setActiveView('finance-reconciliation')}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          Inspect Zero-Residual Proof
        </button>
      </div>

      {/* Recent Ledger Invoices Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Recent Enterprise Invoices</h3>
            <p className="text-xs text-slate-500">Latest pro-forma commercial invoices across all business organizations</p>
          </div>
          <button
            onClick={() => setActiveView('finance-invoices')}
            className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
          >
            View all invoices →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Buyer Store</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Paid Amount</th>
                <th className="py-3 px-4">Balance</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.invoices.slice(0, 6).map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                  <td className="py-3 px-4 font-medium text-slate-800">{inv.buyerOrganizationName}</td>
                  <td className="py-3 px-4 text-slate-600">{inv.supplierOrganizationName}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{formatINR(inv.grandTotalPaise)}</td>
                  <td className="py-3 px-4 font-mono text-emerald-700">{formatINR(inv.amountPaidPaise)}</td>
                  <td className="py-3 px-4 font-mono font-bold text-amber-700">{formatINR(inv.outstandingBalancePaise)}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={inv.status} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
