import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Invoice } from '../../types';
import { formatINR } from '../../services/financialEngine';
import { StatusBadge } from '../common/StatusBadge';
import { DataTable, Column } from '../common/DataTable';
import { InvoicePrintView } from '../common/InvoicePrintView';
import { PaymentCheckoutModal } from '../common/PaymentCheckoutModal';
import { Printer, CreditCard, FileText } from 'lucide-react';

export const InvoiceRegister: React.FC = () => {
  const { state } = useApp();

  const [printInvoice, setPrintInvoice] = useState<Invoice | null>(null);
  const [checkoutInvoice, setCheckoutInvoice] = useState<Invoice | null>(null);

  const columns: Column<Invoice>[] = [
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
      header: 'Supplier / Manufacturer',
      accessor: 'supplierOrganizationName',
      sortKey: 'supplierOrganizationName',
    },
    {
      header: 'Gross Total',
      accessor: (row) => formatINR(row.subtotalPaise),
      sortKey: 'subtotalPaise',
    },
    {
      header: 'Discount Allocated',
      accessor: (row) => (
        <span className="font-mono text-emerald-700 font-semibold">
          -{formatINR(row.totalDiscountPaise)}
        </span>
      ),
      sortKey: 'totalDiscountPaise',
    },
    {
      header: 'GST Tax',
      accessor: (row) => formatINR(row.totalTaxPaise),
      sortKey: 'totalTaxPaise',
    },
    {
      header: 'Final Payable',
      accessor: (row) => (
        <span className="font-mono font-bold text-slate-900">
          {formatINR(row.grandTotalPaise)}
        </span>
      ),
      sortKey: 'grandTotalPaise',
    },
    {
      header: 'Amount Paid',
      accessor: (row) => (
        <span className="font-mono text-emerald-700">
          {formatINR(row.amountPaidPaise)}
        </span>
      ),
      sortKey: 'amountPaidPaise',
    },
    {
      header: 'Balance',
      accessor: (row) => (
        <span
          className={`font-mono font-bold ${
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Central Invoices Register</h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete statutory ledger of all participant pro-forma invoices, discount deductions, and GST breakdowns.
          </p>
        </div>
      </div>

      <DataTable
        data={state.invoices}
        columns={columns}
        searchPlaceholder="Search by invoice #, buyer, supplier..."
        statusFilterKey="status"
        statusOptions={['PAID', 'PARTIALLY_PAID', 'UNPAID', 'OVERDUE']}
        filename="central_invoice_register.csv"
        actions={(invoice) => (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => setPrintInvoice(invoice)}
              className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              title="Print / PDF Preview"
            >
              <Printer className="w-4 h-4" />
            </button>
            {invoice.outstandingBalancePaise > 0 && (
              <button
                onClick={() => setCheckoutInvoice(invoice)}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                Pay
              </button>
            )}
          </div>
        )}
      />

      {printInvoice && (
        <InvoicePrintView
          invoice={printInvoice}
          isOpen={!!printInvoice}
          onClose={() => setPrintInvoice(null)}
        />
      )}

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
