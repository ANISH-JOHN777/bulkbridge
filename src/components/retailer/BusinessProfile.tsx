import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../services/financialEngine';
import {
  Building2,
  MapPin,
  FileText,
  Users,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
} from 'lucide-react';

export const BusinessProfile: React.FC = () => {
  const { currentOrg, currentUser, state, addToast } = useApp();

  const [addressStreet, setAddressStreet] = useState(currentOrg.address.street);
  const [addressCity, setAddressCity] = useState(currentOrg.address.city);
  const [addressState, setAddressState] = useState(currentOrg.address.state);
  const [addressPincode, setAddressPincode] = useState(currentOrg.address.pincode);

  const orgUsers = state.users.filter((u) => u.organizationId === currentOrg.id);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('Profile Updated', 'Organization delivery address and billing details saved.', 'success');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Organization & Trade Profile</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your verified commercial identity, registered delivery locations, and authorized personnel.
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl">
              {currentOrg.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{currentOrg.name}</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-1 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>KYC Verified</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{currentOrg.industryCategory || 'Retail & Wholesale Trade'}</p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-400">Cooperative Credit Limit</div>
            <div className="text-lg font-bold text-slate-900 font-mono">
              {formatINR(currentOrg.creditLimitPaise || 50000000)}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold">
              Available: {formatINR(currentOrg.availableCreditPaise || 38500000)}
            </div>
          </div>
        </div>

        {/* Tax & Commercial Identifiers */}
        <div>
          <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-3">
            Simulated Commercial Identifiers
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Sample GSTIN</span>
              <div className="font-mono font-bold text-sm text-slate-900">{currentOrg.gstin}</div>
              <p className="text-[10px] text-slate-400">Registered with Karnataka GST Authority (Fictional)</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Sample PAN</span>
              <div className="font-mono font-bold text-sm text-slate-900">{currentOrg.pan}</div>
              <p className="text-[10px] text-slate-400">Central Board of Direct Taxes entity record</p>
            </div>
          </div>
        </div>

        {/* Registered Delivery Location Form */}
        <form onSubmit={handleSave} className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
            Primary Store Delivery Location
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block text-slate-600 font-medium mb-1">Street Address</label>
              <input
                type="text"
                value={addressStreet}
                onChange={(e) => setAddressStreet(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">City</label>
              <input
                type="text"
                value={addressCity}
                onChange={(e) => setAddressCity(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">State</label>
              <input
                type="text"
                value={addressState}
                onChange={(e) => setAddressState(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Pincode</label>
              <input
                type="text"
                value={addressPincode}
                onChange={(e) => setAddressPincode(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Country</label>
              <input
                type="text"
                disabled
                value="India"
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-500"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              Save Address
            </button>
          </div>
        </form>

        {/* Authorized Team Members */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
            Authorized Procurement Team
          </h3>
          <div className="space-y-2">
            {orgUsers.map((user) => (
              <div
                key={user.id}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900">{user.name}</div>
                  <div className="text-slate-500 text-[11px]">{user.designation || user.role} • {user.email}</div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                  Signatory
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
