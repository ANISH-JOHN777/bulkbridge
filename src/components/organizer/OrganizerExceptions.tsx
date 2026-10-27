import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DataTable, Column } from '../common/DataTable';
import { AlertOctagon, MessageSquare, ShieldAlert, Send, CheckCircle2 } from 'lucide-react';

export const OrganizerExceptions: React.FC = () => {
  const { state, addToast } = useApp();

  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastCampaign, setBroadcastCampaign] = useState(state.campaigns[0]?.id || '');

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    addToast('Broadcast Sent', `Notification dispatched to all active participants in selected campaign.`, 'success');
    setBroadcastMessage('');
  };

  const supportColumns: Column<any>[] = [
    {
      header: 'Ticket #',
      accessor: 'ticketNumber',
      className: 'font-mono font-bold text-slate-900',
    },
    {
      header: 'Organization',
      accessor: 'organizationName',
      sortKey: 'organizationName',
    },
    {
      header: 'Subject & Category',
      accessor: (row) => (
        <div>
          <div className="font-semibold text-slate-800">{row.subject}</div>
          <div className="text-[10px] text-slate-400 font-bold uppercase">{row.category}</div>
        </div>
      ),
      sortKey: 'subject',
    },
    {
      header: 'Priority',
      accessor: (row) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
            row.priority === 'HIGH' || row.priority === 'URGENT'
              ? 'bg-rose-100 text-rose-800'
              : 'bg-slate-100 text-slate-700'
          }`}
        >
          {row.priority}
        </span>
      ),
      sortKey: 'priority',
    },
    {
      header: 'Status',
      accessor: (row) => (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
          {row.status}
        </span>
      ),
      sortKey: 'status',
    },
    {
      header: 'Created Date',
      accessor: (row) => new Date(row.createdAt).toLocaleDateString(),
      sortKey: 'createdAt',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Campaign Communications & Exception Center</h1>
        <p className="text-xs text-slate-500 mt-1">
          Broadcast cooperative notices, resolve participant exception requests, and maintain immutable communication records.
        </p>
      </div>

      {/* Broadcast Box */}
      <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-slate-900 font-bold text-sm">
          <MessageSquare className="w-4 h-4 text-emerald-600" />
          <span>Broadcast Syndicate Bulletin</span>
        </div>

        <form onSubmit={handleBroadcast} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Select Target Campaign</label>
              <select
                value={broadcastCampaign}
                onChange={(e) => setBroadcastCampaign(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
              >
                {state.campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.campaignNumber}: {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Message Text</label>
            <textarea
              rows={3}
              placeholder="e.g. Factory has confirmed batch scheduling. Delivery confirmed for upcoming Friday..."
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold shadow-xs transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast Bulletin</span>
            </button>
          </div>
        </form>
      </div>

      {/* Exception Inquiries Table */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm text-slate-900">Cooperative Participant Exception Log</h3>
        <DataTable
          data={state.supportCases}
          columns={supportColumns}
          searchPlaceholder="Search support tickets by ticket #, store..."
          filename="coop_exception_cases.csv"
        />
      </div>
    </div>
  );
};
