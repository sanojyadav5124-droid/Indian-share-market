import React, { useState } from 'react';
import { X, Plus, Database, Check, Building2 } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { InstrumentType, MarketCap, Sector, StockDirectoryItem } from '../types';
import { formatINR } from '../utils/formatters';

const POPULAR_SECTORS: Sector[] = [
  'Financial Services',
  'IT',
  'Capital Goods',
  'Auto',
  'Pharma & Healthcare',
  'FMCG',
  'Oil & Gas',
  'Consumer Durables',
  'Chemicals',
  'Metals',
  'Power',
  'Telecommunication',
];

interface AddCustomStockModalProps {
  onStockAdded?: (stock: StockDirectoryItem) => void;
  initialQuery?: string;
}

export const AddCustomStockModal: React.FC<AddCustomStockModalProps> = ({
  onStockAdded,
  initialQuery = '',
}) => {
  const { isAddStockModalOpen, setIsAddStockModalOpen, addCustomStock, allStocks } = usePortfolio();

  const [symbol, setSymbol] = useState(initialQuery.trim().toUpperCase());
  const [name, setName] = useState('');
  const [instrumentType, setInstrumentType] = useState<InstrumentType>('EQUITY');
  const [sector, setSector] = useState<Sector>('Capital Goods');
  const [customSector, setCustomSector] = useState('');
  const [isCustomSector, setIsCustomSector] = useState(false);
  const [marketCap, setMarketCap] = useState<MarketCap>('Mid Cap');
  const [price, setPrice] = useState<number>(500);
  const [error, setError] = useState<string | null>(null);

  if (!isAddStockModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSym = symbol.trim().toUpperCase();
    if (!cleanSym) {
      setError('Ticker symbol is required.');
      return;
    }

    if (!name.trim()) {
      setError('Company / Fund name is required.');
      return;
    }

    if (price <= 0) {
      setError('Price must be greater than ₹0.');
      return;
    }

    const resolvedSector = isCustomSector && customSector.trim() ? customSector.trim() : sector;

    const newStock: StockDirectoryItem = {
      symbol: cleanSym,
      name: name.trim(),
      instrumentType,
      sector: resolvedSector,
      marketCap,
      defaultPrice: Number(price),
      isCustom: true,
    };

    addCustomStock(newStock);
    if (onStockAdded) {
      onStockAdded(newStock);
    }

    setIsAddStockModalOpen(false);
    // Reset
    setSymbol('');
    setName('');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-zinc-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <Database className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 tracking-tight">
                Add Custom Security to Local Master Database
              </h2>
              <p className="text-[11px] text-zinc-500">
                Register any Indian stock, SME scrip, or Mutual Fund for instant tracking
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddStockModalOpen(false)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">
                Ticker / Symbol <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => {
                  setSymbol(e.target.value.toUpperCase());
                  setError(null);
                }}
                placeholder="e.g. JIOFIN, TATATECH"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 uppercase font-mono font-bold text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Instrument Type</label>
              <select
                value={instrumentType}
                onChange={(e) => setInstrumentType(e.target.value as InstrumentType)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-800"
              >
                <option value="EQUITY">Equity Share</option>
                <option value="MUTUAL_FUND">Mutual Fund (Direct)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 mb-1">
              Company / Fund Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder="e.g. Jio Financial Services Ltd"
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-800"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-zinc-700">Nifty Sector</label>
                <button
                  type="button"
                  onClick={() => setIsCustomSector(!isCustomSector)}
                  className="text-[10px] text-indigo-600 hover:text-indigo-800"
                >
                  {isCustomSector ? 'Pick standard' : '+ Custom'}
                </button>
              </div>
              {isCustomSector ? (
                <input
                  type="text"
                  value={customSector}
                  onChange={(e) => setCustomSector(e.target.value)}
                  placeholder="e.g. Defense, Green Energy"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                />
              ) : (
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value as Sector)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                >
                  {POPULAR_SECTORS.map((sec) => (
                    <option key={sec} value={sec}>
                      {sec}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Market Cap Category</label>
              <select
                value={marketCap}
                onChange={(e) => setMarketCap(e.target.value as MarketCap)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-800"
              >
                <option value="Large Cap">Large Cap (Nifty 100)</option>
                <option value="Mid Cap">Mid Cap (Nifty Midcap 150)</option>
                <option value="Small Cap">Small Cap (Nifty Smallcap 250)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 mb-1">
              Current Market Price (CMP) / NAV (₹) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              step="0.05"
              value={price}
              onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-zinc-900 font-mono font-medium focus:outline-none focus:ring-1 focus:ring-zinc-800"
              required
            />
            <span className="text-[10px] text-zinc-400 mt-1 block">
              This price will be used as the initial baseline across valuations and quotes.
            </span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-100">
            <button
              type="button"
              onClick={() => setIsAddStockModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-zinc-600 hover:bg-zinc-100 font-medium text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Save to Database</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
