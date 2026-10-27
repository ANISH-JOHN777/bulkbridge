import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AuditEvent } from '../../types';
import { DataTable, Column } from '../common/DataTable';
import { History, ShieldCheck, Activity, Search } from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const { state } = useApp();

  const columns: Column<AuditEvent>[] = [
    {
      header: 'Action',
      accessor: (row) => (
        <span className="font-mono font-bold text-slate-900 text-[11px]">
          {row.action}
        </span>
      ),
      sortKey: 'action',
    },
    {
      header: 'Entity Type & ID',
      accessor: (row) => (
        <div>
          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">
            {row.entityType}
          </span>
          <span className="font-mono text-slate-600 text-xs ml-1.5">{row.entityId}</span>
        </div>
      ),
      sortKey: 'entityType',
    },
    {
      header: 'State Shift',
      accessor: (row) => (
        <span className="text-xs text-slate-700 font-mono">
          <span className="text-slate-400">{row.previousState || 'NONE'}</span> →{' '}
          <strong className="text-emerald-700">{row.newState}</strong>
        </span>
      ),
    },
    {
      header: 'Actor & Role',
      accessor: (row) => (
        <div>
          <div className="font-semibold text-slate-900">{row.actorName}</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">{row.actorRole}</div>
        </div>
      ),
      sortKey: 'actorName',
    },
    {
      header: 'Reason / Explanation',
      accessor: (row) => (
        <span className="text-xs text-slate-600 line-clamp-2 max-w-sm">
          {row.reason}
        </span>
      ),
    },
    {
      header: 'Timestamp',
      accessor: (row) => new Date(row.timestamp).toLocaleString(),
      sortKey: 'timestamp',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Append-Only Compliance Audit Trail</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-xs font-semibold">
              Immutable
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete cryptographic audit trail recording all material campaign changes, quotation locks, allocations, payments, and shipments.
          </p>
        </div>
      </div>

      <DataTable
        data={state.auditEvents}
        columns={columns}
        searchPlaceholder="Search audit events by action, actor, or entity..."
        statusFilterKey="entityType"
        statusOptions={['CAMPAIGN', 'ORDER', 'INVOICE', 'PAYMENT', 'SHIPMENT', 'USER', 'QUOTATION', 'RETURN']}
        filename="compliance_audit_trail.csv"
      />
    </div>
  );
};
