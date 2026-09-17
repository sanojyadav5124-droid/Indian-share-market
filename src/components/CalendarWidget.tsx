import React from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { Calendar, Bell, ChevronRight, AlertCircle, Clock } from 'lucide-react';

export const CalendarWidget: React.FC = () => {
  const { calendarEvents, toggleCalendarAlert, setActiveTab } = usePortfolio();

  // Pick top 4 upcoming events sorted by date
  const upcomingEvents = [...calendarEvents]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 4);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Dalal Street Catalyst Calendar</h3>
            <p className="text-[11px] text-slate-400">Upcoming Indian Earnings & Macro</p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('calendar')}
          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-0.5 group"
        >
          View All
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      <div className="space-y-2.5">
        {upcomingEvents.map((ev) => {
          const dateObj = new Date(ev.date);
          const isHigh = ev.impact === 'HIGH';
          return (
            <div
              key={ev.id}
              className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/30 flex items-center justify-between gap-2 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 text-center flex-shrink-0">
                  <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                    {dateObj.toLocaleDateString('en-IN', { month: 'short' })}
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                    {dateObj.getDate()}
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {ev.title}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                        isHigh
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {ev.category}
                    </span>
                    {ev.relatedSymbol && (
                      <span className="text-[10px] font-mono font-bold text-slate-500">
                        {ev.relatedSymbol}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => toggleCalendarAlert(ev.id)}
                title={ev.isAlertSet ? 'Alert On' : 'Alert Off'}
                className={`p-1.5 rounded-lg flex-shrink-0 transition-colors ${
                  ev.isAlertSet
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50'
                    : 'text-slate-300 dark:text-slate-600 hover:text-slate-500'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
