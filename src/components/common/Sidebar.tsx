import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
  FileText,
  CreditCard,
  Building2,
  Package,
  Truck,
  RotateCcw,
  CheckSquare,
  BarChart3,
  Users,
  ShieldCheck,
  History,
  Settings,
  Scale,
  DollarSign,
  AlertOctagon,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { state, currentUser, activeView, setActiveView } = useApp();

  const role = currentUser.role;

  // Compute live badges
  const activeCampaignsCount = state.campaigns.filter((c) => ['OPEN', 'THRESHOLD_REACHED'].includes(c.status)).length;
  const unpaidInvoicesCount = state.invoices.filter((i) => ['UNPAID', 'PARTIALLY_PAID', 'OVERDUE'].includes(i.status)).length;
  const pendingApprovalsCount = state.campaigns.filter((c) => c.status === 'AWAITING_PARTICIPANT_APPROVAL').length;
  const activeShipmentsCount = state.shipments.filter((s) => ['PICKING', 'PACKED', 'DISPATCHED', 'IN_TRANSIT'].includes(s.status)).length;

  const NavItem = ({
    id,
    label,
    icon: Icon,
    badge,
  }: {
    id: string;
    label: string;
    icon: any;
    badge?: number | string;
  }) => {
    const isActive = activeView === id;
    return (
      <button
        onClick={() => {
          setActiveView(id);
          onClose();
        }}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
          isActive
            ? 'bg-slate-900 text-white shadow-xs font-semibold'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        <div className="flex items-center gap-2.5 truncate">
          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
          <span className="truncate">{label}</span>
        </div>
        {badge !== undefined && badge !== 0 && (
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              isActive ? 'bg-emerald-500 text-slate-900' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/40 z-30 lg:hidden backdrop-blur-xs"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:sticky top-[101px] left-0 h-[calc(100vh-101px)] w-64 bg-white border-r border-slate-200 p-4 flex flex-col justify-between overflow-y-auto z-40 transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Workspaces Section */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {role === 'RETAILER' && 'Retailer Workspace'}
              {role === 'SUPPLIER' && 'Supplier Workspace'}
              {role === 'ORGANIZER' && 'Coordinator Workspace'}
              {role === 'FINANCE' && 'Finance & Billing Hub'}
              {role === 'WAREHOUSE' && 'Fulfillment & Logistics'}
              {(role === 'ADMIN' || role === 'AUDITOR') && 'Platform Governance'}
            </div>

            <nav className="space-y-1">
              {/* RETAILER NAV */}
              {role === 'RETAILER' && (
                <>
                  <NavItem id="retailer-overview" label="Overview" icon={LayoutDashboard} />
                  <NavItem id="retailer-catalog" label="Product Catalog" icon={ShoppingBag} />
                  <NavItem id="retailer-campaigns" label="Bulk Deals" icon={Layers} badge={activeCampaignsCount} />
                  <NavItem id="retailer-orders" label="My Orders" icon={FileText} />
                  <NavItem id="retailer-invoices" label="My Invoices" icon={DollarSign} badge={unpaidInvoicesCount} />
                  <NavItem id="retailer-payments" label="Payments & Checkout" icon={CreditCard} />
                  <NavItem id="retailer-profile" label="Business Profile" icon={Building2} />
                </>
              )}

              {/* SUPPLIER NAV */}
              {role === 'SUPPLIER' && (
                <>
                  <NavItem id="supplier-overview" label="Supplier Overview" icon={LayoutDashboard} />
                  <NavItem id="supplier-catalog" label="Catalog & MOQ Pricing" icon={ShoppingBag} />
                  <NavItem id="supplier-campaigns" label="Campaign Quotations" icon={Layers} badge={activeCampaignsCount} />
                  <NavItem id="supplier-orders" label="Orders & Fulfillment" icon={Truck} badge={activeShipmentsCount} />
                  <NavItem id="supplier-reconciliation" label="Settlements & Payouts" icon={Scale} />
                </>
              )}

              {/* ORGANIZER NAV */}
              {role === 'ORGANIZER' && (
                <>
                  <NavItem id="organizer-overview" label="Cooperative Overview" icon={LayoutDashboard} />
                  <NavItem id="organizer-campaigns" label="Bulk Campaigns" icon={Layers} badge={activeCampaignsCount} />
                  <NavItem id="organizer-comparison" label="Supplier Comparison" icon={Scale} />
                  <NavItem id="organizer-exceptions" label="Exceptions & Logs" icon={AlertOctagon} />
                </>
              )}

              {/* FINANCE NAV */}
              {role === 'FINANCE' && (
                <>
                  <NavItem id="finance-overview" label="Finance Overview" icon={LayoutDashboard} />
                  <NavItem id="finance-reconciliation" label="Zero-Residual Audit" icon={Scale} />
                  <NavItem id="finance-invoices" label="Invoice Register" icon={FileText} badge={unpaidInvoicesCount} />
                  <NavItem id="finance-payments" label="Payment Register" icon={CreditCard} />
                  <NavItem id="finance-refunds" label="Refunds & Credit Notes" icon={RotateCcw} />
                </>
              )}

              {/* WAREHOUSE NAV */}
              {role === 'WAREHOUSE' && (
                <>
                  <NavItem id="warehouse-overview" label="Warehouse Overview" icon={LayoutDashboard} />
                  <NavItem id="warehouse-shipments" label="Shipments & Carriers" icon={Truck} badge={activeShipmentsCount} />
                  <NavItem id="warehouse-inventory" label="Inventory Ledger" icon={Package} />
                  <NavItem id="warehouse-returns" label="Damage Claims & Returns" icon={RotateCcw} />
                </>
              )}

              {/* ADMIN / AUDITOR NAV */}
              {(role === 'ADMIN' || role === 'AUDITOR') && (
                <>
                  <NavItem id="admin-overview" label="Platform Overview" icon={LayoutDashboard} />
                  <NavItem id="admin-users" label="Users & Organizations" icon={Users} />
                  <NavItem id="admin-verification" label="KYC Verification Queue" icon={ShieldCheck} />
                  <NavItem id="admin-analytics" label="Reports & Analytics" icon={BarChart3} />
                  <NavItem id="admin-audit" label="Append-Only Audit Trail" icon={History} />
                  <NavItem id="admin-settings" label="Platform Configuration" icon={Settings} />
                </>
              )}
            </nav>
          </div>

          {/* Quick Cross-Workspace Access (for reviewers to explore other tabs) */}
          <div className="pt-4 border-t border-slate-100">
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Cross-Module Views
            </div>
            <nav className="space-y-1">
              <NavItem id="retailer-campaigns" label="Campaign Marketplace" icon={Layers} />
              <NavItem id="finance-reconciliation" label="Financial Reconciliation" icon={Scale} />
              <NavItem id="admin-analytics" label="Platform Analytics" icon={BarChart3} />
              <NavItem id="admin-audit" label="Compliance Audit Log" icon={History} />
            </nav>
          </div>
        </div>

        {/* Bottom Help & Demo Badge */}
        <div className="pt-4 border-t border-slate-100">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>BulkBridge Demo</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Fully interactive B2B collaborative commerce engine with zero-residual financial math.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
