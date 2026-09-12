import { KpiMetric, Transaction, ChartDataPoint, NavigationItem } from '../types';

export const navItems: NavigationItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { id: 'analytics', label: 'Analytics', icon: 'BarChart3' },
  { id: 'users', label: 'Users & Teams', icon: 'Users' },
  { id: 'transactions', label: 'Transactions', icon: 'CreditCard' },
  { id: 'management', label: 'Management', icon: 'Layers' },
  { id: 'reports', label: 'Reports', icon: 'FileText' },
  { id: 'settings', label: 'Settings', icon: 'Settings' },
];

export const defaultZeroKpiMetrics: KpiMetric[] = [
  {
    id: 'revenue',
    title: 'Total Revenue',
    value: '$0.00',
    change: '0 transactions',
    isPositive: false,
    timeframe: 'from live Firestore ledger',
    sparkline: [0, 0, 0, 0],
    icon: 'DollarSign',
  },
  {
    id: 'active_users',
    title: 'Active Members',
    value: '0',
    change: '0 active',
    isPositive: false,
    timeframe: 'registered in organization',
    sparkline: [0, 0, 0, 0],
    icon: 'Users',
  },
  {
    id: 'conversions',
    title: 'Settlement Rate',
    value: '0.0%',
    change: '0 completed',
    isPositive: false,
    timeframe: 'invoiced transactions',
    sparkline: [0, 0, 0, 0],
    icon: 'Activity',
  },
  {
    id: 'growth',
    title: 'Pending Volume',
    value: '$0.00',
    change: '0 pending',
    isPositive: false,
    timeframe: 'awaiting clearance',
    sparkline: [0, 0, 0, 0],
    icon: 'TrendingUp',
  },
];

export const kpiMetrics = defaultZeroKpiMetrics;

export const emptyChartPeriods: Record<'7D' | '30D' | '90D' | '1Y', ChartDataPoint[]> = {
  '7D': [
    { period: 'Mon', revenue: 0, expenses: 0, profit: 0 },
    { period: 'Tue', revenue: 0, expenses: 0, profit: 0 },
    { period: 'Wed', revenue: 0, expenses: 0, profit: 0 },
    { period: 'Thu', revenue: 0, expenses: 0, profit: 0 },
    { period: 'Fri', revenue: 0, expenses: 0, profit: 0 },
    { period: 'Sat', revenue: 0, expenses: 0, profit: 0 },
    { period: 'Sun', revenue: 0, expenses: 0, profit: 0 },
  ],
  '30D': [
    { period: 'Week 1', revenue: 0, expenses: 0, profit: 0 },
    { period: 'Week 2', revenue: 0, expenses: 0, profit: 0 },
    { period: 'Week 3', revenue: 0, expenses: 0, profit: 0 },
    { period: 'Week 4', revenue: 0, expenses: 0, profit: 0 },
  ],
  '90D': [
    { period: 'Month 1', revenue: 0, expenses: 0, profit: 0 },
    { period: 'Month 2', revenue: 0, expenses: 0, profit: 0 },
    { period: 'Month 3', revenue: 0, expenses: 0, profit: 0 },
  ],
  '1Y': [
    { period: 'Q1', revenue: 0, expenses: 0, profit: 0 },
    { period: 'Q2', revenue: 0, expenses: 0, profit: 0 },
    { period: 'Q3', revenue: 0, expenses: 0, profit: 0 },
    { period: 'Q4', revenue: 0, expenses: 0, profit: 0 },
  ],
};

export const chartPeriods = emptyChartPeriods;

export const initialTransactions: Transaction[] = [];

export const initialTeamUsers = [];


