import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Invoice } from '../../types';
import { formatINR } from '../../services/financialEngine';
import { StatusBadge } from '../common/StatusBadge';
import { DataTable, Column } from '../common/DataTable';
import { PaymentCheckoutModal } from '../common/PaymentCheckoutModal';
import { InvoicePrintView } from '../common/InvoicePrintView';
import {
  FileText,
  CreditCard,
  Printer,
  ShieldCheck,
  Building2,
  Clock,
} from 'lucide-react';

export const MyInvoices: React.FC = () => {
  const { state, currentOrg } = useApp();

  const myInvoices = state.invoices.filter(
    (i) => i.buyerOrganizationId === currentOrg.id
  );

  const [checkoutInvoice, setCheckoutInvoice] = useState<Invoice | null>(null);
  const [printInvoice, setPrintInvoice] = useState<Invoice | null>(null);

  const totalOutstandingPaise = myInvoices.reduce(
    (sum, inv) => sum + inv.outstandingBalancePaise,
    0
  );

  const columns: Column<Invoice>[] = [
    {
      header: 'Invoice #',
      accessor: 'invoiceNumber',
      className: 'font-mono font-semibold text-slate-900',
    },
    {
      header: 'Supplier & Campaign',
      accessor: (row) => (
        <div>
          <div className="font-semibold text-slate-800">{row.supplierOrganizationName}</div>
          <div className="text-[10px] text-slate-400">Ref: {row.campaignNumber}</div>
        </div>
      ),
      sortKey: 'supplierOrganizationName',
    },
    {
      header: 'Issue / Due Date',
      accessor: (row) => (
        <div>
          <div>{row.issueDate}</div>
          <div className="text-[10px] text-slate-400">Due: {row.dueDate}</div>
        </div>
      ),
      sortKey: 'dueDate',
    },
    {
      header: 'Gross Subtotal',
      accessor: (row) => formatINR(row.subtotalPaise),
      sortKey: 'subtotalPaise',
    },
    {
      header: 'Bulk Discount',
      accessor: (row) => (
        <span className="font-mono text-emerald-700 font-semibold">
          -{formatINR(row.totalDiscountPaise)}
        </span>
      ),
      sortKey: 'totalDiscountPaise',
    },
    {
      header: 'Total Payable',
      accessor: (row) => (
        <span className="font-bold font-mono text-slate-900">
          {formatINR(row.grandTotalPaise)}
        </span>
      ),
      sortKey: 'grandTotalPaise',
    },
    {
      header: 'Balance Due',
      accessor: (row) => (
        <span
          className={`font-bold font-mono ${
            row.outstandingBalancePaise > 0 ? 'text-amber-700' : 'text-slate-400'
          }`}
        >
          {formatINR(row.outstandingBalancePaise)}
        </span>
      ),
      sortKey: 'outstandingBalancePaise',
    },
    {
      header: 'Status',
      accessor: (row) => <StatusBadge status={row.status} size="sm" />,
      sortKey: 'status',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Invoices & Billing</h1>
          <p className="text-xs text-slate-500 mt-1">
            Itemized pro-forma tax invoices with allocated volume discounts, proportional freight, and GST breakdowns.
          </p>
        </div>
        <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-xs flex items-center gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">
              Total Outstanding Balance
            </span>
            <span className="text-lg font-black text-amber-700 font-mono">
              {formatINR(totalOutstandingPaise)}
            </span>
          </div>
        </div>
      </div>

      {/* Invoices DataTable */}
      <DataTable
        data={myInvoices}
        columns={columns}
        searchPlaceholder="Search invoices by invoice #, supplier, or campaign..."
        statusFilterKey="status"
        statusOptions={['PAID', 'PARTIALLY_PAID', 'UNPAID', 'OVERDUE']}
        filename={`invoices_${currentOrg.id}.csv`}
        actions={(invoice) => (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => setPrintInvoice(invoice)}
              className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              title="Print / Save PDF"
            >
              <Printer className="w-4 h-4" />
            </button>
            {invoice.outstandingBalancePaise > 0 ? (
              <button
                onClick={() => setCheckoutInvoice(invoice)}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                Pay Now
              </button>
            ) : (
              <span className="text-xs font-semibold text-emerald-700 px-2 py-0.5 rounded bg-emerald-50">
                Settled
              </span>
            )}
          </div>
        )}
      />

      {/* Payment Checkout Simulator Modal */}
      {checkoutInvoice && (
        <PaymentCheckoutModal
          invoice={checkoutInvoice}
          isOpen={!!checkoutInvoice}
          onClose={() => setCheckoutInvoice(null)}
        />
      )}

      {/* Printable Invoice PDF View */}
      {printInvoice && (
        <InvoicePrintView
          invoice={printInvoice}
          isOpen={!!printInvoice}
          onClose={() => setPrintInvoice(null)}
        />
      )}
    </div>
  );
};
