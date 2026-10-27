import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../services/financialEngine';
import {
  Scale,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Info,
  Clock,
  Truck,
  TrendingDown,
  Star,
} from 'lucide-react';

export const SupplierComparison: React.FC = () => {
  const { state } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<'ELECTRICAL' | 'FMCG' | 'PACKAGING'>('ELECTRICAL');

  const comparisonProfiles = [
    {
      supplierName: 'Apex Lumens & Lighting Ltd',
      location: 'Chakan MIDC, Pune, Maharashtra',
      category: 'ELECTRICAL',
      productName: '9W LED Bulbs (Carton of 50)',
      basePricePaise: 100000, // ₹1,000
      maxDiscountPercent: 12,
      netLandedPricePaise: 88000 + 3000, // ₹880 + ₹30 freight = ₹910
      leadTimeDays: 7,
      reliabilityScore: 98.4,
      paymentTerms: '14-Day Escrow Settlement',
      deliveryTerms: 'Doorstep consolidated delivery',
      isRecommended: true,
      recommendationReason: 'Lowest total landed cost per carton with highest on-time fulfillment track record (98.4%).',
    },
    {
      supplierName: 'Surya PolyLite Components',
      location: 'Noida Phase II, Uttar Pradesh',
      category: 'ELECTRICAL',
      productName: '9W LED Bulbs (Carton of 50)',
      basePricePaise: 105000,
      maxDiscountPercent: 15, // Higher discount %, but higher base and freight!
      netLandedPricePaise: 89250 + 6500, // ₹892.50 + ₹65 freight = ₹957.50
      leadTimeDays: 12,
      reliabilityScore: 91.2,
      paymentTerms: '100% Advance before dispatch',
      deliveryTerms: 'Ex-works factory gate',
      isRecommended: false,
      recommendationReason: 'Nominally higher discount (15%) is offset by higher base price and ex-works shipping surcharges.',
    },
    {
      supplierName: 'Deccan Kraft Packaging Solutions',
      location: 'Peenya Industrial Area, Bengaluru',
      category: 'PACKAGING',
      productName: 'Standard 3-Ply Corrugated Shipping Boxes',
      basePricePaise: 125000,
      maxDiscountPercent: 11,
      netLandedPricePaise: 111250 + 1000,
      leadTimeDays: 5,
      reliabilityScore: 99.1,
      paymentTerms: '30-Day Cooperative Credit',
      deliveryTerms: 'Direct APMC hub drop',
      isRecommended: true,
      recommendationReason: 'Optimal proximity to Southern retail hubs reduces transport emissions and turnaround times to 5 days.',
    },
    {
      supplierName: 'SunGold Oil Refineries Ltd',
      location: 'IDA Nacharam, Hyderabad, Telangana',
      category: 'FMCG',
      productName: 'SunGold Refined Sunflower Oil (15L Commercial Tin)',
      basePricePaise: 185000,
      maxDiscountPercent: 8,
      netLandedPricePaise: 170200 + 2000,
      leadTimeDays: 4,
      reliabilityScore: 97.8,
      paymentTerms: '100% Advance via Escrow',
      deliveryTerms: 'Insulated food-grade tanker transport',
      isRecommended: true,
      recommendationReason: 'Direct refinery pricing with certified FSSAI purity compliance and dedicated logistics.',
    },
  ];

  const filtered = comparisonProfiles.filter((p) => p.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Cooperative Supplier Comparison Matrix</h1>
        <p className="text-xs text-slate-500 mt-1">
          Objective evaluation of manufacturing partners based on total landed cost, factory reliability, and lead times.
        </p>
      </div>

      {/* Disclosed Policy Banner */}
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-emerald-900 text-xs">
        <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold">Transparent Landing Cost Policy</h4>
          <p className="text-[11px] mt-0.5 leading-relaxed text-emerald-800">
            BulkBridge evaluates suppliers on <strong>Total Landed Cost</strong> (Base Price - Volume Discount + Freight + Tax + Reliability Adjustment) rather than face discount percentages alone. A nominal 15% discount with high freight often costs more than a 12% all-inclusive contract.
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2">
        {(['ELECTRICAL', 'PACKAGING', 'FMCG'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {cat === 'ELECTRICAL' && 'Electrical & Lighting'}
            {cat === 'PACKAGING' && 'Packaging & Cartons'}
            {cat === 'FMCG' && 'FMCG & Edible Oils'}
          </button>
        ))}
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filtered.map((supplier, idx) => (
          <div
            key={idx}
            className={`p-6 bg-white border rounded-3xl shadow-xs space-y-5 transition-shadow hover:shadow-md relative overflow-hidden ${
              supplier.isRecommended ? 'border-emerald-300 ring-1 ring-emerald-400/20' : 'border-slate-200'
            }`}
          >
            {supplier.isRecommended && (
              <div className="absolute top-0 right-0 bg-emerald-600 text-white font-bold text-[10px] px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Recommended Contract</span>
              </div>
            )}

            <div>
              <span className="text-[11px] font-mono text-slate-400 font-semibold">{supplier.productName}</span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">{supplier.supplierName}</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{supplier.location}</span>
              </p>
            </div>

            {/* Metrics Matrix */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Net Landed Cost</span>
                <div className="text-lg font-black text-slate-900 font-mono">
                  {formatINR(supplier.netLandedPricePaise)}
                </div>
                <div className="text-[10px] text-slate-500">Base {formatINR(supplier.basePricePaise)} - {supplier.maxDiscountPercent}% tier</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Reliability Score</span>
                <div className="text-lg font-black text-emerald-700 font-mono flex items-center gap-1">
                  <Star className="w-4 h-4 fill-emerald-600 text-emerald-600" />
                  <span>{supplier.reliabilityScore}%</span>
                </div>
                <div className="text-[10px] text-slate-500">On-time factory fulfillment</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Lead Time</span>
                <div className="text-sm font-bold text-slate-900">{supplier.leadTimeDays} Business Days</div>
                <div className="text-[10px] text-slate-500">Production to delivery</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Payment Terms</span>
                <div className="text-xs font-bold text-slate-900 truncate">{supplier.paymentTerms}</div>
                <div className="text-[10px] text-slate-500">{supplier.deliveryTerms}</div>
              </div>
            </div>

            {/* Objective Recommendation Note */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed">
              <span className="font-bold text-slate-900 block mb-0.5">Coordinator Audit Finding:</span>
              {supplier.recommendationReason}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
