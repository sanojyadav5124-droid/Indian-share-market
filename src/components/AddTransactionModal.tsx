import React, { useState } from 'react';
import {
  X,
  PlusCircle,
  Calculator,
  Coins,
  ShieldCheck,
  AlertCircle,
  ArrowDownLeft,
  Sparkles,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { InstrumentType, MarketCap, ProfileId, Sector, TransactionType } from '../types';
import { calculateIndianFriction } from '../utils/indianFriction';
import { formatINR } from '../utils/formatters';

export const AddTransactionModal: React.FC = () => {
  const {
    isAddTxModalOpen,
    setIsAddTxModalOpen,
    addTransaction,
    activeProfile,
    profiles,
    marketPrices,
    cashBalances,
  } = usePortfolio();

  // Form states
  const [profileId, setProfileId] = useState<ProfileId>(
    activeProfile === 'consolidated' ? 'self' : activeProfile
  );
  const [type, setType] = useState<TransactionType>('BUY');
  const [symbol, setSymbol] = useState('RELIANCE');
  const [name, setName] = useState('Reliance Industries Ltd');
  const [instrumentType, setInstrumentType] = useState<InstrumentType>('EQUITY');
  const [sector, setSector] = useState<Sector>('Oil & Gas');
  const [marketCap, setMarketCap] = useState<MarketCap>('Large Cap');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [quantity, setQuantity] = useState<number>(10);
  const [price, setPrice] = useState<number>(2985.40);
  const [notes, setNotes] = useState('');
  const [ratio, setRatio] = useState('1:1');
  const [useCashBalance, setUseCashBalance] = useState(true);

  // Charges
  const [stt, setStt] = useState(29.85);
  const [stampDuty, setStampDuty] = useState(4.48);
  const [exchangeCharges, setExchangeCharges] = useState(1.03);
  const [gstAndBrokerage, setGstAndBrokerage] = useState(0.22);

  if (!isAddTxModalOpen) return null;

  const totalCharges = Math.round((stt + stampDuty + exchangeCharges + gstAndBrokerage) * 100) / 100;
  const grossTradeValue = quantity * price;
  const netTradeValue =
    type === 'BUY'
      ? grossTradeValue + totalCharges
      : type === 'SELL'
      ? grossTradeValue - totalCharges
      : grossTradeValue;

  const currentProfileCash = cashBalances[profileId] || 0;
  const isCashInsufficient = useCashBalance && type === 'BUY' && netTradeValue > currentProfileCash;

  const handleSymbolChange = (sym: string) => {
    setSymbol(sym.toUpperCase());
    const existing = marketPrices.find((p) => p.symbol.toUpperCase() === sym.toUpperCase());
    if (existing) {
      setName(existing.name);
      setInstrumentType(existing.instrumentType);
      setSector(existing.sector);
      setMarketCap(existing.marketCap);
      setPrice(existing.cmp);

      // Recalculate friction
      const friction = calculateIndianFriction(
        existing.instrumentType,
        type === 'BUY' ? 'BUY' : 'SELL',
        quantity * existing.cmp
      );
      setStt(friction.stt);
      setStampDuty(friction.stampDuty);
      setExchangeCharges(friction.exchangeCharges);
      setGstAndBrokerage(friction.gstAndBrokerage);
    }
  };

  const handleAutoCalculateCharges = () => {
    const friction = calculateIndianFriction(
      instrumentType,
      type === 'BUY' ? 'BUY' : 'SELL',
      quantity * price
    );
    setStt(friction.stt);
    setStampDuty(friction.stampDuty);
    setExchangeCharges(friction.exchangeCharges);
    setGstAndBrokerage(friction.gstAndBrokerage);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!symbol.trim()) {
      alert('Please enter or select a symbol.');
      return;
    }

    if (quantity <= 0 && !['CASH_DEPOSIT', 'CASH_WITHDRAW'].includes(type)) {
      alert('Quantity must be greater than 0.');
      return;
    }

    if (price <= 0 && !['BONUS', 'SPLIT'].includes(type)) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-zinc-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
              <PlusCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 tracking-tight">
                Record Transaction
              </h2>
              <p className="text-xs text-zinc-500">
                Log purchases, sales, corporate actions, and uninvested cash entries
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddTxModalOpen(false)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Row 1: Profile & Action Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">
                Family Profile Account
              </label>
              <select
                value={profileId}
                onChange={(e) => setProfileId(e.target.value as ProfileId)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-800"
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
                value={type}
                onChange={(e) => {
                  const newType = e.target.value as TransactionType;
                  setType(newType);
                  if (newType === 'BONUS') {
                    setPrice(0);
                    setRatio('1:1');
                  }
                  if (newType === 'SPLIT') {
                    setRatio('1:2');
                  }
                  if (newType === 'CASH_DEPOSIT' || newType === 'CASH_WITHDRAW') {
                    setSymbol('INR_CASH');
                    setName('Cash Ledger Entry');
                    setInstrumentType('CASH');
                    setSector('Cash & Liquid');
                    setMarketCap('Cash');
                    setQuantity(1);
                  }
                }}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-800 font-medium"
              >
                <option value="BUY">BUY (Equity / MF)</option>
                <option value="SELL">SELL (FIFO Peeling & Tax Realization)</option>
                <option value="DIVIDEND">CASH DIVIDEND (Income)</option>
                <option value="BONUS">BONUS ISSUE (Section 55 Zero Cost)</option>
                <option value="SPLIT">STOCK SPLIT (Face Value Reduction)</option>
                <option value="DEMERGER">DEMERGER (Cost Apportionment)</option>
                <option value="CASH_DEPOSIT">CASH DEPOSIT (Add to Ledger)</option>
                <option value="CASH_WITHDRAW">CASH WITHDRAW (Transfer Out)</option>
              </select>
            </div>
          </div>

          {/* Row 2: Symbol & Name */}
          {!['CASH_DEPOSIT', 'CASH_WITHDRAW'].includes(type) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  Ticker / Symbol
                </label>
                <input
                  type="text"
                  list="known-symbols"
                  value={symbol}
                  onChange={(e) => handleSymbolChange(e.target.value)}
                  placeholder="e.g. RELIANCE, TCS, CDSL"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 uppercase font-mono font-medium text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                  required
                />
                <datalist id="known-symbols">
                  {marketPrices.map((p) => (
                    <option key={p.symbol} value={p.symbol}>
                      {p.name} ({formatINR(p.cmp)})
                    </option>
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  Company / Security Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Reliance Industries Ltd"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                  required
                />
              </div>
            </div>
          )}

          {/* Row 3: Date, Qty, Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Execution Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-800 font-mono"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">
                {type === 'DIVIDEND' ? 'Eligible Shares' : 'Quantity / Units'}
              </label>
              <input
                type="number"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-zinc-900 font-mono focus:outline-none focus:ring-1 focus:ring-zinc-800"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">
                {type === 'DIVIDEND'
                  ? 'Dividend Per Share (₹)'
                  : ['CASH_DEPOSIT', 'CASH_WITHDRAW'].includes(type)
                  ? 'Total Amount (₹)'
                  : 'Execution Price (₹)'}
              </label>
              <input
                type="number"
                step="any"
                value={price}
                disabled={type === 'BONUS'}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-zinc-900 font-mono focus:outline-none focus:ring-1 focus:ring-zinc-800 disabled:bg-zinc-100"
                required
              />
            </div>
          </div>

          {/* Corporate Action Ratio input if BONUS or SPLIT */}
          {['BONUS', 'SPLIT'].includes(type) && (
            <div className="p-3 bg-purple-50/60 border border-purple-200 rounded-xl">
              <label className="block font-semibold text-purple-900 mb-1">
                {type === 'BONUS' ? 'Bonus Ratio (e.g. 1:1, 4:1)' : 'Split Ratio (e.g. 1:2, 1:5)'}
              </label>
              <input
                type="text"
                value={ratio}
                onChange={(e) => setRatio(e.target.value)}
                placeholder="1:1"
                className="w-32 bg-white border border-purple-200 rounded-lg p-2 font-mono text-xs text-purple-950"
              />
              <span className="ml-3 text-[11px] text-purple-700">
                {type === 'BONUS'
                  ? 'New bonus shares created at ₹0 cost basis per Sec 55'
                  : 'Multiplies open share counts and reduces unit cost proportionally'}
              </span>
            </div>
          )}

          {/* Statutory Indian Friction Costs Accordion */}
          {['BUY', 'SELL'].includes(type) && (
            <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-800 flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-emerald-600" />
                  <span>Statutory Indian Transaction Costs</span>
                </span>
                <button
                  type="button"
                  onClick={handleAutoCalculateCharges}
                  className="px-2.5 py-1 bg-white border border-zinc-200 hover:bg-zinc-100 rounded text-[11px] font-medium text-zinc-700"
                >
                  Auto-Calculate Charges
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-500 block">STT (0.1%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={stt}
                    onChange={(e) => setStt(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-zinc-200 rounded p-1.5 font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 block">Stamp Duty (0.015%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={stampDuty}
                    onChange={(e) => setStampDuty(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-zinc-200 rounded p-1.5 font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 block">Exchange Fee (0.003%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={exchangeCharges}
                    onChange={(e) => setExchangeCharges(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-zinc-200 rounded p-1.5 font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 block">GST & SEBI (18%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={gstAndBrokerage}
                    onChange={(e) => setGstAndBrokerage(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-zinc-200 rounded p-1.5 font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="text-[11px] text-zinc-500 flex items-center justify-between pt-1 border-t border-zinc-200">
                <span>Total Statutory Friction: {formatINR(totalCharges)}</span>
                <span>Net Total Trade: <strong className="text-zinc-900">{formatINR(netTradeValue)}</strong></span>
              </div>
            </div>
          )}

          {/* Cash Routing Toggle */}
          {['BUY', 'SELL'].includes(type) && (
            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 flex items-center justify-between">
              <div>
                <span className="font-semibold text-zinc-800 block">
                  Route via Profile Uninvested Cash
                </span>
                <span className="text-[11px] text-zinc-500">
                  Available in {profiles.find((p) => p.id === profileId)?.name.split(' ')[0]}'s cash: {formatINR(currentProfileCash)}
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
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>
                Insufficient cash in ledger ({formatINR(currentProfileCash)} vs required {formatINR(netTradeValue)}). The balance will show a negative debit unless cash deposit is logged.
              </span>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block font-semibold text-zinc-700 mb-1">Notes / Investment Thesis</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Q3 result dip addition, rebalancing, SIP installment"
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-800"
            />
          </div>

          {/* Submit */}
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
  );
};
