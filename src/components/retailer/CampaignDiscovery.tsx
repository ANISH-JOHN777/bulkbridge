import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR, formatQuantity } from '../../services/financialEngine';
import { StatusBadge } from '../common/StatusBadge';
import {
  Layers,
  Search,
  Users,
  Clock,
  ArrowRight,
  TrendingDown,
  ShieldCheck,
  Building2,
  Sparkles,
} from 'lucide-react';

export const CampaignDiscovery: React.FC = () => {
  const { state, setActiveView } = useApp();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filteredCampaigns = state.campaigns.filter((c) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        c.title.toLowerCase().includes(q) ||
        c.campaignNumber.toLowerCase().includes(q) ||
        c.productName.toLowerCase().includes(q) ||
        c.supplierName.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (filterStatus === 'ACTIVE') {
      return ['OPEN', 'THRESHOLD_REACHED'].includes(c.status);
    }
    if (filterStatus === 'CONFIRMED') {
      return ['CONFIRMED', 'PURCHASING'].includes(c.status);
    }
    if (filterStatus === 'COMPLETED') {
      return ['FULFILLED', 'CLOSED'].includes(c.status);
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bulk Purchasing Marketplace</h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse active demand syndicates. Combine order volume with regional businesses to unlock volume discounts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('organizer-campaigns')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Launch New Campaign</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns by product, supplier, or campaign ID..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          {['ALL', 'ACTIVE', 'CONFIRMED', 'COMPLETED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCampaigns.map((camp) => {
          const progressPercent = Math.min(
            100,
            Math.round((camp.currentQuantity / camp.targetQuantity) * 100)
          );

          return (
            <div
              key={camp.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow group"
            >
              <div className="space-y-4">
                {/* Header Pills */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-500">
                    {camp.campaignNumber}
                  </span>
                  <StatusBadge status={camp.status} size="sm" />
                </div>

                {/* Title */}
                <div>
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
                    {camp.title}
                  </h3>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{camp.supplierName}</span>
                  </div>
                </div>

                {/* Target Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Pledged Volume:</span>
                    <span className="font-bold font-mono text-slate-900">
                      {camp.currentQuantity} / {camp.targetQuantity} {camp.unitOfMeasure}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        progressPercent >= 100 ? 'bg-emerald-500' : 'bg-emerald-600'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-emerald-700 font-semibold">
                      {camp.currentDiscountPercent}% Unlocked
                    </span>
                    {camp.nextTier && (
                      <span className="text-slate-500">
                        {camp.nextTier.quantityNeeded} more to {camp.nextTier.discountPercent}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Parameters Breakdown */}
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Base Price
                    </span>
                    <span className="font-mono font-bold text-slate-800">
                      {formatINR(camp.basePricePaise)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Participants
                    </span>
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-400" />
                      {camp.participants.length} businesses
                    </span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Ends {camp.endDate}</span>
                </div>
                <button
                  onClick={() => setActiveView('campaign-detail', camp.id)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
