import React from 'react';
import { Invoice } from '../../types';
import { formatINR } from '../../services/financialEngine';
import { Printer, Download, X, Building2, CheckCircle2 } from 'lucide-react';

interface InvoicePrintViewProps {
  invoice: Invoice;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoicePrintView: React.FC<InvoicePrintViewProps> = ({
  invoice,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden flex flex-col max-h-[95vh]">
        {/* Top Action Bar (hidden when printing) */}
        <div className="no-print p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">Invoice Document Preview</span>
            <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300 font-mono">
              {invoice.invoiceNumber}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Content Surface */}
        <div className="p-8 overflow-y-auto flex-1 bg-white text-slate-900 font-sans text-xs space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">BulkBridge</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold uppercase">
                  B2B Tax Invoice (Pro-Forma)
                </span>
              </div>
              <p className="text-slate-500 text-[11px]">Collaborative Bulk Purchasing Platform</p>
              <p className="text-slate-400 text-[10px] mt-0.5">Fictional Demo Document • Generated under Indian Commercial Rules</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-slate-900">{invoice.invoiceNumber}</div>
              <div className="text-slate-500 text-[11px] mt-0.5">Date: {invoice.issueDate}</div>
              <div className="text-slate-500 text-[11px]">Due Date: {invoice.dueDate}</div>
              <div className="mt-1">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    invoice.status === 'PAID'
                      ? 'bg-emerald-100 text-emerald-800'
                      : invoice.status === 'PARTIALLY_PAID'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {invoice.status}
                </span>
              </div>
            </div>
          </div>

          {/* Supplier & Buyer Party Information */}
          <div className="grid grid-cols-2 gap-8 border-b border-slate-200 pb-6">
            {/* Supplier / Seller */}
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Supplier / Manufacturer
              </h4>
              <div className="font-bold text-sm text-slate-900">{invoice.supplierOrganizationName}</div>
              <div className="text-slate-600 mt-0.5">{invoice.supplierAddress.street}</div>
              <div className="text-slate-600">
                {invoice.supplierAddress.city}, {invoice.supplierAddress.state} - {invoice.supplierAddress.pincode}
              </div>
              <div className="mt-2 font-mono text-[11px] text-slate-700">
                GSTIN: <strong>{invoice.supplierGstin}</strong> (Sample)
              </div>
            </div>

            {/* Buyer */}
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Billed To (Participant)
              </h4>
              <div className="font-bold text-sm text-slate-900">{invoice.buyerOrganizationName}</div>
              <div className="text-slate-600 mt-0.5">{invoice.buyerAddress.street}</div>
              <div className="text-slate-600">
                {invoice.buyerAddress.city}, {invoice.buyerAddress.state} - {invoice.buyerAddress.pincode}
              </div>
              <div className="mt-2 font-mono text-[11px] text-slate-700">
                GSTIN: <strong>{invoice.buyerGstin}</strong> (Sample)
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Campaign Ref: {invoice.campaignNumber}</div>
            </div>
          </div>

          {/* Itemized Table */}
          <div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-300 text-[11px] font-bold text-slate-600 uppercase">
                  <th className="py-2">Item Description</th>
                  <th className="py-2 text-right">Quantity</th>
                  <th className="py-2 text-right">Base Price</th>
                  <th className="py-2 text-right">Gross Total</th>
                  <th className="py-2 text-right">Allocated Discount</th>
                  <th className="py-2 text-right">Taxable Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className="text-slate-800">
                    <td className="py-3">
                      <div className="font-semibold text-slate-900">{item.description}</div>
                      <div className="text-slate-400 text-[10px]">SKU: {item.sku}</div>
                    </td>
                    <td className="py-3 text-right">{item.quantity} {item.unitOfMeasure}</td>
                    <td className="py-3 text-right">{formatINR(item.unitPricePaise)}</td>
                    <td className="py-3 text-right">{formatINR(item.subtotalPaise)}</td>
                    <td className="py-3 text-right text-emerald-700 font-medium">
                      -{formatINR(item.discountPaise)}
                    </td>
                    <td className="py-3 text-right font-medium">{formatINR(item.taxableBasePaise)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tax Breakdown & Totals */}
          <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-200">
            <div className="space-y-2">
              <h5 className="font-bold text-[11px] text-slate-700 uppercase">GST Tax Specification</h5>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1 text-[11px] text-slate-600">
                <div className="flex justify-between">
                  <span>Supply Type:</span>
                  <span className="font-medium text-slate-900">
                    {invoice.isInterState ? 'Inter-State (IGST)' : 'Intra-State (CGST + SGST)'}
                  </span>
                </div>
                {invoice.isInterState ? (
                  <div className="flex justify-between">
                    <span>IGST (5%):</span>
                    <span>{formatINR(invoice.igstTotalPaise)}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span>CGST (2.5%):</span>
                      <span>{formatINR(invoice.cgstTotalPaise)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SGST (2.5%):</span>
                      <span>{formatINR(invoice.sgstTotalPaise)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between font-bold pt-1 border-t border-slate-200 text-slate-900">
                  <span>Total Tax:</span>
                  <span>{formatINR(invoice.totalTaxPaise)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal (Gross):</span>
                <span>{formatINR(invoice.subtotalPaise)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Volume Bulk Discount:</span>
                <span>-{formatINR(invoice.totalDiscountPaise)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Proportional Freight / Shipping:</span>
                <span>{formatINR(invoice.allocatedShippingPaise)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST Tax Total:</span>
                <span>{formatINR(invoice.totalTaxPaise)}</span>
              </div>
              <div className="pt-2 border-t border-slate-300 flex justify-between font-bold text-sm text-slate-900">
                <span>Grand Total:</span>
                <span>{formatINR(invoice.grandTotalPaise)}</span>
              </div>
              <div className="flex justify-between text-blue-700">
                <span>Total Amount Paid:</span>
                <span>-{formatINR(invoice.amountPaidPaise)}</span>
              </div>
              <div className="pt-1 border-t border-slate-200 flex justify-between font-extrabold text-sm text-emerald-800">
                <span>Balance Due:</span>
                <span>{formatINR(invoice.outstandingBalancePaise)}</span>
              </div>
            </div>
          </div>

          {/* Legal / Compliance Disclaimer */}
          <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-400 space-y-1">
            <p className="font-semibold text-slate-500">{invoice.disclaimer}</p>
            <p>
              This is a demonstration invoice generated for simulation testing of collaborative B2B bulk purchases. Fictional GSTIN and business identities are used. All calculations are exact and reconciled to zero residual paise.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
