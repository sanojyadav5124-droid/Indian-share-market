import React, { useState } from 'react';
import {
  X,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Search,
  Plus,
  Database,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { formatINR, formatPercent } from '../utils/formatters';

export const PricingManagerModal: React.FC = () => {
  const {
    isPricingModalOpen,
    setIsPricingModalOpen,
    setIsAddStockModalOpen,
    marketPrices,
    updateMarketPrice,
    bulkUpdatePrices,
    simulateMarketShift,
    fetchLiveMarketPrices,
    isFetchingLivePrices,
    lastLiveSyncTime,
    livePriceError,
  } = usePortfolio();

  const [bulkText, setBulkText] = useState('');
  const [bulkResult, setBulkResult] = useState<{ successCount: number; errors: string[] } | null>(
    null
  );
  const [liveSyncResult, setLiveSyncResult] = useState<{ updatedCount: number; errors: string[] } | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<'individual' | 'live' | 'bulk' | 'simulate'>('individual');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPrices, setEditingPrices] = useState<Record<string, string>>({});

  if (!isPricingModalOpen) return null;

  const handleLiveFetchAll = async () => {
    const res = await fetchLiveMarketPrices();
    setLiveSyncResult(res);
  };

  const handleLiveFetchSingle = async (symbol: string) => {
    const res = await fetchLiveMarketPrices([symbol]);
    if (res.updatedCount > 0) {
      setLiveSyncResult(res);
    }
  };

  const filteredPrices = marketPrices.filter(
    (p) =>
      p.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePriceChange = (symbol: string, val: string) => {
    setEditingPrices((prev) => ({ ...prev, [symbol]: val }));
  };

  const handleSavePrice = (symbol: string) => {
    const val = parseFloat(editingPrices[symbol]);
    if (!isNaN(val) && val > 0) {
      updateMarketPrice(symbol, val);
      setEditingPrices((prev) => {
        const next = { ...prev };
        delete next[symbol];
        return next;
      });
    }
  };

  const handleBulkSubmit = () => {
    if (!bulkText.trim()) return;
    const res = bulkUpdatePrices(bulkText);
    setBulkResult(res);
    if (res.successCount > 0) {
      setBulkText('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl border border-zinc-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
              <RefreshCw className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 tracking-tight">
                Offline Market Pricing Engine
              </h2>
              <p className="text-xs text-zinc-500">
                Update valuations manually or paste bulk CSV text (zero live internet dependency)
              </p>
            </div>
          </div>

          <button
            id="close-pricing-modal-btn"
            onClick={() => setIsPricingModalOpen(false)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-zinc-200 flex space-x-4 bg-white text-xs font-medium">
          <button
            onClick={() => setActiveTab('individual')}
            className={`py-3 border-b-2 transition-all ${
              activeTab === 'individual'
                ? 'border-zinc-900 text-zinc-900 font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Manual Price Overrides ({marketPrices.length})
          </button>
          <button
            onClick={() => setActiveTab('live')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'live'
                ? 'border-emerald-600 text-emerald-700 font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Yahoo Finance Sync</span>
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`py-3 border-b-2 transition-all ${
              activeTab === 'bulk'
                ? 'border-zinc-900 text-zinc-900 font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Bulk Paste (CSV / Text)
          </button>
          <button
            onClick={() => setActiveTab('simulate')}
            className={`py-3 border-b-2 transition-all ${
              activeTab === 'simulate'
                ? 'border-zinc-900 text-zinc-900 font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Market Simulation Presets
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'live' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-emerald-900 uppercase tracking-wide flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    <span>Yahoo Finance Free Market API</span>
                  </div>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Fetches real-time / delayed NSE & BSE stock quotes and mutual fund NAVs automatically.
                  </p>
                  {lastLiveSyncTime && (
                    <div className="text-[11px] text-emerald-700 font-mono mt-1">
                      Last synchronized at: {lastLiveSyncTime}
                    </div>
                  )}
                </div>

                <button
                  id="pricing-fetch-all-live-btn"
                  onClick={handleLiveFetchAll}
                  disabled={isFetchingLivePrices}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors shrink-0 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isFetchingLivePrices ? 'animate-spin' : ''}`} />
                  <span>{isFetchingLivePrices ? 'Fetching Live Quotes...' : 'Sync All Tracked Scrips'}</span>
                </button>
              </div>

              {liveSyncResult && (
                <div
                  className={`p-3 rounded-xl border text-xs ${
                    liveSyncResult.updatedCount > 0
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  <div className="flex items-center gap-2 font-medium">
                    {liveSyncResult.updatedCount > 0 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                    )}
                    <span>
                      {liveSyncResult.updatedCount > 0
                        ? `Successfully updated ${liveSyncResult.updatedCount} scrip prices from Yahoo Finance.`
                        : 'No quotes were updated.'}
                    </span>
                  </div>
                  {liveSyncResult.errors.length > 0 && (
                    <ul className="list-disc pl-5 mt-1 text-[11px] text-rose-700">
                      {liveSyncResult.errors.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {livePriceError && !liveSyncResult && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{livePriceError}</span>
                </div>
              )}

              <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-xl overflow-hidden">
                {marketPrices.map((p) => (
                  <div
                    key={p.symbol}
                    className="p-3 flex items-center justify-between hover:bg-zinc-50/80 transition-colors text-xs"
                  >
                    <div>
                      <div className="font-semibold text-zinc-900 flex items-center gap-1.5">
                        <span>{p.symbol}</span>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {p.instrumentType === 'MUTUAL_FUND' ? 'NAV' : 'NSE/BSE'}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-500 truncate max-w-[240px]">{p.name}</div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="font-mono font-semibold text-zinc-900 block">{formatINR(p.cmp)}</span>
                        <span className="text-[10px] text-zinc-400">Updated: {p.lastUpdated}</span>
                      </div>
                      <button
                        onClick={() => handleLiveFetchSingle(p.symbol)}
                        disabled={isFetchingLivePrices}
                        className="px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-medium rounded-lg text-[11px] flex items-center gap-1 transition-colors"
                        title="Fetch live price for this scrip only"
                      >
                        <RefreshCw className="w-3 h-3 text-zinc-500" />
                        <span>Fetch</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'individual' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter scrip to update..."
                    className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddStockModalOpen(true)}
                  className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Add Security</span>
                </button>
              </div>

              <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-xl overflow-hidden">
                {filteredPrices.map((p) => {
                  const isEditing = editingPrices[p.symbol] !== undefined;
                  const dayChangePct =
                    p.previousClose > 0 ? ((p.cmp - p.previousClose) / p.previousClose) * 100 : 0;

                  return (
                    <div
                      key={p.symbol}
                      className="p-3 flex items-center justify-between hover:bg-zinc-50/80 transition-colors text-xs"
                    >
                      <div>
                        <div className="font-semibold text-zinc-900 flex items-center gap-1.5">
                          <span>{p.symbol}</span>
                          <span className="text-[10px] text-zinc-400 font-normal">
                            ({p.instrumentType === 'MUTUAL_FUND' ? 'NAV' : 'EQ'})
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-500 truncate max-w-[220px]">
                          {p.name}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="font-mono font-medium text-zinc-900 block">
                            {formatINR(p.cmp)}
                          </span>
                          <span
                            className={`text-[10px] font-mono ${
                              dayChangePct >= 0 ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {formatPercent(dayChangePct)}
                          </span>
                        </div>

                        {/* Price Input */}
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            step="0.05"
                            placeholder={p.cmp.toString()}
                            value={editingPrices[p.symbol] ?? ''}
                            onChange={(e) => handlePriceChange(p.symbol, e.target.value)}
                            className="w-24 px-2 py-1 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-mono text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                          />
                          {isEditing && (
                            <button
                              onClick={() => handleSavePrice(p.symbol)}
                              className="px-2.5 py-1 bg-zinc-900 text-white text-[11px] font-semibold rounded-lg hover:bg-zinc-800"
                            >
                              Save
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'bulk' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">
                  Paste Bulk Quotes (Format: TICKER,PRICE)
                </label>
                <p className="text-[11px] text-zinc-500 mb-2">
                  Paste one scrip per line. Example: <code className="font-mono bg-zinc-100 px-1 py-0.5 rounded">RELIANCE,3025.00</code>
                </p>
                <textarea
                  rows={8}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder={`RELIANCE,2995.00\nTCS,4250.00\nHDFCBANK,1695.50\nCDSL,1580.00\nPPFAS_FLEXI,79.20`}
                  className="w-full p-3 font-mono text-xs bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                />
              </div>

              {bulkResult && (
                <div
                  className={`p-3 rounded-xl border text-xs ${
                    bulkResult.successCount > 0
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  <div className="font-semibold flex items-center gap-1.5">
                    {bulkResult.successCount > 0 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                    )}
                    <span>
                      Successfully updated {bulkResult.successCount} scrips in portfolio.
                    </span>
                  </div>
                  {bulkResult.errors.length > 0 && (
                    <ul className="list-disc pl-5 mt-1 text-[11px] text-rose-700">
                      {bulkResult.errors.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <button
                id="apply-bulk-prices-btn"
                onClick={handleBulkSubmit}
                className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-all"
              >
                Apply Bulk Price Updates
              </button>
            </div>
          )}

          {activeTab === 'simulate' && (
            <div className="space-y-4">
              <p className="text-xs text-zinc-600">
                Quickly test portfolio valuation responsiveness by simulating broad market movements across all tracked Indian securities:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => simulateMarketShift(2.5)}
                  className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 transition-all text-left"
                >
                  <div className="flex items-center justify-between text-emerald-800 font-bold text-xs">
                    <span>Bullish Rally</span>
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div className="text-lg font-bold text-emerald-700 mt-1">+2.5%</div>
                  <p className="text-[10px] text-emerald-600/80 mt-1">
                    Simulates market-wide gap-up surge
                  </p>
                </button>

                <button
                  onClick={() => simulateMarketShift(-1.8)}
                  className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-50 transition-all text-left"
                >
                  <div className="flex items-center justify-between text-rose-800 font-bold text-xs">
                    <span>Market Correction</span>
                    <TrendingDown className="w-4 h-4" />
                  </div>
                  <div className="text-lg font-bold text-rose-700 mt-1">-1.8%</div>
                  <p className="text-[10px] text-rose-600/80 mt-1">
                    Simulates tactical market pullback
                  </p>
                </button>

                <button
                  onClick={() => simulateMarketShift(0.5)}
                  className="p-4 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 transition-all text-left"
                >
                  <div className="flex items-center justify-between text-zinc-800 font-bold text-xs">
                    <span>Mild Positive</span>
                    <Sparkles className="w-4 h-4 text-zinc-600" />
                  </div>
                  <div className="text-lg font-bold text-zinc-800 mt-1">+0.5%</div>
                  <p className="text-[10px] text-zinc-500 mt-1">
                    Simulates modest sideways uptick
                  </p>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between text-xs text-zinc-500">
          <span>All changes reflect immediately in holdings & tax statements</span>
          <button
            onClick={() => setIsPricingModalOpen(false)}
            className="px-4 py-1.5 bg-white border border-zinc-200 hover:bg-zinc-100 rounded-lg font-medium text-zinc-800"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
