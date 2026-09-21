import React, { useState } from 'react';
import {
  Briefcase,
  Users,
  Layers,
  Database,
  PlusCircle,
  TrendingUp,
  RefreshCw,
  Sparkles,
  UserPlus,
  Download,
  Radio,
  CheckCircle2,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { ProfileId } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  onOpenBackupModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenBackupModal }) => {
  const {
    activeProfile,
    setActiveProfile,
    profiles,
    costBasisMethod,
    setCostBasisMethod,
    setIsPricingModalOpen,
    setIsAddTxModalOpen,
    setIsFamilyModalOpen,
    setIsExportModalOpen,
    marketPrices,
    fetchLiveMarketPrices,
    isFetchingLivePrices,
    lastLiveSyncTime,
  } = usePortfolio();

  const [syncToast, setSyncToast] = useState<string | null>(null);

  const handleLiveSync = async () => {
    const res = await fetchLiveMarketPrices();
    if (res.updatedCount > 0) {
      setSyncToast(`Updated ${res.updatedCount} scrips`);
      setTimeout(() => setSyncToast(null), 3000);
    } else if (res.errors && res.errors.length > 0) {
      setSyncToast(`Sync note: ${res.errors[0]}`);
      setTimeout(() => setSyncToast(null), 3000);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand & Market Status */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold shadow-sm ring-1 ring-zinc-800">
              <Briefcase className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-900 text-base tracking-tight">
                  SKYadav portfolio App
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200 font-medium">
                  Local-First
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span className="inline-flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>{marketPrices.length} Scrips Tracked</span>
                </span>
                {lastLiveSyncTime && (
                  <span className="hidden sm:inline-block text-[11px] text-zinc-400 font-mono">
                    • Live: {lastLiveSyncTime}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Center: Global Profile Selector */}
          <div className="hidden md:flex items-center gap-1.5 bg-zinc-100/80 p-1 rounded-xl border border-zinc-200">
            <button
              id="profile-consolidated-btn"
              onClick={() => setActiveProfile('consolidated')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeProfile === 'consolidated'
                  ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/80 font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-white/50'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              <span>Consolidated</span>
              <span className="ml-0.5 text-[10px] bg-zinc-100 text-zinc-500 px-1 py-0.2 rounded font-mono">
                {profiles.length}
              </span>
            </button>

            <div className="h-4 w-px bg-zinc-200 mx-0.5"></div>

            {profiles.map((p) => {
              const isActive = activeProfile === p.id;
              return (
                <button
                  key={p.id}
                  id={`profile-${p.id}-btn`}
                  onClick={() => setActiveProfile(p.id as ProfileId)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/80 font-semibold'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-white/50'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      p.id === 'self'
                        ? 'bg-emerald-500'
                        : p.id === 'spouse'
                        ? 'bg-indigo-500'
                        : 'bg-amber-500'
                    }`}
                  />
                  <span>{p.name.split(' ')[0]}</span>
                  <span className="text-[10px] text-zinc-400">({p.relation.split(' ')[0]})</span>
                </button>
              );
            })}

            {/* Quick Manage Family Button */}
            <button
              id="header-manage-family-btn"
              onClick={() => setIsFamilyModalOpen(true)}
              title="Add or remove family members"
              className="p-1.5 text-zinc-400 hover:text-zinc-800 hover:bg-white rounded-lg transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right Actions: Live Sync, Export, Pricing, Add Transaction */}
          <div className="flex items-center gap-2">
            {/* PWA Install / Add to Home Screen Button */}
            <PWAInstallButton variant="header" />

            {/* Live Yahoo Finance Market Price Sync Button */}
            <button
              id="header-live-sync-btn"
              onClick={handleLiveSync}
              disabled={isFetchingLivePrices}
              className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium border transition-all ${
                isFetchingLivePrices
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-zinc-50 hover:bg-emerald-50/80 text-zinc-700 hover:text-emerald-800 border-zinc-200 hover:border-emerald-300'
              }`}
              title="Fetch live market prices via Yahoo Finance API (NSE/BSE)"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  isFetchingLivePrices
                    ? 'animate-spin text-emerald-600'
                    : 'text-emerald-600'
                }`}
              />
              <span className="hidden sm:inline font-semibold">
                {isFetchingLivePrices ? 'Syncing...' : 'Live Prices'}
              </span>
            </button>

            {/* Portfolio Export Button */}
            <button
              id="header-export-btn"
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold bg-zinc-50 hover:bg-zinc-100 text-zinc-800 border border-zinc-200 transition-colors shadow-2xs"
              title="Export Portfolio to CSV, JSON Backup, or Printable Report"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>Export</span>
            </button>

            {/* Backup / Sync Button */}
            {onOpenBackupModal && (
              <button
                id="header-backup-btn"
                onClick={onOpenBackupModal}
                className="hidden xl:flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200 transition-colors"
                title="Backup & Restore Data"
              >
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                <span>Backup</span>
              </button>
            )}

            {/* Cost Basis Selector (WAC vs FIFO) */}
            <div className="hidden lg:flex items-center bg-zinc-100 p-1 rounded-lg border border-zinc-200 text-xs">
              <span className="text-zinc-400 px-2 text-[11px] font-medium flex items-center gap-1">
                <Layers className="w-3 h-3" /> Costing:
              </span>
              <button
                id="cost-basis-wac-btn"
                onClick={() => setCostBasisMethod('WAC')}
                title="Weighted Average Cost (Portfolio standard)"
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  costBasisMethod === 'WAC'
                    ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                WAC
              </button>
              <button
                id="cost-basis-fifo-btn"
                onClick={() => setCostBasisMethod('FIFO')}
                title="First In First Out (Tax audit standard)"
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  costBasisMethod === 'FIFO'
                    ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                FIFO
              </button>
            </div>

            {/* Manual Pricing Engine Modal Trigger */}
            <button
              id="open-pricing-manager-btn"
              onClick={() => setIsPricingModalOpen(true)}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200 transition-colors shadow-2xs"
              title="Manual price override & batch CSV price update"
            >
              <Layers className="w-3.5 h-3.5 text-zinc-500" />
              <span>Overrides</span>
            </button>

            {/* Log Trade CTA */}
            <button
              id="open-add-transaction-btn"
              onClick={() => setIsAddTxModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Log Trade</span>
              <span className="sm:hidden">Trade</span>
            </button>
          </div>
        </div>

        {/* Sync feedback toast */}
        {syncToast && (
          <div className="absolute top-16 right-6 bg-zinc-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg border border-zinc-800 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 z-50">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{syncToast}</span>
          </div>
        )}
      </div>
    </header>
  );
};

