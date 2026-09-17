import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  PlusCircle,
  Calculator,
  Search,
  Check,
  Building2,
  Database,
  ArrowRight,
  Layers,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { InstrumentType, MarketCap, ProfileId, Sector, StockDirectoryItem, TransactionType } from '../types';
import { calculateIndianFriction } from '../utils/indianFriction';
import { formatINR } from '../utils/formatters';

export const AddTransactionModal: React.FC = () => {
  const {
    isAddTxModalOpen,
    setIsAddTxModalOpen,
    setIsAddStockModalOpen,
    addTransaction,
    activeProfile,
    profiles,
    allStocks,
    customStocks,
    marketPrices,
    cashBalances,
  } = usePortfolio();

  // Form states
  const [profileId, setProfileId] = useState<ProfileId>(
    activeProfile === 'consolidated' ? 'self' : activeProfile
  );
  const [type, setType] = useState<TransactionType>('BUY');

  // Search & Selected Stock state
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StockDirectoryItem | null>(null);

  // Structural metadata (auto-inherited upon selection)
  const [symbol, setSymbol] = useState('RELIANCE');
  const [name, setName] = useState('Reliance Industries Ltd');
  const [instrumentType, setInstrumentType] = useState<InstrumentType>('EQUITY');
  const [sector, setSector] = useState<Sector>('Oil & Gas');
  const [marketCap, setMarketCap] = useState<MarketCap>('Large Cap');

  // Raw transaction variables
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [quantity, setQuantity] = useState<number>(10);
  const [price, setPrice] = useState<number>(2985.40);
  const [notes, setNotes] = useState('');
  const [ratio, setRatio] = useState('1:1');
  const [useCashBalance, setUseCashBalance] = useState(true);

  // Friction Cost Estimator Toggle & Charges
  const [autoCalculateFriction, setAutoCalculateFriction] = useState(true);
  const [showFrictionBreakdown, setShowFrictionBreakdown] = useState(false);
  const [stt, setStt] = useState(29.85);
  const [stampDuty, setStampDuty] = useState(4.48);
  const [exchangeCharges, setExchangeCharges] = useState(1.03);
  const [gstAndBrokerage, setGstAndBrokerage] = useState(0.22);

  // Search input ref & dropdown container ref
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const prevCustomStocksCountRef = useRef(customStocks.length);

  // When a custom stock is newly added while transaction modal is open, auto-select it
  useEffect(() => {
    if (customStocks.length > prevCustomStocksCountRef.current) {
      const latest = customStocks[customStocks.length - 1];
      if (latest) {
        handleSelectStock(latest);
      }
    }
    prevCustomStocksCountRef.current = customStocks.length;
  }, [customStocks]);

  // Initialize with RELIANCE from directory if available
  useEffect(() => {
    if (allStocks.length > 0 && !selectedStock) {
      const defaultItem = allStocks.find((s) => s.symbol === 'RELIANCE') || allStocks[0];
      if (defaultItem) {
        handleSelectStock(defaultItem);
      }
    }
  }, [allStocks]);

  // Click outside to close autocomplete dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter stocks based on query
  const filteredStocks = searchQuery.trim()
    ? allStocks.filter(
        (s) =>
          s.symbol.toUpperCase().includes(searchQuery.trim().toUpperCase()) ||
          s.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
          s.sector.toLowerCase().includes(searchQuery.trim().toLowerCase())
      )
    : allStocks.slice(0, 8); // top 8 when query is empty

  // One-Click Metadata Resolution
  const handleSelectStock = (stock: StockDirectoryItem) => {
    setSelectedStock(stock);
    setSymbol(stock.symbol);
    setName(stock.name);
    setInstrumentType(stock.instrumentType);
    setSector(stock.sector);
    setMarketCap(stock.marketCap);

    // Look up latest CMP if available in marketPrices, else defaultPrice
    const livePriceObj = marketPrices.find((p) => p.symbol.toUpperCase() === stock.symbol.toUpperCase());
    const resolvedPrice = livePriceObj ? livePriceObj.cmp : stock.defaultPrice;
    if (type !== 'BONUS') {
      setPrice(resolvedPrice);
    }

    setSearchQuery(`${stock.symbol} - ${stock.name}`);
    setIsDropdownOpen(false);

    // Auto-calculate friction for newly selected stock
    if (autoCalculateFriction && ['BUY', 'SELL'].includes(type)) {
      const tradeVal = quantity * resolvedPrice;
      const friction = calculateIndianFriction(
        stock.instrumentType,
        type === 'BUY' ? 'BUY' : 'SELL',
        tradeVal
      );
      setStt(friction.stt);
      setStampDuty(friction.stampDuty);
      setExchangeCharges(friction.exchangeCharges);
      setGstAndBrokerage(friction.gstAndBrokerage);
    }
  };

  // Recompute friction whenever autoCalculateFriction is enabled and variables change
  useEffect(() => {
    if (autoCalculateFriction && ['BUY', 'SELL'].includes(type)) {
      const tradeVal = (Number(quantity) || 0) * (Number(price) || 0);
      const friction = calculateIndianFriction(
        instrumentType,
        type === 'BUY' ? 'BUY' : 'SELL',
        tradeVal
      );
      setStt(friction.stt);
      setStampDuty(friction.stampDuty);
      setExchangeCharges(friction.exchangeCharges);
      setGstAndBrokerage(friction.gstAndBrokerage);
    } else if (!['BUY', 'SELL'].includes(type)) {
      setStt(0);
      setStampDuty(0);
      setExchangeCharges(0);
      setGstAndBrokerage(0);
    }
  }, [autoCalculateFriction, quantity, price, instrumentType, type]);

  if (!isAddTxModalOpen) return null;

  const totalCharges = Math.round((stt + stampDuty + exchangeCharges + gstAndBrokerage) * 100) / 100;
  const grossTradeValue = (Number(quantity) || 0) * (Number(price) || 0);
  const netTradeValue =
    type === 'BUY'
      ? grossTradeValue + totalCharges
      : type === 'SELL'
      ? Math.max(0, grossTradeValue - totalCharges)
      : grossTradeValue;

  const currentProfileCash = cashBalances[profileId] || 0;
  const isCashInsufficient = useCashBalance && type === 'BUY' && netTradeValue > currentProfileCash;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!symbol.trim()) {
      alert('Please select or enter a valid security.');
      return;
    }

    if (quantity <= 0 && !['CASH_DEPOSIT', 'CASH_WITHDRAW'].includes(type)) {
      alert('Quantity must be greater than 0.');
      return;
    }

    if (price < 0 || (price === 0 && !['BONUS', 'SPLIT'].includes(type))) {
      alert('Price must be greater than 0.');
      return;
    }

    addTransaction({
      profileId,
      symbol: symbol.toUpperCase(),
      name: name || symbol.toUpperCase(),
      instrumentType,
      sector,
      marketCap,
      type,
      date,
      quantity: Number(quantity),
      price: Number(price),
      charges: {
        stt: Number(stt),
        stampDuty: Number(stampDuty),
        exchangeCharges: Number(exchangeCharges),
        gstAndBrokerage: Number(gstAndBrokerage),
        total: totalCharges,
      },
      notes: notes.trim() || undefined,
      ratio: ['BONUS', 'SPLIT'].includes(type) ? ratio : undefined,
      useCashBalance,
    });

    setIsAddTxModalOpen(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[92vh]">
          {/* Header */}
          <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/80">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-xs">
                <PlusCircle className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-zinc-900 tracking-tight">
                  Record Order / Transaction
                </h2>
                <p className="text-xs text-zinc-500">
                  Smart auto-populating trade entry with one-click metadata resolution
                </p>
              </div>
            </div>

            <button
              id="close-tx-modal-btn"
              onClick={() => setIsAddTxModalOpen(false)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
            {/* Account Profile & Action Type Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  Family Profile Account
                </label>
                <select
                  id="tx-profile-select"
                  value={profileId}
                  onChange={(e) => setProfileId(e.target.value as ProfileId)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-800 font-medium"
                >
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.relation}) • PAN: {p.pan}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  Action / Transaction Type
                </label>
                <select
                  id="tx-type-select"
                  value={type}
                  onChange={(e) => {
                    const newType = e.target.value as TransactionType;
                    setType(newType);
                    if (newType === 'BONUS') {
                      setPrice(0);
                      setRatio('1:1');
                    } else if (newType === 'SPLIT') {
                      setRatio('1:2');
                    } else if (newType === 'CASH_DEPOSIT' || newType === 'CASH_WITHDRAW') {
                      setSymbol('INR_CASH');
                      setName('Cash Ledger Entry');
                      setInstrumentType('CASH');
                      setSector('Cash & Liquid');
                      setMarketCap('Cash');
                      setQuantity(1);
                    } else if (selectedStock) {
                      setPrice(selectedStock.defaultPrice);
                    }
                  }}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-800 font-semibold"
                >
                  <option value="BUY">BUY (Long Delivery Holding)</option>
                  <option value="SELL">SELL (FIFO Peeling & Tax Realization)</option>
                  <option value="DIVIDEND">DIVIDEND (Cash Payout)</option>
                  <option value="BONUS">BONUS ISSUE (Section 55 Zero Cost)</option>
                  <option value="SPLIT">STOCK SPLIT (Sub-division)</option>
                  <option value="DEMERGER">DEMERGER (Cost Apportionment)</option>
                  <option value="CASH_DEPOSIT">CASH DEPOSIT (Add to Ledger)</option>
                  <option value="CASH_WITHDRAW">CASH WITHDRAW (Transfer Out)</option>
                </select>
              </div>
            </div>

            {/* Smart Search & Auto-Fill Stock Directory (Hidden for Pure Cash Actions) */}
            {!['CASH_DEPOSIT', 'CASH_WITHDRAW'].includes(type) && (
              <div ref={searchContainerRef} className="relative space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-zinc-800 flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Search Master Stock & Mutual Fund Directory</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsAddStockModalOpen(true)}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <Database className="w-3 h-3" />
                    <span>+ Add Custom Stock</span>
                  </button>
                </div>

                {/* Autocomplete Input */}
                <div className="relative">
                  <input
                    id="stock-autocomplete-input"
                    type="text"
                    value={searchQuery}
                    onFocus={() => setIsDropdownOpen(true)}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    placeholder="Type ticker or company name (e.g. RELIANCE, TCS, HDFC, Parag Parikh...)"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 pl-9 pr-24 text-zinc-900 font-medium focus:outline-none focus:ring-1 focus:ring-zinc-800"
                  />
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />

                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setIsDropdownOpen(true);
                      }}
                      className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600 p-0.5"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Autocomplete Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto bg-white border border-zinc-200 rounded-xl shadow-lg divide-y divide-zinc-100">
                    {filteredStocks.length > 0 ? (
                      filteredStocks.map((stock) => (
                        <div
                          key={stock.symbol}
                          onClick={() => handleSelectStock(stock)}
                          className="p-2.5 hover:bg-zinc-50 cursor-pointer flex items-center justify-between transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono font-bold text-zinc-900 text-xs">
                              {stock.symbol}
                            </span>
                            <span className="text-zinc-600 text-xs truncate max-w-[220px]">
                              {stock.name}
                            </span>
                            {stock.isCustom && (
                              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-100 text-amber-800">
                                Custom
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600">
                              {stock.sector}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">
                              {stock.marketCap}
                            </span>
                            <span className="font-mono font-semibold text-zinc-900 text-xs">
                              {formatINR(stock.defaultPrice)}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center">
                        <p className="text-zinc-500 mb-2">No security found matching "{searchQuery}"</p>
                        <button
                          type="button"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            setIsAddStockModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 inline-flex items-center gap-1.5"
                        >
                          <Database className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Add "{searchQuery.toUpperCase()}" to Master Database</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* One-Click Metadata Resolution Visual Badges */}
                {symbol && (
                  <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/80 flex flex-wrap items-center justify-between gap-2 mt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-zinc-900 text-white flex items-center justify-center text-[10px] font-mono font-bold">
                        {symbol.slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-bold text-zinc-900 text-xs flex items-center gap-1.5">
                          <span>{symbol}</span>
                          <span className="text-zinc-400 font-normal">|</span>
                          <span className="text-zinc-700 font-normal">{name}</span>
                        </div>
                      </div>
                    </div>

                    {/* Auto-resolved Structural Badges */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white border border-zinc-200 text-zinc-700">
                        {sector}
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                        {marketCap}
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100">
                        {instrumentType}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Raw Transaction Variables: Date, Quantity, Price */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Execution Date</label>
                <input
                  id="tx-date-input"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-800 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  {type === 'DIVIDEND' ? 'Eligible Shares' : 'Quantity / Units'}
                </label>
                <input
                  id="tx-quantity-input"
                  type="number"
                  step="any"
                  value={quantity}
                  onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-zinc-900 font-mono font-medium focus:outline-none focus:ring-1 focus:ring-zinc-800"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  {type === 'DIVIDEND'
                    ? 'Dividend / Share (₹)'
                    : ['CASH_DEPOSIT', 'CASH_WITHDRAW'].includes(type)
                    ? 'Total Amount (₹)'
                    : 'Execution Price / NAV (₹)'}
                </label>
                <input
                  id="tx-price-input"
                  type="number"
                  step="any"
                  value={price}
                  disabled={type === 'BONUS'}
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-zinc-900 font-mono font-medium focus:outline-none focus:ring-1 focus:ring-zinc-800 disabled:bg-zinc-100 disabled:text-zinc-400"
                  required
                />
              </div>
            </div>

            {/* Corporate Action Ratio input if BONUS or SPLIT */}
            {['BONUS', 'SPLIT'].includes(type) && (
              <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl">
                <label className="block font-semibold text-purple-900 mb-1">
                  {type === 'BONUS' ? 'Bonus Ratio (e.g. 1:1, 4:1)' : 'Split Ratio (e.g. 1:2, 1:5)'}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={ratio}
                    onChange={(e) => setRatio(e.target.value)}
                    placeholder="1:1"
                    className="w-28 bg-white border border-purple-200 rounded-lg p-2 font-mono text-xs text-purple-950 font-bold"
                  />
                  <span className="text-[11px] text-purple-800">
                    {type === 'BONUS'
                      ? 'New bonus shares created at ₹0 cost basis per Sec 55'
                      : 'Multiplies open share counts and reduces unit cost proportionally'}
                  </span>
                </div>
              </div>
            )}

            {/* Friction Cost Estimator with Auto-Calculate Toggle */}
            {['BUY', 'SELL'].includes(type) && (
              <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="font-bold text-zinc-900 block">
                        Statutory Indian Friction Costs
                      </span>
                      <span className="text-[11px] text-zinc-500">
                        Approximate STT (0.1%), Stamp Duty (0.015%), Exchange Fee, and GST
                      </span>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] font-medium text-zinc-600 cursor-pointer">
                      Auto-calculate
                    </label>
                    <button
                      type="button"
                      id="friction-calc-toggle"
                      role="switch"
                      aria-checked={autoCalculateFriction}
                      onClick={() => setAutoCalculateFriction(!autoCalculateFriction)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        autoCalculateFriction ? 'bg-emerald-600' : 'bg-zinc-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          autoCalculateFriction ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Quick Summary Row & Expand Breakdown */}
                <div className="pt-2 border-t border-zinc-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-zinc-500">Total Statutory Charges: </span>
                    <strong className="text-zinc-900 font-mono">{formatINR(totalCharges)}</strong>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowFrictionBreakdown(!showFrictionBreakdown)}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                  >
                    <span>{showFrictionBreakdown ? 'Hide Breakdown' : 'Edit / View Breakdown'}</span>
                    {showFrictionBreakdown ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>

                {/* Expandable Breakdown Inputs */}
                {showFrictionBreakdown && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-zinc-200/60">
                    <div>
                      <label className="text-[10px] text-zinc-500 block font-medium">STT (0.1%)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={stt}
                        disabled={autoCalculateFriction}
                        onChange={(e) => setStt(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-zinc-200 rounded p-1.5 font-mono text-[11px] disabled:bg-zinc-100 text-zinc-900"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-500 block font-medium">
                        Stamp Duty ({type === 'BUY' ? '0.015%' : '0%'})
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={stampDuty}
                        disabled={autoCalculateFriction}
                        onChange={(e) => setStampDuty(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-zinc-200 rounded p-1.5 font-mono text-[11px] disabled:bg-zinc-100 text-zinc-900"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-500 block font-medium">Exchange Fee (0.003%)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={exchangeCharges}
                        disabled={autoCalculateFriction}
                        onChange={(e) => setExchangeCharges(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-zinc-200 rounded p-1.5 font-mono text-[11px] disabled:bg-zinc-100 text-zinc-900"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-500 block font-medium">GST & SEBI (18%)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={gstAndBrokerage}
                        disabled={autoCalculateFriction}
                        onChange={(e) => setGstAndBrokerage(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-zinc-200 rounded p-1.5 font-mono text-[11px] disabled:bg-zinc-100 text-zinc-900"
                      />
                    </div>
                  </div>
                )}

                {/* Net Cost Basis Resolution */}
                <div className="pt-2 border-t border-zinc-200/80 flex items-center justify-between text-xs bg-white p-2.5 rounded-lg">
                  <span className="text-zinc-600 font-medium">
                    {type === 'BUY' ? 'Net Buy Cost Basis (Price + Friction):' : 'Net Proceeds Realized (Gross - Friction):'}
                  </span>
                  <span className="text-sm font-bold font-mono text-zinc-900">
                    {formatINR(netTradeValue)}
                  </span>
                </div>
              </div>
            )}

            {/* Cash Routing Toggle */}
            {['BUY', 'SELL'].includes(type) && (
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-zinc-800 block">
                    Route Settlement via Uninvested Cash
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    {profiles.find((p) => p.id === profileId)?.name.split(' ')[0]}'s Available Cash: {formatINR(currentProfileCash)}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={useCashBalance}
                  onChange={(e) => setUseCashBalance(e.target.checked)}
                  className="w-4 h-4 rounded text-zinc-900 focus:ring-zinc-800 cursor-pointer"
                />
              </div>
            )}

            {isCashInsufficient && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  Trade value ({formatINR(netTradeValue)}) exceeds current liquid cash ({formatINR(currentProfileCash)}). Balance will reflect an overdraft unless a cash deposit is logged.
                </span>
              </div>
            )}

            {/* Notes / Thesis */}
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">
                Notes / Thesis (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Q3 result dip addition, Monthly SIP, Rebalancing tranche"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-800"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                id="submit-transaction-btn"
                type="submit"
                className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                <span>Confirm & Record to Local Ledger</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
