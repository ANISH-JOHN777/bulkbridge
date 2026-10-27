import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Organization, User } from '../../types';
import { DataTable, Column } from '../common/DataTable';
import { StatusBadge } from '../common/StatusBadge';
import { Users, Building2, ShieldCheck, CheckCircle2, X } from 'lucide-react';

export const UserOrgManagement: React.FC = () => {
  const { state, switchUser, addToast } = useApp();

  const [activeTab, setActiveTab] = useState<'USERS' | 'ORGS'>('ORGS');

  const orgColumns: Column<Organization>[] = [
    {
      header: 'Organization Name',
      accessor: (row) => (
        <div>
          <div className="font-bold text-slate-900">{row.name}</div>
          <div className="text-[10px] text-slate-400">{row.industryCategory || row.type}</div>
        </div>
      ),
      sortKey: 'name',
    },
    {
      header: 'Type',
      accessor: (row) => (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
          {row.type}
        </span>
      ),
      sortKey: 'type',
    },
    {
      header: 'Sample GSTIN / PAN',
      accessor: (row) => (
        <div>
          <div className="font-mono text-slate-800 font-semibold">{row.gstin}</div>
          <div className="font-mono text-[10px] text-slate-400">PAN: {row.pan}</div>
        </div>
      ),
    },
    {
      header: 'Registered Location',
      accessor: (row) => `${row.address.city}, ${row.address.state}`,
    },
    {
      header: 'KYC Status',
      accessor: (row) => (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
            row.isVerified ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800'
          }`}
        >
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          <span>{row.isVerified ? 'Verified' : 'Pending'}</span>
        </span>
      ),
    },
  ];

  const userColumns: Column<User>[] = [
    {
      header: 'User Name',
      accessor: (row) => (
        <div>
          <div className="font-bold text-slate-900">{row.name}</div>
          <div className="text-[10px] text-slate-400">{row.designation || 'Signatory'}</div>
        </div>
      ),
      sortKey: 'name',
    },
    {
      header: 'Demo Email',
      accessor: 'email',
      sortKey: 'email',
      className: 'font-mono text-slate-700',
    },
    {
      header: 'Assigned Role',
      accessor: (row) => (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-white uppercase">
          {row.role}
        </span>
      ),
      sortKey: 'role',
    },
    {
      header: 'Organization',
      accessor: (row) => {
        const org = state.organizations.find((o) => o.id === row.organizationId);
        return org?.name || 'BulkBridge Platform';
      },
    },
    {
      header: 'Phone (Sample)',
      accessor: 'phone',
      className: 'font-mono text-slate-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User & Business Organization Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Directory of all 7 demo accounts and 16 participating commercial enterprises.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('ORGS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'ORGS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Organizations ({state.organizations.length})
          </button>
          <button
            onClick={() => setActiveTab('USERS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'USERS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Demo Users ({state.users.length})
          </button>
        </div>
      </div>

      {activeTab === 'ORGS' ? (
        <DataTable
          data={state.organizations}
          columns={orgColumns}
          searchPlaceholder="Search organizations by name, GSTIN, city..."
          filename="organizations.csv"
          actions={(org) => (
            <button
              onClick={() => addToast('KYC Verification', `Inspected verification documents for ${org.name}`, 'info')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
            >
              Audit KYC
            </button>
          )}
        />
      ) : (
        <DataTable
          data={state.users}
          columns={userColumns}
          searchPlaceholder="Search demo users by name, role, email..."
          filename="demo_users.csv"
          actions={(user) => (
            <button
              onClick={() => switchUser(user.id)}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              Switch Role
            </button>
          )}
        />
      )}
    </div>
  );
};
