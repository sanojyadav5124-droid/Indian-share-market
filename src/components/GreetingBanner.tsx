import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import {
  Sun,
  Sunset,
  Moon,
  Clock,
  Calendar,
  Users,
  Database,
  Palette,
  Download,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { AppLogo } from './AppLogo';
import { ThemeMode } from '../types';

interface GreetingBannerProps {
  onOpenBackupModal: () => void;
}

export const GreetingBanner: React.FC<GreetingBannerProps> = ({ onOpenBackupModal }) => {
  const {
    activeProfile,
    profiles,
    setIsFamilyModalOpen,
    theme,
    setTheme,
  } = usePortfolio();

  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = currentTime.getHours();
  let greeting = 'Good day';
  let GreetingIcon = Sun;
  let greetingColor = 'text-amber-500';

  if (hours >= 4 && hours < 12) {
    greeting = 'Good morning';
    GreetingIcon = Sun;
    greetingColor = 'text-amber-500';
  } else if (hours >= 12 && hours < 17) {
    greeting = 'Good afternoon';
    GreetingIcon = Sun;
    greetingColor = 'text-amber-600';
  } else if (hours >= 17 && hours < 22) {
    greeting = 'Good evening';
    GreetingIcon = Sunset;
    greetingColor = 'text-indigo-400';
  } else {
    greeting = 'Good night';
    GreetingIcon = Moon;
    greetingColor = 'text-blue-300';
  }

  // Determine market session status (NSE/BSE runs 09:15 to 15:30 IST, Mon-Fri)
  const dayOfWeek = currentTime.getDay(); // 0 = Sun, 6 = Sat
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const currentMinutes = hours * 60 + currentTime.getMinutes();
  const isMarketHours = !isWeekend && currentMinutes >= (9 * 60 + 15) && currentMinutes <= (15 * 60 + 30);

  const activeProfileObj = profiles.find((p) => p.id === activeProfile);
  const displayName =
    activeProfile === 'consolidated'
      ? 'S. K. Yadav & Family'
      : activeProfileObj?.name || 'S. K. Yadav';

  const themes: { id: ThemeMode; label: string; bg: string; dot: string }[] = [
    { id: 'day', label: 'Day (Light)', bg: 'bg-zinc-100', dot: 'bg-emerald-500' },
    { id: 'slate', label: 'Slate (Dark)', bg: 'bg-zinc-900', dot: 'bg-slate-400' },
  ];

  return (
    <div className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 text-white rounded-2xl p-5 border border-zinc-800 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: App Logo + Time greeting and date info */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-zinc-950/80 p-1 ring-1 ring-zinc-700/80 shadow-md">
            <AppLogo size="lg" />
          </div>
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="p-1.5 rounded-lg bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center">
                <GreetingIcon className={`w-4 h-4 ${greetingColor}`} />
              </div>
              <span className="text-xs font-medium text-zinc-400">
                {greeting},
              </span>
              <span className="text-sm font-bold text-white tracking-tight">
                {displayName}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {activeProfile === 'consolidated' ? 'Consolidated Ledger' : `${activeProfileObj?.relation || 'Member'} Account`}
              </span>
            </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
              {currentTime.toLocaleDateString('en-IN', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 font-mono text-[11px]">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              {currentTime.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isMarketHours ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'
                }`}
              />
              <span className={isMarketHours ? 'text-emerald-400 font-medium' : 'text-zinc-400'}>
                {isMarketHours
                  ? 'NSE/BSE Market Open (IST)'
                  : isWeekend
                  ? 'Market Closed (Weekend)'
                  : 'Market Closed (After Hours)'}
              </span>
            </span>
          </div>
        </div>
      </div>

        {/* Right: Quick Tool Actions (Backup, Family Manager, PWA Install, Theme) */}
        <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-zinc-800">
          {/* Backup & Sync Modal Trigger */}
          <button
            id="open-backup-sync-btn"
            type="button"
            onClick={onOpenBackupModal}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs"
            title="Import/Export Backup File & Sync Across Devices"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Backup / Sync</span>
          </button>

          {/* Manage Family Members */}
          <button
            id="manage-family-profiles-btn"
            type="button"
            onClick={() => setIsFamilyModalOpen(true)}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs"
            title="Add or remove family members"
          >
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>Family ({profiles.length})</span>
          </button>

          {/* PWA Install / Add to Home Screen Button */}
          <PWAInstallButton />

          {/* Theme Selector Dropdown */}
          <div className="relative">
            <button
              id="theme-selector-btn"
              type="button"
              onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
              className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Change Theme Palette"
            >
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              <span className="capitalize">{theme}</span>
            </button>

            {isThemeMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-44 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl z-50 p-1 space-y-1">
                <div className="px-2.5 py-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Color Themes
                </div>
                {themes.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setTheme(t.id);
                      setIsThemeMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                      theme === t.id
                        ? 'bg-zinc-800 text-white font-bold'
                        : 'text-zinc-300 hover:bg-zinc-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${t.dot}`} />
                      <span>{t.label}</span>
                    </div>
                    {theme === t.id && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
