import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = status.toUpperCase().replace(/\s+/g, '_');

  let bg = 'bg-slate-100 text-slate-700 border-slate-200';
  let dot = 'bg-slate-400';

  // Green / Emerald = Success / Confirmed / Paid / Fulfilled
  if (['PAID', 'CONFIRMED', 'DELIVERED', 'ACCEPTED', 'FULFILLED', 'SUCCESS', 'APPROVED', 'VERIFIED'].includes(normalized)) {
    bg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    dot = 'bg-emerald-500';
  }
  // Amber = Pending / Awaiting / Partial / Draft / Open
  else if (['PENDING', 'AWAITING_SUPPLIER_QUOTATION', 'AWAITING_PARTICIPANT_APPROVAL', 'PARTIALLY_PAID', 'PARTIALLY_DELIVERED', 'PARTIALLY_FULFILLED', 'IN_PROGRESS', 'THRESHOLD_REACHED', 'OPEN', 'PENDING_REVIEW'].includes(normalized)) {
    bg = 'bg-amber-50 text-amber-800 border-amber-200';
    dot = 'bg-amber-500';
  }
  // Blue / Indigo = Dispatched / Purchasing / In Transit / Processing / Picking / Packed
  else if (['DISPATCHED', 'IN_TRANSIT', 'PURCHASING', 'PROCESSING', 'PICKING', 'PACKED', 'ACTIVE'].includes(normalized)) {
    bg = 'bg-blue-50 text-blue-800 border-blue-200';
    dot = 'bg-blue-500';
  }
  // Red = Failed / Cancelled / Overdue / Rejected / Shortage / Damaged
  else if (['FAILED', 'CANCELLED', 'OVERDUE', 'REJECTED', 'REFUNDED'].includes(normalized)) {
    bg = 'bg-rose-50 text-rose-800 border-rose-200';
    dot = 'bg-rose-500';
  }
  // Gray = Closed / Draft / Unpaid
  else if (['CLOSED', 'DRAFT', 'UNPAID', 'EXPIRED'].includes(normalized)) {
    bg = 'bg-slate-100 text-slate-700 border-slate-300';
    dot = 'bg-slate-400';
  }

  const label = status.replace(/_/g, ' ');

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${bg} ${sizeClasses} capitalize transition-colors`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden="true" />
      {label.toLowerCase()}
    </span>
  );
};
