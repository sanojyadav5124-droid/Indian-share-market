import React from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import {
  LayoutDashboard,
  PieChart,
  Calendar,
  Sparkles,
  ReceiptText,
  Calculator,
  Sliders,
  PlusCircle,
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isMobileView,
    setIsAddTxModalOpen,
    setIsSettingsModalOpen,
    calendarEvents,
  } = usePortfolio();

  if (!isMobileView) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-zinc-200 px-2 py-1.5 shadow-lg md:hidden">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {/* Dashboard */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
            activeTab === 'dashboard'
              ? 'text-zinc-900 font-bold'
              : 'text-zinc-400 hover:text-zinc-600'
          }`}
        >
          <LayoutDashboard className={`w-5 h-5 ${activeTab === 'dashboard' ? 'text-zinc-900' : 'text-zinc-400'}`} />
          <span className="text-[10px] mt-0.5">Home</span>
        </button>

        {/* Holdings */}
        <button
          onClick={() => setActiveTab('holdings')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
            activeTab === 'holdings'
              ? 'text-zinc-900 font-bold'
              : 'text-zinc-400 hover:text-zinc-600'
          }`}
        >
          <PieChart className={`w-5 h-5 ${activeTab === 'holdings' ? 'text-zinc-900' : 'text-zinc-400'}`} />
          <span className="text-[10px] mt-0.5">Holdings</span>
        </button>

        {/* Center Quick Trade Button */}
        <button
          onClick={() => setIsAddTxModalOpen(true)}
          className="flex flex-col items-center justify-center -mt-4 bg-zinc-900 text-white w-11 h-11 rounded-full shadow-md border-2 border-white transition-transform active:scale-95"
          title="Log Trade"
        >
          <PlusCircle className="w-6 h-6 text-emerald-400" />
        </button>

        {/* Calendar */}
        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all relative ${
            activeTab === 'calendar'
              ? 'text-zinc-900 font-bold'
              : 'text-zinc-400 hover:text-zinc-600'
          }`}
        >
          <Calendar className={`w-5 h-5 ${activeTab === 'calendar' ? 'text-zinc-900' : 'text-zinc-400'}`} />
          <span className="text-[10px] mt-0.5">Events</span>
          {calendarEvents.length > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-indigo-600"></span>
          )}
        </button>

        {/* AI Co-Pilot */}
        <button
          onClick={() => setActiveTab('ai_copilot')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
            activeTab === 'ai_copilot'
              ? 'text-indigo-600 font-bold'
              : 'text-zinc-400 hover:text-zinc-600'
          }`}
        >
          <Sparkles className={`w-5 h-5 ${activeTab === 'ai_copilot' ? 'text-indigo-600' : 'text-zinc-400'}`} />
          <span className="text-[10px] mt-0.5">AI Copilot</span>
        </button>
      </div>
    </div>
  );
};
