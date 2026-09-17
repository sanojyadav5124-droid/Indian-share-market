import React, { useState } from 'react';
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
} from 'lucide-react';

export const CalendarView: React.FC = () => {
  const { calendarEvents, addCalendarEvent, toggleCalendarAlert, deleteCalendarEvent } = usePortfolio();

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Event Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10));
  const [newCategory, setNewCategory] = useState<CalendarEvent['category']>('EARNINGS');
  const [newImpact, setNewImpact] = useState<CalendarEvent['impact']>('HIGH');
  const [newSymbol, setNewSymbol] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const categories = [
    { id: 'ALL', label: 'All Market Events' },
    { id: 'EARNINGS', label: 'Qtrly Earnings' },
    { id: 'IPO', label: 'Mainboard IPOs' },
    { id: 'POLICY', label: 'RBI MPC Policy' },
    { id: 'MACRO', label: 'Budget & Macro' },
    { id: 'AMFI_REBALANCE', label: 'SEBI/AMFI Rebalance' },
    { id: 'HOLIDAY', label: 'Exchange Holidays' },
  ];

  const filteredEvents = calendarEvents.filter((ev) => {
    if (selectedCategory === 'ALL') return true;
    return ev.category === selectedCategory;
  });

  // Sort by date ascending
  const sortedEvents = [...filteredEvents].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

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
      isAlertSet: true,
    });

    setNewTitle('');
    setNewDescription('');
    setNewSymbol('');
    setIsAddModalOpen(false);
  };

  const getImpactBadge = (impact: CalendarEvent['impact']) => {
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
        return 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300';
      case 'AMFI_REBALANCE':
        return 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 text-xs font-semibold border border-indigo-200 dark:border-indigo-800">
              SEBI & DALAL STREET CALENDAR
            </span>
            <span className="text-xs text-slate-400 font-medium">BSE / NSE Indian Market Events</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Market Catalyst & Corporate Action Schedule
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track key market triggers, RBI policy meetings, quarterly earnings, and major IPO listings.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Custom Alert / Event
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              selectedCategory === cat.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedEvents.map((ev) => {
          const eventDate = new Date(ev.date);
          const isUpcoming = eventDate >= new Date();
          return (
            <div
              key={ev.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getCategoryBadge(ev.category)}`}>
                      {ev.category.replace('_', ' ')}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${getImpactBadge(ev.impact)}`}
                    >
                      {ev.impact} IMPACT
                    </span>
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
                  <div className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {eventDate.toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                    {isUpcoming ? (
                      <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-semibold">
                        Upcoming
                      </span>
                    ) : (
                      <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium">
                        Concluded
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
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
                {ev.relatedSymbol ? (
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                    NSE: {ev.relatedSymbol}
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400 font-medium">Market Macro Indicator</span>
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

      {/* Add Event Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-indigo-600" />
              Add Custom Market Event / Alert
            </h2>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Infosys Q3 Board Meeting / Dividend"
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
                    <option value="POLICY">RBI Policy Meeting</option>
                    <option value="MACRO">Macro / Union Budget</option>
                    <option value="AMFI_REBALANCE">AMFI Rebalance</option>
                    <option value="HOLIDAY">Exchange Holiday</option>
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
                  Details / Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Record date details, expected listing premium, or revenue guidance triggers..."
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
