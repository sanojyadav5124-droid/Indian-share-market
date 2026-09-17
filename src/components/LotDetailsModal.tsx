import React from 'react';
import { X, Layers, Calendar, ShieldCheck, TrendingUp, TrendingDown } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { formatINR, formatPercent } from '../utils/formatters';
import { getDaysBetween } from '../utils/taxAndFifoEngine';

export const LotDetailsModal: React.FC = () => {
  const { selectedHoldingForLots, setSelectedHoldingForLots } = usePortfolio();

  if (!selectedHoldingForLots) return null;

  const h = selectedHoldingForLots;
  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-zinc-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-900 text-base">{h.symbol}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                {h.sector} • {h.marketCap}
              </span>
            </div>
            <p className="text-xs text-zinc-500">{h.name}</p>
          </div>

          <button
            onClick={() => setSelectedHoldingForLots(null)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overview Stats */}
        <div className="p-4 bg-zinc-50 border-b border-zinc-200 grid grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-[10px] text-zinc-400 uppercase font-mono">Current Quantity</span>
            <div className="font-bold text-zinc-900 font-mono text-sm mt-0.5">
              {h.totalQuantity} units
            </div>
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 uppercase font-mono">Current Market Price</span>
            <div className="font-bold text-zinc-900 font-mono text-sm mt-0.5">
              {formatINR(h.cmp)}
            </div>
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 uppercase font-mono">WAC vs FIFO Avg</span>
            <div className="font-medium text-zinc-800 font-mono text-xs mt-0.5">
              WAC: {formatINR(h.wacPrice)}
              <br />
              FIFO: {formatINR(h.fifoPrice)}
            </div>
          </div>
        </div>

        {/* FIFO Open Lots List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div>
            <h3 className="text-xs font-semibold text-zinc-900 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Active FIFO Buy Tranches ({h.openLots.length} Lots)</span>
            </h3>
            <p className="text-[11px] text-zinc-500">
              Future sell orders will peel off the oldest lots first in chronological order.
            </p>
          </div>

          <div className="space-y-2.5">
            {h.openLots.map((lot, idx) => {
              const holdingDays = getDaysBetween(lot.date, todayStr);
              const isLTCG = holdingDays >= 365;
              const lotInvested = lot.remainingQuantity * lot.netCostPerUnit;
              const lotCurrent = lot.remainingQuantity * h.cmp;
              const lotPnL = lotCurrent - lotInvested;

              return (
                <div
                  key={lot.lotId || idx}
                  className="p-3.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50/50 transition-colors text-xs font-mono"
                >
                  <div className="flex items-center justify-between font-sans">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-zinc-900">Lot #{idx + 1}</span>
                      <span className="text-[10px] text-zinc-400 flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3" /> Acquired {lot.date}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                        isLTCG
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {isLTCG ? `LTCG (${holdingDays}d &ge; 365d)` : `STCG (${holdingDays}d < 365d)`}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2.5 pt-2 border-t border-zinc-100 text-[11px]">
                    <div>
                      <span className="text-[10px] text-zinc-400 font-sans block">Remaining Qty</span>
                      <span className="font-semibold text-zinc-800">
                        {lot.remainingQuantity} / {lot.originalQuantity}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-zinc-400 font-sans block">Buy Price / Unit</span>
                      <span className="text-zinc-800">{formatINR(lot.buyPrice)}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-zinc-400 font-sans block">Net Cost Basis</span>
                      <span className="font-medium text-zinc-800">{formatINR(lot.netCostPerUnit)}</span>
                    </div>

                    <div className="text-right sm:text-left">
                      <span className="text-[10px] text-zinc-400 font-sans block">Lot Unrealized</span>
                      <span className={lotPnL >= 0 ? 'text-emerald-700 font-semibold' : 'text-rose-700 font-semibold'}>
                        {formatINR(lotPnL)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-200 bg-zinc-50 flex items-center justify-end">
          <button
            onClick={() => setSelectedHoldingForLots(null)}
            className="px-4 py-1.5 bg-white border border-zinc-200 hover:bg-zinc-100 rounded-lg text-xs font-medium text-zinc-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
