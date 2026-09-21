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
  Smartphone,
  Monitor,
  Sliders,
  ChevronDown,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { ProfileId, ViewMode } from '../types';
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
    viewMode,
    setViewMode,
    isMobileView,
    setIsSettingsModalOpen,
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
  const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false);

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

  const cycleViewMode = () => {
    if (viewMode === 'auto') setViewMode('mobile');
    else if (viewMode === 'mobile') setViewMode('desktop');
    else setViewMode('auto');
  };

  const activeProfileName =
    activeProfile === 'consolidated'
      ? 'Consolidated'
      : profiles.find((p) => p.id === activeProfile)?.name.split(' ')[0] || 'Profile';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          {/* Brand & Market Status */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold shadow-sm ring-1 ring-zinc-800 flex-shrink-0">
              <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-bold text-zinc-900 text-sm sm:text-base tracking-tight truncate">
                  SKYadav
                </span>
                <span className="hidden sm:inline text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200 font-medium">
                  Portfolio
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-zinc-500">
                <span className="inline-flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>{marketPrices.length} Scrips</span>
                </span>
                {lastLiveSyncTime && (
                  <span className="hidden md:inline-block text-[10px] text-zinc-400 font-mono">
                    • {lastLiveSyncTime}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Center: Global Profile Selector (Desktop) */}
          <div className="hidden lg:flex items-center gap-1.5 bg-zinc-100/80 p-1 rounded-xl border border-zinc-200">
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

          {/* Compact Mobile Profile Dropdown */}
          <div className="lg:hidden relative">
            <button
              id="mobile-profile-toggle-btn"
              onClick={() => setIsMobileProfileOpen(!isMobileProfileOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-zinc-100 text-zinc-800 border border-zinc-200 shadow-2xs"
            >
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              <span className="font-semibold max-w-[80px] truncate">{activeProfileName}</span>
              <ChevronDown className="w-3 h-3 text-zinc-500" />
            </button>

            {isMobileProfileOpen && (
              <div className="absolute top-10 left-0 w-48 bg-white rounded-xl shadow-xl border border-zinc-200 p-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                <button
                  onClick={() => {
                    setActiveProfile('consolidated');
                    setIsMobileProfileOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs ${
                    activeProfile === 'consolidated'
                      ? 'bg-zinc-900 text-white font-bold'
                      : 'text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Consolidated</span>
                  </span>
                  <span className="text-[10px] opacity-70">({profiles.length})</span>
                </button>
                <div className="h-px bg-zinc-100 my-1"></div>
                {profiles.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setActiveProfile(p.id as ProfileId);
                      setIsMobileProfileOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs ${
                      activeProfile === p.id
                        ? 'bg-zinc-900 text-white font-bold'
                        : 'text-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    <span>{p.name}</span>
                    <span className="text-[10px] opacity-70">({p.relation})</span>
                  </button>
                ))}
                <div className="h-px bg-zinc-100 my-1"></div>
                <button
                  onClick={() => {
                    setIsFamilyModalOpen(true);
                    setIsMobileProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-indigo-600 hover:bg-indigo-50 font-medium"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Manage Profiles</span>
                </button>
              </div>
            )}
          </div>

          {/* Right Actions Toolbar */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* View Mode Switcher (Phone / Desktop / Auto) */}
            <button
              id="header-view-mode-toggle-btn"
              onClick={cycleViewMode}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                viewMode === 'mobile'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                  : viewMode === 'desktop'
                  ? 'bg-blue-50 text-blue-800 border-blue-300 shadow-2xs'
                  : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
              }`}
              title={`Layout View Mode: ${viewMode.toUpperCase()} (Click to toggle: Auto -> Phone -> Desktop)`}
            >
              {viewMode === 'mobile' ? (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Phone View</span>
                </>
              ) : viewMode === 'desktop' ? (
                <>
                  <Monitor className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden sm:inline">Desktop View</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline">Auto View</span>
                </>
              )}
            </button>

            {/* Quick Settings Gear Modal Button */}
            <button
              id="header-settings-btn"
              onClick={() => setIsSettingsModalOpen(true)}
              className="p-2 rounded-xl text-zinc-600 hover:text-zinc-900 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 transition-colors shadow-2xs"
              title="Open Settings & View Mode Configuration"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>

            {/* PWA Install Button */}
            <div className="hidden sm:block">
              <PWAInstallButton variant="header" />
            </div>

            {/* Live Yahoo Finance Market Price Sync Button */}
            <button
              id="header-live-sync-btn"
              onClick={handleLiveSync}
              disabled={isFetchingLivePrices}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:py-2 rounded-xl text-xs font-medium border transition-all ${
                isFetchingLivePrices
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-zinc-50 hover:bg-emerald-50/80 text-zinc-700 hover:text-emerald-800 border-zinc-200 hover:border-emerald-300'
              }`}
              title="Fetch live market prices via Yahoo Finance API"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  isFetchingLivePrices
                    ? 'animate-spin text-emerald-600'
                    : 'text-emerald-600'
                }`}
              />
              <span className="hidden md:inline font-semibold">
                {isFetchingLivePrices ? 'Syncing...' : 'Live Prices'}
              </span>
            </button>

            {/* Portfolio Export Button */}
            <button
              id="header-export-btn"
              onClick={() => setIsExportModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold bg-zinc-50 hover:bg-zinc-100 text-zinc-800 border border-zinc-200 transition-colors shadow-2xs"
              title="Export Portfolio to CSV, JSON Backup, or Printable Report"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>Export</span>
            </button>

            {/* Log Trade CTA */}
            <button
              id="open-add-transaction-btn"
              onClick={() => setIsAddTxModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm transition-all flex-shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Trade</span>
            </button>
          </div>
        </div>

        {/* Sync feedback toast */}
        {syncToast && (
          <div className="absolute top-16 right-4 sm:right-6 bg-zinc-900 text-white text-xs px-3 py-1.5 rounded-xl shadow-lg border border-zinc-800 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 z-50">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{syncToast}</span>
          </div>
        )}
      </div>
    </header>
  );
};


