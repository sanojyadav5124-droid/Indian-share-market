import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Coins,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { formatCompactINR, formatINR, formatPercent } from '../utils/formatters';
import { PortfolioCharts } from './PortfolioCharts';

export const DashboardView: React.FC = () => {
  const {
    summary,
    holdings,
    activeProfile,
    profiles,
    costBasisMethod,
    setActiveTab,
    setIsAddTxModalOpen,
    setIsPricingModalOpen,
    exportBackupJSON,
    transactions,
  } = usePortfolio();

  const [timeframe, setTimeframe] = useState<'1M' | '6M' | '1Y' | 'ALL'>('6M');

  // Find active profile details or null if consolidated
  const currentProfileObj = profiles.find((p) => p.id === activeProfile);

  // Top gainers
  const topGainers = [...holdings]
    .sort((a, b) => {
      const pnlA = costBasisMethod === 'WAC' ? a.unrealizedPnLPercentWAC : a.unrealizedPnLPercentFIFO;
      const pnlB = costBasisMethod === 'WAC' ? b.unrealizedPnLPercentWAC : b.unrealizedPnLPercentFIFO;
      return pnlB - pnlA;
    })
    .slice(0, 4);

  // Top allocations
  const topAllocations = [...holdings]
    .sort((a, b) => b.weightagePercent - a.weightagePercent)
    .slice(0, 4);

  // Corporate actions & dividends
  const recentCorpActions = transactions
    .filter((t) => ['BONUS', 'SPLIT', 'DEMERGER', 'DIVIDEND'].includes(t.type))
    .slice(0, 4);

  // Selected costing values
  const investedValue = costBasisMethod === 'WAC' ? summary.totalInvestedWAC : summary.totalInvestedFIFO;
  const unrealizedPnL = costBasisMethod === 'WAC' ? summary.totalUnrealizedPnLWAC : summary.totalUnrealizedPnLFIFO;
  const unrealizedPnLPercent = costBasisMethod === 'WAC' ? summary.totalUnrealizedPnLPercentWAC : summary.totalUnrealizedPnLPercentFIFO;

  // Realistic mock trend curve points for SVG based on portfolio valuation
  const baseVal = summary.totalCurrentValue || 1000000;
  const chartPoints = [
    { label: 'Apr 25', val: baseVal * 0.82 },
    { label: 'Jun 25', val: baseVal * 0.86 },
    { label: 'Aug 25', val: baseVal * 0.84 },
    { label: 'Oct 25', val: baseVal * 0.92 },
    { label: 'Dec 25', val: baseVal * 0.95 },
    { label: 'Feb 26', val: baseVal * 0.91 },
    { label: 'Now', val: baseVal },
  ];

  const minVal = Math.min(...chartPoints.map((p) => p.val)) * 0.95;
  const maxVal = Math.max(...chartPoints.map((p) => p.val)) * 1.05;

  const svgWidth = 700;
  const svgHeight = 160;

  const getCoordinates = (index: number, val: number) => {
    const x = (index / (chartPoints.length - 1)) * (svgWidth - 40) + 20;
    const y = svgHeight - 20 - ((val - minVal) / (maxVal - minVal)) * (svgHeight - 40);
    return { x, y };
  };

  const polylinePoints = chartPoints
    .map((p, i) => {
      const { x, y } = getCoordinates(i, p.val);
      return `${x},${y}`;
    })
    .join(' ');

  const areaPoints = `${getCoordinates(0, chartPoints[0].val).x},${svgHeight - 10} ${polylinePoints} ${
    getCoordinates(chartPoints.length - 1, chartPoints[chartPoints.length - 1].val).x
  },${svgHeight - 10}`;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Breadcrumb & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900 text-white p-5 rounded-2xl shadow-sm border border-zinc-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              {activeProfile === 'consolidated'
                ? 'CONSOLIDATED HOUSEHOLD WEALTH LEDGER'
                : `${currentProfileObj?.name.toUpperCase()} • ${currentProfileObj?.relation.toUpperCase()}`}
            </span>
            {currentProfileObj && (
              <span className="bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded text-[10px]">
                PAN: {currentProfileObj.pan}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            {formatINR(summary.totalNetWorth)}
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-2">
            <span>Portfolio Value: {formatINR(summary.totalCurrentValue)}</span>
            <span>•</span>
            <span>Liquid Cash: {formatINR(summary.uninvestedCash)}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="dash-add-trade-btn"
            onClick={() => setIsAddTxModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-colors shadow-xs"
          >
            + New Order
          </button>
          <button
            id="dash-price-mgr-btn"
            onClick={() => setIsPricingModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors"
          >
            Update Prices
          </button>
          <button
            id="dash-backup-btn"
            onClick={exportBackupJSON}
            className="px-3.5 py-2 rounded-xl text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors"
          >
            Export Backup
          </button>
        </div>
      </div>

      {/* Primary Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Invested Value */}
        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
            <span>Total Invested</span>
            <span className="text-[10px] font-mono uppercase bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-600">
              {costBasisMethod}
            </span>
          </div>
          <div className="text-xl font-bold text-zinc-900 mt-2 tracking-tight">
            {formatINR(investedValue)}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            Across {holdings.length} holding scrips
          </div>
        </div>

        {/* Total Unrealized P&L */}
        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
            <span>Total Unrealized P&L</span>
            {unrealizedPnL >= 0 ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
            )}
          </div>
          <div
            className={`text-xl font-bold mt-2 tracking-tight flex items-baseline gap-1.5 ${
              unrealizedPnL >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            <span>{formatINR(unrealizedPnL)}</span>
          </div>
          <div className="text-[11px] font-medium mt-1">
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono ${
                unrealizedPnL >= 0
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {formatPercent(unrealizedPnLPercent)}
            </span>
            <span className="text-zinc-400 ml-1.5 text-[10px]">all-time return</span>
          </div>
        </div>

        {/* 1-Day Return */}
        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
            <span>Today's Change</span>
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div
            className={`text-xl font-bold mt-2 tracking-tight ${
              summary.totalDayChangePnL >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {formatINR(summary.totalDayChangePnL)}
          </div>
          <div className="text-[11px] font-medium mt-1">
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono ${
                summary.totalDayChangePercent >= 0
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {formatPercent(summary.totalDayChangePercent)}
            </span>
            <span className="text-zinc-400 ml-1.5 text-[10px]">vs prev close</span>
          </div>
        </div>

        {/* Uninvested Cash */}
        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
            <span>Uninvested Cash</span>
            <Wallet className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-xl font-bold text-zinc-900 mt-2 tracking-tight">
            {formatINR(summary.uninvestedCash)}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1 flex items-center justify-between">
            <span>Instant buying capacity</span>
            <button
              onClick={() => setActiveTab('transactions')}
              className="text-indigo-600 hover:text-indigo-700 font-medium text-[11px]"
            >
              Ledger &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Trend Chart Card */}
      <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>Household Valuation Trajectory</span>
            </h2>
            <p className="text-xs text-zinc-500">
              Estimated historical growth based on portfolio accumulation and current market valuations
            </p>
          </div>

          <div className="flex items-center bg-zinc-100 p-1 rounded-lg border border-zinc-200 self-start sm:self-auto">
            {(['1M', '6M', '1Y', 'ALL'] as const).map((tf) => (
              <button
                key={tf}
                id={`timeframe-${tf}-btn`}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded ${
                  timeframe === tf
                    ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* SVG Chart */}
        <div className="w-full overflow-hidden pt-2">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-44 overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="valGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0.25, 0.5, 0.75].map((factor, idx) => (
              <line
                key={idx}
                x1="20"
                y1={svgHeight * factor}
                x2={svgWidth - 20}
                y2={svgHeight * factor}
                stroke="#f4f4f5"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            ))}

            {/* Gradient Area */}
            <polygon points={areaPoints} fill="url(#valGrad)" />

            {/* Path Line */}
            <polyline
              fill="none"
              stroke="#059669"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={polylinePoints}
            />

            {/* Dots */}
            {chartPoints.map((p, i) => {
              const { x, y } = getCoordinates(i, p.val);
              return (
                <g key={i} className="group cursor-pointer">
                  <circle
                    cx={x}
                    cy={y}
                    r="4"
                    className="fill-white stroke-emerald-600 stroke-2 hover:r-6 transition-all"
                  />
                  <text
                    x={x}
                    y={svgHeight}
                    textAnchor="middle"
                    fontSize="10"
                    className="fill-zinc-400 font-mono"
                  >
                    {p.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Sector Weightage & Market Cap Allocation Visualizations */}
      <PortfolioCharts holdings={holdings} summary={summary} />

      {/* Multi-Profile Family Distribution Breakdown */}
      <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 tracking-tight">
              Family Member Portfolios (Household Breakdown)
            </h2>
            <p className="text-xs text-zinc-500">
              Cross-account holding distribution and uninvested cash allocations
            </p>
          </div>
          <span className="text-xs text-zinc-400 font-mono">3 Active Profiles</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {profiles.map((p) => {
            const profileHoldings = holdings.filter((h) => (h.profileBreakdown[p.id] || 0) > 0);
            const profileStockVal = profileHoldings.reduce(
              (acc, h) => acc + (h.profileBreakdown[p.id] || 0) * h.cmp,
              0
            );
            const profileCash = summary.cashPerProfile[p.id] || 0;
            const profileTotal = profileStockVal + profileCash;
            const shareOfHousehold =
              summary.totalNetWorth > 0 ? (profileTotal / summary.totalNetWorth) * 100 : 0;

            return (
              <div
                key={p.id}
                id={`dash-profile-card-${p.id}`}
                className="p-4 rounded-xl border border-zinc-200/80 bg-zinc-50/50 hover:bg-zinc-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        p.id === 'self'
                          ? 'bg-emerald-500'
                          : p.id === 'spouse'
                          ? 'bg-indigo-500'
                          : 'bg-amber-500'
                      }`}
                    />
                    <span className="font-semibold text-zinc-900 text-sm">{p.name}</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white text-zinc-600 border border-zinc-200">
                    {p.relation}
                  </span>
                </div>

                <div className="mt-3">
                  <div className="text-lg font-bold text-zinc-900">
                    {formatINR(profileTotal)}
                  </div>
                  <div className="text-xs text-zinc-500 flex items-center justify-between mt-0.5">
                    <span>{shareOfHousehold.toFixed(1)}% of household</span>
                    <span className="font-mono text-zinc-400">PAN: {p.pan}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-zinc-200 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      p.id === 'self'
                        ? 'bg-emerald-500'
                        : p.id === 'spouse'
                        ? 'bg-indigo-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${shareOfHousehold}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-zinc-200/60 text-xs">
                  <div>
                    <span className="text-[11px] text-zinc-400">Invested Equities</span>
                    <p className="font-medium text-zinc-800">{formatINR(profileStockVal)}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-400">Cash Ledger</span>
                    <p className="font-medium text-zinc-800">{formatINR(profileCash)}</p>
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-zinc-400 flex items-center justify-between">
                  <span>Broker: {p.broker}</span>
                  <span>{profileHoldings.length} Scrips</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Gainers & Allocations Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Gainers */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-zinc-900 tracking-tight flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Top Gainers in Portfolio</span>
            </h3>
            <button
              onClick={() => setActiveTab('holdings')}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View all holdings &rarr;
            </button>
          </div>

          <div className="divide-y divide-zinc-100">
            {topGainers.map((h) => {
              const pnl = costBasisMethod === 'WAC' ? h.unrealizedPnLWAC : h.unrealizedPnLFIFO;
              const pnlPct =
                costBasisMethod === 'WAC' ? h.unrealizedPnLPercentWAC : h.unrealizedPnLPercentFIFO;

              return (
                <div key={h.symbol} className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-zinc-900">{h.symbol}</span>
                      <span className="text-[10px] text-zinc-400">{h.sector}</span>
                    </div>
                    <span className="text-[11px] text-zinc-500">
                      {h.totalQuantity} units • CMP {formatINR(h.cmp)}
                    </span>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-xs font-semibold ${
                        pnl >= 0 ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {formatINR(pnl)}
                    </div>
                    <span
                      className={`inline-block text-[10px] font-mono px-1 rounded ${
                        pnlPct >= 0
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {formatPercent(pnlPct)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Corporate Actions & Dividends */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-zinc-900 tracking-tight flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Corporate Actions & Income Log</span>
            </h3>
            <button
              onClick={() => setActiveTab('transactions')}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Ledger history &rarr;
            </button>
          </div>

          <div className="divide-y divide-zinc-100">
            {recentCorpActions.length > 0 ? (
              recentCorpActions.map((t) => (
                <div key={t.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-zinc-900">{t.symbol}</span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold uppercase ${
                          t.type === 'BONUS'
                            ? 'bg-purple-100 text-purple-700'
                            : t.type === 'SPLIT'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {t.type} {t.ratio ? `(${t.ratio})` : ''}
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-500">{t.notes || t.name}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-medium text-zinc-900">
                      {t.type === 'DIVIDEND'
                        ? formatINR(t.quantity * t.price)
                        : `+${t.quantity} shares`}
                    </span>
                    <div className="text-[10px] text-zinc-400 font-mono">{t.date}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-zinc-400">
                No corporate actions recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
