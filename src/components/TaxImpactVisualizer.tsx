import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  Calculator,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Info,
  HelpCircle,
  AlertTriangle,
  Coins,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
  Percent,
  Scissors,
} from 'lucide-react';
import { HoldingItem, PortfolioSummary, RealizedGainLot } from '../types';
import { formatINR, formatPercent } from '../utils/formatters';
import { getDaysBetween } from '../utils/taxAndFifoEngine';

interface TaxImpactVisualizerProps {
  summary: PortfolioSummary;
  holdings: HoldingItem[];
  realizedLots: RealizedGainLot[];
  activeProfile: string;
}

export const TaxImpactVisualizer: React.FC<TaxImpactVisualizerProps> = ({
  summary,
  holdings,
  realizedLots,
  activeProfile,
}) => {
  const [activeView, setActiveView] = useState<'realized' | 'projected' | 'harvesting'>('realized');

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // ==========================================
  // 1. Projected Unrealized Tax Computation (Liquidation Scenario)
  // ==========================================
  const projectedTaxData = useMemo(() => {
    let unrealizedSTCGGains = 0;
    let unrealizedLTCGGains = 0;
    let unrealizedLosses = 0;

    const scripTaxBreakdown: Array<{
      symbol: string;
      name: string;
      stcgGains: number;
      ltcgGains: number;
      losses: number;
      embeddedTax: number;
      currentValue: number;
      isHarvestCandidate: boolean;
      isFreeLTCGCandidate: boolean;
    }> = [];

    holdings.forEach((h) => {
      let scripSTCG = 0;
      let scripLTCG = 0;
      let scripLoss = 0;

      if (h.openLots && h.openLots.length > 0) {
        h.openLots.forEach((lot) => {
          if (lot.remainingQuantity > 0) {
            const holdingDays = getDaysBetween(lot.date, todayStr);
            const lotPnL = (h.cmp - lot.netCostPerUnit) * lot.remainingQuantity;

            if (lotPnL > 0) {
              if (holdingDays >= 365) {
                scripLTCG += lotPnL;
              } else {
                scripSTCG += lotPnL;
              }
            } else {
              scripLoss += Math.abs(lotPnL);
            }
          }
        });
      } else {
        // Fallback if no open lots
        if (h.unrealizedPnLFIFO > 0) {
          scripLTCG += h.unrealizedPnLFIFO;
        } else {
          scripLoss += Math.abs(h.unrealizedPnLFIFO);
        }
      }

      unrealizedSTCGGains += scripSTCG;
      unrealizedLTCGGains += scripLTCG;
      unrealizedLosses += scripLoss;

      // Approximate scrip embedded tax: 20% on STCG + 12.5% on LTCG
      const embeddedTax = scripSTCG * 0.2 + scripLTCG * 0.125;

      scripTaxBreakdown.push({
        symbol: h.symbol,
        name: h.name,
        stcgGains: scripSTCG,
        ltcgGains: scripLTCG,
        losses: scripLoss,
        embeddedTax,
        currentValue: h.currentValue,
        isHarvestCandidate: scripLoss > 2000,
        isFreeLTCGCandidate: scripLTCG > 0 && scripLTCG <= (summary.remainingLTCGExemption || 125000),
      });
    });

    const totalUnrealizedGains = unrealizedSTCGGains + unrealizedLTCGGains;
    const remainingLTCGExemption = summary.remainingLTCGExemption || 125000;
    const projectedExemptLTCG = Math.min(unrealizedLTCGGains, remainingLTCGExemption);
    const projectedTaxableLTCG = Math.max(0, unrealizedLTCGGains - remainingLTCGExemption);

    const projectedSTCGTax = unrealizedSTCGGains * 0.2; // 20%
    const projectedLTCGTax = projectedTaxableLTCG * 0.125; // 12.5%
    const projectedTotalTax = projectedSTCGTax + projectedLTCGTax;
    const projectedNetInHand = totalUnrealizedGains - projectedTotalTax;
    const effectiveProjectedTaxRate =
      totalUnrealizedGains > 0 ? (projectedTotalTax / totalUnrealizedGains) * 100 : 0;

    return {
      unrealizedSTCGGains,
      unrealizedLTCGGains,
      totalUnrealizedGains,
      unrealizedLosses,
      remainingLTCGExemption,
      projectedExemptLTCG,
      projectedTaxableLTCG,
      projectedSTCGTax,
      projectedLTCGTax,
      projectedTotalTax,
      projectedNetInHand,
      effectiveProjectedTaxRate,
      scripTaxBreakdown: scripTaxBreakdown.sort((a, b) => b.embeddedTax - a.embeddedTax),
    };
  }, [holdings, todayStr, summary]);

  // ==========================================
  // 2. Realized Tax Waterfall Chart Data
  // ==========================================
  const realizedChartData = useMemo(() => {
    const totalGains = (summary.totalRealizedSTCG || 0) + (summary.totalRealizedLTCG || 0);
    const netRetained = Math.max(0, totalGains - (summary.totalTaxLiability || 0));

    return [
      {
        name: 'Gross Realized Gains',
        amount: Math.max(0, totalGains),
        fill: '#3b82f6', // Blue
      },
      {
        name: 'STCG Tax (20%)',
        amount: summary.stcgTaxLiability || 0,
        fill: '#f59e0b', // Amber
      },
      {
        name: 'LTCG Tax (12.5%)',
        amount: summary.ltcgTaxLiability || 0,
        fill: '#6366f1', // Indigo
      },
      {
        name: 'Net Retained Alpha',
        amount: netRetained,
        fill: '#10b981', // Emerald
      },
    ];
  }, [summary]);

  // ==========================================
  // 3. Exemption Utilization Donut Data
  // ==========================================
  const exemptionDonutData = useMemo(() => {
    const used = summary.exemptLTCGUsed || 0;
    const remaining = summary.remainingLTCGExemption || 125000;
    const taxable = summary.taxableLTCG || 0;

    return [
      { name: 'Exemption Utilized (0% Tax)', value: used, color: '#10b981' }, // Emerald
      { name: 'Exemption Remaining (Tax-Free Buffer)', value: remaining, color: '#06b6d4' }, // Cyan
      ...(taxable > 0 ? [{ name: 'Taxable LTCG (12.5% Tax)', value: taxable, color: '#6366f1' }] : []),
    ];
  }, [summary]);

  // ==========================================
  // 4. Projected Scrip-Level Comparison Data
  // ==========================================
  const topTaxScripsData = useMemo(() => {
    return projectedTaxData.scripTaxBreakdown.slice(0, 6).map((s) => ({
      name: s.symbol,
      stcgTax: Math.round(s.stcgGains * 0.2),
      ltcgTax: Math.round(s.ltcgGains * 0.125),
      totalTax: Math.round(s.embeddedTax),
    }));
  }, [projectedTaxData]);

  const totalRealizedGains = (summary.totalRealizedSTCG || 0) + (summary.totalRealizedLTCG || 0);
  const effectiveRealizedTaxRate =
    totalRealizedGains > 0 ? (summary.totalTaxLiability / totalRealizedGains) * 100 : 0;

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xs overflow-hidden space-y-6 p-5 sm:p-6">
      {/* Visualizer Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-sm">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 tracking-tight flex items-center gap-2">
                <span>Tax Impact & Fiscal Alpha Visualizer</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                  Budget 2024 Lens
                </span>
              </h2>
              <p className="text-xs text-zinc-500">
                Visualise gross vs net in-hand returns, ₹1.25 Lakh exemption shielding, and liquidation exposure
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl self-start sm:self-auto border border-zinc-200/80">
          <button
            id="tax-view-realized-btn"
            onClick={() => setActiveView('realized')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeView === 'realized'
                ? 'bg-white text-zinc-900 shadow-2xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Realized Tax (FY 24-25)
          </button>
          <button
            id="tax-view-projected-btn"
            onClick={() => setActiveView('projected')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeView === 'projected'
                ? 'bg-white text-zinc-900 shadow-2xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Projected Liquidation
          </button>
          <button
            id="tax-view-harvesting-btn"
            onClick={() => setActiveView('harvesting')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeView === 'harvesting'
                ? 'bg-white text-zinc-900 shadow-2xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Harvesting Simulator
          </button>
        </div>
      </div>

      {/* VIEW 1: REALIZED TAX IMPACT (FY 2024-25) */}
      {activeView === 'realized' && (
        <div className="space-y-6">
          {/* Executive KPI Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1">
              <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block">
                Total Realized Gains
              </span>
              <div className="text-xl font-bold font-mono text-zinc-900">
                {formatINR(totalRealizedGains)}
              </div>
              <span className="text-[11px] text-zinc-400">Pre-tax capital gains generated</span>
            </div>

            <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-amber-900 uppercase tracking-wider block">
                  Total Tax Liability
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                  {effectiveRealizedTaxRate.toFixed(1)}% Drag
                </span>
              </div>
              <div className="text-xl font-bold font-mono text-amber-950">
                {formatINR(summary.totalTaxLiability)}
              </div>
              <span className="text-[11px] text-amber-700">STCG @ 20% + LTCG @ 12.5%</span>
            </div>

            <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-1">
              <span className="text-[11px] font-medium text-emerald-900 uppercase tracking-wider block">
                Net Retained In-Hand
              </span>
              <div className="text-xl font-bold font-mono text-emerald-950">
                {formatINR(Math.max(0, totalRealizedGains - summary.totalTaxLiability))}
              </div>
              <span className="text-[11px] text-emerald-700">True post-tax portfolio wealth</span>
            </div>

            <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-200 space-y-1">
              <span className="text-[11px] font-medium text-indigo-900 uppercase tracking-wider block">
                ₹1.25L Exemption Shield
              </span>
              <div className="text-xl font-bold font-mono text-indigo-950">
                {formatINR(summary.exemptLTCGUsed)}
              </div>
              <span className="text-[11px] text-indigo-700">
                Saved {formatINR(summary.exemptLTCGUsed * 0.125)} in statutory tax
              </span>
            </div>
          </div>

          {/* Visual Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Realized Gains vs Taxes Waterfall */}
            <div className="p-4 bg-zinc-50/50 rounded-xl border border-zinc-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-900">
                  Gross Capital Gains vs Statutory Tax Drag
                </span>
                <span className="text-[11px] text-zinc-400 font-mono">INR (₹)</span>
              </div>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={realizedChartData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#71717a' }}
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#71717a' }}
                      tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      formatter={(val: number) => [formatINR(val), 'Amount']}
                      contentStyle={{
                        backgroundColor: '#18181b',
                        color: '#fff',
                        borderRadius: '8px',
                        fontSize: '12px',
                        border: 'none',
                      }}
                    />
                    <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                      {realizedChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: ₹1.25 Lakh Statutory Exemption Absorption */}
            <div className="p-4 bg-zinc-50/50 rounded-xl border border-zinc-200 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900">
                    Section 112A LTCG Statutory Shield Meter
                  </span>
                  <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                    ₹1,25,000 / Year
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Budget 2024 allows up to ₹1.25L in long-term equity gains tax-free per PAN per financial year.
                </p>
              </div>

              <div className="h-52 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={exemptionDonutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {exemptionDonutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: number) => [formatINR(val), 'Value']}
                      contentStyle={{
                        backgroundColor: '#18181b',
                        color: '#fff',
                        borderRadius: '8px',
                        fontSize: '12px',
                        border: 'none',
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                      formatter={(value) => <span className="text-zinc-700">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="p-3 bg-white rounded-lg border border-zinc-200 flex items-center justify-between text-xs">
                <span className="text-zinc-600">Free Tax Buffer Available to Harvest:</span>
                <span className="font-mono font-bold text-emerald-700">
                  {formatINR(summary.remainingLTCGExemption || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: PROJECTED UNREALIZED LIQUIDATION TAX IMPACT */}
      {activeView === 'projected' && (
        <div className="space-y-6">
          <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-200 flex items-start gap-3">
            <Info className="w-5 h-5 text-indigo-700 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <span className="font-bold text-indigo-950 block">
                Total Portfolio Liquidation Simulation (What-If Scenario)
              </span>
              <p className="text-indigo-900 leading-relaxed">
                If you were to sell 100% of your open portfolio positions at current market prices today, this analysis calculates the exact tax liability based on individual FIFO tranche holding durations (&lt;365 days vs &ge;365 days) and your remaining ₹1.25L exemption.
              </p>
            </div>
          </div>

          {/* Projected KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1">
              <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block">
                Unrealized Gains
              </span>
              <div className="text-xl font-bold font-mono text-zinc-900">
                {formatINR(projectedTaxData.totalUnrealizedGains)}
              </div>
              <span className="text-[11px] text-zinc-400">
                STCG: {formatINR(projectedTaxData.unrealizedSTCGGains)} • LTCG: {formatINR(projectedTaxData.unrealizedLTCGGains)}
              </span>
            </div>

            <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-rose-900 uppercase tracking-wider block">
                  Projected Tax Liability
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">
                  {projectedTaxData.effectiveProjectedTaxRate.toFixed(1)}%
                </span>
              </div>
              <div className="text-xl font-bold font-mono text-rose-950">
                {formatINR(projectedTaxData.projectTotalTax)}
              </div>
              <span className="text-[11px] text-rose-700">
                STCG 20%: {formatINR(projectedTaxData.projectedSTCGTax)} • LTCG 12.5%: {formatINR(projectedTaxData.projectedLTCGTax)}
              </span>
            </div>

            <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-1">
              <span className="text-[11px] font-medium text-emerald-900 uppercase tracking-wider block">
                Net Cash In-Hand
              </span>
              <div className="text-xl font-bold font-mono text-emerald-950">
                {formatINR(summary.totalCurrentValue - projectedTaxData.projectedTotalTax)}
              </div>
              <span className="text-[11px] text-emerald-700">After complete statutory tax settlement</span>
            </div>

            <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-200 space-y-1">
              <span className="text-[11px] font-medium text-purple-900 uppercase tracking-wider block">
                Lock-In Tax Drag
              </span>
              <div className="text-xl font-bold font-mono text-purple-950">
                {formatINR(projectedTaxData.projectedSTCGTax)}
              </div>
              <span className="text-[11px] text-purple-700">
                Tax savings if short-term lots held &ge; 365 days
              </span>
            </div>
          </div>

          {/* Top Scrips Tax Drag Chart */}
          <div className="p-4 bg-zinc-50/50 rounded-xl border border-zinc-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900">
                Embedded Tax Liability by Top Security Holdings
              </span>
              <span className="text-[11px] text-zinc-400 font-mono">STCG (20%) vs LTCG (12.5%)</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topTaxScripsData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#71717a' }} />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#71717a' }}
                    tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(val: number) => [formatINR(val), 'Embedded Tax']}
                    contentStyle={{
                      backgroundColor: '#18181b',
                      color: '#fff',
                      borderRadius: '8px',
                      fontSize: '12px',
                      border: 'none',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="stcgTax" name="STCG Tax @ 20%" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="ltcgTax" name="LTCG Tax @ 12.5%" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: TAX SHIELD & HARVESTING SIMULATOR */}
      {activeView === 'harvesting' && (
        <div className="space-y-6">
          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <span className="font-bold text-emerald-950 block">
                Smart Indian Tax Arbitrage: Section 112A Tax-Free Reset
              </span>
              <p className="text-emerald-900 leading-relaxed">
                Under Section 112A, you can harvest up to <strong>₹1,25,000 of LTCG every financial year at 0% tax</strong>. By selling eligible long-term shares and immediately repurchasing them, you reset your cost basis to CMP, permanently wiping out embedded future tax liability.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 text-xs">
            {/* Free LTCG Candidates */}
            <div className="p-4 rounded-xl border border-zinc-200 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-zinc-900">
                    Eligible for 0% Tax LTCG Reset
                  </span>
                </div>
                <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                  Remaining Buffer: {formatINR(projectedTaxData.remainingLTCGExemption)}
                </span>
              </div>
              <p className="text-zinc-500 text-[11px]">
                These holdings have accrued long-term gains (&ge;365 days) that fit inside your remaining ₹1.25L exemption buffer.
              </p>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {projectedTaxData.scripTaxBreakdown
                  .filter((s) => s.ltcgGains > 0)
                  .map((s) => (
                    <div
                      key={s.symbol}
                      className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-zinc-900 block">{s.symbol}</span>
                        <span className="text-[11px] text-zinc-500">{s.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-emerald-700 block">
                          +{formatINR(s.ltcgGains)}
                        </span>
                        <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded font-medium">
                          Tax Free: ₹0
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Tax-Loss Harvesting Candidates */}
            <div className="p-4 rounded-xl border border-zinc-200 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-rose-600" />
                  <span className="font-bold text-zinc-900">
                    Tax-Loss Harvesting Candidates
                  </span>
                </div>
                <span className="text-[10px] font-mono bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-bold">
                  Offset 20% STCG
                </span>
              </div>
              <p className="text-zinc-500 text-[11px]">
                Booking unrealized losses before March 31 directly offsets realized short-term gains, immediately saving 20% in tax outflow.
              </p>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {projectedTaxData.scripTaxBreakdown.filter((s) => s.losses > 0).length > 0 ? (
                  projectedTaxData.scripTaxBreakdown
                    .filter((s) => s.losses > 0)
                    .map((s) => (
                      <div
                        key={s.symbol}
                        className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-zinc-900 block">{s.symbol}</span>
                          <span className="text-[11px] text-zinc-500">{s.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-rose-600 block">
                            -{formatINR(s.losses)}
                          </span>
                          <span className="text-[10px] text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded font-medium">
                            Potential Tax Saved: {formatINR(s.losses * 0.2)}
                          </span>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="py-8 text-center text-zinc-400 text-xs">
                    No open positions with unrealized loss found in this profile. All scrips currently profitable!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
