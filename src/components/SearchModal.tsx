import React, { useState, useEffect } from 'react';
import { Search, X, ArrowRight, LayoutDashboard, BarChart3, Users, CreditCard, Shield, FileText } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNav: (id: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectNav,
}) => {
  const [query, setQuery] = useState('');

  // ESC key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickLinks = [
    { id: 'dashboard', title: 'Main Executive Dashboard', desc: 'KPI cards, live sync graphs', icon: LayoutDashboard },
    { id: 'analytics', title: 'Revenue & Margins Analytics', desc: 'Interval forecasting & breakdown', icon: BarChart3 },
    { id: 'users', title: 'Team Directory & Roles', desc: 'Access controls and member seats', icon: Users },
    { id: 'transactions', title: 'Transaction Ledger', desc: 'Invoices, refunds and payment status', icon: CreditCard },
    { id: 'reports', title: 'Audit Logs & SLA Reports', desc: 'SOC2 perimeter compliance files', icon: FileText },
    { id: 'settings', title: 'Security & Token Vault', desc: 'API Keys and connected providers', icon: Shield },
  ];

  const filtered = quickLinks.filter(
    (l) => l.title.toLowerCase().includes(query.toLowerCase()) || l.desc.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      id="global-search-modal"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs transition-all"
    >
      {/* Backdrop click */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Container: Slide-up on mobile, centered card on sm+ */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 sm:zoom-in-95 duration-200">
        {/* Drag Handle Indicator on Mobile */}
        <div className="sm:hidden w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mt-2.5 mb-1" />

        {/* Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            id="input-command-palette"
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or jump to page..."
            className="flex-1 bg-transparent text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden placeholder:text-slate-400"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="sm:hidden px-2 py-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Cancel
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] sm:max-h-80 overflow-y-auto p-2">
          <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Navigation Destinations
          </div>
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  id={`cmd-result-${item.id}`}
                  onClick={() => {
                    onSelectNav(item.id);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {item.desc}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 dark:text-slate-600 dark:group-hover:text-indigo-400 transition-colors shrink-0" />
                </button>
              );
            })
          )}
        </div>

        {/* Keyboard hint footer */}
        <div className="hidden sm:flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400">
          <span>Use &uarr; &darr; to navigate</span>
          <span>Press [ESC] to dismiss</span>
        </div>
      </div>
    </div>
  );
};
