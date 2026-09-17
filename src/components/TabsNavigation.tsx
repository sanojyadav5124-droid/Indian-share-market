import React from 'react';
import {
  LayoutDashboard,
  PieChart,
  ReceiptText,
  Calculator,
  BookOpen,
  Info,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

export const TabsNavigation: React.FC = () => {
  const { activeTab, setActiveTab, holdings, transactions, realizedLots } = usePortfolio();

  const tabs = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
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
    <div className="border-b border-zinc-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2.5 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}-btn`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-zinc-900 text-white shadow-xs font-semibold'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                      isActive
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
