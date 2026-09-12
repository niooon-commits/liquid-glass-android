export type ThemeMode = 'light' | 'dark';

export type NavigationItem = {
  id: string;
  label: string;
  icon: string;
  badge?: string | number;
  badgeColor?: string;
};

export type KpiMetric = {
  id: string;
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  timeframe: string;
  sparkline: number[];
  icon: string;
};

export type TransactionStatus = 'Completed' | 'Pending' | 'Failed';

export type Transaction = {
  id: string;
  invoiceId: string;
  customerName: string;
  customerEmail: string;
  avatarUrl: string;
  amount: number;
  status: TransactionStatus;
  date: string;
  method: string;
  category: string;
};

export type ChartDataPoint = {
  period: string;
  revenue: number;
  expenses: number;
  profit: number;
};
