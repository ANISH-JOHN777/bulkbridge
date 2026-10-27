import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { exportStateAsJSON, importStateFromJSON } from '../../services/storageService';
import {
  Settings,
  Download,
  Upload,
  RotateCcw,
  ShieldAlert,
  CheckCircle2,
  Globe,
  Database,
} from 'lucide-react';

export const SystemSettings: React.FC = () => {
  const { state, resetDemo, addToast } = useApp();

  const [importJson, setImportJson] = useState('');

  const handleExport = () => {
    const json = exportStateAsJSON(state);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bulkbridge_database_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('State Exported', 'Database backup downloaded as JSON.', 'success');
  };

  const handleImport = () => {
    if (!importJson.trim()) return;
    const imported = importStateFromJSON(importJson.trim());
    if (imported) {
      window.location.reload();
    } else {
      addToast('Import Failed', 'Invalid JSON backup format.', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">System Configuration & Data Management</h1>
        <p className="text-xs text-slate-500 mt-1">
          Demonstration persistence controls, multi-currency extensibility, and state backup / restore utilities.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        {/* Currency & Locale Extensibility */}
        <div>
          <h3 className="font-bold text-sm text-slate-900 mb-1 flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-600" />
            <span>Currency & Regional Fiscal Configuration</span>
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            BulkBridge financial architecture uses minor-unit integer arithmetic (paise) with decoupled formatting, allowing seamless multi-currency adaptation.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Default Currency</span>
              <div className="font-bold text-slate-900 text-sm">Indian Rupee (INR - ₹)</div>
              <p className="text-[10px] text-slate-400">1 INR = 100 Paise • En-IN Locale formatting</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Statutory Tax Engine</span>
              <div className="font-bold text-slate-900 text-sm">Indian GST (CGST + SGST / IGST)</div>
              <p className="text-[10px] text-slate-400">State-boundary inter-state supply detection</p>
            </div>
          </div>
        </div>

        {/* Database Backup & Restore */}
        <div className="pt-6 border-t border-slate-100 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-600" />
            <span>State Backup & Portability</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
              <div>
                <h4 className="font-bold text-slate-900">Export State Backup</h4>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Save all current campaigns, orders, invoices, and payments as a portable JSON file.
                </p>
              </div>
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON Database</span>
              </button>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
              <div>
                <h4 className="font-bold text-slate-900">Restore Backup</h4>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Paste previously exported JSON state to restore.
                </p>
              </div>
              <textarea
                rows={2}
                placeholder="Paste JSON state..."
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-mono text-[11px]"
              />
              <button
                onClick={handleImport}
                disabled={!importJson.trim()}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl font-semibold shadow-xs transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import & Reload</span>
              </button>
            </div>
          </div>
        </div>

        {/* Demo Reset Danger Zone */}
        <div className="pt-6 border-t border-slate-100 space-y-3">
          <h3 className="font-bold text-sm text-rose-700 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>Reset Demo State to Clean Factory Seeds</span>
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Restores the application to the exact initial state (7 users, 16 organizations, 42 products, 12 campaigns, 30 orders, 12 invoices, 20 payment attempts). Useful for starting a fresh demonstration tour.
          </p>

          <button
            onClick={() => {
              if (window.confirm('Reset all demo state to fresh deterministic seed data?')) {
                resetDemo();
              }
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset to Initial Factory Seeds</span>
          </button>
        </div>
      </div>
    </div>
  );
};
