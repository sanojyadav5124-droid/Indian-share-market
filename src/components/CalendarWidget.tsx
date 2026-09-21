import React, { useMemo } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { Calendar, Bell, ChevronRight, Clock, Landmark } from 'lucide-react';

export const CalendarWidget: React.FC = () => {
  const { calendarEvents, toggleCalendarAlert, setActiveTab } = usePortfolio();

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Filter only upcoming events starting from today, sorted by date ascending
  const upcomingEvents = useMemo(() => {
    return [...calendarEvents]
      .filter((ev) => {
        const evDate = new Date(ev.date);
        evDate.setHours(0, 0, 0, 0);
        return evDate >= today;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 4);
  }, [calendarEvents, today]);

  const getDaysDiff = (dateStr: string) => {
    const evDate = new Date(dateStr);
    evDate.setHours(0, 0, 0, 0);
    return Math.round((evDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Dalal Street Catalyst Calendar</h3>
            <p className="text-[11px] text-slate-400">Upcoming Indian Earnings & Macro Triggers</p>
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
        {upcomingEvents.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            No upcoming events scheduled. Click 'View All' to check the full calendar.
          </div>
        ) : (
          upcomingEvents.map((ev) => {
            const dateObj = new Date(ev.date);
            const isHigh = ev.impact === 'HIGH';
            const daysRemaining = getDaysDiff(ev.date);

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
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          isHigh
                            ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {ev.badgeText || ev.category.replace('_', ' ')}
                      </span>
                      {daysRemaining === 0 ? (
                        <span className="text-[9px] font-bold text-rose-600 animate-pulse">Today</span>
                      ) : daysRemaining === 1 ? (
                        <span className="text-[9px] font-bold text-amber-600">Tomorrow</span>
                      ) : (
                        <span className="text-[9px] font-medium text-slate-400">in {daysRemaining}d</span>
                      )}
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
          })
        )}
      </div>
    </div>
  );
};
