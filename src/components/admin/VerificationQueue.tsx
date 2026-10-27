import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, CheckCircle2, Building2, FileCheck, X } from 'lucide-react';

export const VerificationQueue: React.FC = () => {
  const { state, addToast } = useApp();

  const handleApproveKyc = (name: string) => {
    addToast('KYC Approved', `Trade verification confirmed for ${name}.`, 'success');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Trade & Factory Verification Queues</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review business KYC credentials, statutory trade licenses, and factory quality audit certifications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Business KYC Queue */}
        <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Retailer & Buyer KYC Queue</h3>
              <p className="text-xs text-slate-500">GSTIN validation & registered storefront inspections</p>
            </div>
            <span className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>

          <div className="space-y-3">
            {[
              {
                name: 'GreenMart Retail Pvt Ltd',
                doc: 'GSTIN Registration 29AAACG1234D1Z5 • APMC Trade License',
                status: 'Verified',
              },
              {
                name: 'Sri Lakshmi Stores',
                doc: 'GSTIN Registration 33AABCS4567M1Z4 • Shop & Establishment Act',
                status: 'Verified',
              },
              {
                name: 'Metro Home Supplies',
                doc: 'GSTIN Registration 27AAECM9012N1Z8 • Municipal Trade Certificate',
                status: 'Verified',
              },
              {
                name: 'Delta Electricals & Power',
                doc: 'GSTIN Registration 07AAACD7890B1Z1 • Electrical Contractor License',
                status: 'Verified',
              },
            ].map((item, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">{item.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{item.doc}</div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>{item.status}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Supplier Factory Audit Queue */}
        <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Factory Audit & Inspection Queue</h3>
              <p className="text-xs text-slate-500">ISO 9001, ISI standards, and production line audits</p>
            </div>
            <span className="p-2 bg-slate-100 text-slate-700 rounded-xl">
              <FileCheck className="w-4 h-4" />
            </span>
          </div>

          <div className="space-y-3">
            {[
              {
                name: 'Apex Lumens & Lighting Ltd',
                audit: 'BIS IS:16102 LED Safety • Chakan MIDC Plant Inspection',
                score: '98.4%',
              },
              {
                name: 'Bharat Agro Chemicals',
                audit: 'CIBRC Central Insecticides Board • Vadodara Chemical Zone',
                score: '96.2%',
              },
              {
                name: 'SunGold Oil Refineries Ltd',
                audit: 'FSSAI License 10018047000982 • Hyderabad Terminal Audit',
                score: '99.0%',
              },
              {
                name: 'Deccan Kraft Packaging Solutions',
                audit: 'Bursting Factor Testing Calibration • Peenya Plant 3',
                score: '97.5%',
              },
            ].map((item, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">{item.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{item.audit}</div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                  Audit: {item.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
