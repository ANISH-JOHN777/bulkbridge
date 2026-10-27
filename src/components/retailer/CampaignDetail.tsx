import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR, formatQuantity } from '../../services/financialEngine';
import { StatusBadge } from '../common/StatusBadge';
import {
  ArrowLeft,
  Users,
  ShieldCheck,
  Building2,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  Layers,
  Info,
  DollarSign,
  Plus,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CampaignDetail: React.FC = () => {
  const {
    state,
    currentUser,
    currentOrg,
    activeCampaignId,
    setActiveView,
    joinCampaign,
    withdrawFromCampaign,
    approveParticipantTerms,
    submitSupplierQuotation,
    generatePurchaseOrder,
  } = useApp();

  const campaign = state.campaigns.find((c) => c.id === activeCampaignId) || state.campaigns[0];
  const product = state.products.find((p) => p.id === campaign.productId);

  const [pledgeUnits, setPledgeUnits] = useState<number>(20);
  const [pledgeModalOpen, setPledgeModalOpen] = useState(false);

  // Check if current user's organization is a participant
  const myParticipantRecord = campaign.participants.find(
    (p) => p.organizationId === currentOrg.id
  );

  const progressPercent = Math.min(
    100,
    Math.round((campaign.currentQuantity / campaign.targetQuantity) * 100)
  );

  const handleJoinOrUpdate = () => {
    joinCampaign(campaign.id, pledgeUnits);
    setPledgeModalOpen(false);
    try {
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
    } catch (_) {}
  };

  const handleApprove = () => {
    approveParticipantTerms(campaign.id, currentOrg.id);
  };

  const isOrganizer = currentUser.role === 'ORGANIZER' || currentUser.role === 'ADMIN';
  const isSupplier = currentUser.role === 'SUPPLIER';
  const isBuyer = currentUser.role === 'RETAILER';

  return (
    <div className="space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveView('retailer-campaigns')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-slate-400 font-semibold">
            {campaign.campaignNumber}
          </span>
          <StatusBadge status={campaign.status} />
        </div>
      </div>

      {/* Main Campaign Hero Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold uppercase tracking-wider">
              {campaign.category.replace(/_/g, ' ')}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {campaign.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                <Building2 className="w-4 h-4 text-slate-400" />
                Supplier: {campaign.supplierName}
              </span>
              <span>•</span>
              <span>Coordinator: {campaign.organizerName}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-600">
                <Clock className="w-3.5 h-3.5" />
                Closes: {campaign.endDate}
              </span>
            </div>
          </div>

          {/* User Status Badge / Action */}
          <div className="text-right">
            {myParticipantRecord ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-right space-y-1">
                <div className="text-[11px] font-semibold text-emerald-800 uppercase flex items-center justify-end gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>You Are Participating</span>
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {myParticipantRecord.requestedQuantity} {campaign.unitOfMeasure} Pledged
                </div>
                <div className="text-xs text-emerald-700 font-semibold font-mono">
                  Payable: {formatINR(myParticipantRecord.finalPayablePaise)}
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500">
                Not yet pledged in this group
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Tier Progression & Volume Gauge */}
        <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Consolidated Pool Volume Progress
              </span>
              <div className="text-2xl font-black text-slate-900 font-mono mt-0.5">
                {campaign.currentQuantity} / {campaign.targetQuantity} {campaign.unitOfMeasure}
                <span className="text-sm font-medium text-slate-500 ml-2">
                  ({progressPercent}% of target)
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-slate-500">Current Unlocked Tier</div>
              <div className="text-xl font-extrabold text-emerald-700 flex items-center gap-1.5 justify-end">
                <TrendingDown className="w-5 h-5" />
                <span>{campaign.currentDiscountPercent}% Volume Discount</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                progressPercent >= 100 ? 'bg-emerald-500' : 'bg-emerald-600'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Tier Schedule Milestones */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            {campaign.discountSchedule.map((tier) => {
              const isUnlocked = campaign.currentQuantity >= tier.minQuantity;
              return (
                <div
                  key={tier.id}
                  className={`p-3 rounded-xl border text-center text-xs transition-colors ${
                    isUnlocked
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold'
                      : 'bg-white border-slate-200 text-slate-500'
                  }`}
                >
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    {tier.minQuantity}
                    {tier.maxQuantity ? ` - ${tier.maxQuantity}` : '+'} Units
                  </div>
                  <div className="text-base font-extrabold mt-0.5">
                    {tier.discountPercent}% Discount
                  </div>
                  <div className="text-[10px] mt-0.5 text-slate-400">
                    {isUnlocked ? '✓ Unlocked' : 'Locked'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Next Tier Notice */}
          {campaign.nextTier && (
            <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-700">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Only <strong>{campaign.nextTier.quantityNeeded} more {campaign.unitOfMeasure}</strong> needed to unlock the <strong>{campaign.nextTier.discountPercent}% Tier</strong>!
                </span>
              </span>
              <button
                onClick={() => setPledgeModalOpen(true)}
                className="text-emerald-700 hover:text-emerald-800 font-semibold shrink-0"
              >
                Pledge Cartons →
              </button>
            </div>
          )}
        </div>

        {/* Participant Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Policy: {campaign.disclosedPolicy}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Buyer Pledge / Update */}
            {isBuyer && (
              <>
                <button
                  onClick={() => setPledgeModalOpen(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
                >
                  {myParticipantRecord ? 'Amend Requested Quantity' : 'Join Campaign & Pledge Units'}
                </button>

                {myParticipantRecord && ['OPEN', 'THRESHOLD_REACHED'].includes(campaign.status) && (
                  <button
                    onClick={() => withdrawFromCampaign(campaign.id, currentOrg.id)}
                    className="px-3 py-2 border border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 rounded-xl text-xs font-medium transition-colors"
                  >
                    Withdraw
                  </button>
                )}

                {myParticipantRecord &&
                  campaign.status === 'AWAITING_PARTICIPANT_APPROVAL' &&
                  !myParticipantRecord.approvedTerms && (
                    <button
                      onClick={handleApprove}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
                    >
                      Approve Allocated Terms
                    </button>
                  )}
              </>
            )}

            {/* Supplier Confirm Quotation */}
            {isSupplier && campaign.status === 'THRESHOLD_REACHED' && (
              <button
                onClick={() =>
                  submitSupplierQuotation(campaign.id, {
                    quotationNumber: `QT-2026-${Math.floor(100 + Math.random() * 900)}`,
                    unitPricePaise: campaign.basePricePaise,
                    appliedDiscountPercent: campaign.currentDiscountPercent,
                    deliveryChargePaise: 150000,
                    deliveryTerms: 'Factory warehouse dispatch',
                    paymentTerms: '14-day escrow settlement',
                    validUntil: '2026-04-30',
                    leadTimeDays: 7,
                    status: 'ACCEPTED',
                    submittedAt: new Date().toISOString(),
                  })
                }
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
              >
                Confirm Availability & Quotation
              </button>
            )}

            {/* Organizer Generate PO */}
            {isOrganizer &&
              (campaign.status === 'CONFIRMED' || campaign.status === 'AWAITING_PARTICIPANT_APPROVAL') && (
                <button
                  onClick={() => generatePurchaseOrder(campaign.id)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
                >
                  Generate Consolidated Purchase Order
                </button>
              )}
          </div>
        </div>
      </div>

      {/* Supplier Quotation Terms Review Card */}
      {campaign.quotation && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900">
                Official Supplier Quotation ({campaign.quotation.quotationNumber})
              </h3>
            </div>
            <StatusBadge status={campaign.quotation.status} size="sm" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                Agreed Unit Price
              </span>
              <span className="font-mono font-bold text-slate-800">
                {formatINR(campaign.quotation.unitPricePaise)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                Volume Discount
              </span>
              <span className="font-bold text-emerald-700">
                {campaign.quotation.appliedDiscountPercent}% Locked
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                Consolidated Delivery Charge
              </span>
              <span className="font-mono font-bold text-slate-800">
                {formatINR(campaign.quotation.deliveryChargePaise)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                Lead Time & Terms
              </span>
              <span className="font-medium text-slate-700">
                {campaign.quotation.leadTimeDays} days • {campaign.quotation.paymentTerms}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Privacy-Preserving Participant Breakdown Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Cooperative Participant Breakdown
            </h3>
            <p className="text-xs text-slate-500">
              Transparent volume sharing with enterprise competitor privacy safeguards
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
            {campaign.participants.length} Active Participants
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Business / Member</th>
                <th className="py-3 px-4">Pledged Units</th>
                <th className="py-3 px-4">Base Subtotal</th>
                <th className="py-3 px-4">Volume Discount</th>
                <th className="py-3 px-4">Freight Share</th>
                <th className="py-3 px-4">Estimated Tax</th>
                <th className="py-3 px-4">Final Payable</th>
                <th className="py-3 px-4 text-right">Terms Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {campaign.participants.map((p, idx) => {
                const isCurrentOrg = p.organizationId === currentOrg.id;
                // Privacy safeguard: if not current user's org and user is not admin/organizer, mask name
                const displayName =
                  isCurrentOrg || isOrganizer
                    ? p.organizationName
                    : `Cooperative Participant #${idx + 1} (${p.deliveryAddress.state})`;

                return (
                  <tr
                    key={p.organizationId}
                    className={`transition-colors ${
                      isCurrentOrg ? 'bg-emerald-50/40 font-medium' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <span>{displayName}</span>
                        {isCurrentOrg && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-600 text-white font-bold">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {p.deliveryAddress.city}, {p.deliveryAddress.state}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {p.requestedQuantity} {campaign.unitOfMeasure}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {formatINR(p.requestedQuantity * campaign.basePricePaise)}
                    </td>
                    <td className="py-3 px-4 font-mono text-emerald-700 font-semibold">
                      -{formatINR(p.allocatedDiscountPaise)}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {formatINR(p.allocatedShippingPaise)}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {formatINR(p.taxPaise)}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {formatINR(p.finalPayablePaise)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          p.approvedTerms
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {p.approvedTerms ? 'Terms Approved' : 'Pending Review'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pledge Drawer Modal */}
      {pledgeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Pledge Cartons for Campaign</h3>
              <button
                onClick={() => setPledgeModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Requested Quantity ({campaign.unitOfMeasure})
              </label>
              <input
                type="number"
                min="5"
                step="5"
                value={pledgeUnits}
                onChange={(e) => setPledgeUnits(Math.max(5, Number(e.target.value)))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold font-mono text-base text-slate-900 text-center"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Base price per carton: {formatINR(campaign.basePricePaise)}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Estimated Subtotal:</span>
                <span className="font-mono">{formatINR(pledgeUnits * campaign.basePricePaise)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Estimated Tier Discount ({campaign.currentDiscountPercent}%):</span>
                <span className="font-mono">
                  -{formatINR((pledgeUnits * campaign.basePricePaise * campaign.currentDiscountPercent) / 100)}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setPledgeModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleJoinOrUpdate}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                Confirm Commitment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
