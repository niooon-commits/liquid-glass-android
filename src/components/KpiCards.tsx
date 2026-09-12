import React from 'react';
import { DollarSign, Users, Activity, TrendingUp, ArrowUpRight } from 'lucide-react';
import { KpiMetric } from '../types';

interface KpiCardsProps {
  metrics: KpiMetric[];
}

const iconMap: Record<string, React.ElementType> = {
  DollarSign,
  Users,
  Activity,
  TrendingUp,
};

export const KpiCards: React.FC<KpiCardsProps> = ({ metrics }) => {
  return (
    <section id="kpi-metrics-section" aria-label="Key Performance Indicators">
      {/* 2x2 on mobile (sm/xs) and 4-col on lg+ screens */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {metrics.map((metric) => {
          const Icon = iconMap[metric.icon] || TrendingUp;

          // Compute normalized SVG points for mini sparkline
          const min = Math.min(...metric.sparkline);
          const max = Math.max(...metric.sparkline);
          const range = max - min || 1;
          const points = metric.sparkline
            .map((val, idx) => {
              const x = (idx / (metric.sparkline.length - 1)) * 100;
              const y = 32 - ((val - min) / range) * 26; // Height 32 with padding
              return `${x.toFixed(1)},${y.toFixed(1)}`;
            })
            .join(' ');

          return (
            <div
              key={metric.id}
              id={`kpi-card-${metric.id}`}
              className="group relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              {/* Card Header: Title & Icon */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
                  {metric.title}
                </span>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              {/* Main Metric Value */}
              <div className="mb-2">
                <div className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  {metric.value}
                </div>
              </div>

              {/* Trend Badge & Sparkline Row */}
              <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-1">
                  <span className="inline-flex items-center text-[11px] sm:text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <ArrowUpRight className="w-3 h-3 mr-0.5" />
                    {metric.change}
                  </span>
                  <span className="hidden sm:inline text-[11px] text-slate-400 dark:text-slate-500">
                    {metric.timeframe}
                  </span>
                </div>

                {/* Micro SVG Sparkline Chart */}
                <div className="w-14 sm:w-18 h-7 shrink-0">
                  <svg
                    viewBox="0 0 100 32"
                    className="w-full h-full overflow-visible"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <polyline
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={points}
                      className="text-indigo-600 dark:text-indigo-400"
                    />
                  </svg>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
