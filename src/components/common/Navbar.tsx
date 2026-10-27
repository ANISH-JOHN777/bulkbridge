import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  Search,
  Sparkles,
  User as UserIcon,
  CheckCircle,
  Building2,
  ExternalLink,
  Menu,
  X,
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const {
    state,
    currentUser,
    currentOrg,
    activeView,
    setActiveView,
    setDemoGuideOpen,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useApp();

  const [notifOpen, setNotifOpen] = useState(false);

  const unreadNotifications = state.notifications.filter((n) => !n.isRead);

  const isPublicPage = activeView.startsWith('public-');

  return (
    <header className="bg-white border-b border-slate-200 sticky top-[37px] z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Mobile Menu Toggle */}
        <div className="flex items-center gap-3">
          {!isPublicPage && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          <div
            onClick={() => setActiveView(isPublicPage ? 'public-home' : 'retailer-overview')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-lg tracking-wider shadow-sm group-hover:bg-emerald-600 transition-colors">
              B
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">
                  Bulk<span className="text-emerald-600">Bridge</span>
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 tracking-wide uppercase">
                  Enterprise
                </span>
              </div>
              <p className="text-[10px] text-slate-500 hidden md:block">
                Buy Together. Save More. Grow Faster.
              </p>
            </div>
          </div>
        </div>

        {/* Center / Navigation Links for Public View */}
        {isPublicPage ? (
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <button
              onClick={() => setActiveView('public-home')}
              className={`hover:text-slate-900 transition-colors ${
                activeView === 'public-home' ? 'text-emerald-600' : ''
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveView('public-how-it-works')}
              className="hover:text-slate-900 transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => setActiveView('public-retailers')}
              className="hover:text-slate-900 transition-colors"
            >
              For Retailers
            </button>
            <button
              onClick={() => setActiveView('public-suppliers')}
              className="hover:text-slate-900 transition-colors"
            >
              For Suppliers
            </button>
            <button
              onClick={() => setActiveView('public-pricing')}
              className="hover:text-slate-900 transition-colors"
            >
              Pricing & Savings
            </button>
            <button
              onClick={() => setActiveView('public-faq')}
              className="hover:text-slate-900 transition-colors"
            >
              FAQ
            </button>
          </nav>
        ) : (
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-800">{currentOrg.name}</span>
            <span className="text-slate-300">•</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px]">
              GST: {currentOrg.gstin}
            </span>
          </div>
        )}

        {/* Right: Actions, Notifications, User Menu */}
        <div className="flex items-center gap-3">
          {/* Public Portal Switcher */}
          {isPublicPage ? (
            <button
              onClick={() => setActiveView('retailer-overview')}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              <span>Access Workspaces</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => setActiveView('public-home')}
              className="hidden sm:flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-medium px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <span>Public Site</span>
            </button>
          )}

          {/* Notifications Popover */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
              )}
            </button>

            {notifOpen && (
              <div
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl py-3 z-50 animate-in fade-in text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">Notifications</span>
                    {unreadNotifications.length > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        {unreadNotifications.length} new
                      </span>
                    )}
                  </div>
                  {unreadNotifications.length > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {state.notifications.slice(0, 8).map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationAsRead(notif.id)}
                      className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer ${
                        !notif.isRead ? 'bg-emerald-50/40' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-slate-900 leading-snug">
                          {notif.title}
                        </span>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                        {notif.message}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1.5 block">
                        {new Date(notif.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
              {currentUser.name.charAt(0)}
            </div>
            <div className="hidden lg:block text-left text-xs leading-tight">
              <div className="font-semibold text-slate-900">{currentUser.name}</div>
              <div className="text-[10px] text-slate-500 capitalize">{currentUser.role.toLowerCase()}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
