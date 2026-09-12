import React, { useState } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileDown,
  ArrowUpDown,
  MoreVertical,
  Receipt,
  Plus,
} from 'lucide-react';
import { Transaction, TransactionStatus } from '../types';

interface TransactionsTableProps {
  transactions: Transaction[];
  onSelectTransaction: (tx: Transaction) => void;
  onOpenActionModal?: () => void;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  transactions,
  onSelectTransaction,
  onOpenActionModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | TransactionStatus>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filtering
  const filtered = transactions.filter((tx) => {
    const matchesSearch =
      tx.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.invoiceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || tx.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusBadge = (status: TransactionStatus) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40">
            <Clock className="w-3.5 h-3.5" />
            Pending
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/40">
            <AlertTriangle className="w-3.5 h-3.5" />
            Failed
          </span>
        );
    }
  };

  return (
    <section
      id="recent-transactions-section"
      className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden"
      aria-label="Recent Transactions Data Table"
    >
      {/* Table Header Controls */}
      <div className="p-4 sm:p-6 border-b border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              Recent Transactions & Activity
            </h2>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {filtered.length} entries
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time ledger of inbound payments and recurring renewals
          </p>
        </div>

        {/* Filter bar & Search */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Table Search Input */}
          <div className="relative flex-1 sm:w-60 min-w-[160px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="input-filter-transactions"
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search invoice or customer..."
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Status Pills */}
          <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
            {(['All', 'Completed', 'Pending', 'Failed'] as const).map((st) => (
              <button
                key={st}
                id={`btn-filter-status-${st.toLowerCase()}`}
                onClick={() => {
                  setStatusFilter(st);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  statusFilter === st
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop / Tablet Table View (Hidden on smallest mobile, >= sm) */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-[11px] uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider">
              <th className="py-3.5 px-4 sm:px-6">Customer & Tier</th>
              <th className="py-3.5 px-4">Invoice #</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Date & Gateway</th>
              <th className="py-3.5 px-4 text-right">Amount</th>
              <th className="py-3.5 px-4 sm:px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-14 text-center">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto px-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                      <Receipt className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
                      {transactions.length === 0
                        ? 'No transactions in Firestore ledger'
                        : 'No transactions match search'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                      {transactions.length === 0
                        ? 'Dummy transactions have been purged. Only real invoices and payments recorded in Firestore will be displayed here.'
                        : 'Try adjusting your search keywords or status filter.'}
                    </p>
                    {transactions.length === 0 && onOpenActionModal && (
                      <button
                        id="btn-create-first-tx"
                        onClick={onOpenActionModal}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs"
                      >
                        <Plus className="w-4 h-4" />
                        Record Real Transaction
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((tx) => (
                <tr
                  key={tx.id}
                  id={`row-tx-${tx.id}`}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                >
                  {/* Customer info */}
                  <td className="py-3.5 px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={tx.avatarUrl}
                        alt={tx.customerName}
                        className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                      />
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {tx.customerName}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {tx.category}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Invoice ID */}
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-600 dark:text-slate-300">
                    {tx.invoiceId}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4">{getStatusBadge(tx.status)}</td>

                  {/* Date & Method */}
                  <td className="py-3.5 px-4">
                    <div className="text-slate-900 dark:text-slate-100 font-medium">{tx.date}</div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500">{tx.method}</div>
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-4 text-right font-semibold text-slate-900 dark:text-slate-100">
                    ${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>

                  {/* Action icons */}
                  <td className="py-3.5 px-4 sm:px-6 text-center">
                    <div className="inline-flex items-center gap-1">
                      <button
                        id={`btn-view-tx-${tx.id}`}
                        onClick={() => onSelectTransaction(tx)}
                        title="View Details"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        id={`btn-download-tx-${tx.id}`}
                        title="Download Invoice PDF"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <FileDown className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Cards View (Clean, touch-friendly, visible on screens < sm) */}
      <div className="block sm:hidden divide-y divide-slate-100 dark:divide-slate-800">
        {paginated.length === 0 ? (
          <div className="py-10 px-4 text-center">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-2.5">
              <Receipt className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1">
              {transactions.length === 0 ? 'No transactions in ledger' : 'No matches found'}
            </p>
            <p className="text-[11px] text-slate-400 mb-3">
              {transactions.length === 0 ? 'Only real transactions from Firestore are displayed.' : 'Try adjusting search.'}
            </p>
            {transactions.length === 0 && onOpenActionModal && (
              <button
                id="btn-mobile-record-first-tx"
                onClick={onOpenActionModal}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" /> Record Transaction
              </button>
            )}
          </div>
        ) : (
          paginated.map((tx) => (
            <div
              key={tx.id}
              id={`mobile-card-tx-${tx.id}`}
              onClick={() => onSelectTransaction(tx)}
              className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 active:bg-slate-100 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5">
                  <img
                    src={tx.avatarUrl}
                    alt={tx.customerName}
                    className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                  />
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">{tx.customerName}</h4>
                    <p className="text-[11px] text-slate-400 font-mono">{tx.invoiceId}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    ${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] text-slate-400">{tx.date}</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[50%]">
                  {tx.category}
                </span>
                <div>{getStatusBadge(tx.status)}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 text-xs bg-slate-50/40 dark:bg-slate-800/20">
        <span className="text-slate-500 dark:text-slate-400">
          Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{filtered.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to{' '}
          <span className="font-semibold text-slate-700 dark:text-slate-200">{Math.min(currentPage * itemsPerPage, filtered.length)}</span> of{' '}
          <span className="font-semibold text-slate-700 dark:text-slate-200">{filtered.length}</span> records
        </span>

        <div className="flex items-center gap-1.5">
          <button
            id="btn-pagination-prev"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 py-1 font-semibold text-slate-700 dark:text-slate-200">
            {currentPage} / {totalPages}
          </span>
          <button
            id="btn-pagination-next"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
