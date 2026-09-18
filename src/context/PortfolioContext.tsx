import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  ActiveTab,
  BenchmarkIndex,
  CalendarEvent,
  CostBasisMethod,
  FamilyProfile,
  FiscalYear,
  HoldingItem,
  MarketPrice,
  PortfolioSummary,
  ProfileId,
  RealizedGainLot,
  StockDirectoryItem,
  ThemeMode,
  Transaction,
} from '../types';
import {
  FAMILY_PROFILES,
  INITIAL_MARKET_PRICES,
  INITIAL_TRANSACTIONS,
} from '../data/seedData';
import { MASTER_STOCK_DIRECTORY } from '../data/stockDirectory';
import { INITIAL_CALENDAR_EVENTS } from '../data/calendarData';
import { processPortfolioTransactions } from '../utils/taxAndFifoEngine';

interface PortfolioContextType {
  activeProfile: ProfileId | 'consolidated';
  setActiveProfile: (profile: ProfileId | 'consolidated') => void;
  profiles: FamilyProfile[];
  costBasisMethod: CostBasisMethod;
  setCostBasisMethod: (method: CostBasisMethod) => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;

  // Fiscal Year & Benchmark
  selectedFY: FiscalYear;
  setSelectedFY: (fy: FiscalYear) => void;
  selectedBenchmark: BenchmarkIndex;
  setSelectedBenchmark: (b: BenchmarkIndex) => void;

  // Data
  transactions: Transaction[];
  marketPrices: MarketPrice[];
  allStocks: StockDirectoryItem[];
  customStocks: StockDirectoryItem[];
  holdings: HoldingItem[];
  realizedLots: RealizedGainLot[];
  summary: PortfolioSummary;
  cashBalances: Record<ProfileId, number>;
  calendarEvents: CalendarEvent[];

  // Actions
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  bulkAddTransactions: (txs: Omit<Transaction, 'id'>[]) => number;
  deleteTransaction: (id: string) => void;
  updateMarketPrice: (symbol: string, newCmp: number) => void;
  addCustomStock: (stock: StockDirectoryItem) => void;
  bulkUpdatePrices: (csvText: string) => { successCount: number; errors: string[] };
  simulateMarketShift: (percent: number) => void;
  resetToDefaults: () => void;

  // Calendar Actions
  addCalendarEvent: (ev: Omit<CalendarEvent, 'id'>) => void;
  toggleCalendarAlert: (id: string) => void;
  deleteCalendarEvent: (id: string) => void;

  // Family Profile Actions
  addProfile: (profile: Omit<FamilyProfile, 'id'>) => FamilyProfile;
  deleteProfile: (id: ProfileId) => { success: boolean; message?: string };
  updateProfile: (profile: FamilyProfile) => void;

  // Import/Export
  exportBackupJSON: () => void;
  importBackupJSON: (jsonString: string) => boolean;
  importBackupFromFile: (file: File) => Promise<{ success: boolean; message: string }>;
  exportHoldingsCSV: () => void;
  exportTaxCSV: () => void;

  // UI Modals
  isPricingModalOpen: boolean;
  setIsPricingModalOpen: (open: boolean) => void;
  isAddTxModalOpen: boolean;
  setIsAddTxModalOpen: (open: boolean) => void;
  isAddStockModalOpen: boolean;
  setIsAddStockModalOpen: (open: boolean) => void;
  isFamilyModalOpen: boolean;
  setIsFamilyModalOpen: (open: boolean) => void;
  isBackupModalOpen: boolean;
  setIsBackupModalOpen: (open: boolean) => void;
  selectedHoldingForLots: HoldingItem | null;
  setSelectedHoldingForLots: (holding: HoldingItem | null) => void;
}

const STORAGE_KEY = 'indian_share_market_portfolio_v1';

const PortfolioContext = createContext<PortfolioContextType | null>(null);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeProfile, setActiveProfile] = useState<ProfileId | 'consolidated'>('consolidated');
  const [costBasisMethod, setCostBasisMethod] = useState<CostBasisMethod>('WAC');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedFY, setSelectedFY] = useState<FiscalYear>('FY 2025-26');
  const [selectedBenchmark, setSelectedBenchmark] = useState<BenchmarkIndex>('NIFTY 50');

  const [profiles, setProfiles] = useState<FamilyProfile[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_profiles`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load profiles from localStorage', e);
    }
    return FAMILY_PROFILES;
  });

  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_theme`);
      if (saved && ['slate', 'day'].includes(saved)) {
        return saved as ThemeMode;
      }
    } catch (e) {
      console.error('Failed to load theme from localStorage', e);
    }
    return 'day';
  });

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_calendar_events`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load calendar events', e);
    }
    return INITIAL_CALENDAR_EVENTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_calendar_events`, JSON.stringify(calendarEvents));
    } catch (e) {
      console.error('Failed to persist calendar events', e);
    }
  }, [calendarEvents]);

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
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [selectedHoldingForLots, setSelectedHoldingForLots] = useState<HoldingItem | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_profiles`, JSON.stringify(profiles));
    } catch (e) {
      console.error('Failed to persist profiles', e);
    }
  }, [profiles]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_theme`, theme);
      document.documentElement.setAttribute('data-theme', theme);
    } catch (e) {
      console.error('Failed to persist theme', e);
    }
  }, [theme]);

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

  // Cross-tab sync listener
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key) return;
      if (e.key === `${STORAGE_KEY}_tx` && e.newValue) {
        try { setTransactions(JSON.parse(e.newValue)); } catch {}
      }
      if (e.key === `${STORAGE_KEY}_prices` && e.newValue) {
        try { setMarketPrices(JSON.parse(e.newValue)); } catch {}
      }
      if (e.key === `${STORAGE_KEY}_profiles` && e.newValue) {
        try { setProfiles(JSON.parse(e.newValue)); } catch {}
      }
      if (e.key === `${STORAGE_KEY}_custom_stocks` && e.newValue) {
        try { setCustomStocks(JSON.parse(e.newValue)); } catch {}
      }
      if (e.key === `${STORAGE_KEY}_theme` && e.newValue) {
        setTheme(e.newValue as ThemeMode);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

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

  const bulkAddTransactions = (txsData: Omit<Transaction, 'id'>[]): number => {
    if (!txsData || txsData.length === 0) return 0;
    const newTxs: Transaction[] = txsData.map((t, idx) => ({
      ...t,
      id: `tx-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 6)}`,
    }));
    setTransactions((prev) => [...newTxs, ...prev]);

    // Also auto-register any missing market price entries
    setMarketPrices((prevPrices) => {
      const existingSymbols = new Set(prevPrices.map((p) => p.symbol.toUpperCase()));
      const addedPrices: MarketPrice[] = [];
      newTxs.forEach((tx) => {
        const sym = tx.symbol.toUpperCase();
        if (!existingSymbols.has(sym) && tx.instrumentType !== 'CASH') {
          existingSymbols.add(sym);
          addedPrices.push({
            symbol: tx.symbol,
            name: tx.name,
            cmp: tx.price > 0 ? tx.price : 100,
            previousClose: tx.price > 0 ? tx.price : 100,
            lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 19),
            sector: tx.sector || 'Financial Services',
            marketCap: tx.marketCap || 'Large Cap',
            instrumentType: tx.instrumentType || 'EQUITY',
          });
        }
      });
      return addedPrices.length > 0 ? [...prevPrices, ...addedPrices] : prevPrices;
    });

    return newTxs.length;
  };

  // Calendar event actions
  const addCalendarEvent = (ev: Omit<CalendarEvent, 'id'>) => {
    const newEv: CalendarEvent = {
      ...ev,
      id: `cal-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    };
    setCalendarEvents((prev) => [newEv, ...prev]);
  };

  const toggleCalendarAlert = (id: string) => {
    setCalendarEvents((prev) =>
      prev.map((ev) => (ev.id === id ? { ...ev, isAlertSet: !ev.isAlertSet } : ev))
    );
  };

  const deleteCalendarEvent = (id: string) => {
    setCalendarEvents((prev) => prev.filter((ev) => ev.id !== id));
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

  // Family Profile Actions
  const addProfile = (profileData: Omit<FamilyProfile, 'id'>): FamilyProfile => {
    const slug = profileData.name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 15) || 'member';
    const id = `${slug}-${Date.now().toString().slice(-4)}`;
    const newProfile: FamilyProfile = {
      ...profileData,
      id,
    };
    setProfiles((prev) => [...prev, newProfile]);
    return newProfile;
  };

  const deleteProfile = (id: ProfileId): { success: boolean; message?: string } => {
    if (profiles.length <= 1) {
      return {
        success: false,
        message: 'Cannot delete the only remaining family profile. At least one profile is required.',
      };
    }
    // Delete transactions associated with this profile
    setTransactions((prev) => prev.filter((tx) => tx.profileId !== id));
    // Remove the profile
    setProfiles((prev) => prev.filter((p) => p.id !== id));

    if (activeProfile === id) {
      setActiveProfile('consolidated');
    }
    return { success: true };
  };

  const updateProfile = (updatedProfile: FamilyProfile) => {
    setProfiles((prev) => prev.map((p) => (p.id === updatedProfile.id ? updatedProfile : p)));
  };

  const resetToDefaults = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setMarketPrices(INITIAL_MARKET_PRICES);
    setProfiles(FAMILY_PROFILES);
    setCustomStocks([]);
    setActiveProfile('consolidated');
    localStorage.removeItem(`${STORAGE_KEY}_tx`);
    localStorage.removeItem(`${STORAGE_KEY}_prices`);
    localStorage.removeItem(`${STORAGE_KEY}_profiles`);
    localStorage.removeItem(`${STORAGE_KEY}_custom_stocks`);
  };

  // Export JSON
  const exportBackupJSON = () => {
    const payload = {
      appName: 'SKYadav portfolio App',
      version: '1.2',
      exportedAt: new Date().toISOString(),
      profiles,
      theme,
      transactions,
      marketPrices,
      customStocks,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SKYadav_Portfolio_Backup_${new Date().toISOString().slice(0, 10)}.json`;
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
        if (Array.isArray(data.profiles) && data.profiles.length > 0) {
          setProfiles(data.profiles);
        }
        if (Array.isArray(data.customStocks)) {
          setCustomStocks(data.customStocks);
        }
        if (data.theme && ['slate', 'day'].includes(data.theme)) {
          setTheme(data.theme);
        }
        return true;
      }
      return false;
    } catch (e) {
      console.error('Invalid JSON backup', e);
      return false;
    }
  };

  // Import Backup from File directly
  const importBackupFromFile = (file: File): Promise<{ success: boolean; message: string }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (!text) {
          resolve({ success: false, message: 'Uploaded file is empty.' });
          return;
        }
        const success = importBackupJSON(text);
        if (success) {
          resolve({ success: true, message: 'Portfolio backup restored successfully!' });
        } else {
          resolve({ success: false, message: 'Invalid portfolio backup file. Required transactions and market prices were missing.' });
        }
      };
      reader.onerror = () => {
        resolve({ success: false, message: 'Failed to read file from disk.' });
      };
      reader.readAsText(file);
    });
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
        profiles,
        costBasisMethod,
        setCostBasisMethod,
        activeTab,
        setActiveTab,
        theme,
        setTheme,
        selectedFY,
        setSelectedFY,
        selectedBenchmark,
        setSelectedBenchmark,
        transactions,
        marketPrices,
        allStocks,
        customStocks,
        holdings,
        realizedLots,
        summary,
        cashBalances,
        calendarEvents,
        addTransaction,
        bulkAddTransactions,
        deleteTransaction,
        updateMarketPrice,
        addCustomStock,
        bulkUpdatePrices,
        simulateMarketShift,
        resetToDefaults,
        addCalendarEvent,
        toggleCalendarAlert,
        deleteCalendarEvent,
        addProfile,
        deleteProfile,
        updateProfile,
        exportBackupJSON,
        importBackupJSON,
        importBackupFromFile,
        exportHoldingsCSV,
        exportTaxCSV,
        isPricingModalOpen,
        setIsPricingModalOpen,
        isAddTxModalOpen,
        setIsAddTxModalOpen,
        isAddStockModalOpen,
        setIsAddStockModalOpen,
        isFamilyModalOpen,
        setIsFamilyModalOpen,
        isBackupModalOpen,
        setIsBackupModalOpen,
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
