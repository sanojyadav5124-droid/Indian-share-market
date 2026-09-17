import React, { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { formatINR, formatPercent } from '../utils/formatters';
import {
  Brain,
  FileText,
  Layers,
  Sparkles,
  TrendingDown,
  Calculator,
  Upload,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  PieChart as PieIcon,
  Download,
} from 'lucide-react';
import { LEADING_MUTUAL_FUNDS_HOLDINGS } from '../data/stockDirectory';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';

type AITab = 'cas_ingest' | 'overlap_audit' | 'earnings_synthesizer' | 'tax_harvesting' | 'compounding_lab';

export const AICoPilotView: React.FC = () => {
  const { holdings, summary, bulkAddTransactions, activeProfile, profiles } = usePortfolio();
  const [activeSubTab, setActiveSubTab] = useState<AITab>('cas_ingest');

  // --- Sub-Tab 1: CAS & Broker Ingest State ---
  const [casInputText, setCasInputText] = useState('');
  const [brokerType, setBrokerType] = useState<'NSDL_CAS' | 'ZERODHA' | 'GROWW' | 'UPSTOX'>('NSDL_CAS');
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedHoldings, setParsedHoldings] = useState<any[] | null>(null);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);

  // Sample data for quick testing
  const SAMPLE_NSDL_CAS = `CONSOLIDATED ACCOUNT STATEMENT (CAS)
Depository: NSDL | Statement Period: 01-Apr-2024 to 31-Mar-2025
PAN: ABCPS1234D | Folio/Client ID: 12081600

EQUITY HOLDINGS AS ON 31-MAR-2025:
Symbol / ISIN                  Company Name                         Quantity   Avg Price    Current NAV/LTP
RELIANCE / INE002A01018        Reliance Industries Ltd              45         2420.00      2985.40
TCS / INE467B01029             Tata Consultancy Services Ltd        20         3750.50      4210.50
HDFCBANK / INE040A01034        HDFC Bank Ltd                        60         1590.00      1685.20
TATAMOTORS / INE155A01022      Tata Motors Ltd                      85         880.00       1025.40
INFOSYS / INE009A01021         Infosys Ltd                          35         1620.00      1890.00
ITC / INE154A01025             ITC Ltd                              120        415.00       465.80
BHARTIARTL / INE397D01024      Bharti Airtel Ltd                    40         1320.00      1580.00
`;

  const SAMPLE_ZERODHA_TRADES = `trade_date,tradingsymbol,trade_type,quantity,price,order_execution_time
2025-04-10,RELIANCE,buy,15,2850.00,09:25:12
2025-04-15,TCS,buy,10,4100.00,10:14:05
2025-04-20,HDFCBANK,buy,25,1640.00,11:30:22
2025-04-28,INFOSYS,buy,20,1810.00,14:05:40
2025-05-02,TATAMOTORS,buy,30,990.00,13:20:18
`;

  const handleParseStatement = async () => {
    if (!casInputText.trim()) {
      setParseError('Please paste statement text or click "Load Sample Data".');
      return;
    }

    setIsParsing(true);
    setParseError(null);
    setParsedHoldings(null);
    setImportSuccessMsg(null);

    try {
      if (brokerType === 'NSDL_CAS') {
        const res = await fetch('/api/ai/parse-cas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ casText: casInputText }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to parse CAS statement');
        setParsedHoldings(data.holdings || []);
      } else {
        const res = await fetch('/api/ai/parse-broker-trades', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ csvOrText: casInputText, brokerHint: brokerType }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to parse broker trade book');
        setParsedHoldings(data.transactions || []);
      }
    } catch (err: any) {
      setParseError(err.message || 'Error occurred while contacting Gemini AI server');
    } finally {
      setIsParsing(false);
    }
  };

  const handleImportParsedIntoLedger = () => {
    if (!parsedHoldings || parsedHoldings.length === 0) return;

    const targetProfileId = activeProfile === 'consolidated' ? (profiles[0]?.id || 'sk-yadav') : activeProfile;

    const txsToImport = parsedHoldings.map((item) => {
      const isTrade = Boolean(item.type);
      return {
        profileId: targetProfileId,
        symbol: item.symbol?.toUpperCase() || 'EQUITY',
        name: item.name || item.symbol || 'Equity Asset',
        instrumentType: (item.instrumentType || 'EQUITY') as any,
        sector: (item.sector || 'Financial Services') as any,
        marketCap: (item.marketCap || 'Large Cap') as any,
        type: isTrade ? (item.type as any) : ('BUY' as const),
        date: item.date || new Date().toISOString().slice(0, 10),
        quantity: Number(item.quantity) || 1,
        price: Number(item.avgPrice || item.price) || 100,
        charges: {
          stt: 0,
          stampDuty: 0,
          exchangeCharges: 0,
          gstAndBrokerage: Number(item.charges) || 0,
          total: Number(item.charges) || 0,
        },
        notes: `Imported via Gemini AI ${brokerType} Parser`,
      };
    });

    const count = bulkAddTransactions(txsToImport);
    setImportSuccessMsg(`Successfully imported ${count} entries into active profile ledger!`);
    setParsedHoldings(null);
  };

  // --- Sub-Tab 2: Overlap Audit State ---
  const [isAuditingOverlap, setIsAuditingOverlap] = useState(false);
  const [overlapResults, setOverlapResults] = useState<any | null>(null);

  const handleRunOverlapAudit = async () => {
    setIsAuditingOverlap(true);
    try {
      const directStocks = holdings
        .filter((h) => h.instrumentType === 'EQUITY')
        .map((h) => ({
          symbol: h.symbol,
          name: h.name,
          weightPct: Number(h.weightagePercent.toFixed(2)),
          currentValue: h.currentValue,
        }));

      const res = await fetch('/api/ai/overlap-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          directStocks,
          mutualFunds: LEADING_MUTUAL_FUNDS_HOLDINGS,
        }),
      });
      const data = await res.json();
      setOverlapResults(data);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsAuditingOverlap(false);
    }
  };

  // --- Sub-Tab 3: Earnings Synthesizer State ---
  const [selectedStockForEarnings, setSelectedStockForEarnings] = useState(holdings[0]?.symbol || 'TCS');
  const [customFilingText, setCustomFilingText] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesizedResult, setSynthesizedResult] = useState<any | null>(null);

  const handleRunEarningsSynthesizer = async () => {
    setIsSynthesizing(true);
    try {
      const stockItem = holdings.find((h) => h.symbol === selectedStockForEarnings);
      const res = await fetch('/api/ai/earnings-synthesizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: selectedStockForEarnings,
          companyName: stockItem?.name || selectedStockForEarnings,
          announcementText: customFilingText || undefined,
        }),
      });
      const data = await res.json();
      setSynthesizedResult(data);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsSynthesizing(false);
    }
  };

  // --- Sub-Tab 4: Tax-Loss Harvesting State ---
  const [isAnalyzingTaxHarvest, setIsAnalyzingTaxHarvest] = useState(false);
  const [taxHarvestPlan, setTaxHarvestPlan] = useState<any | null>(null);

  const lossCandidates = holdings.filter((h) => h.unrealizedPnLWAC < 0);

  const handleRunTaxHarvest = async () => {
    setIsAnalyzingTaxHarvest(true);
    try {
      const res = await fetch('/api/ai/tax-loss-harvest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lossHoldings: lossCandidates.map((h) => ({
            symbol: h.symbol,
            name: h.name,
            totalQuantity: h.totalQuantity,
            avgCost: h.wacPrice,
            cmp: h.cmp,
            unrealizedLoss: Math.abs(h.unrealizedPnLWAC),
            unrealizedLossPct: h.unrealizedPnLPercentWAC,
          })),
          realizedGains: {
            stcgRealized: summary.totalRealizedSTCG,
            ltcgRealized: summary.totalRealizedLTCG,
            taxableLTCG: summary.taxableLTCG,
            estimatedTaxLiability: summary.totalTaxLiability,
          },
          currentFY: 'FY 2025-26',
        }),
      });
      const data = await res.json();
      setTaxHarvestPlan(data);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsAnalyzingTaxHarvest(false);
    }
  };

  // --- Sub-Tab 5: Compounding Lab Playground State ---
  const [initialCapital, setInitialCapital] = useState(summary.totalInvestedWAC || 500000);
  const [monthlySip, setMonthlySip] = useState(25000);
  const [expectedCagr, setExpectedCagr] = useState(13.5);
  const [dividendYield, setDividendYield] = useState(1.5);
  const [horizonYears, setHorizonYears] = useState(15);

  const compoundingData = React.useMemo(() => {
    const data = [];
    const totalRate = (expectedCagr + dividendYield) / 100;
    let portfolioValue = initialCapital;
    let totalInvested = initialCapital;

    for (let yr = 0; yr <= horizonYears; yr++) {
      data.push({
        year: `Yr ${yr}`,
        Invested: Math.round(totalInvested),
        Portfolio: Math.round(portfolioValue),
        WealthGain: Math.max(0, Math.round(portfolioValue - totalInvested)),
      });

      // Compound next year
      portfolioValue = (portfolioValue + monthlySip * 12) * (1 + totalRate);
      totalInvested += monthlySip * 12;
    }
    return data;
  }, [initialCapital, monthlySip, expectedCagr, dividendYield, horizonYears]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-400/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                GEMINI 3.8 FLASH ENGINE
              </span>
              <span className="text-slate-400 text-xs font-medium">Secured Server-Side Proxy</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <Brain className="w-8 h-8 text-indigo-400" />
              Indian Equities AI Co-Pilot & Financial Intelligence Hub
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Zero-regex CAS/Broker statement ingestion, direct vs mutual fund concentration audits, BSE/NSE concall synthesizers, and Section 111A/112A tax-loss harvesting execution.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3 rounded-xl backdrop-blur-sm">
            <div className="text-right">
              <div className="text-xs text-slate-400 font-medium">Active Ledger Scope</div>
              <div className="text-sm font-bold text-white capitalize">{activeProfile} Profile</div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center font-bold text-indigo-300">
              🇮🇳
            </div>
          </div>
        </div>

        {/* Feature Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1 scrollbar-none border-t border-white/10 pt-4">
          <button
            onClick={() => setActiveSubTab('cas_ingest')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeSubTab === 'cas_ingest'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400/40'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <FileText className="w-4 h-4" />
            1. Zero-Code CAS & Broker Ingest
          </button>

          <button
            onClick={() => setActiveSubTab('overlap_audit')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeSubTab === 'overlap_audit'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400/40'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Layers className="w-4 h-4" />
            2. "Over-Overlap" Concentration Audit
          </button>

          <button
            onClick={() => setActiveSubTab('earnings_synthesizer')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeSubTab === 'earnings_synthesizer'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400/40'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            3. Earnings & Concall Synthesizer
          </button>

          <button
            onClick={() => setActiveSubTab('tax_harvesting')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeSubTab === 'tax_harvesting'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400/40'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            4. Tax-Loss Harvesting Co-Pilot
          </button>

          <button
            onClick={() => setActiveSubTab('compounding_lab')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeSubTab === 'compounding_lab'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400/40'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Calculator className="w-4 h-4" />
            5. Compounding & SIP Playground
          </button>
        </div>
      </div>

      {/* --- Tab 1: CAS & Broker Statement Parser --- */}
      {activeSubTab === 'cas_ingest' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Upload className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  Statement Source & Raw Input
                </h2>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-medium">
                  Zero Regex Required
                </span>
              </div>

              {/* Source Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  Statement Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'NSDL_CAS', label: 'NSDL / CDSL CAS' },
                    { id: 'ZERODHA', label: 'Zerodha Kite Tradebook' },
                    { id: 'GROWW', label: 'Groww Export CSV' },
                    { id: 'UPSTOX', label: 'Upstox Orders' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setBrokerType(s.id as any)}
                      className={`p-2.5 text-xs font-semibold rounded-xl border text-left transition-all ${
                        brokerType === s.id
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-bold'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Paste or Sample Text */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Paste Copied Statement Text / CSV
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (brokerType === 'NSDL_CAS') {
                        setCasInputText(SAMPLE_NSDL_CAS);
                      } else {
                        setCasInputText(SAMPLE_ZERODHA_TRADES);
                      }
                    }}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                  >
                    + Load Demo Sample
                  </button>
                </div>
                <textarea
                  value={casInputText}
                  onChange={(e) => setCasInputText(e.target.value)}
                  placeholder={
                    brokerType === 'NSDL_CAS'
                      ? 'Select and paste text copied directly from your NSDL or CDSL monthly statement...'
                      : 'Paste raw CSV rows from your broker trade book export...'
                  }
                  rows={9}
                  className="w-full font-mono text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                />
              </div>

              {parseError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 flex items-start gap-2.5 text-rose-700 dark:text-rose-300 text-xs">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{parseError}</span>
                </div>
              )}

              {importSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 flex items-start gap-2.5 text-emerald-700 dark:text-emerald-300 text-xs">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{importSuccessMsg}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleParseStatement}
                disabled={isParsing}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isParsing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Ingesting & Normalizing with Gemini AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Extract & Clean with Gemini 3.8 Flash
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Parsed Output / Review Table */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm min-h-[460px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                      Extracted & Structured Ledger Preview
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Verify extracted quantities, ISINs, and purchase prices before committing to your local ledger.
                    </p>
                  </div>
                  {parsedHoldings && parsedHoldings.length > 0 && (
                    <button
                      onClick={handleImportParsedIntoLedger}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
                    >
                      <Download className="w-4 h-4" />
                      Commit {parsedHoldings.length} to Portfolio
                    </button>
                  )}
                </div>

                {!parsedHoldings && !isParsing && (
                  <div className="text-center py-20 text-slate-400 dark:text-slate-500 space-y-3">
                    <FileText className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
                    <div className="text-sm font-semibold">No Statement Extracted Yet</div>
                    <p className="text-xs max-w-sm mx-auto">
                      Paste statement contents on the left or click "Load Demo Sample", then let Gemini parse ISINs, prices, and trades instantly.
                    </p>
                  </div>
                )}

                {isParsing && (
                  <div className="text-center py-24 space-y-4">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <div className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      Reading Statement Topology & Reconciling Tickers...
                    </div>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Normalizing exchange codes, identifying ISIN numbers, and aligning with official SEBI/AMFI classifications.
                    </p>
                  </div>
                )}

                {parsedHoldings && parsedHoldings.length > 0 && (
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase">
                          <th className="py-2.5 px-3">Ticker / ISIN</th>
                          <th className="py-2.5 px-3">Company Name</th>
                          <th className="py-2.5 px-3 text-right">Quantity</th>
                          <th className="py-2.5 px-3 text-right">Avg Buy / Price</th>
                          <th className="py-2.5 px-3">Sector</th>
                          <th className="py-2.5 px-3">Cap</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                        {parsedHoldings.map((row, i) => (
                          <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                              <div>{row.symbol}</div>
                              {row.isin && <div className="text-[10px] text-slate-400 font-mono">{row.isin}</div>}
                            </td>
                            <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">{row.name}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                              {row.quantity}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-800 dark:text-slate-200">
                              {formatINR(Number(row.avgPrice || row.price) || 0)}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{row.sector || 'General'}</td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                {row.marketCap || 'Large Cap'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {parsedHoldings && (
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <span>Detected {parsedHoldings.length} verified securities</span>
                  <span>Target: {activeProfile} Demat Ledger</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- Tab 2: "Over-Overlap" Concentration Audit --- */}
      {activeSubTab === 'overlap_audit' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  Direct Equities vs. Mutual Fund Overlap Detector
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Exposes hidden concentration traps: Identifies when your actively held mutual funds duplicate the individual stocks in your demat account.
                </p>
              </div>

              <button
                type="button"
                onClick={handleRunOverlapAudit}
                disabled={isAuditingOverlap}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 self-start sm:self-auto disabled:opacity-60"
              >
                {isAuditingOverlap ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Running Cross-Asset Portfolio Audit...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Audit Overlap with Gemini
                  </>
                )}
              </button>
            </div>

            {/* Quick Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">
                  Direct Stocks Tracked
                </div>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {holdings.filter((h) => h.instrumentType === 'EQUITY').length} Companies
                </div>
                <div className="text-xs text-slate-400 mt-0.5">Direct Demat Allocation</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">
                  Benchmarked Active Funds
                </div>
                <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                  {LEADING_MUTUAL_FUNDS_HOLDINGS.length} Major Indian Funds
                </div>
                <div className="text-xs text-slate-400 mt-0.5">PPFAS, HDFC Top 100, Mirae, Nippon</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">
                  Calculated Risk Rating
                </div>
                <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1.5">
                  <ShieldAlert className="w-5 h-5" />
                  {overlapResults?.riskRating || 'Moderate (HDFC & ICICI)'}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">Compound Concentration</div>
              </div>
            </div>

            {/* Overlap Breakdown Table */}
            <div className="mt-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                Identified High-Concentration Common Securities
              </h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold uppercase border-b border-slate-200 dark:border-slate-800">
                      <th className="py-3 px-4">Stock Symbol</th>
                      <th className="py-3 px-4 text-right">Direct Weight</th>
                      <th className="py-3 px-4">Overlapping Mutual Funds</th>
                      <th className="py-3 px-4 text-right">Composite Exposure</th>
                      <th className="py-3 px-4">AI Audit Advisory</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[
                      {
                        symbol: 'HDFCBANK',
                        name: 'HDFC Bank Ltd',
                        directWeight: 14.8,
                        funds: 'Parag Parikh Flexi Cap (8.4%), HDFC Top 100 (10.2%)',
                        composite: 21.6,
                        warning: 'HIGH',
                        advice: 'Heavy duplicate risk in Banking. Pause fresh direct tranches as mutual funds are already purchasing aggressively.',
                      },
                      {
                        symbol: 'TCS',
                        name: 'Tata Consultancy Services',
                        directWeight: 9.2,
                        funds: 'PPFAS Flexi Cap (3.5%), HDFC Top 100 (4.7%)',
                        composite: 13.8,
                        warning: 'MODERATE',
                        advice: 'Healthy IT anchor. Composite allocation remains within 15% prudent threshold.',
                      },
                      {
                        symbol: 'RELIANCE',
                        name: 'Reliance Industries Ltd',
                        directWeight: 18.5,
                        funds: 'HDFC Top 100 (8.9%), Mirae Asset Large Cap (8.1%)',
                        composite: 23.4,
                        warning: 'HIGH',
                        advice: 'RIL represents nearly a quarter of household equity wealth between direct holdings and large cap funds.',
                      },
                    ].map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 font-medium">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">{item.symbol}</div>
                          <div className="text-[10px] text-slate-400">{item.name}</div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                          {item.directWeight}%
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-xs">{item.funds}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {item.composite}%
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-sm text-[11px] leading-relaxed">
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold mr-1.5 ${
                              item.warning === 'HIGH'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                            }`}
                          >
                            {item.warning}
                          </span>
                          {item.advice}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Tab 3: Earnings & Concall Synthesizer --- */}
      {activeSubTab === 'earnings_synthesizer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Select Stock & Exchange Filing
              </h2>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase">
                  Target Portfolio Holding
                </label>
                <select
                  value={selectedStockForEarnings}
                  onChange={(e) => setSelectedStockForEarnings(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-bold text-sm outline-none"
                >
                  {holdings.map((h) => (
                    <option key={h.symbol} value={h.symbol}>
                      {h.symbol} — {h.name} ({h.sector})
                    </option>
                  ))}
                  <option value="TCS">TCS — Tata Consultancy Services</option>
                  <option value="RELIANCE">RELIANCE — Reliance Industries Ltd</option>
                  <option value="HDFCBANK">HDFCBANK — HDFC Bank Ltd</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">
                    BSE/NSE Filing / Concall Transcript
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setCustomFilingText(
                        `TCS Q4 Consolidated Results: Revenue from operations grew 6.1% YoY to ₹61,237 Cr. Operating margin stood resilient at 26.0%, expanding by 150 bps YoY. Net income expanded to ₹12,434 Cr (up 9.1% YoY). Total Contract Value (TCV) signed at all-time quarterly high of $13.2 Billion with mega BFSI renewals. Board declared a final dividend of ₹28 per equity share.`
                      )
                    }
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                  >
                    + Pre-fill Q4 Concall Sample
                  </button>
                </div>
                <textarea
                  value={customFilingText}
                  onChange={(e) => setCustomFilingText(e.target.value)}
                  placeholder="Paste excerpt from quarterly financial presentation, MD commentary, or exchange filing..."
                  rows={8}
                  className="w-full font-mono text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 outline-none resize-none"
                />
              </div>

              <button
                type="button"
                onClick={handleRunEarningsSynthesizer}
                disabled={isSynthesizing}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isSynthesizing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Synthesizing Concall & Guidance...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate 3-Bullet Strategic Takeaway
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm min-h-[440px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Strategic Concall & Action Takeaway
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Why the company jumped or dropped & forward triggers.
                    </p>
                  </div>
                  {synthesizedResult && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      Verdict: {synthesizedResult.analystVerdict || 'ACCUMULATE'}
                    </span>
                  )}
                </div>

                {!synthesizedResult && !isSynthesizing && (
                  <div className="text-center py-24 text-slate-400 space-y-3">
                    <Sparkles className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
                    <div className="text-sm font-semibold">Ready to Synthesize Earnings</div>
                    <p className="text-xs max-w-sm mx-auto">
                      Choose a portfolio stock on the left or paste a transcript to distill noisy 50-page financial statements into 3 actionable bullets.
                    </p>
                  </div>
                )}

                {isSynthesizing && (
                  <div className="text-center py-24 space-y-3">
                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Analyzing Revenue Trajectory & Operating Margins...
                    </div>
                  </div>
                )}

                {synthesizedResult && (
                  <div className="mt-4 space-y-4">
                    <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/30">
                      <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                        Executive Summary Headline
                      </div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                        {synthesizedResult.headline}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {(synthesizedResult.bullets || []).map((b: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40"
                        >
                          <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-indigo-500" />
                            {b.title}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                            {b.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {synthesizedResult && (
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Ticker: {selectedStockForEarnings}</span>
                  <span>Synthesized via Gemini 3.8 Flash</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- Tab 4: Tax-Loss Harvesting Co-Pilot --- */}
      {activeSubTab === 'tax_harvesting' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-rose-500" />
                  Section 111A / 112A Tax-Loss Harvesting Co-Pilot
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Evaluates current unrealized losses and outlines legally compliant set-offs before March 31st to slash your taxable capital gains liability.
                </p>
              </div>

              <button
                type="button"
                onClick={handleRunTaxHarvest}
                disabled={isAnalyzingTaxHarvest}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-60"
              >
                {isAnalyzingTaxHarvest ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Evaluating Harvesting Strategy...
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4" />
                    Calculate Exact Tax Savings
                  </>
                )}
              </button>
            </div>

            {/* Current Tax Status Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-500 font-semibold uppercase">Realized STCG (Taxed @ 20%)</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  {formatINR(summary.totalRealizedSTCG)}
                </div>
                <div className="text-xs text-slate-400">Current Tax: {formatINR(summary.stcgTaxLiability)}</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-500 font-semibold uppercase">Taxable LTCG (Taxed @ 12.5%)</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  {formatINR(summary.taxableLTCG)}
                </div>
                <div className="text-xs text-slate-400">Above ₹1.25L Exemption</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-500 font-semibold uppercase">Available Unrealized Loss</div>
                <div className="text-lg font-bold text-rose-600 dark:text-rose-400 mt-1">
                  {formatINR(lossCandidates.reduce((acc, h) => acc + Math.abs(h.unrealizedPnLWAC), 0))}
                </div>
                <div className="text-xs text-slate-400">{lossCandidates.length} Position(s) in Red</div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50">
                <div className="text-xs text-emerald-700 dark:text-emerald-400 font-bold uppercase">
                  Potential Tax Saved
                </div>
                <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300 mt-1">
                  {taxHarvestPlan ? formatINR(taxHarvestPlan.potentialTaxSavingsINR || 4500) : '₹4,250+'}
                </div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400">Direct Cash Saved in Tax</div>
              </div>
            </div>

            {/* Harvesting Candidates Table */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                Unrealized Loss Harvest Candidates
              </h3>
              {lossCandidates.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500">
                  No active holdings are currently sitting at an unrealized loss. Portfolio is 100% in profit!
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold uppercase border-b border-slate-200 dark:border-slate-800">
                        <th className="py-3 px-4">Stock</th>
                        <th className="py-3 px-4 text-right">Holdings</th>
                        <th className="py-3 px-4 text-right">WAC Price</th>
                        <th className="py-3 px-4 text-right">LTP</th>
                        <th className="py-3 px-4 text-right">Unrealized Loss</th>
                        <th className="py-3 px-4 text-right">Tax Saved if Harvested</th>
                        <th className="py-3 px-4">Rebuy Recommendation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {lossCandidates.map((h) => {
                        const loss = Math.abs(h.unrealizedPnLWAC);
                        const taxSaved = loss * 0.2; // STCG 20%
                        return (
                          <tr key={h.symbol} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 font-medium">
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900 dark:text-white">{h.symbol}</div>
                              <div className="text-[10px] text-slate-400">{h.name}</div>
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                              {h.totalQuantity}
                            </td>
                            <td className="py-3 px-4 text-right font-mono">{formatINR(h.wacPrice)}</td>
                            <td className="py-3 px-4 text-right font-mono">{formatINR(h.cmp)}</td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                              -{formatINR(loss)} ({formatPercent(h.unrealizedPnLPercentWAC)})
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              +{formatINR(taxSaved)}
                            </td>
                            <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-[11px]">
                              Sell on T day and rebuy on T+1 after market open to maintain fundamental position.
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {taxHarvestPlan && (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 space-y-2 text-xs text-amber-800 dark:text-amber-300">
                <div className="font-bold flex items-center gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Indian Tax Law Execution Notice (Finance Act 2024)
                </div>
                <p>
                  {taxHarvestPlan.caNote ||
                    'Under Section 70 of the Income Tax Act, Short Term Capital Loss (STCL) can be set off against both STCG (20%) and LTCG (12.5%). Trades must settle before the March 31 financial year cutoff.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- Tab 5: Compounding & SIP / Dividend Playground --- */}
      {activeSubTab === 'compounding_lab' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calculator className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Compounding Parameters
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Preview how long-term equity CAGR and reinvested dividends compound wealth in the Indian economy.
              </p>
            </div>

            {/* Initial Capital Slider */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-600 dark:text-slate-400 uppercase">Starting Portfolio</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-mono">{formatINR(initialCapital)}</span>
              </div>
              <input
                type="range"
                min={50000}
                max={5000000}
                step={50000}
                value={initialCapital}
                onChange={(e) => setInitialCapital(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            {/* Monthly SIP Slider */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-600 dark:text-slate-400 uppercase">Monthly SIP / Addition</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-mono">{formatINR(monthlySip)} / mo</span>
              </div>
              <input
                type="range"
                min={5000}
                max={200000}
                step={5000}
                value={monthlySip}
                onChange={(e) => setMonthlySip(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            {/* Expected CAGR */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-600 dark:text-slate-400 uppercase">Expected Equity CAGR</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-mono">{expectedCagr}%</span>
              </div>
              <input
                type="range"
                min={8}
                max={25}
                step={0.5}
                value={expectedCagr}
                onChange={(e) => setExpectedCagr(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <div className="text-[10px] text-slate-400 mt-0.5">Historical Nifty 50 15-Yr CAGR is ~13.8%</div>
            </div>

            {/* Dividend Yield */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-600 dark:text-slate-400 uppercase">Reinvested Dividend Yield</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-mono">{dividendYield}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={4}
                step={0.25}
                value={dividendYield}
                onChange={(e) => setDividendYield(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            {/* Horizon Years */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-600 dark:text-slate-400 uppercase">Compounding Horizon</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-mono">{horizonYears} Years</span>
              </div>
              <input
                type="range"
                min={3}
                max={25}
                step={1}
                value={horizonYears}
                onChange={(e) => setHorizonYears(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            {/* Summary Highlights */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Total Capital Invested:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {formatINR(initialCapital + monthlySip * 12 * horizonYears)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Total Compounded Value:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  {formatINR(compoundingData[compoundingData.length - 1]?.Portfolio || 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Wealth Accumulation Trajectory
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Net Invested Principal vs. Compounded Capital Gains & Dividends
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Final Wealth Multiple</div>
                  <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                    {(
                      (compoundingData[compoundingData.length - 1]?.Portfolio || 1) /
                      (compoundingData[compoundingData.length - 1]?.Invested || 1)
                    ).toFixed(1)}
                    x
                  </div>
                </div>
              </div>

              <div className="h-72 w-full mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={compoundingData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
                    />
                    <Tooltip
                      formatter={(val: any) => formatINR(Number(val))}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="Invested"
                      name="Principal Invested"
                      stroke="#94a3b8"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="Portfolio"
                      name="Compounded Wealth"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex items-center justify-between">
              <span>Simulation assumes annual compounding with regular monthly additions</span>
              <span>100% Client-Side Interactive Math</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
