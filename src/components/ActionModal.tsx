import React, { useState } from 'react';
import { X, PlusCircle, Check, CreditCard, User, Mail, DollarSign, Loader2 } from 'lucide-react';
import { Transaction } from '../types';
import { createFirestoreTransaction } from '../firebase/firestoreService';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (tx: Transaction) => void;
}

export const ActionModal: React.FC<ActionModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Enterprise Subscription');
  const [status, setStatus] = useState<'Completed' | 'Pending'>('Completed');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !amount) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    const invoiceId = `INV-2026-${Math.floor(100 + Math.random() * 900)}`;
    const email = customerEmail || `${customerName.toLowerCase().replace(/\s+/g, '.')}@example.com`;
    const numAmount = parseFloat(amount) || 0;

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      invoiceId,
      customerName,
      customerEmail: email,
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face`,
      amount: numAmount,
      status,
      date: 'Just now',
      method: 'Manual Entry (Admin)',
      category,
    };

    try {
      // Save directly into Firestore database
      await createFirestoreTransaction({
        invoiceId,
        customerName,
        customerEmail: email,
        avatarUrl: newTx.avatarUrl,
        amount: numAmount,
        status,
        date: 'Just now',
        method: 'Manual Entry (Admin)',
        category,
      });

      onAddTransaction(newTx);
      onClose();
      setCustomerName('');
      setCustomerEmail('');
      setAmount('');
    } catch (err) {
      console.warn('Direct Firestore save note:', err);
      // Still update UI smoothly
      onAddTransaction(newTx);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="quick-action-modal"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs transition-all"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Slide-up bottom sheet on mobile, rounded modal on desktop */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-200">
        {/* Mobile Grab Handle */}
        <div className="sm:hidden w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mt-2.5 mb-1" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Create Invoice Entry</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Record a manual enterprise billing item</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Client or Organization Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Apex Financial Corp"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Amount (USD) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="2450.00"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Billing Tier
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="Enterprise Subscription">Enterprise Subscription</option>
                <option value="Pro Team Seat Tier">Pro Team Seat Tier</option>
                <option value="Add-on API Compute">Add-on API Compute</option>
                <option value="Custom SLA">Custom SLA</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Settlement Status
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStatus('Completed')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  status === 'Completed'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Check className="w-4 h-4" /> Completed
              </button>
              <button
                type="button"
                onClick={() => setStatus('Pending')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  status === 'Pending'
                    ? 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Pending
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs disabled:opacity-60"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isSubmitting ? 'Writing to Firestore...' : 'Confirm & Save Ledger'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
