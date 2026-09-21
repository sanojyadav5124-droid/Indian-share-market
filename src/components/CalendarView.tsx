import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { CalendarEvent } from '../types';
import {
  Calendar as CalendarIcon,
  Bell,
  BellOff,
  Plus,
  Tag,
  AlertCircle,
  Clock,
  Trash2,
  Filter,
  CheckCircle2,
  RefreshCw,
  Search,
  Building2,
  TrendingUp,
  Sparkles,
  Landmark,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  RotateCcw,
} from 'lucide-react';

export const CalendarView: React.FC = () => {
  const {
    calendarEvents,
    addCalendarEvent,
    toggleCalendarAlert,
    deleteCalendarEvent,
    fetchLiveMarketCalendar,
    resetCalendarToOfficialSchedule,
    isFetchingLiveCalendar,
    lastCalendarSyncTime,
    calendarSyncError,
    holdings,
  } = usePortfolio();

  // Top Section Tabs: 'catalyst' | 'holidays' | 'holdings' | 'past'
  const [activeMainTab, setActiveMainTab] = useState<'catalyst' | 'holidays' | 'holdings' | 'past'>('catalyst');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  // New Event Form State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10));
  const [newCategory, setNewCategory] = useState<CalendarEvent['category']>('EARNINGS');
  const [newImpact, setNewImpact] = useState<CalendarEvent['impact']>('HIGH');
  const [newSymbol, setNewSymbol] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const todayStr = useMemo(() => {
    return new Date().toISOString().slice(0, 10);
  }, []);

  const holdingSymbols = useMemo(() => {
    return new Set(holdings.map((h) => h.symbol.toUpperCase()));
  }, [holdings]);

  const categories = [
    { id: 'ALL', label: 'All Categories' },
    { id: 'EARNINGS', label: 'Quarterly Earnings & Concalls' },
    { id: 'IPO', label: 'Mainboard IPOs' },
    { id: 'POLICY', label: 'RBI MPC & F&O Expiry' },
    { id: 'MACRO', label: 'Union Budget & Tax Cutoffs' },
    { id: 'AMFI_REBALANCE', label: 'SEBI/AMFI Rebalance' },
    { id: 'HOLIDAY', label: 'BSE/NSE Trading Holidays' },
    { id: 'CUSTOM', label: 'Custom User Alerts' },
  ];

  // Helper for countdown
  const getDaysDiff = (dateStr: string) => {
    const evDate = new Date(dateStr);
    evDate.setHours(0, 0, 0, 0);
    const diffTime = evDate.getTime() - today.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  };

  const getCountdownBadge = (dateStr: string) => {
    const diff = getDaysDiff(dateStr);
    if (diff === 0) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500 text-white animate-pulse">
          Today
        </span>
      );
    }
    if (diff === 1) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
          Tomorrow
        </span>
      );
    }
    if (diff > 1 && diff <= 7) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          In {diff} days
        </span>
      );
    }
    if (diff > 7 && diff <= 30) {
      const weeks = Math.round(diff / 7);
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
          In {weeks} {weeks === 1 ? 'week' : 'weeks'}
        </span>
      );
    }
    if (diff > 30) {
      const months = Math.round(diff / 30);
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          In {months} {months === 1 ? 'month' : 'months'}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
        Concluded ({Math.abs(diff)}d ago)
      </span>
    );
  };

  const handleSyncLiveCalendar = async () => {
    setSyncStatusMsg(null);
    const res = await fetchLiveMarketCalendar();
    setSyncStatusMsg(res.message);
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addCalendarEvent({
      title: newTitle.trim(),
      date: newDate,
      category: newCategory,
      impact: newImpact,
      relatedSymbol: newSymbol.trim().toUpperCase() || undefined,
      description: newDescription.trim() || undefined,
      badgeText: newCategory === 'CUSTOM' ? 'User Custom Alert' : undefined,
      isAlertSet: true,
      status: newDate >= todayStr ? 'UPCOMING' : 'PASSED',
    });

    setNewTitle('');
    setNewDescription('');
    setNewSymbol('');
    setIsAddModalOpen(false);
  };

  // Filtered by tab and category and search query
  const filteredEvents = useMemo(() => {
    return calendarEvents.filter((ev) => {
      const evDate = new Date(ev.date);
      evDate.setHours(0, 0, 0, 0);
      const isUpcoming = evDate >= today;

      // 1. Tab level filtering
      if (activeMainTab === 'catalyst') {
        if (!isUpcoming) return false;
        if (ev.category === 'HOLIDAY') return false; // Show in holidays tab
      } else if (activeMainTab === 'holidays') {
        if (ev.category !== 'HOLIDAY') return false;
      } else if (activeMainTab === 'holdings') {
        if (!isUpcoming) return false;
        const sym = (ev.relatedSymbol || ev.symbol || '').toUpperCase();
        if (!sym || !holdingSymbols.has(sym)) return false;
      } else if (activeMainTab === 'past') {
        if (isUpcoming) return false;
      }

      // 2. Category filtering
      if (selectedCategory !== 'ALL') {
        if (selectedCategory === 'MACRO') {
          if (ev.category !== 'MACRO' && ev.category !== 'BUDGET') return false;
        } else if (ev.category !== selectedCategory) {
          return false;
        }
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = ev.title.toLowerCase().includes(q);
        const matchDesc = (ev.description || '').toLowerCase().includes(q);
        const matchSymbol = (ev.relatedSymbol || ev.symbol || '').toLowerCase().includes(q);
        const matchCat = ev.category.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchSymbol && !matchCat) return false;
      }

      return true;
    });
  }, [calendarEvents, activeMainTab, selectedCategory, searchQuery, today, holdingSymbols]);

  // Sort ascending for upcoming, descending for past
  const sortedEvents = useMemo(() => {
    return [...filteredEvents].sort((a, b) => {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      if (activeMainTab === 'past') {
        return timeB - timeA;
      }
      return timeA - timeB;
    });
  }, [filteredEvents, activeMainTab]);

  const upcomingCount = useMemo(() => {
    return calendarEvents.filter((e) => {
      const d = new Date(e.date);
      d.setHours(0, 0, 0, 0);
      return d >= today && e.category !== 'HOLIDAY';
    }).length;
  }, [calendarEvents, today]);

  const holidaysCount = useMemo(() => {
    return calendarEvents.filter((e) => e.category === 'HOLIDAY').length;
  }, [calendarEvents]);

  const myHoldingsEventsCount = useMemo(() => {
    return calendarEvents.filter((e) => {
      const d = new Date(e.date);
      d.setHours(0, 0, 0, 0);
      const sym = (e.relatedSymbol || e.symbol || '').toUpperCase();
      return d >= today && sym && holdingSymbols.has(sym);
    }).length;
  }, [calendarEvents, today, holdingSymbols]);

  const pastCount = useMemo(() => {
    return calendarEvents.filter((e) => {
      const d = new Date(e.date);
      d.setHours(0, 0, 0, 0);
      return d < today;
    }).length;
  }, [calendarEvents, today]);

  const getImpactBadge = (impact?: CalendarEvent['impact']) => {
    switch (impact) {
      case 'HIGH':
        return 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/50';
      case 'MEDIUM':
        return 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/50';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const getCategoryBadge = (cat: CalendarEvent['category']) => {
    switch (cat) {
      case 'EARNINGS':
        return 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300';
      case 'IPO':
        return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300';
      case 'POLICY':
        return 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300';
      case 'MACRO':
      case 'BUDGET':
        return 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300';
      case 'AMFI_REBALANCE':
        return 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300';
      case 'HOLIDAY':
        return 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 text-xs font-bold border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5" />
              <span>BSE & NSE DALAL STREET CALENDAR</span>
            </span>
            <span className="text-xs text-slate-400 font-medium">Indian Equity Catalysts & Market Schedule</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Market Catalyst & Corporate Action Schedule</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Track quarterly earnings concalls, board dividend announcements, RBI MPC repo rate decisions, NSE F&O derivative monthly expiries, exchange trading holidays, and SEBI/AMFI reclassifications.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="cal-sync-live-btn"
            onClick={handleSyncLiveCalendar}
            disabled={isFetchingLiveCalendar}
            className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
            title="Fetch live BSE/NSE corporate earnings announcements & board meetings from Yahoo Finance"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetchingLiveCalendar ? 'animate-spin' : ''}`} />
            <span>{isFetchingLiveCalendar ? 'Fetching Live Data...' : 'Sync Live NSE/BSE Events'}</span>
          </button>

          <button
            id="cal-add-custom-btn"
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event / Alert</span>
          </button>

          <button
            id="cal-reset-defaults-btn"
            onClick={resetCalendarToOfficialSchedule}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            title="Reset to 2026-2027 official Dalal Street schedule"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sync Banner Status */}
      {(syncStatusMsg || lastCalendarSyncTime || calendarSyncError) && (
        <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>
              {syncStatusMsg || 'BSE/NSE Indian market schedule is up-to-date for FY 2026-27.'}
            </span>
          </div>
          {lastCalendarSyncTime && (
            <span className="text-[11px] font-mono text-indigo-700 dark:text-indigo-400">
              Last synced: {lastCalendarSyncTime}
            </span>
          )}
        </div>
      )}

      {/* 4 Main View Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-px">
        <button
          id="cal-tab-catalyst-btn"
          onClick={() => {
            setActiveMainTab('catalyst');
            setSelectedCategory('ALL');
          }}
          className={`px-4 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeMainTab === 'catalyst'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Upcoming Dalal Street Triggers</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
            {upcomingCount}
          </span>
        </button>

        <button
          id="cal-tab-holdings-btn"
          onClick={() => {
            setActiveMainTab('holdings');
            setSelectedCategory('ALL');
          }}
          className={`px-4 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeMainTab === 'holdings'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>My Holdings Watchlist</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
            {myHoldingsEventsCount}
          </span>
        </button>

        <button
          id="cal-tab-holidays-btn"
          onClick={() => {
            setActiveMainTab('holidays');
            setSelectedCategory('ALL');
          }}
          className={`px-4 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeMainTab === 'holidays'
              ? 'border-rose-600 text-rose-600 dark:text-rose-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>BSE & NSE Trading Holidays</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
            {holidaysCount}
          </span>
        </button>

        <button
          id="cal-tab-past-btn"
          onClick={() => {
            setActiveMainTab('past');
            setSelectedCategory('ALL');
          }}
          className={`px-4 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeMainTab === 'past'
              ? 'border-zinc-700 text-zinc-900 dark:text-white'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Concluded Events</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {pastCount}
          </span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-1">
          {categories.map((cat) => {
            if (activeMainTab === 'holidays' && cat.id !== 'ALL' && cat.id !== 'HOLIDAY') return null;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Search Box */}
        <div className="relative w-full md:w-64 shrink-0">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search symbol, event, IPO..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-500 transition-colors shadow-2xs"
          />
        </div>
      </div>

      {/* Quick Holdings Ticker Chips (for quick filtering) */}
      {holdings.length > 0 && activeMainTab !== 'holidays' && (
        <div className="flex items-center gap-1.5 flex-wrap text-xs text-slate-500">
          <span className="font-semibold text-[11px] text-slate-400 uppercase tracking-wide">
            Filter by Portfolio Scrip:
          </span>
          {holdings.map((h) => (
            <button
              key={h.symbol}
              onClick={() => setSearchQuery(searchQuery === h.symbol ? '' : h.symbol)}
              className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold transition-all ${
                searchQuery.toUpperCase() === h.symbol.toUpperCase()
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {h.symbol}
            </button>
          ))}
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-[11px] text-rose-500 hover:underline font-semibold ml-1"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Events Grid */}
      {sortedEvents.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
          <CalendarIcon className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No Events Match the Selected Filter
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {activeMainTab === 'holdings'
              ? "None of your current portfolio holdings have scheduled concalls or corporate triggers in this category. Click 'Sync Live NSE/BSE Events' to query new announcements."
              : 'Try changing your category filter or search terms, or add a custom market trigger.'}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
            >
              Reset Filters
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold"
            >
              Add Custom Event
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedEvents.map((ev) => {
            const evDate = new Date(ev.date);
            const isHolding = (ev.relatedSymbol || ev.symbol) && holdingSymbols.has((ev.relatedSymbol || ev.symbol || '').toUpperCase());

            return (
              <div
                key={ev.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border shadow-2xs flex flex-col justify-between transition-all group ${
                  isHolding
                    ? 'border-emerald-300 dark:border-emerald-700/70 hover:border-emerald-400'
                    : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getCategoryBadge(ev.category)}`}>
                        {ev.badgeText || ev.category.replace('_', ' ')}
                      </span>
                      {ev.impact && (
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${getImpactBadge(ev.impact)}`}
                        >
                          {ev.impact} IMPACT
                        </span>
                      )}
                      {isHolding && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          In Portfolio
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => toggleCalendarAlert(ev.id)}
                      title={ev.isAlertSet ? 'Alert Enabled' : 'Enable Alert'}
                      className={`p-1.5 rounded-lg transition-all ${
                        ev.isAlertSet
                          ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60'
                          : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                      }`}
                    >
                      {ev.isAlertSet ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {evDate.toLocaleDateString('en-IN', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div>{getCountdownBadge(ev.date)}</div>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                      {ev.title}
                    </h3>

                    {ev.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 line-clamp-3 leading-relaxed">
                        {ev.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  {ev.relatedSymbol || ev.symbol ? (
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      NSE: {ev.relatedSymbol || ev.symbol}
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-medium">
                      {ev.category === 'HOLIDAY' ? 'Exchange Settlement Holiday' : 'Macro Catalytic Trigger'}
                    </span>
                  )}

                  <button
                    onClick={() => deleteCalendarEvent(ev.id)}
                    title="Remove Event"
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition-all p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Event Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-indigo-600" />
              Add Custom Market Event / Trigger Alert
            </h2>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Infosys Q3 Board Meeting / Interim Dividend"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs outline-none"
                  >
                    <option value="EARNINGS">Quarterly Earnings</option>
                    <option value="IPO">Mainboard IPO</option>
                    <option value="POLICY">RBI MPC / Policy</option>
                    <option value="MACRO">Macro / Budget / Tax</option>
                    <option value="AMFI_REBALANCE">AMFI Reclassification</option>
                    <option value="HOLIDAY">Trading Holiday</option>
                    <option value="CUSTOM">Custom Watchlist Alert</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase">
                    Impact Level
                  </label>
                  <select
                    value={newImpact}
                    onChange={(e) => setNewImpact(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs outline-none"
                  >
                    <option value="HIGH">High Impact</option>
                    <option value="MEDIUM">Medium Impact</option>
                    <option value="LOW">Low Impact</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase">
                    Related Ticker
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. INFY, TCS"
                    value={newSymbol}
                    onChange={(e) => setNewSymbol(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs outline-none uppercase font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase">
                  Details / Record Date / Concall Trigger
                </label>
                <textarea
                  rows={3}
                  placeholder="Record date details, expected dividend payout, or margin guidance triggers..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
