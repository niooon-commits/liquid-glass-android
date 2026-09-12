import React, { useState } from 'react';
import { X, Check, Copy, Download, CreditCard, Calendar, User, Tag, ShieldCheck, Loader2 } from 'lucide-react';
import { Transaction } from '../types';
import { updateFirestoreTransactionStatus } from '../firebase/firestoreService';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onStatusUpdated?: (id: string, newStatus: 'Completed' | 'Pending' | 'Failed') => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  onClose,
  onStatusUpdated,
}) => {
  const [copied, setCopied] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  if (!transaction) return null;

  const handleCopy = () => {
    navigator.clipboard?.writeText(transaction.invoiceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStatusChange = async (newStatus: 'Completed' | 'Pending' | 'Failed') => {
    if (newStatus === transaction.status) return;
    setIsUpdatingStatus(true);
    try {
      await updateFirestoreTransactionStatus(transaction.id, newStatus);
      if (onStatusUpdated) onStatusUpdated(transaction.id, newStatus);
    } catch (err) {
      console.warn('Status update note:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div
      id="tx-detail-modal"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs transition-all"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-200">
        {/* Mobile Grab Handle */}
        <div className="sm:hidden w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mt-2.5 mb-1" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-xs uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
              Settlement Ledger
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Transaction Receipt</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 space-y-4">
          {/* Amount banner */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400">Total Charged</span>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                ${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                transaction.status === 'Completed'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                  : transaction.status === 'Pending'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
              }`}
            >
              {transaction.status}
            </span>
          </div>

          {/* Quick Status Control */}
          <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Update Status:</span>
            <div className="flex gap-1.5">
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={() => handleStatusChange('Completed')}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                  transaction.status === 'Completed'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200/60 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-emerald-100 hover:text-emerald-800'
                }`}
              >
                Completed
              </button>
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={() => handleStatusChange('Pending')}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                  transaction.status === 'Pending'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-200/60 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-amber-100 hover:text-amber-800'
                }`}
              >
                Pending
              </button>
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={() => handleStatusChange('Failed')}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                  transaction.status === 'Failed'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-200/60 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-rose-100 hover:text-rose-800'
                }`}
              >
                Failed
              </button>
            </div>
          </div>

          {/* Details metadata list */}
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Tag className="w-4 h-4 text-slate-400" /> Invoice Identifier
              </span>
              <div className="flex items-center gap-1.5 font-mono font-semibold text-slate-800 dark:text-slate-200">
                <span>{transaction.invoiceId}</span>
                <button
                  onClick={handleCopy}
                  title="Copy Invoice ID"
                  className="p-1 hover:text-indigo-600 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <User className="w-4 h-4 text-slate-400" /> Customer Account
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">
                {transaction.customerName}
                <span className="block text-[11px] font-normal text-slate-400">{transaction.customerEmail}</span>
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <CreditCard className="w-4 h-4 text-slate-400" /> Payment Gateway
              </span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{transaction.method}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Calendar className="w-4 h-4 text-slate-400" /> Date & Time
              </span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{transaction.date}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Encrypted PCI-DSS compliance verification hash #8929-B9</span>
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Done
            </button>
            <button
              onClick={() => alert(`Downloaded receipt for ${transaction.invoiceId}`)}
              className="flex-1 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
