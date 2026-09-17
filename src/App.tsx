import React from 'react';
import { PortfolioProvider, usePortfolio } from './context/PortfolioContext';
import { Header } from './components/Header';
import { TabsNavigation } from './components/TabsNavigation';
import { DashboardView } from './components/DashboardView';
import { HoldingsAnalyticsView } from './components/HoldingsAnalyticsView';
import { TransactionLedgerView } from './components/TransactionLedgerView';
import { TaxEngineView } from './components/TaxEngineView';
import { UserManualView } from './components/UserManualView';
import { PricingManagerModal } from './components/PricingManagerModal';
import { AddTransactionModal } from './components/AddTransactionModal';
import { AddCustomStockModal } from './components/AddCustomStockModal';
import { LotDetailsModal } from './components/LotDetailsModal';
import { ShieldCheck, HardDrive, BookOpen, Layers } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, setActiveTab, costBasisMethod, setCostBasisMethod } = usePortfolio();

  return (
    <div className="min-h-screen bg-zinc-50/70 text-zinc-900 font-sans antialiased flex flex-col selection:bg-zinc-900 selection:text-white">
      {/* Global Top Header with Profile Selector & Price Manager */}
      <Header />

      {/* Main 5-Tab Navigation */}
      <TabsNavigation />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'holdings' && <HoldingsAnalyticsView />}
        {activeTab === 'transactions' && <TransactionLedgerView />}
        {activeTab === 'tax' && <TaxEngineView />}
        {activeTab === 'manual' && <UserManualView />}
      </main>

      {/* Global Modals */}
      <PricingManagerModal />
      <AddTransactionModal />
      <AddCustomStockModal />
      <LotDetailsModal />

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-6 mt-auto text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-medium text-zinc-700">BharatWealth Engine</span>
            <span>• 100% Client-Side Local Storage</span>
            <span>• Indian Finance Act 2024 Compliant</span>
          </div>

          <div className="flex items-center gap-4 text-zinc-500">
            <button
              onClick={() => setActiveTab('manual')}
              className="hover:text-zinc-900 flex items-center gap-1"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>FIFO Manual & Docs</span>
            </button>
            <span>•</span>
            <button
              onClick={() => setCostBasisMethod(costBasisMethod === 'WAC' ? 'FIFO' : 'WAC')}
              className="hover:text-zinc-900 flex items-center gap-1 font-mono"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Current Lens: {costBasisMethod}</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <PortfolioProvider>
      <MainLayout />
    </PortfolioProvider>
  );
}
