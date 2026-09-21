import React from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import {
  Smartphone,
  Monitor,
  Sparkles,
  Sliders,
  X,
  Layers,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Database,
  RefreshCw,
} from 'lucide-react';
import { ViewMode, CostBasisMethod, BenchmarkIndex } from '../types';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsModalOpen,
    setIsSettingsModalOpen,
    viewMode,
    setViewMode,
    isMobileView,
    costBasisMethod,
    setCostBasisMethod,
    selectedBenchmark,
    setSelectedBenchmark,
    marketPrices,
    holdings,
    transactions,
    fetchLiveMarketPrices,
    isFetchingLivePrices,
  } = usePortfolio();

  if (!isSettingsModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-zinc-200 dark:border-slate-800 max-h-[92vh] overflow-y-auto space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 dark:bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Sliders className="w-4 h-4 text-emerald-400 dark:text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                Display & Application Settings
              </h2>
              <p className="text-xs text-zinc-500 dark:text-slate-400">
                Configure layout view mode, costing lens, and market preferences
              </p>
            </div>
          </div>

          <button
            id="close-settings-modal-btn"
            onClick={() => setIsSettingsModalOpen(false)}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* View Mode Selector (Mobile vs Desktop vs Auto) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>App Layout View Mode</span>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-mono px-1.5 py-0.2 rounded border border-indigo-200 dark:border-indigo-800">
                Active: {viewMode.toUpperCase()}
              </span>
            </label>
            <span className="text-[11px] text-zinc-400">
              {isMobileView ? '📱 Phone View Active' : '💻 Desktop View Active'}
            </span>
          </div>

          <p className="text-xs text-zinc-500 dark:text-slate-400">
            Fix overlapping on small screens by forcing Phone View, or switch to Desktop View for expansive multi-column tables.
          </p>

          <div className="grid grid-cols-3 gap-2.5">
            {/* Auto Mode */}
            <button
              id="view-mode-auto-btn"
              type="button"
              onClick={() => setViewMode('auto')}
              className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 relative ${
                viewMode === 'auto'
                  ? 'bg-indigo-50/70 dark:bg-indigo-950/50 border-indigo-600 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                  : 'bg-zinc-50 dark:bg-slate-800/60 border-zinc-200 dark:border-slate-700 text-zinc-600 dark:text-slate-300 hover:bg-zinc-100'
              }`}
            >
              {viewMode === 'auto' && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600"></span>
              )}
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <div className="text-xs font-bold">Auto Adaptive</div>
              <div className="text-[10px] text-zinc-400 leading-tight">Responsive to screen</div>
            </button>

            {/* Mobile / Phone Mode */}
            <button
              id="view-mode-mobile-btn"
              type="button"
              onClick={() => setViewMode('mobile')}
              className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 relative ${
                viewMode === 'mobile'
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/50 border-emerald-600 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                  : 'bg-zinc-50 dark:bg-slate-800/60 border-zinc-200 dark:border-slate-700 text-zinc-600 dark:text-slate-300 hover:bg-zinc-100'
              }`}
            >
              {viewMode === 'mobile' && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-600"></span>
              )}
              <Smartphone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <div className="text-xs font-bold">Phone View</div>
              <div className="text-[10px] text-zinc-400 leading-tight">Touch & compact cards</div>
            </button>

            {/* Desktop Mode */}
            <button
              id="view-mode-desktop-btn"
              type="button"
              onClick={() => setViewMode('desktop')}
              className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 relative ${
                viewMode === 'desktop'
                  ? 'bg-blue-50/70 dark:bg-blue-950/50 border-blue-600 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/20'
                  : 'bg-zinc-50 dark:bg-slate-800/60 border-zinc-200 dark:border-slate-700 text-zinc-600 dark:text-slate-300 hover:bg-zinc-100'
              }`}
            >
              {viewMode === 'desktop' && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600"></span>
              )}
              <Monitor className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div className="text-xs font-bold">Desktop View</div>
              <div className="text-[10px] text-zinc-400 leading-tight">Wide multi-column</div>
            </button>
          </div>
        </div>

        {/* Costing Methodology Lens */}
        <div className="space-y-3 pt-3 border-t border-zinc-200 dark:border-slate-800">
          <label className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-zinc-500" />
            <span>Inventory Costing Method</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setCostBasisMethod('WAC')}
              className={`p-3 rounded-xl border text-left transition-all ${
                costBasisMethod === 'WAC'
                  ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                  : 'bg-zinc-50 dark:bg-slate-800/60 border-zinc-200 dark:border-slate-700 text-zinc-700 dark:text-slate-300 hover:bg-zinc-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono">WAC Method</span>
                {costBasisMethod === 'WAC' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              </div>
              <p className={`text-[11px] mt-1 ${costBasisMethod === 'WAC' ? 'text-zinc-300' : 'text-zinc-500'}`}>
                Weighted Average Costing (Standard for portfolio dashboards)
              </p>
            </button>

            <button
              type="button"
              onClick={() => setCostBasisMethod('FIFO')}
              className={`p-3 rounded-xl border text-left transition-all ${
                costBasisMethod === 'FIFO'
                  ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                  : 'bg-zinc-50 dark:bg-slate-800/60 border-zinc-200 dark:border-slate-700 text-zinc-700 dark:text-slate-300 hover:bg-zinc-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono">FIFO Engine</span>
                {costBasisMethod === 'FIFO' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              </div>
              <p className={`text-[11px] mt-1 ${costBasisMethod === 'FIFO' ? 'text-zinc-300' : 'text-zinc-500'}`}>
                First-In, First-Out (Mandatory Indian Income Tax IT Act Sec 45)
              </p>
            </button>
          </div>
        </div>

        {/* Market Benchmark Selection */}
        <div className="space-y-3 pt-3 border-t border-zinc-200 dark:border-slate-800">
          <label className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-zinc-500" />
            <span>Benchmark Comparison Index</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['NIFTY 50', 'NIFTY NEXT 50', 'NIFTY SMALLCAP 250'] as BenchmarkIndex[]).map((idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedBenchmark(idx)}
                className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all truncate ${
                  selectedBenchmark === idx
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-zinc-50 dark:bg-slate-800/60 border-zinc-200 dark:border-slate-700 text-zinc-700 dark:text-slate-300 hover:bg-zinc-100'
                }`}
              >
                {idx}
              </button>
            ))}
          </div>
        </div>

        {/* System & Storage Telemetry */}
        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-slate-800/50 border border-zinc-200 dark:border-slate-800 flex items-center justify-between text-xs text-zinc-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-600" />
            <span>{holdings.length} Holdings • {transactions.length} Trades</span>
          </div>
          <button
            onClick={() => fetchLiveMarketPrices()}
            disabled={isFetchingLivePrices}
            className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
          >
            <RefreshCw className={`w-3 h-3 ${isFetchingLivePrices ? 'animate-spin' : ''}`} />
            <span>Sync Live Scrips</span>
          </button>
        </div>

        {/* Done CTA */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={() => setIsSettingsModalOpen(false)}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold shadow-md transition-all"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
