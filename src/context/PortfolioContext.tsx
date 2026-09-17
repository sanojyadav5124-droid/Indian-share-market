import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  CostBasisMethod,
  FamilyProfile,
  HoldingItem,
  MarketPrice,
  PortfolioSummary,
  ProfileId,
  RealizedGainLot,
  StockDirectoryItem,
  Transaction,
} from '../types';
import {
  FAMILY_PROFILES,
  INITIAL_MARKET_PRICES,
  INITIAL_TRANSACTIONS,
} from '../data/seedData';
import { MASTER_STOCK_DIRECTORY } from '../data/stockDirectory';
import { processPortfolioTransactions } from '../utils/taxAndFifoEngine';

interface PortfolioContextType {
  activeProfile: ProfileId | 'consolidated';
  setActiveProfile: (profile: ProfileId | 'consolidated') => void;
  profiles: FamilyProfile[];
  costBasisMethod: CostBasisMethod;
  setCostBasisMethod: (method: CostBasisMethod) => void;
  activeTab: 'dashboard' | 'holdings' | 'transactions' | 'tax' | 'manual';
  setActiveTab: (tab: 'dashboard' | 'holdings' | 'transactions' | 'tax' | 'manual') => void;

  // Data
  transactions: Transaction[];
  marketPrices: MarketPrice[];
  allStocks: StockDirectoryItem[];
  customStocks: StockDirectoryItem[];
  holdings: HoldingItem[];
  realizedLots: RealizedGainLot[];
  summary: PortfolioSummary;
  cashBalances: Record<ProfileId, number>;

  // Actions
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  updateMarketPrice: (symbol: string, newCmp: number) => void;
  addCustomStock: (stock: StockDirectoryItem) => void;
  bulkUpdatePrices: (csvText: string) => { successCount: number; errors: string[] };
  simulateMarketShift: (percent: number) => void;
  resetToDefaults: () => void;

  // Import/Export
  exportBackupJSON: () => void;
  importBackupJSON: (jsonString: string) => boolean;
  exportHoldingsCSV: () => void;
  exportTaxCSV: () => void;

  // UI Modals
  isPricingModalOpen: boolean;
  setIsPricingModalOpen: (open: boolean) => void;
  isAddTxModalOpen: boolean;
  setIsAddTxModalOpen: (open: boolean) => void;
  isAddStockModalOpen: boolean;
  setIsAddStockModalOpen: (open: boolean) => void;
  selectedHoldingForLots: HoldingItem | null;
  setSelectedHoldingForLots: (holding: HoldingItem | null) => void;
}

const STORAGE_KEY = 'indian_share_market_portfolio_v1';

const PortfolioContext = createContext<PortfolioContextType | null>(null);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeProfile, setActiveProfile] = useState<ProfileId | 'consolidated'>('consolidated');
  const [costBasisMethod, setCostBasisMethod] = useState<CostBasisMethod>('WAC');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'holdings' | 'transactions' | 'tax' | 'manual'>('dashboard');

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_tx`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load transactions from localStorage', e);
    }
    return INITIAL_TRANSACTIONS;
  });

  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_prices`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load market prices from localStorage', e);
    }
    return INITIAL_MARKET_PRICES;
  });

  const [customStocks, setCustomStocks] = useState<StockDirectoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_custom_stocks`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load custom stocks from localStorage', e);
    }
    return [];
  });

  // Modal states
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  const [selectedHoldingForLots, setSelectedHoldingForLots] = useState<HoldingItem | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_tx`, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to persist transactions', e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_prices`, JSON.stringify(marketPrices));
    } catch (e) {
      console.error('Failed to persist market prices', e);
    }
  }, [marketPrices]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_custom_stocks`, JSON.stringify(customStocks));
    } catch (e) {
      console.error('Failed to persist custom stocks', e);
    }
  }, [customStocks]);

  // Combined Directory: Master Directory + User's Custom Stocks
  const allStocks = useMemo(() => {
    const stockMap = new Map<string, StockDirectoryItem>();
    
    // Seed with master directory
    MASTER_STOCK_DIRECTORY.forEach((item) => {
      stockMap.set(item.symbol.toUpperCase(), item);
    });

    // Merge custom stocks
    customStocks.forEach((item) => {
      stockMap.set(item.symbol.toUpperCase(), { ...item, isCustom: true });
    });

    // Also include any marketPrices not in master directory
    marketPrices.forEach((mp) => {
      const sym = mp.symbol.toUpperCase();
      if (!stockMap.has(sym) && mp.instrumentType !== 'CASH') {
        stockMap.set(sym, {
          symbol: mp.symbol,
          name: mp.name,
          sector: mp.sector,
          marketCap: mp.marketCap,
          instrumentType: mp.instrumentType,
          defaultPrice: mp.cmp,
        });
      }
    });

    return Array.from(stockMap.values());
  }, [customStocks, marketPrices]);

  // Derived processed data
  const { holdings, realizedLots, summary, cashBalances } = useMemo(() => {
    return processPortfolioTransactions(transactions, marketPrices, activeProfile);
  }, [transactions, marketPrices, activeProfile]);

  // Actions
  const addTransaction = (txData: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const updateMarketPrice = (symbol: string, newCmp: number) => {
    setMarketPrices((prev) =>
      prev.map((p) => {
        if (p.symbol.toUpperCase() === symbol.toUpperCase()) {
          return {
            ...p,
            previousClose: p.cmp,
            cmp: newCmp,
            lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 19),
          };
        }
        return p;
      })
    );
  };

  const bulkUpdatePrices = (csvText: string) => {
    const lines = csvText.split('\n');
    let successCount = 0;
    const errors: string[] = [];

    setMarketPrices((prev) => {
      const priceMap = new Map<string, MarketPrice>(prev.map((p) => [p.symbol.toUpperCase(), { ...p }]));

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.startsWith('#') || line.toLowerCase().startsWith('ticker') || line.toLowerCase().startsWith('symbol')) {
          continue;
        }

        const parts = line.split(/[,\t|]+/);
        if (parts.length >= 2) {
          const sym = parts[0].trim().toUpperCase();
          const priceStr = parts[1].trim().replace(/[₹,]/g, '');
          const price = parseFloat(priceStr);

          if (!isNaN(price) && price > 0) {
            const existing = priceMap.get(sym);
            if (existing) {
              existing.previousClose = existing.cmp;
              existing.cmp = price;
              existing.lastUpdated = new Date().toISOString().replace('T', ' ').substring(0, 19);
              successCount++;
            } else {
              // Add new tracked ticker
              priceMap.set(sym, {
                symbol: sym,
                name: sym,
                cmp: price,
                previousClose: price,
                lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 19),
                sector: 'Capital Goods',
                marketCap: 'Mid Cap',
                instrumentType: 'EQUITY',
              });
              successCount++;
            }
          } else {
            errors.push(`Line ${i + 1}: Invalid price format for ${parts[0]}`);
          }
        }
      }

      return Array.from(priceMap.values());
    });

    return { successCount, errors };
  };

  const simulateMarketShift = (percent: number) => {
    setMarketPrices((prev) =>
      prev.map((p) => {
        const factor = 1 + percent / 100;
        const newCmp = Math.round(p.cmp * factor * 100) / 100;
        return {
          ...p,
          previousClose: p.cmp,
          cmp: newCmp,
          lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 19),
        };
      })
    );
  };

  const addCustomStock = (stock: StockDirectoryItem) => {
    const formattedSymbol = stock.symbol.trim().toUpperCase();
    const formattedStock: StockDirectoryItem = {
      ...stock,
      symbol: formattedSymbol,
      isCustom: true,
    };

    setCustomStocks((prev) => {
      const filtered = prev.filter((s) => s.symbol.toUpperCase() !== formattedSymbol);
      return [...filtered, formattedStock];
    });

    // Also register or update in marketPrices so CMP is ready
    setMarketPrices((prev) => {
      const existing = prev.find((p) => p.symbol.toUpperCase() === formattedSymbol);
      if (existing) {
        return prev.map((p) =>
          p.symbol.toUpperCase() === formattedSymbol
            ? {
                ...p,
                name: stock.name,
                cmp: stock.defaultPrice,
                sector: stock.sector,
                marketCap: stock.marketCap,
                instrumentType: stock.instrumentType,
                lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 19),
              }
            : p
        );
      } else {
        return [
          ...prev,
          {
            symbol: formattedSymbol,
            name: stock.name,
            cmp: stock.defaultPrice,
            previousClose: stock.defaultPrice,
            lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 19),
            sector: stock.sector,
            marketCap: stock.marketCap,
            instrumentType: stock.instrumentType,
          },
        ];
      }
    });
  };

  const resetToDefaults = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setMarketPrices(INITIAL_MARKET_PRICES);
    setCustomStocks([]);
    localStorage.removeItem(`${STORAGE_KEY}_tx`);
    localStorage.removeItem(`${STORAGE_KEY}_prices`);
    localStorage.removeItem(`${STORAGE_KEY}_custom_stocks`);
  };

  // Export JSON
  const exportBackupJSON = () => {
    const payload = {
      version: '1.1',
      exportedAt: new Date().toISOString(),
      profiles: FAMILY_PROFILES,
      transactions,
      marketPrices,
      customStocks,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Indian_Portfolio_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON
  const importBackupJSON = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.transactions) && Array.isArray(data.marketPrices)) {
        setTransactions(data.transactions);
        setMarketPrices(data.marketPrices);
        if (Array.isArray(data.customStocks)) {
          setCustomStocks(data.customStocks);
        }
        return true;
      }
      return false;
    } catch (e) {
      console.error('Invalid JSON backup', e);
      return false;
    }
  };

  // Export CSV
  const exportHoldingsCSV = () => {
    const headers = [
      'Symbol',
      'Name',
      'Instrument',
      'Sector',
      'Market Cap',
      'Quantity',
      'WAC Avg Buy Price (INR)',
      'FIFO Avg Buy Price (INR)',
      'CMP (INR)',
      'Invested Value WAC (INR)',
      'Current Value (INR)',
      'Unrealized PnL WAC (INR)',
      'Unrealized PnL %',
      'Weightage %',
    ];

    const rows = holdings.map((h) => [
      `"${h.symbol}"`,
      `"${h.name}"`,
      `"${h.instrumentType}"`,
      `"${h.sector}"`,
      `"${h.marketCap}"`,
      h.totalQuantity,
      h.wacPrice.toFixed(2),
      h.fifoPrice.toFixed(2),
      h.cmp.toFixed(2),
      h.investedValueWAC.toFixed(2),
      h.currentValue.toFixed(2),
      h.unrealizedPnLWAC.toFixed(2),
      h.unrealizedPnLPercentWAC.toFixed(2),
      h.weightagePercent.toFixed(2),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Holdings_Report_${activeProfile}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportTaxCSV = () => {
    const headers = [
      'Profile',
      'Symbol',
      'Name',
      'Buy Date',
      'Sell Date',
      'Holding Days',
      'Classification',
      'Quantity',
      'Buy Cost (incl charges)',
      'Sell Proceed (net charges)',
      'Realized PnL (INR)',
      'Tax Rate',
      'Tax Amount (INR)',
    ];

    const rows = realizedLots.map((r) => [
      `"${r.profileId.toUpperCase()}"`,
      `"${r.symbol}"`,
      `"${r.name}"`,
      `"${r.buyDate}"`,
      `"${r.sellDate}"`,
      r.holdingDays,
      `"${r.isLTCG ? 'LTCG (>= 1 Yr)' : 'STCG (< 1 Yr)'}"`,
      r.quantity,
      r.netBuyCost.toFixed(2),
      r.netSellProceed.toFixed(2),
      r.realizedPnL.toFixed(2),
      `"${(r.taxRate * 100).toFixed(1)}%"`,
      r.taxApplicable.toFixed(2),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Capital_Gains_Tax_Statement_${activeProfile}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PortfolioContext.Provider
      value={{
        activeProfile,
        setActiveProfile,
        profiles: FAMILY_PROFILES,
        costBasisMethod,
        setCostBasisMethod,
        activeTab,
        setActiveTab,
        transactions,
        marketPrices,
        allStocks,
        customStocks,
        holdings,
        realizedLots,
        summary,
        cashBalances,
        addTransaction,
        deleteTransaction,
        updateMarketPrice,
        addCustomStock,
        bulkUpdatePrices,
        simulateMarketShift,
        resetToDefaults,
        exportBackupJSON,
        importBackupJSON,
        exportHoldingsCSV,
        exportTaxCSV,
        isPricingModalOpen,
        setIsPricingModalOpen,
        isAddTxModalOpen,
        setIsAddTxModalOpen,
        isAddStockModalOpen,
        setIsAddStockModalOpen,
        selectedHoldingForLots,
        setSelectedHoldingForLots,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};
