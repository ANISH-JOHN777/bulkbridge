import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BulkCampaign, SupplierQuotation } from '../../types';
import { formatINR } from '../../services/financialEngine';
import { StatusBadge } from '../common/StatusBadge';
import { DataTable, Column } from '../common/DataTable';
import {
  Layers,
  FileCheck,
  Building2,
  Users,
  AlertCircle,
  X,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

export const SupplierCampaigns: React.FC = () => {
  const { state, currentOrg, setActiveView, submitSupplierQuotation } = useApp();

  const myCampaigns = state.campaigns.filter((c) => c.supplierId === currentOrg.id);

  const [selectedCampaign, setSelectedCampaign] = useState<BulkCampaign | null>(null);
  const [quotationModalOpen, setQuotationModalOpen] = useState(false);
  const [quotationPriceRupees, setQuotationPriceRupees] = useState<number>(1000);
  const [discountPercent, setDiscountPercent] = useState<number>(8);
  const [deliveryChargeRupees, setDeliveryChargeRupees] = useState<number>(1500);
  const [leadTimeDays, setLeadTimeDays] = useState<number>(7);
  const [paymentTerms, setPaymentTerms] = useState<string>('14-Day Escrow Net Settlement');
  const [revisionNotes, setRevisionNotes] = useState<string>('');

  const handleOpenQuotation = (camp: BulkCampaign) => {
    setSelectedCampaign(camp);
    setQuotationPriceRupees(camp.basePricePaise / 100);
    setDiscountPercent(camp.currentDiscountPercent || 8);
    setQuotationModalOpen(true);
  };

  const handleQuotationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaign) return;

    const quotation: SupplierQuotation = {
      quotationNumber: `QT-2026-${Math.floor(100 + Math.random() * 900)}`,
      unitPricePaise: quotationPriceRupees * 100,
      appliedDiscountPercent: discountPercent,
      deliveryChargePaise: deliveryChargeRupees * 100,
      deliveryTerms: 'Doorstep consolidated delivery to regional APMC / trade clusters',
      paymentTerms,
      validUntil: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      leadTimeDays,
      status: 'ACCEPTED',
      revisionNotes: revisionNotes.trim() || undefined,
      submittedAt: new Date().toISOString(),
    };

    submitSupplierQuotation(selectedCampaign.id, quotation);
    setQuotationModalOpen(false);
  };

  const columns: Column<BulkCampaign>[] = [
    {
      header: 'Campaign #',
      accessor: 'campaignNumber',
      className: 'font-mono font-semibold text-slate-900',
    },
    {
      header: 'Campaign & Product',
      accessor: (row) => (
        <div>
          <div className="font-semibold text-slate-900">{row.title}</div>
          <div className="text-[10px] text-slate-400">
            SKU: {row.productSku} • Closes: {row.endDate}
          </div>
        </div>
      ),
      sortKey: 'title',
    },
    {
      header: 'Consolidated Volume',
      accessor: (row) => (
        <span className="font-mono font-bold text-slate-900">
          {row.currentQuantity} / {row.targetQuantity} {row.unitOfMeasure}
        </span>
      ),
      sortKey: 'currentQuantity',
    },
    {
      header: 'Unlocked Discount',
      accessor: (row) => (
        <span className="font-bold text-emerald-700 font-mono">
          {row.currentDiscountPercent}% Off
        </span>
      ),
      sortKey: 'currentDiscountPercent',
    },
    {
      header: 'Participants',
      accessor: (row) => `${row.participants.length} businesses`,
    },
    {
      header: 'Campaign Status',
      accessor: (row) => <StatusBadge status={row.status} size="sm" />,
      sortKey: 'status',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Campaign Quotations & Inquiries</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review aggregated buyer demands, lock volume discounts, and issue binding supplier commercial terms.
          </p>
        </div>
      </div>

      {/* Campaigns Table */}
      <DataTable
        data={myCampaigns}
        columns={columns}
        searchPlaceholder="Search campaigns by ref, product, or SKU..."
        statusFilterKey="status"
        statusOptions={['OPEN', 'THRESHOLD_REACHED', 'AWAITING_SUPPLIER_QUOTATION', 'CONFIRMED', 'PURCHASING']}
        filename={`supplier_campaigns_${currentOrg.id}.csv`}
        actions={(row) => (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setActiveView('campaign-detail', row.id)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
            >
              View
            </button>
            {['OPEN', 'THRESHOLD_REACHED', 'AWAITING_SUPPLIER_QUOTATION'].includes(row.status) && (
              <button
                onClick={() => handleOpenQuotation(row)}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                Confirm Terms
              </button>
            )}
          </div>
        )}
      />

      {/* Supplier Quotation Modal */}
      {quotationModalOpen && selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-mono text-emerald-600 font-bold uppercase">
                  Commercial Quotation Submission
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {selectedCampaign.title}
                </h3>
                <p className="text-xs text-slate-500">
                  Aggregated Quantity: <strong>{selectedCampaign.currentQuantity} {selectedCampaign.unitOfMeasure}</strong>
                </p>
              </div>
              <button
                onClick={() => setQuotationModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuotationSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Confirmed Base Price (₹ / unit)
                  </label>
                  <input
                    type="number"
                    value={quotationPriceRupees}
                    onChange={(e) => setQuotationPriceRupees(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold font-mono text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Applied Discount (%)
                  </label>
                  <input
                    type="number"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold font-mono text-emerald-800"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Total Freight Charge (₹)
                  </label>
                  <input
                    type="number"
                    value={deliveryChargeRupees}
                    onChange={(e) => setDeliveryChargeRupees(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold font-mono text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Production Lead Time (Days)
                  </label>
                  <input
                    type="number"
                    value={leadTimeDays}
                    onChange={(e) => setLeadTimeDays(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold font-mono text-slate-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Settlement & Commercial Terms
                </label>
                <input
                  type="text"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Revision Notes (Disclosed to participants)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Confirmed batch quota for week 14 delivery"
                  value={revisionNotes}
                  onChange={(e) => setRevisionNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-amber-800 text-[11px] leading-relaxed">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Note:</strong> Locking commercial terms generates the formal quotation. Any subsequent price revisions will automatically trigger participant re-approval before PO generation.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setQuotationModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  Submit Binding Quotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
