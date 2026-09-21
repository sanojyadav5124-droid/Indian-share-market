import React from 'react';
import {
  LayoutDashboard,
  PieChart,
  ReceiptText,
  Calculator,
  BookOpen,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

export const TabsNavigation: React.FC = () => {
  const { activeTab, setActiveTab, holdings, transactions, realizedLots, calendarEvents } = usePortfolio();

  const tabs = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'ai_copilot',
      label: 'AI Co-Pilot & CAS Sync',
      icon: Sparkles,
      badge: 'Gemini AI',
      badgeClass: 'bg-indigo-600 text-white font-bold',
    },
    {
      id: 'calendar',
      label: 'Market Calendar',
      icon: Calendar,
      badge: `${calendarEvents.length} Events`,
    },
    {
      id: 'holdings',
      label: 'Holdings Analytics',
      icon: PieChart,
      badge: holdings.length.toString(),
    },
    {
      id: 'transactions',
      label: 'Transaction Ledger',
      icon: ReceiptText,
      badge: transactions.length.toString(),
    },
    {
      id: 'tax',
      label: 'Tax Engine & Reports',
      icon: Calculator,
      badge: realizedLots.length > 0 ? `${realizedLots.length} Realized` : null,
    },
    {
      id: 'manual',
      label: 'User Manual & Docs',
      icon: BookOpen,
      badge: null,
    },
  ] as const;

  return (
    <div className="border-b border-zinc-200 bg-white sticky top-16 z-20 shadow-2xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <nav className="flex space-x-1.5 sm:space-x-3 overflow-x-auto py-2 sm:py-2.5 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}-btn`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                  isActive
                    ? 'bg-zinc-900 text-white shadow-xs font-semibold'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[9px] sm:text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                      (tab as any).badgeClass
                        ? (tab as any).badgeClass
                        : isActive
                        ? 'bg-zinc-800 text-zinc-300'
                        : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
