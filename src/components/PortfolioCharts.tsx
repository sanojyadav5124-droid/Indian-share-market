import React, { useState, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { PieChart as PieIcon, BarChart3, Layers, ShieldAlert, Sparkles, TrendingUp, Award, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { HoldingItem, MarketCap, PortfolioSummary, Sector, BenchmarkIndex } from '../types';
import { formatCompactINR, formatINR, formatPercent } from '../utils/formatters';
import { usePortfolio } from '../context/PortfolioContext';

interface PortfolioChartsProps {
  holdings: HoldingItem[];
  summary: PortfolioSummary;
}

// Sophisticated, accessible anti-slop color palettes
const SECTOR_COLORS: Record<string, string> = {
  'Financial Services': '#2563eb', // Blue
  IT: '#059669', // Emerald
  Auto: '#d97706', // Amber
  'Oil & Gas': '#dc2626', // Red
  'Capital Goods': '#7c3aed', // Violet
  'Pharma & Healthcare': '#0891b2', // Cyan
  FMCG: '#16a34a', // Green
  'Consumer Durables': '#ea580c', // Orange
  Chemicals: '#4f46e5', // Indigo
  Metals: '#475569', // Slate
  Power: '#ca8a04', // Yellow/Gold
  Telecommunication: '#9333ea', // Purple
  'Cash & Liquid': '#64748b', // Slate Gray
};

const MARKET_CAP_COLORS: Record<MarketCap, string> = {
  'Large Cap': '#059669', // Emerald - Established Bluechip
  'Mid Cap': '#2563eb', // Blue - Growth Engines
  'Small Cap': '#d97706', // Amber - High Alpha
  Cash: '#64748b', // Slate - Liquid Reserve
};

const FALLBACK_COLORS = [
  '#2563eb',
  '#059669',
  '#d97706',
  '#7c3aed',
  '#0891b2',
  '#ea580c',
  '#dc2626',
  '#16a34a',
  '#475569',
  '#ca8a04',
];

export const PortfolioCharts: React.FC<PortfolioChartsProps> = ({ holdings, summary }) => {
  const { selectedBenchmark, setSelectedBenchmark, selectedFY, setSelectedFY, costBasisMethod } = usePortfolio();
  const [activeChartTab, setActiveChartTab] = useState<'both' | 'sector' | 'marketcap'>('both');
  const [chartType, setChartType] = useState<'donut' | 'bar'>('donut');

  const BENCHMARKS: Record<BenchmarkIndex, { returnPct: number; desc: string }> = {
    'NIFTY 50': { returnPct: 14.8, desc: 'India Top 50 Large-Cap Scrips (AMFI Rank 1-50)' },
    'NIFTY NEXT 50': { returnPct: 19.4, desc: 'Next 50 Emerging Bluechips (AMFI Rank 51-100)' },
    'NIFTY SMALLCAP 250': { returnPct: 23.5, desc: 'High-Alpha Smallcaps (AMFI Rank 251-500)' },
  };

  const portfolioReturn = costBasisMethod === 'WAC' 
    ? summary.totalUnrealizedPnLPercentWAC 
    : summary.totalUnrealizedPnLPercentFIFO;
  const benchmarkReturn = BENCHMARKS[selectedBenchmark]?.returnPct ?? 14.8;
  const alpha = portfolioReturn - benchmarkReturn;

  // Total portfolio valuation including cash
  const totalNetWorth = summary.totalNetWorth || 1;

  // 1. Sector Weightage Calculation
  const sectorData = useMemo(() => {
    const map = new Map<string, { value: number; count: number; scrips: string[] }>();

    holdings.forEach((h) => {
      const sec = h.sector || 'Others';
      const existing = map.get(sec) || { value: 0, count: 0, scrips: [] };
      existing.value += h.currentValue;
      existing.count += 1;
      existing.scrips.push(h.symbol);
      map.set(sec, existing);
    });

    // Add uninvested liquid cash if > 0
    if (summary.uninvestedCash > 0) {
      map.set('Cash & Liquid', {
        value: summary.uninvestedCash,
        count: 1,
        scrips: ['INR_CASH'],
      });
    }

    const result = Array.from(map.entries()).map(([name, data]) => ({
      name,
      value: Math.round(data.value),
      percentage: (data.value / totalNetWorth) * 100,
      count: data.count,
      scrips: data.scrips,
      color: SECTOR_COLORS[name] || FALLBACK_COLORS[Math.abs(name.length) % FALLBACK_COLORS.length],
    }));

    // Sort descending by value
    return result.sort((a, b) => b.value - a.value);
  }, [holdings, summary.uninvestedCash, totalNetWorth]);

  // 2. Market Cap Allocation Calculation
  const marketCapData = useMemo(() => {
    const map: Record<MarketCap, { value: number; count: number; scrips: string[] }> = {
      'Large Cap': { value: 0, count: 0, scrips: [] },
      'Mid Cap': { value: 0, count: 0, scrips: [] },
      'Small Cap': { value: 0, count: 0, scrips: [] },
      Cash: { value: 0, count: 0, scrips: [] },
    };

    holdings.forEach((h) => {
      const mc = (h.marketCap as MarketCap) || 'Large Cap';
      if (!map[mc]) {
        map[mc] = { value: 0, count: 0, scrips: [] };
      }
      map[mc].value += h.currentValue;
      map[mc].count += 1;
      map[mc].scrips.push(h.symbol);
    });

    if (summary.uninvestedCash > 0) {
      map.Cash.value += summary.uninvestedCash;
      map.Cash.count += 1;
      map.Cash.scrips.push('Cash Reserve');
    }

    return (['Large Cap', 'Mid Cap', 'Small Cap', 'Cash'] as MarketCap[])
      .map((cap) => ({
        name: cap,
        value: Math.round(map[cap].value),
        percentage: (map[cap].value / totalNetWorth) * 100,
        count: map[cap].count,
        scrips: map[cap].scrips,
        color: MARKET_CAP_COLORS[cap],
        description:
          cap === 'Large Cap'
            ? 'Nifty 100 bluechips with low volatility'
            : cap === 'Mid Cap'
            ? 'Nifty Midcap 150 high compounders'
            : cap === 'Small Cap'
            ? 'Nifty Smallcap 250 high alpha potential'
            : 'Unallocated liquid dry powder',
      }))
      .filter((item) => item.value > 0);
  }, [holdings, summary.uninvestedCash, totalNetWorth]);

  // Custom Tooltip for Charts
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-zinc-900 text-white p-3 rounded-xl shadow-xl border border-zinc-800 text-xs">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: data.color }}
            />
            <span className="font-bold">{data.name}</span>
          </div>
          <div className="font-mono text-emerald-400 font-semibold text-sm">
            {formatINR(data.value)}
          </div>
          <div className="text-zinc-400 text-[11px] mt-0.5 flex items-center justify-between gap-3">
            <span>Portfolio Share:</span>
            <strong className="text-white">{data.percentage.toFixed(1)}%</strong>
          </div>
          {data.count && (
            <div className="text-zinc-400 text-[11px] flex items-center justify-between gap-3">
              <span>Scrips:</span>
              <span className="text-zinc-300 font-mono">{data.count} items</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-6">
      {/* Top Header & View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
        <div>
          <h2 className="text-sm font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>Portfolio Allocation & Structural Weightage</span>
          </h2>
          <p className="text-xs text-zinc-500">
            Nifty sector concentration risk and market capitalization exposure analytics
          </p>
        </div>

        {/* View Switchers */}
        <div className="flex items-center gap-2">
          {/* Tab buttons */}
          <div className="flex items-center bg-zinc-100 p-1 rounded-lg border border-zinc-200">
            <button
              id="chart-tab-both"
              onClick={() => setActiveChartTab('both')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
                activeChartTab === 'both'
                  ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Side-by-Side
            </button>
            <button
              id="chart-tab-sector"
              onClick={() => setActiveChartTab('sector')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
                activeChartTab === 'sector'
                  ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Sector Weightage
            </button>
            <button
              id="chart-tab-marketcap"
              onClick={() => setActiveChartTab('marketcap')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
                activeChartTab === 'marketcap'
                  ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Market Cap Tier
            </button>
          </div>

          {/* Chart format toggle */}
          <div className="hidden sm:flex items-center bg-zinc-100 p-1 rounded-lg border border-zinc-200">
            <button
              onClick={() => setChartType('donut')}
              title="Donut Chart View"
              className={`p-1 rounded ${
                chartType === 'donut' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <PieIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChartType('bar')}
              title="Bar Chart View"
              className={`p-1 rounded ${
                chartType === 'bar' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div
        className={`grid gap-6 ${
          activeChartTab === 'both' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
        }`}
      >
        {/* 1. SECTOR WEIGHTAGE SECTION */}
        {(activeChartTab === 'both' || activeChartTab === 'sector') && (
          <div className="p-4 rounded-xl border border-zinc-200/80 bg-zinc-50/40 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <h3 className="font-bold text-zinc-900 text-xs tracking-tight">
                    Sector Diversification Breakdown
                  </h3>
                </div>
                <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-zinc-200 text-zinc-600">
                  {sectorData.length} Sectors
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 mb-4">
                Allocation across industrial and services verticals in the portfolio
              </p>

              {/* Chart Visual */}
              <div className="h-56 w-full flex items-center justify-center">
                {chartType === 'donut' ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip content={<CustomPieTooltip />} />
                      <Pie
                        data={sectorData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {sectorData.map((entry, index) => (
                          <Cell key={`sector-cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={1.5} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={sectorData.slice(0, 7)}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e4e4e7" />
                      <XAxis type="number" tickFormatter={(v) => formatCompactINR(v)} tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={75} />
                      <Tooltip content={<CustomPieTooltip />} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {sectorData.slice(0, 7).map((entry, index) => (
                          <Cell key={`bar-cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Ranked Sector List Breakdown */}
            <div className="mt-4 pt-3 border-t border-zinc-200/80 space-y-2 max-h-48 overflow-y-auto pr-1">
              {sectorData.map((sec) => (
                <div key={sec.name} className="flex items-center justify-between text-xs py-1 hover:bg-zinc-100/50 rounded px-1.5 transition-colors">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: sec.color }}
                    />
                    <span className="font-semibold text-zinc-900 truncate max-w-[130px]">
                      {sec.name}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      ({sec.count} {sec.count === 1 ? 'scrip' : 'scrips'})
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-zinc-800 font-medium">
                      {formatINR(sec.value)}
                    </span>
                    <span className="font-mono text-[11px] font-semibold text-zinc-900 bg-white border border-zinc-200 px-1.5 py-0.2 rounded w-14 text-right">
                      {sec.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. MARKET CAP TIER SECTION */}
        {(activeChartTab === 'both' || activeChartTab === 'marketcap') && (
          <div className="p-4 rounded-xl border border-zinc-200/80 bg-zinc-50/40 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  <h3 className="font-bold text-zinc-900 text-xs tracking-tight">
                    Market Capitalization Weightage
                  </h3>
                </div>
                <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-zinc-200 text-zinc-600">
                  Large vs Mid vs Small vs Cash
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 mb-4">
                Risk and volatility exposure profile based on market cap tiers
              </p>

              {/* Chart Visual */}
              <div className="h-56 w-full flex items-center justify-center">
                {chartType === 'donut' ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip content={<CustomPieTooltip />} />
                      <Pie
                        data={marketCapData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {marketCapData.map((entry, index) => (
                          <Cell key={`cap-cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={1.5} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={marketCapData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e4e4e7" />
                      <XAxis type="number" tickFormatter={(v) => formatCompactINR(v)} tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={75} />
                      <Tooltip content={<CustomPieTooltip />} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {marketCapData.map((entry, index) => (
                          <Cell key={`bar-cap-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Market Cap Detail Cards */}
            <div className="mt-4 pt-3 border-t border-zinc-200/80 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {marketCapData.map((cap) => (
                <div
                  key={cap.name}
                  className="p-2.5 rounded-lg bg-white border border-zinc-200 shadow-2xs flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: cap.color }}
                      />
                      <span className="font-bold text-zinc-900 text-xs">{cap.name}</span>
                    </div>
                    <span className="font-mono font-bold text-xs text-zinc-900">
                      {cap.percentage.toFixed(1)}%
                    </span>
                  </div>

                  <div className="mt-2">
                    <div className="text-xs font-mono font-semibold text-zinc-800">
                      {formatINR(cap.value)}
                    </div>
                    <div className="w-full bg-zinc-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${cap.percentage}%`,
                          backgroundColor: cap.color,
                        }}
                      />
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-1 truncate">
                      {cap.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SEBI Market-Cap Framework & AMFI Index Alpha Benchmarking */}
      <div className="mt-4 pt-4 border-t border-zinc-200 bg-zinc-50/80 -mx-5 -mb-5 p-5 rounded-b-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-900">
                  SEBI Market-Cap & AMFI Index Benchmarking
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono font-medium">
                  {selectedFY}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500">
                Official semi-annual categorization (Large: 1-100, Mid: 101-250, Small: 251+) vs Market Beta
              </p>
            </div>
          </div>

          {/* Benchmark Selector Buttons */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-zinc-200 self-start sm:self-auto shadow-2xs">
            {(['NIFTY 50', 'NIFTY NEXT 50', 'NIFTY SMALLCAP 250'] as BenchmarkIndex[]).map((bm) => (
              <button
                key={bm}
                id={`benchmark-pill-${bm.replace(/\s+/g, '-').toLowerCase()}`}
                onClick={() => setSelectedBenchmark(bm)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                  selectedBenchmark === bm
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                {bm}
              </button>
            ))}
          </div>
        </div>

        {/* Alpha Comparison Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Portfolio Return */}
          <div className="bg-white p-3 rounded-xl border border-zinc-200">
            <span className="text-[11px] text-zinc-500 font-medium block">
              Portfolio Return ({costBasisMethod})
            </span>
            <div className={`text-lg font-bold font-mono mt-1 ${portfolioReturn >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {formatPercent(portfolioReturn)}
            </div>
            <span className="text-[10px] text-zinc-400">All-time unrealized gains</span>
          </div>

          {/* Benchmark Return */}
          <div className="bg-white p-3 rounded-xl border border-zinc-200">
            <span className="text-[11px] text-zinc-500 font-medium block">
              {selectedBenchmark} Reference
            </span>
            <div className="text-lg font-bold font-mono mt-1 text-zinc-800">
              {formatPercent(benchmarkReturn)}
            </div>
            <span className="text-[10px] text-zinc-400 truncate block">
              {BENCHMARKS[selectedBenchmark].desc}
            </span>
          </div>

          {/* Alpha Metric */}
          <div className={`p-3 rounded-xl border ${alpha >= 0 ? 'bg-emerald-50/70 border-emerald-200' : 'bg-rose-50/70 border-rose-200'}`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-700">Excess Alpha vs Index</span>
              {alpha >= 0 ? (
                <ArrowUpRight className="w-4 h-4 text-emerald-600" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-rose-600" />
              )}
            </div>
            <div className={`text-lg font-bold font-mono mt-1 ${alpha >= 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
              {alpha >= 0 ? `+${alpha.toFixed(2)}%` : `${alpha.toFixed(2)}%`}
            </div>
            <span className="text-[10px] text-zinc-600">
              {alpha >= 0 ? 'Alpha Generation Achieved' : 'Trailing Benchmark'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
