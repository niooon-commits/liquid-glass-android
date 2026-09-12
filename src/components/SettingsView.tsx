import React, { useState } from 'react';
import {
  Shield,
  Key,
  Bell,
  Sun,
  Moon,
  CheckCircle2,
  Lock,
  Sparkles,
  Database,
  Cloud,
  Cpu,
  Flame,
  Check,
  RefreshCw,
} from 'lucide-react';
import { ThemeMode } from '../types';
import { seedInitialFirestoreData } from '../firebase/firestoreService';
import { SUPABASE_ARCHITECTURE } from '../services/supabaseService';
import { useAuth } from '../firebase/authContext';

interface SettingsViewProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  theme,
  onToggleTheme,
}) => {
  const { user, isAdmin } = useAuth();
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      await seedInitialFirestoreData();
      setSeedSuccess(true);
      setTimeout(() => setSeedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div id="settings-view" className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Enterprise Settings & Infrastructure</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Firebase database configuration, Supabase serverless computing, and enterprise security
        </p>
      </div>

      {/* Firebase Cloud Architecture Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Firebase Cloud Datastore & Auth</h3>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                  LIVE CONNECTED
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Managed Firestore database with ABAC Security Rules and Google OAuth
              </p>
            </div>
          </div>

          <button
            onClick={handleSeedData}
            disabled={seeding}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors self-start sm:self-auto"
          >
            {seedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Seed Successful!</span>
              </>
            ) : (
              <>
                <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin text-indigo-500' : ''}`} />
                <span>{seeding ? 'Syncing Schema...' : 'Re-Seed Collections'}</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-0.5">Firebase Project ID</span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">chatbang</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-0.5">Firestore Region</span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">asia-southeast1</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-0.5">Security Rules</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">ABAC Verified</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-0.5">Auth Session</span>
            <span className="font-bold text-slate-900 dark:text-slate-100 truncate block">
              {user ? (isAdmin ? 'Admin (Owner)' : 'Authenticated') : 'Anonymous'}
            </span>
          </div>
        </div>
      </div>

      {/* Supabase Serverless Computing Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Supabase Serverless Functions Engine
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                ACTIVE_HEALTHY
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No server code in client app — all server-side logic executed via remote Supabase Edge Functions
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-0.5">Supabase Project Ref</span>
            <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
              {SUPABASE_ARCHITECTURE.projectRef}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-0.5">Deployment Region</span>
            <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
              {SUPABASE_ARCHITECTURE.region}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-0.5">Architecture Model</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              Zero Local Server (Edge)
            </span>
          </div>
        </div>
      </div>

      {/* Security & Token Vault Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">NIOOON Token Vault & Credentials</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Transient memory secrets management with 5-minute TTL
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">GitHub</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Account: niooon-commits</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Vercel</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Account: niooon-commits</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Supabase</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Project: niooon.cc (Healthy)</p>
          </div>
        </div>
      </div>

      {/* Theme Appearance Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Display Theme Preference</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Toggle between Light and Deep Slate dark theme</p>
          </div>
          <button
            onClick={onToggleTheme}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            <span>Active: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

