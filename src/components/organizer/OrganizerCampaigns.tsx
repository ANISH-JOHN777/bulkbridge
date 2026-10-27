import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BulkCampaign } from '../../types';
import { formatINR } from '../../services/financialEngine';
import { StatusBadge } from '../common/StatusBadge';
import { DataTable, Column } from '../common/DataTable';
import {
  Layers,
  Plus,
  FileCheck,
  Building2,
  X,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const OrganizerCampaigns: React.FC = () => {
  const { state, createCampaign, generatePurchaseOrder, setActiveView } = useApp();

  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);

  // Form State
  const [title, setTitle] = useState('');
  const [selectedProductId, setSelectedProductId] = useState(state.products[0]?.id || '');
  const [targetQuantity, setTargetQuantity] = useState(100);
  const [endDate, setEndDate] = useState('2026-04-30');
  const [withdrawalDeadline, setWithdrawalDeadline] = useState('2026-04-20');
  const [deliveryTerms, setDeliveryTerms] = useState('Consolidated freight delivery to regional APMC clusters');
  const [disclosedPolicy, setDisclosedPolicy] = useState('Withdrawals permitted until quotation lock. Shared freight allocated per carton.');

  const selectedProduct = state.products.find((p) => p.id === selectedProductId) || state.products[0];

  const handleCreateSubmit = () => {
    createCampaign({
      title: title.trim() || `Collective Wholesale Drive: ${selectedProduct.name}`,
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      productSku: selectedProduct.sku,
      category: selectedProduct.category,
      supplierId: selectedProduct.supplierId,
      supplierName: selectedProduct.supplierName,
      targetQuantity,
      unitOfMeasure: selectedProduct.unitOfMeasure,
      basePricePaise: selectedProduct.basePricePaise,
      endDate,
      withdrawalDeadline,
      deliveryTerms,
      disclosedPolicy,
    });
    setWizardOpen(false);
    setWizardStep(1);
    setTitle('');
  };

  const columns: Column<BulkCampaign>[] = [
    {
      header: 'Ref #',
      accessor: 'campaignNumber',
      className: 'font-mono font-semibold text-slate-900',
    },
    {
      header: 'Campaign & Product',
      accessor: (row) => (
        <div>
          <div className="font-semibold text-slate-900">{row.title}</div>
          <div className="text-[10px] text-slate-400">
            {row.supplierName} • {row.productSku}
          </div>
        </div>
      ),
      sortKey: 'title',
    },
    {
      header: 'Consolidated Units',
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
        <span className="font-mono font-bold text-emerald-700">
          {row.currentDiscountPercent}% Off
        </span>
      ),
      sortKey: 'currentDiscountPercent',
    },
    {
      header: 'Participants',
      accessor: (row) => `${row.participants.length} stores`,
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
          <h1 className="text-2xl font-bold text-slate-900">Campaign Management & PO Generation</h1>
          <p className="text-xs text-slate-500 mt-1">
            Author and configure collective bulk campaigns, aggregate commitments, and issue purchase orders.
          </p>
        </div>
        <button
          onClick={() => setWizardOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Launch Campaign Wizard</span>
        </button>
      </div>

      {/* Campaigns DataTable */}
      <DataTable
        data={state.campaigns}
        columns={columns}
        searchPlaceholder="Search campaigns by ref, product, or supplier..."
        statusFilterKey="status"
        statusOptions={['OPEN', 'THRESHOLD_REACHED', 'AWAITING_SUPPLIER_QUOTATION', 'CONFIRMED', 'PURCHASING', 'FULFILLED', 'CLOSED']}
        filename="all_campaigns.csv"
        actions={(camp) => (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => setActiveView('campaign-detail', camp.id)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
            >
              Details
            </button>
            {(camp.status === 'CONFIRMED' || camp.status === 'AWAITING_PARTICIPANT_APPROVAL') && (
              <button
                onClick={() => generatePurchaseOrder(camp.id)}
                className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                Generate PO
              </button>
            )}
          </div>
        )}
      />

      {/* 4-Step Campaign Creator Wizard Modal */}
      {wizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-mono text-emerald-600 font-bold uppercase">
                  Step {wizardStep} of 4: Campaign Setup Wizard
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {wizardStep === 1 && 'Select Supplier & Eligible Product'}
                  {wizardStep === 2 && 'Define Volume Targets & Tier Schedule'}
                  {wizardStep === 3 && 'Schedule Deadlines & Delivery Terms'}
                  {wizardStep === 4 && 'Disclosed Policies & Review'}
                </h3>
              </div>
              <button
                onClick={() => setWizardOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step 1: Product & Supplier */}
            {wizardStep === 1 && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Campaign Marketing Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Q2 Commercial LED Bulbs Cooperative Procurement"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Select Eligible Factory Product
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                  >
                    {state.products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {p.supplierName} ({formatINR(p.basePricePaise)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>Base Factory Price:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {formatINR(selectedProduct.basePricePaise)} / {selectedProduct.unitOfMeasure}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Minimum Order Quantity:</span>
                    <span className="font-semibold text-slate-900">{selectedProduct.moq} units</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Manufacturer:</span>
                    <span className="font-semibold text-slate-900">{selectedProduct.supplierName}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Target Volume & Discount Schedule */}
            {wizardStep === 2 && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Minimum Target Threshold ({selectedProduct.unitOfMeasure})
                  </label>
                  <input
                    type="number"
                    min="10"
                    value={targetQuantity}
                    onChange={(e) => setTargetQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold font-mono text-slate-900"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Campaign will transition to THRESHOLD_REACHED once pledged orders reach this volume.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <span className="font-bold text-[10px] uppercase text-slate-500">
                    Pre-Configured Tier Schedule
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 bg-white rounded border border-slate-200 text-center">
                      <div className="text-[10px] text-slate-400">50 - 99 Units</div>
                      <div className="font-bold text-emerald-700">5% Discount</div>
                    </div>
                    <div className="p-2 bg-white rounded border border-slate-200 text-center">
                      <div className="text-[10px] text-slate-400">100 - 199 Units</div>
                      <div className="font-bold text-emerald-700">8% Discount</div>
                    </div>
                    <div className="p-2 bg-white rounded border border-slate-200 text-center">
                      <div className="text-[10px] text-slate-400">200+ Units</div>
                      <div className="font-bold text-emerald-700">12% Discount</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Schedule & Delivery */}
            {wizardStep === 3 && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">
                      Campaign Closing Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">
                      Withdrawal Deadline
                    </label>
                    <input
                      type="date"
                      value={withdrawalDeadline}
                      onChange={(e) => setWithdrawalDeadline(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Delivery Arrangement
                  </label>
                  <input
                    type="text"
                    value={deliveryTerms}
                    onChange={(e) => setDeliveryTerms(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Disclosed Policies & Review */}
            {wizardStep === 4 && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Disclosed Withdrawal & Cancellation Policy
                  </label>
                  <textarea
                    rows={3}
                    value={disclosedPolicy}
                    onChange={(e) => setDisclosedPolicy(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                  />
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-emerald-900">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Ready for Launch</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Once published, independent retailers across your regional cooperative can immediately join, pledge units, and track real-time tier progression.
                  </p>
                </div>
              </div>
            )}

            {/* Wizard Navigation */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setWizardStep((s) => Math.max(1, s - 1))}
                disabled={wizardStep === 1}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-medium disabled:opacity-40"
              >
                Back
              </button>

              {wizardStep < 4 ? (
                <button
                  type="button"
                  onClick={() => setWizardStep((s) => Math.min(4, s + 1))}
                  className="flex items-center gap-1 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCreateSubmit}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  Publish Bulk Campaign
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
