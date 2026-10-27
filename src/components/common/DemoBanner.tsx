import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldAlert,
  RotateCcw,
  Sparkles,
  Users,
  Building2,
  ChevronDown,
  Info,
} from 'lucide-react';

export const DemoBanner: React.FC = () => {
  const {
    state,
    currentUser,
    currentOrg,
    switchUser,
    resetDemo,
    setDemoGuideOpen,
  } = useApp();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  return (
    <div className="bg-slate-900 text-white text-xs border-b border-slate-800 sticky top-0 z-40 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Prominent Disclaimer */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold text-[11px] border border-amber-500/30">
            <ShieldAlert className="w-3.5 h-3.5" />
            SIMULATED DEMO MODE
          </span>
          <span className="hidden md:inline text-slate-300">
            No real money transferred • INR (₹) transactions simulated • Fictional GSTINs
          </span>
        </div>

        {/* Center / Right: Quick Switcher & Controls */}
        <div className="flex items-center gap-2">
          {/* Active Org & User Indicator */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-2 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg border border-slate-700 transition-colors"
              title="Click to quickly switch demo roles"
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-medium text-emerald-400 uppercase tracking-wider text-[11px]">
                {currentUser.role}:
              </span>
              <span className="max-w-[120px] truncate">{currentUser.name.split(' ')[0]}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {roleMenuOpen && (
              <div
                className="absolute right-0 mt-1 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-slate-200"
                onClick={() => setRoleMenuOpen(false)}
              >
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-700">
                  Switch Active Role & Account
                </div>
                {state.users.map((user) => {
                  const org = state.organizations.find((o) => o.id === user.organizationId);
                  const isCurrent = user.id === currentUser.id;
                  return (
                    <button
                      key={user.id}
                      onClick={() => switchUser(user.id)}
                      className={`w-full text-left px-3 py-2 flex items-start gap-2.5 hover:bg-slate-700/80 transition-colors ${
                        isCurrent ? 'bg-slate-700/50 text-emerald-400 font-semibold' : ''
                      }`}
                    >
                      <div className="mt-0.5 w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-100">{user.name}</span>
                          <span className="text-[10px] uppercase px-1.5 py-0.2 bg-slate-900/60 rounded text-slate-300">
                            {user.role}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {org?.name || user.email}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Interactive 21-Step Guided Scenario Launcher */}
          <button
            onClick={() => setDemoGuideOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium shadow-sm transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Scenario Guide (21 Steps)</span>
          </button>

          {/* Reset Demo Button */}
          <button
            onClick={() => {
              if (window.confirm('Reset all demo state to fresh deterministic seed data?')) {
                resetDemo();
              }
            }}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-300 rounded-lg border border-slate-700 transition-colors"
            title="Reset demo records to original state"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
