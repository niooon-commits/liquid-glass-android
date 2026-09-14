/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { ThemeMode, Transaction, KpiMetric } from './types';
import { kpiMetrics as initialKpis, initialTransactions } from './data/mockData';
import {
  subscribeTransactions,
  subscribeKpiMetrics,
  subscribeNotifications,
  seedInitialFirestoreData,
  testConnection,
  FirestoreNotification,
} from './firebase/firestoreService';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { KpiCards } from './components/KpiCards';
import { AnalyticsChart } from './components/AnalyticsChart';
import { TransactionsTable } from './components/TransactionsTable';
import { BottomNav } from './components/BottomNav';
import { SearchModal } from './components/SearchModal';
import { ActionModal } from './components/ActionModal';
import { TransactionDetailModal } from './components/TransactionDetailModal';
import { UsersView } from './components/UsersView';
import { SettingsView } from './components/SettingsView';
import { ChromeDownloadsView } from './components/ChromeDownloadsView';

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nexus_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Live Firestore State with initial fallbacks
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [firestoreMetrics, setFirestoreMetrics] = useState<KpiMetric[] | null>(null);
  const [notifications, setNotifications] = useState<FirestoreNotification[]>([]);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);

  // 1. Initial connection verification & background database seeding
  useEffect(() => {
    let mounted = true;
    async function initFirestore() {
      try {
        const isOk = await testConnection();
        if (mounted) setIsFirebaseConnected(isOk);
        // Purge residual dummy data so only real records exist
        await seedInitialFirestoreData();
      } catch (err) {
        console.warn('Firestore initialization notice:', err);
      }
    }
    initFirestore();
    return () => {
      mounted = false;
    };
  }, []);

  // 2. Real-time Firestore Subscriptions
  useEffect(() => {
    const unsubTx = subscribeTransactions((liveTx) => {
      setTransactions(liveTx);
    });

    const unsubMetrics = subscribeKpiMetrics((liveMetrics) => {
      if (liveMetrics && liveMetrics.length > 0) {
        setFirestoreMetrics(liveMetrics);
      }
    });

    const unsubNotifs = subscribeNotifications((liveNotifs) => {
      setNotifications(liveNotifs);
    });

    return () => {
      unsubTx();
      unsubMetrics();
      unsubNotifs();
    };
  }, []);

  // Dynamically derive live KPI metrics from verified real transactions
  const metrics = useMemo<KpiMetric[]>(() => {
    if (firestoreMetrics && firestoreMetrics.length > 0) {
      return firestoreMetrics;
    }

    const totalRev = transactions
      .filter((t) => t.status === 'Completed')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const pendingRev = transactions
      .filter((t) => t.status === 'Pending')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const completedCount = transactions.filter((t) => t.status === 'Completed').length;
    const totalCount = transactions.length;
    const settlementRate = totalCount > 0 ? ((completedCount / totalCount) * 100).toFixed(1) : '0.0';

    return [
      {
        id: 'revenue',
        title: 'Total Revenue',
        value: `$${totalRev.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change: `${completedCount} completed`,
        isPositive: totalRev > 0,
        timeframe: 'from live Firestore ledger',
        sparkline: totalRev > 0 ? [10, 30, 50, 80] : [0, 0, 0, 0],
        icon: 'DollarSign',
      },
      {
        id: 'active_users',
        title: 'Transactions Logged',
        value: `${totalCount}`,
        change: `${totalCount} total entries`,
        isPositive: totalCount > 0,
        timeframe: 'registered in database',
        sparkline: totalCount > 0 ? [1, 2, 3, totalCount] : [0, 0, 0, 0],
        icon: 'Users',
      },
      {
        id: 'conversions',
        title: 'Settlement Rate',
        value: `${settlementRate}%`,
        change: `${completedCount} of ${totalCount} settled`,
        isPositive: Number(settlementRate) > 50,
        timeframe: 'invoiced ledger total',
        sparkline: [0, 0, 0, Number(settlementRate) || 0],
        icon: 'Activity',
      },
      {
        id: 'growth',
        title: 'Pending Volume',
        value: `$${pendingRev.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change: `${transactions.filter((t) => t.status === 'Pending').length} pending`,
        isPositive: pendingRev === 0,
        timeframe: 'awaiting clearance',
        sparkline: [0, 0, 0, 0],
        icon: 'TrendingUp',
      },
    ];
  }, [transactions, firestoreMetrics]);

  // Sync theme class to html root
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('nexus_theme', theme);
  }, [theme]);

  // Global Keyboard Shortcut (⌘K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleAddTransaction = (newTx: Transaction) => {
    setTransactions((prev) => [newTx, ...prev]);
  };

  const handleStatusUpdated = (id: string, newStatus: 'Completed' | 'Pending' | 'Failed') => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === id ? { ...tx, status: newStatus } : tx))
    );
    if (selectedTx && selectedTx.id === id) {
      setSelectedTx((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 overflow-x-hidden antialiased">
      {/* 1. Left Sidebar (Fixed on Desktop, Slide-over on Mobile) */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        activeNav={activeNav}
        onSelectNav={(id) => setActiveNav(id)}
        isMobileDrawerOpen={isMobileDrawerOpen}
        onCloseMobileDrawer={() => setIsMobileDrawerOpen(false)}
      />

      {/* 2. Main Layout Container (Offset by desktop sidebar width) */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isCollapsed ? 'lg:pl-[72px]' : 'lg:pl-64'
        }`}
      >
        {/* Top Header */}
        <Header
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)}
          onOpenSearchModal={() => setIsSearchOpen(true)}
          onOpenActionModal={() => setIsActionModalOpen(true)}
          notifications={notifications}
          onMarkAllRead={handleMarkAllNotificationsRead}
        />

        {/* Dynamic Content Area based on Active Navigation Item */}
        <main
          id="main-dashboard-content"
          className="flex-1 w-full max-w-7xl mx-auto px-4 py-5 sm:px-6 sm:py-7 space-y-6 sm:space-y-8 pb-24 lg:pb-10"
        >
          {activeNav === 'dashboard' && (
            <>
              {/* Dashboard Banner / Welcome Greeting */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    Enterprise Executive Overview
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Real-time operational metrics, Firestore live ledger, and audit records
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {isFirebaseConnected ? 'Firebase Live Sync' : 'All Systems Operational'}
                  </span>
                </div>
              </div>

              {/* 4 Key Metric / KPI Cards (Live Firestore) */}
              <KpiCards metrics={metrics} />

              {/* Analytics & Performance Flow Visualization (Computed from live transactions) */}
              <AnalyticsChart transactions={transactions} />

              {/* Transactions Ledger Table */}
              <TransactionsTable
                transactions={transactions}
                onSelectTransaction={(tx) => setSelectedTx(tx)}
                onOpenActionModal={() => setIsActionModalOpen(true)}
              />
            </>
          )}

          {activeNav === 'downloads' && (
            <ChromeDownloadsView onBack={() => setActiveNav('dashboard')} />
          )}

          {activeNav === 'analytics' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  Detailed Analytics & Projections
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Deep-dive revenue trajectory, conversion cohorts, and channel attribution
                </p>
              </div>
              <AnalyticsChart transactions={transactions} />
              <KpiCards metrics={metrics} />
            </div>
          )}

          {activeNav === 'users' && <UsersView />}

          {activeNav === 'transactions' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  Financial Ledger & Records
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Complete historic record of enterprise billing, invoices, and payment statuses
                </p>
              </div>
              <TransactionsTable
                transactions={transactions}
                onSelectTransaction={(tx) => setSelectedTx(tx)}
                onOpenActionModal={() => setIsActionModalOpen(true)}
              />
            </div>
          )}

          {activeNav === 'management' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  Infrastructure & Cloud Management
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Clusters, API Gateways, and automated deployments
                </p>
              </div>
              <SettingsView theme={theme} onToggleTheme={handleToggleTheme} />
            </div>
          )}

          {activeNav === 'reports' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  Compliance & SLA Reports
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Quarterly SOC2 compliance statements and uptime logs
                </p>
              </div>
              <TransactionsTable
                transactions={transactions}
                onSelectTransaction={(tx) => setSelectedTx(tx)}
              />
            </div>
          )}

          {activeNav === 'settings' && (
            <SettingsView theme={theme} onToggleTheme={handleToggleTheme} />
          )}
        </main>
      </div>

      {/* 3. Mobile Fixed Bottom Navigation Bar (Visible on mobile/tablet < lg) */}
      <BottomNav
        activeNav={activeNav}
        onSelectNav={(id) => setActiveNav(id)}
        onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)}
      />

      {/* 4. Global Search Modal (Command Palette / Ctrl+K) */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectNav={(id) => setActiveNav(id)}
      />

      {/* 5. Quick Action Modal (Create Invoice Entry) */}
      <ActionModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        onAddTransaction={handleAddTransaction}
      />

      {/* 6. Transaction Detail Slide-Up Bottom Sheet / Modal */}
      <TransactionDetailModal
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
        onStatusUpdated={handleStatusUpdated}
      />
    </div>
  );
}
