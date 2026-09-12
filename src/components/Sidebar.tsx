import React from 'react';
import {
  LayoutDashboard,
  BarChart3,
  Users,
  CreditCard,
  Layers,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  X,
  ShieldCheck,
  LogIn,
} from 'lucide-react';
import { navItems } from '../data/mockData';
import { useAuth } from '../firebase/authContext';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  activeNav: string;
  onSelectNav: (id: string) => void;
  isMobileDrawerOpen: boolean;
  onCloseMobileDrawer: () => void;
}

const iconMap: Record<string, React.ElementType> = {
  Sparkles,
  LayoutDashboard,
  BarChart3,
  Users,
  CreditCard,
  Layers,
  FileText,
  Settings,
};

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  activeNav,
  onSelectNav,
  isMobileDrawerOpen,
  onCloseMobileDrawer,
}) => {
  const { user, signInWithGoogle, signOut } = useAuth();
  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileDrawerOpen && (
        <div
          id="mobile-drawer-backdrop"
          onClick={onCloseMobileDrawer}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs transition-opacity lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Mobile Slide-Over Drawer */}
      <aside
        id="mobile-sidebar-drawer"
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 max-w-[85vw] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:hidden shadow-2xl ${
          isMobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Mobile Navigation"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-semibold text-lg shadow-sm">
              <Sparkles className="w-5 h-5 text-indigo-100" />
            </div>
            <div>
              <div className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Nexus<span className="text-indigo-600 dark:text-indigo-400">Core</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Enterprise Suite</p>
            </div>
          </div>
          <button
            id="btn-close-mobile-drawer"
            onClick={onCloseMobileDrawer}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase dark:text-slate-500">
            Platform
          </div>
          {navItems.map((item) => {
            const Icon = iconMap[item.icon] || LayoutDashboard;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-${item.id}`}
                onClick={() => {
                  onSelectNav(item.id);
                  onCloseMobileDrawer();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Mobile Profile Bottom Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          {!user ? (
            <button
              onClick={() => signInWithGoogle()}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold text-xs border border-indigo-200 dark:border-indigo-800"
            >
              <LogIn className="w-4 h-4" />
              <span>Connect Firebase Auth</span>
            </button>
          ) : (
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <div className="relative">
                <img
                  src={
                    user.photoURL ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face'
                  }
                  alt={user.displayName || 'Operator'}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/20"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {user.displayName || 'Authorized Admin'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {user.email || 'operator@enterprise.io'}
                </p>
              </div>
              <button
                id="btn-mobile-drawer-logout"
                title="Sign Out"
                onClick={() => signOut()}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Desktop Fixed Sidebar */}
      <aside
        id="desktop-fixed-sidebar"
        className={`hidden lg:flex flex-col fixed top-0 bottom-0 left-0 z-30 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-[72px]' : 'w-64'
        }`}
        aria-label="Desktop Navigation"
      >
        {/* Brand & Collapse Control */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-3 min-w-0 overflow-hidden">
            <div className="w-9 h-9 shrink-0 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-semibold shadow-xs">
              <Sparkles className="w-5 h-5 text-indigo-100" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 transition-opacity duration-200">
                <span className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  Nexus<span className="text-indigo-600 dark:text-indigo-400">Core</span>
                </span>
                <span className="block text-[10px] uppercase font-semibold tracking-wider text-slate-400 dark:text-slate-500">
                  Enterprise
                </span>
              </div>
            )}
          </div>

          <button
            id="btn-toggle-sidebar-collapse"
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
          {!isCollapsed && (
            <div className="px-3 pb-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase dark:text-slate-500">
              Overview
            </div>
          )}
          {navItems.map((item) => {
            const Icon = iconMap[item.icon] || LayoutDashboard;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                id={`desktop-nav-${item.id}`}
                onClick={() => onSelectNav(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center rounded-xl text-sm font-medium transition-all ${
                  isCollapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3.5 py-2.5'
                } ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 ${
                    isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'
                  }`}
                />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Verified Badge / System Security Tag (when expanded) */}
        {!isCollapsed && (
          <div className="px-4 py-3 mx-3 mb-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>SOC2 Type II Active</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Cloud perimeter encrypted</p>
          </div>
        )}

        {/* User Profile Summary (Sticky Bottom) */}
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800">
          {!user ? (
            <button
              onClick={() => signInWithGoogle()}
              className={`w-full flex items-center rounded-xl transition-all ${
                isCollapsed ? 'justify-center p-2' : 'gap-2 px-3 py-2'
              } bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold`}
              title="Sign In with Google"
            >
              <LogIn className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Sign In</span>}
            </button>
          ) : (
            <div
              className={`flex items-center rounded-xl transition-all ${
                isCollapsed ? 'justify-center p-1.5' : 'gap-3 p-2 bg-slate-50/80 dark:bg-slate-800/50'
              }`}
            >
              <div className="relative shrink-0">
                <img
                  src={
                    user.photoURL ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face'
                  }
                  alt={user.displayName || 'Operator'}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/20"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
              </div>

              {!isCollapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {user.displayName || 'Authorized Admin'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {user.email || 'operator@enterprise.io'}
                    </p>
                  </div>
                  <button
                    id="btn-desktop-sidebar-logout"
                    title="Sign out"
                    onClick={() => signOut()}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
