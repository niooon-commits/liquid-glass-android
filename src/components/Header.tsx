import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Sun,
  Moon,
  Bell,
  Plus,
  ChevronDown,
  User as UserIcon,
  Key,
  Shield,
  LogOut,
  CheckCheck,
  Sparkles,
  LogIn,
} from 'lucide-react';
import { ThemeMode } from '../types';
import { useAuth } from '../firebase/authContext';
import { FirestoreNotification } from '../firebase/firestoreService';

interface HeaderProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenMobileDrawer: () => void;
  onOpenSearchModal: () => void;
  onOpenActionModal: () => void;
  notifications?: FirestoreNotification[];
  onMarkAllNotificationsRead?: () => void;
  onMarkAllRead?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  onOpenMobileDrawer,
  onOpenSearchModal,
  onOpenActionModal,
  notifications = [],
  onMarkAllNotificationsRead,
  onMarkAllRead,
}) => {
  const { user, signInWithGoogle, signOut, loading: authLoading } = useAuth();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    setIsProfileOpen(false);
    try {
      await signOut();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header
      id="app-top-header"
      className="sticky top-0 z-20 h-16 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors"
    >
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-3">
        {/* Left Side: Mobile Hamburger & Search */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          {/* Mobile Drawer Trigger (☰) */}
          <button
            id="btn-mobile-hamburger"
            onClick={onOpenMobileDrawer}
            className="lg:hidden p-2 -ml-1 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Open navigation drawer"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Mobile Brand (visible only when screen < lg) */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
              <Sparkles className="w-4 h-4 text-indigo-100" />
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-slate-100">
              Nexus<span className="text-indigo-600 dark:text-indigo-400">Core</span>
            </span>
          </div>

          {/* Desktop Search Bar Trigger (Ctrl + K) */}
          <button
            id="btn-global-search-trigger"
            onClick={onOpenSearchModal}
            className="hidden sm:flex items-center gap-2.5 w-full max-w-sm px-3.5 py-2 text-sm text-slate-400 dark:text-slate-500 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700/60 transition-all text-left group"
          >
            <Search className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
            <span className="flex-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">Search metrics, users, invoices...</span>
            <kbd className="hidden md:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-700 shadow-2xs">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Side: Quick Action, Search Icon on Mobile, Theme Toggle, Notifications, Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Mobile Search Icon Trigger */}
          <button
            id="btn-mobile-search-trigger"
            onClick={onOpenSearchModal}
            className="sm:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Dark / Light Theme Switcher */}
          <button
            id="btn-theme-toggle"
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600 hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* Notifications Popover */}
          <div className="relative" ref={notifRef}>
            <button
              id="btn-notifications-toggle"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600" />
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div
                id="notifications-dropdown-menu"
                className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      id="btn-mark-notifications-read"
                      onClick={() => {
                        if (onMarkAllRead) onMarkAllRead();
                        else if (onMarkAllNotificationsRead) onMarkAllNotificationsRead();
                      }}
                      className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No active alerts or notifications
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                          notif.unread ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{notif.title}</p>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">{notif.time}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{notif.desc}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2 border-t border-slate-200 dark:border-slate-800 text-center bg-slate-50/30 dark:bg-slate-800/20">
                  <button
                    onClick={() => {
                      if (onMarkAllNotificationsRead) onMarkAllNotificationsRead();
                      setIsNotifOpen(false);
                    }}
                    className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  >
                    Mark All as Read & Dismiss
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Action Button */}
          <button
            id="btn-header-quick-action"
            onClick={onOpenActionModal}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Action</span>
          </button>

          {/* User Profile / Firebase Auth Button */}
          {!user ? (
            <button
              id="btn-header-google-signin"
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 rounded-xl shadow-2xs transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{isSigningIn ? 'Connecting...' : 'Google Sign In'}</span>
            </button>
          ) : (
            <div className="relative" ref={profileRef}>
              <button
                id="btn-header-profile-dropdown"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1 pl-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="User profile menu"
              >
                <img
                  src={
                    user.photoURL ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face'
                  }
                  alt={user.displayName || 'Operator'}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/20"
                />
                <ChevronDown className="hidden md:block w-3.5 h-3.5 text-slate-400" />
              </button>

              {isProfileOpen && (
                <div
                  id="profile-dropdown-menu"
                  className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {user.displayName || 'Authorized Admin'}
                      </p>
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                        Admin
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {user.email || 'operator@enterprise.io'}
                    </p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => setIsProfileOpen(false)}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span>Firebase Identity Profile</span>
                    </button>
                    <button
                      onClick={() => setIsProfileOpen(false)}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <Key className="w-4 h-4 text-slate-400" />
                      <span>Project: chatbang</span>
                    </button>
                    <button
                      onClick={() => setIsProfileOpen(false)}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <Shield className="w-4 h-4 text-emerald-500" />
                      <span>Firestore ABAC Verified</span>
                    </button>
                  </div>

                  <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </header>
  );
};
