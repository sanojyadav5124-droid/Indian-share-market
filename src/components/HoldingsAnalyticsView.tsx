import React, { useMemo, useState } from 'react';
import {
  PieChart as PieIcon,
  Layers,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Download,
  ListFilter,
  Eye,
  TrendingUp,
  TrendingDown,
  Info,
  LayoutGrid,
  Table as TableIcon,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { HoldingItem, InstrumentType, MarketCap, Sector } from '../types';
import { formatCompactINR, formatINR, formatPercent } from '../utils/formatters';

const SECTOR_COLORS: Record<string, string> = {
  'IT': '#3b82f6',
  'Financial Services': '#10b981',
  'Oil & Gas': '#f59e0b',
  'Auto': '#8b5cf6',
  'Pharma & Healthcare': '#ec4899',
  'FMCG': '#06b6d4',
  'Capital Goods': '#14b8a6',
  'Chemicals': '#f97316',
  'Consumer Durables': '#6366f1',
  'Metals': '#64748b',
  'Power': '#eab308',
  'Cash & Liquid': '#94a3b8',
};

export const HoldingsAnalyticsView: React.FC = () => {
  const {
    holdings,
    costBasisMethod,
    setCostBasisMethod,
    setSelectedHoldingForLots,
    exportHoldingsCSV,
    summary,
    activeProfile,
    profiles,
    isMobileView,
  } = usePortfolio();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedCap, setSelectedCap] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'value' | 'pnl' | 'weight' | 'name'>('value');
  const [sortAsc, setSortAsc] = useState(false);
  const [hoveredSector, setHoveredSector] = useState<string | null>(null);
  const [customViewMode, setCustomViewMode] = useState<'auto' | 'cards' | 'table'>('auto');

  const showCards = customViewMode === 'cards' || (customViewMode === 'auto' && isMobileView);

  // Filtered and sorted holdings
  const filteredHoldings = useMemo(() => {
    return holdings
      .filter((h) => {
        const matchesSearch =
          h.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          h.sector.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesType = selectedType === 'ALL' || h.instrumentType === selectedType;
        const matchesCap = selectedCap === 'ALL' || h.marketCap === selectedCap;

        return matchesSearch && matchesType && matchesCap;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortField === 'value') comp = b.currentValue - a.currentValue;
        else if (sortField === 'weight') comp = b.weightagePercent - a.weightagePercent;
        else if (sortField === 'name') comp = a.symbol.localeCompare(b.symbol);
        else if (sortField === 'pnl') {
          const pnlA = costBasisMethod === 'WAC' ? a.unrealizedPnLWAC : a.unrealizedPnLFIFO;
          const pnlB = costBasisMethod === 'WAC' ? b.unrealizedPnLWAC : b.unrealizedPnLFIFO;
          comp = pnlB - pnlA;
        }
        return sortAsc ? -comp : comp;
      });
  }, [holdings, searchQuery, selectedType, selectedCap, sortField, sortAsc, costBasisMethod]);

  // Sector breakdown aggregation
  const sectorData = useMemo(() => {
    const map: Record<string, { value: number; count: number }> = {};
    let totalVal = 0;

    for (const h of holdings) {
      if (!map[h.sector]) map[h.sector] = { value: 0, count: 0 };
      map[h.sector].value += h.currentValue;
      map[h.sector].count += 1;
      totalVal += h.currentValue;
    }

    return Object.entries(map)
      .map(([sector, data]) => ({
        sector,
        value: data.value,
        count: data.count,
        percent: totalVal > 0 ? (data.value / totalVal) * 100 : 0,
        color: SECTOR_COLORS[sector] || '#94a3b8',
      }))
      .sort((a, b) => b.value - a.value);
  }, [holdings]);

  // Market cap aggregation
  const capData = useMemo(() => {
    const caps: Record<string, number> = {
      'Large Cap': 0,
      'Mid Cap': 0,
      'Small Cap': 0,
    };
    let totalVal = 0;

    for (const h of holdings) {
      if (caps[h.marketCap] !== undefined) {
        caps[h.marketCap] += h.currentValue;
      }
      totalVal += h.currentValue;
    }

    return {
      large: { val: caps['Large Cap'], pct: totalVal > 0 ? (caps['Large Cap'] / totalVal) * 100 : 0 },
      mid: { val: caps['Mid Cap'], pct: totalVal > 0 ? (caps['Mid Cap'] / totalVal) * 100 : 0 },
      small: { val: caps['Small Cap'], pct: totalVal > 0 ? (caps['Small Cap'] / totalVal) * 100 : 0 },
      total: totalVal,
    };
  }, [holdings]);

  // SVG Donut calculation
  const donutSize = 180;
  const radius = 70;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius;

  let cumulativeAngle = 0;
  const donutSlices = sectorData.map((s) => {
    const strokeDasharray = `${(s.percent / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -cumulativeAngle;
    cumulativeAngle += (s.percent / 100) * circumference;
    return {
      ...s,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Methodology Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Holdings Analytics</h1>
            <span className="text-xs font-mono bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded border border-zinc-200">
              {holdings.length} Active Positions
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Sector concentration, market cap diversification, and inventory costing breakdown.
          </p>
        </div>

        {/* Costing Engine Selector Banner */}
        <div className="flex items-center gap-3 bg-zinc-50 p-2 rounded-xl border border-zinc-200">
          <div className="text-xs">
            <span className="text-zinc-400 block text-[10px] uppercase font-mono">Cost Basis Lens</span>
            <span className="font-semibold text-zinc-800">
              {costBasisMethod === 'WAC' ? 'Weighted Average Cost' : 'FIFO Tax Basis'}
            </span>
          </div>
          <div className="flex items-center bg-white p-1 rounded-lg border border-zinc-200 text-xs">
            <button
              id="wac-lens-btn"
              onClick={() => setCostBasisMethod('WAC')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                costBasisMethod === 'WAC'
                  ? 'bg-zinc-900 text-white shadow-xs font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              WAC (Inventory)
            </button>
            <button
              id="fifo-lens-btn"
              onClick={() => setCostBasisMethod('FIFO')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                costBasisMethod === 'FIFO'
                  ? 'bg-zinc-900 text-white shadow-xs font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              FIFO (Tax Lots)
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid: Sector Donut + Market Cap Stacked Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sector Allocation Donut Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 tracking-tight">
                Sector Allocation (Nifty Classifications)
              </h2>
              <p className="text-xs text-zinc-500">Cross-account concentration across industry sectors</p>
            </div>
            <span className="text-xs font-mono text-zinc-400">{sectorData.length} Sectors</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* SVG Donut */}
            <div className="relative flex-shrink-0">
              <svg width={donutSize} height={donutSize} className="transform -rotate-90">
                <circle
                  cx={donutSize / 2}
                  cy={donutSize / 2}
                  r={radius}
                  fill="transparent"
                  stroke="#f4f4f5"
                  strokeWidth={strokeWidth}
                />
                {donutSlices.map((slice) => (
                  <circle
                    key={slice.sector}
                    cx={donutSize / 2}
                    cy={donutSize / 2}
                    r={radius}
                    fill="transparent"
                    stroke={slice.color}
                    strokeWidth={hoveredSector === slice.sector ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={slice.strokeDasharray}
                    strokeDashoffset={slice.strokeDashoffset}
                    className="transition-all duration-300 cursor-pointer"
                    onMouseEnter={() => setHoveredSector(slice.sector)}
                    onMouseLeave={() => setHoveredSector(null)}
                  />
                ))}
              </svg>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
                <span className="text-[10px] uppercase font-mono text-zinc-400">
                  {hoveredSector || 'Total Value'}
                </span>
                <span className="text-xs font-bold text-zinc-900 leading-tight">
                  {hoveredSector
                    ? formatCompactINR(sectorData.find((s) => s.sector === hoveredSector)?.value || 0)
                    : formatCompactINR(summary.totalCurrentValue)}
                </span>
                {hoveredSector && (
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {sectorData.find((s) => s.sector === hoveredSector)?.percent.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>

            {/* Sector Legend */}
            <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-2 text-xs w-full">
              {sectorData.map((s) => (
                <div
                  key={s.sector}
                  onMouseEnter={() => setHoveredSector(s.sector)}
                  onMouseLeave={() => setHoveredSector(null)}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    hoveredSector === s.sector ? 'bg-zinc-100 font-medium' : 'hover:bg-zinc-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="truncate text-zinc-800">{s.sector}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-0.5 pl-4">
                    <span>{s.percent.toFixed(1)}%</span>
                    <span className="font-mono text-zinc-400">{formatCompactINR(s.value)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Market Cap Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-semibold text-zinc-900 tracking-tight">
                  Market Capitalization Distribution
                </h2>
                <p className="text-xs text-zinc-500">Classification by SEBI market cap mandate</p>
              </div>
            </div>

            {/* Stacked Horizontal Bar */}
            <div className="w-full h-5 rounded-full overflow-hidden flex bg-zinc-100 mt-4">
              <div
                className="h-full bg-indigo-600 transition-all"
                style={{ width: `${capData.large.pct}%` }}
                title={`Large Cap: ${capData.large.pct.toFixed(1)}%`}
              />
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{ width: `${capData.mid.pct}%` }}
                title={`Mid Cap: ${capData.mid.pct.toFixed(1)}%`}
              />
              <div
                className="h-full bg-amber-500 transition-all"
                style={{ width: `${capData.small.pct}%` }}
                title={`Small Cap: ${capData.small.pct.toFixed(1)}%`}
              />
            </div>

            {/* Cap Legend cards */}
            <div className="space-y-3 mt-5">
              {/* Large Cap */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 bg-zinc-50/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-indigo-600 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-xs text-zinc-900">Large Cap (Top 100)</div>
                    <span className="text-[10px] text-zinc-500">Lower volatility, stable compounding</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-xs text-zinc-900">{capData.large.pct.toFixed(1)}%</div>
                  <div className="text-[10px] text-zinc-500 font-mono">
                    {formatCompactINR(capData.large.val)}
                  </div>
                </div>
              </div>

              {/* Mid Cap */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 bg-zinc-50/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-xs text-zinc-900">Mid Cap (101 - 250)</div>
                    <span className="text-[10px] text-zinc-500">High growth potential</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-xs text-zinc-900">{capData.mid.pct.toFixed(1)}%</div>
                  <div className="text-[10px] text-zinc-500 font-mono">
                    {formatCompactINR(capData.mid.val)}
                  </div>
                </div>
              </div>

              {/* Small Cap */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 bg-zinc-50/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-amber-500 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-xs text-zinc-900">Small Cap (251+)</div>
                    <span className="text-[10px] text-zinc-500">Emerging market opportunities</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-xs text-zinc-900">{capData.small.pct.toFixed(1)}%</div>
                  <div className="text-[10px] text-zinc-500 font-mono">
                    {formatCompactINR(capData.small.val)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-100 text-[11px] text-zinc-400 flex items-center justify-between">
            <span>SEBI Category Reference</span>
            <span>Total Valuation: {formatINR(capData.total)}</span>
          </div>
        </div>
      </div>

      {/* Holdings Filter & Actions Bar */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="search-holdings-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scrip name, symbol, sector..."
              className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-800"
            />
          </div>

          {/* Filter badges & Export */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Instrument Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-700 focus:outline-none"
            >
              <option value="ALL">All Instruments</option>
              <option value="EQUITY">Equities only</option>
              <option value="MUTUAL_FUND">Mutual Funds</option>
            </select>

            {/* Cap Filter */}
            <select
              value={selectedCap}
              onChange={(e) => setSelectedCap(e.target.value)}
              className="text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-700 focus:outline-none"
            >
              <option value="ALL">All Caps</option>
              <option value="Large Cap">Large Cap</option>
              <option value="Mid Cap">Mid Cap</option>
              <option value="Small Cap">Small Cap</option>
            </select>

            {/* View format switcher (Cards vs Table) */}
            <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200">
              <button
                type="button"
                onClick={() => setCustomViewMode('cards')}
                className={`p-1.5 rounded-md transition-all ${
                  showCards
                    ? 'bg-white text-zinc-900 shadow-2xs font-semibold'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
                title="Card View (Mobile Optimized)"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setCustomViewMode('table')}
                className={`p-1.5 rounded-md transition-all ${
                  !showCards
                    ? 'bg-white text-zinc-900 shadow-2xs font-semibold'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
                title="Table View (Full Grid)"
              >
                <TableIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Export CSV button */}
            <button
              id="export-holdings-csv-btn"
              onClick={exportHoldingsCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Conditional View: Card View (Mobile) vs Table View (Desktop) */}
        {showCards ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {filteredHoldings.length > 0 ? (
              filteredHoldings.map((h) => {
                const avgPrice = costBasisMethod === 'WAC' ? h.wacPrice : h.fifoPrice;
                const pnl = costBasisMethod === 'WAC' ? h.unrealizedPnLWAC : h.unrealizedPnLFIFO;
                const pnlPct =
                  costBasisMethod === 'WAC' ? h.unrealizedPnLPercentWAC : h.unrealizedPnLPercentFIFO;

                return (
                  <div
                    key={h.symbol}
                    className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-zinc-900 text-sm">{h.symbol}</span>
                          <span
                            className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-mono font-semibold ${
                              h.instrumentType === 'MUTUAL_FUND'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-zinc-200 text-zinc-700'
                            }`}
                          >
                            {h.instrumentType === 'MUTUAL_FUND' ? 'MF' : 'EQ'}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 line-clamp-1 mt-0.5">{h.name}</p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="font-bold text-sm text-zinc-900 font-mono">
                          {formatINR(h.cmp)}
                        </div>
                        <span
                          className={`text-[10px] font-mono font-medium ${
                            h.dayChangePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {formatPercent(h.dayChangePercent)} today
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-200/60 text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-zinc-400 font-sans block">Quantity & Avg Buy</span>
                        <span className="font-semibold text-zinc-800">
                          {h.totalQuantity} @ {formatINR(avgPrice)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-400 font-sans block">Current Value</span>
                        <span className="font-bold text-zinc-900">{formatINR(h.currentValue)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-200/60 text-xs">
                      <div>
                        <span className="text-[10px] text-zinc-400 font-sans block">Unrealized P&L</span>
                        <div
                          className={`font-bold font-mono ${
                            pnl >= 0 ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {formatINR(pnl)} ({formatPercent(pnlPct)})
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedHoldingForLots(h)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-200/70 hover:bg-zinc-200 text-zinc-800 transition-colors flex items-center gap-1 font-sans"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>FIFO Lots</span>
                      </button>
                    </div>

                    {/* Dynamic Profile Breakdown tags */}
                    {activeProfile === 'consolidated' && profiles.length > 1 && (
                      <div className="flex flex-wrap items-center gap-1 pt-1">
                        {profiles.map((p) => {
                          const qty = h.profileBreakdown[p.id] || 0;
                          if (qty <= 0) return null;
                          const displayName = p.name.split(' ')[0] || p.name;
                          return (
                            <span
                              key={p.id}
                              className={`text-[9px] px-1.5 py-0.5 rounded border font-medium ${
                                p.avatarColor || 'bg-zinc-100 text-zinc-700 border-zinc-200'
                              }`}
                              title={`${p.name} (${p.relation}): ${qty} units`}
                            >
                              {displayName}: {qty}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-8 text-center text-zinc-400 text-xs">
                No holdings match your search or filter criteria.
              </div>
            )}
          </div>
        ) : (
          /* Robust Data Table with min-width to avoid overlapping */
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-500 font-medium bg-zinc-50/60">
                <th
                  onClick={() => {
                    if (sortField === 'name') setSortAsc(!sortAsc);
                    else {
                      setSortField('name');
                      setSortAsc(true);
                    }
                  }}
                  className="py-3 px-3 cursor-pointer hover:text-zinc-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Instrument & Scrip</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3">Sector & Cap</th>
                <th className="py-3 px-3 text-right">Quantity</th>
                <th className="py-3 px-3 text-right">
                  Avg Buy ({costBasisMethod})
                </th>
                <th className="py-3 px-3 text-right">CMP (Price)</th>
                <th
                  onClick={() => {
                    if (sortField === 'value') setSortAsc(!sortAsc);
                    else {
                      setSortField('value');
                      setSortAsc(false);
                    }
                  }}
                  className="py-3 px-3 text-right cursor-pointer hover:text-zinc-900"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Current Value</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => {
                    if (sortField === 'pnl') setSortAsc(!sortAsc);
                    else {
                      setSortField('pnl');
                      setSortAsc(false);
                    }
                  }}
                  className="py-3 px-3 text-right cursor-pointer hover:text-zinc-900"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Unrealized P&L</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => {
                    if (sortField === 'weight') setSortAsc(!sortAsc);
                    else {
                      setSortField('weight');
                      setSortAsc(false);
                    }
                  }}
                  className="py-3 px-3 text-right cursor-pointer hover:text-zinc-900"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Weight</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 text-center">Lots</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-800 font-mono">
              {filteredHoldings.length > 0 ? (
                filteredHoldings.map((h) => {
                  const avgPrice = costBasisMethod === 'WAC' ? h.wacPrice : h.fifoPrice;
                  const pnl = costBasisMethod === 'WAC' ? h.unrealizedPnLWAC : h.unrealizedPnLFIFO;
                  const pnlPct =
                    costBasisMethod === 'WAC' ? h.unrealizedPnLPercentWAC : h.unrealizedPnLPercentFIFO;

                  return (
                    <tr
                      key={h.symbol}
                      className="hover:bg-zinc-50/80 transition-colors group"
                    >
                      {/* Symbol & Name */}
                      <td className="py-3 px-3">
                        <div className="font-sans font-semibold text-zinc-900 text-xs flex items-center gap-1.5">
                          <span>{h.symbol}</span>
                          <span
                            className={`text-[9px] uppercase px-1 py-0.2 rounded font-mono ${
                              h.instrumentType === 'MUTUAL_FUND'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-zinc-100 text-zinc-600'
                            }`}
                          >
                            {h.instrumentType === 'MUTUAL_FUND' ? 'MF' : 'EQ'}
                          </span>
                        </div>
                        <div className="font-sans text-[11px] text-zinc-400 truncate max-w-[180px]">
                          {h.name}
                        </div>
                        {/* Dynamic Family member breakdown badges */}
                        {activeProfile === 'consolidated' && profiles.length > 1 && (
                          <div className="flex flex-wrap items-center gap-1 mt-1">
                            {profiles.map((p) => {
                              const qty = h.profileBreakdown[p.id] || 0;
                              if (qty <= 0) return null;
                              const displayName = p.name.split(' ')[0] || p.name;
                              return (
                                <span
                                  key={p.id}
                                  className={`text-[9px] px-1.5 py-0.2 rounded border font-medium ${
                                    p.avatarColor || 'bg-zinc-100 text-zinc-700 border-zinc-200'
                                  }`}
                                  title={`${p.name} (${p.relation}): ${qty} units`}
                                >
                                  {displayName}: {qty}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </td>

                      {/* Sector & Cap */}
                      <td className="py-3 px-3 font-sans">
                        <span
                          className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium"
                          style={{
                            backgroundColor: `${SECTOR_COLORS[h.sector] || '#94a3b8'}15`,
                            color: SECTOR_COLORS[h.sector] || '#475569',
                          }}
                        >
                          {h.sector}
                        </span>
                        <div className="text-[10px] text-zinc-400 mt-0.5">{h.marketCap}</div>
                      </td>

                      {/* Quantity */}
                      <td className="py-3 px-3 text-right font-medium">
                        {h.totalQuantity}
                      </td>

                      {/* Avg Buy Price */}
                      <td className="py-3 px-3 text-right">
                        <div>{formatINR(avgPrice)}</div>
                        <span className="text-[9px] text-zinc-400 font-sans block">
                          {costBasisMethod === 'WAC' ? 'WAC' : 'FIFO'} Basis
                        </span>
                      </td>

                      {/* CMP */}
                      <td className="py-3 px-3 text-right font-medium">
                        <div>{formatINR(h.cmp)}</div>
                        <span
                          className={`text-[10px] ${
                            h.dayChangePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {formatPercent(h.dayChangePercent)}
                        </span>
                      </td>

                      {/* Current Value */}
                      <td className="py-3 px-3 text-right font-semibold text-zinc-900">
                        {formatINR(h.currentValue)}
                      </td>

                      {/* Unrealized P&L */}
                      <td className="py-3 px-3 text-right">
                        <div
                          className={`font-semibold ${
                            pnl >= 0 ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {formatINR(pnl)}
                        </div>
                        <div
                          className={`text-[10px] ${
                            pnlPct >= 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {formatPercent(pnlPct)}
                        </div>
                      </td>

                      {/* Weightage % with visual bar */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-zinc-700">{h.weightagePercent.toFixed(1)}%</span>
                          <div className="w-12 bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-zinc-800 h-full rounded-full"
                              style={{ width: `${Math.min(100, h.weightagePercent * 3)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* FIFO Lots Inspection Button */}
                      <td className="py-3 px-3 text-center">
                        <button
                          id={`view-lots-${h.symbol}-btn`}
                          onClick={() => setSelectedHoldingForLots(h)}
                          title="Inspect open FIFO buy lots"
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-zinc-400 font-sans">
                    No holdings match your search or filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
};
