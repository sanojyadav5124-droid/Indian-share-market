import React, { useState } from 'react';
import {
  BookOpen,
  HelpCircle,
  ShieldAlert,
  Layers,
  Sparkles,
  Calculator,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileCode,
  LayoutDashboard,
  PieChart,
  ReceiptText,
  Calendar,
  Brain,
  Download,
  Settings,
  Users,
  TrendingUp,
  Landmark,
  ShieldCheck,
  RefreshCw,
  Coins,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const UserManualView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('all');

  const navigationItems = [
    { id: 'all', label: 'Complete Handbook' },
    { id: 'architecture', label: '1. Architecture & Storage Access API' },
    { id: 'dashboard', label: '2. Executive Dashboard Tab' },
    { id: 'holdings', label: '3. Holdings & FIFO/WAC Tab' },
    { id: 'ledger', label: '4. Transaction Ledger & Friction' },
    { id: 'tax_engine', label: '5. Capital Gains & Visual Tax Impact' },
    { id: 'calendar', label: '6. Dalal Street Catalyst Calendar' },
    { id: 'ai_copilot', label: '7. Gemini 3.8 Flash AI Co-Pilot' },
    { id: 'corporate_actions', label: '8. Corporate Actions & Rebasing' },
    { id: 'exports_sync', label: '9. Exports, Auto-Backup & Sync' },
    { id: 'view_modes', label: '10. View Modes & Mobile PWA' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Page Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 shadow-2xs">
        <div className="flex items-center gap-2.5 text-xs font-mono text-zinc-500 uppercase tracking-wider">
          <BookOpen className="w-4 h-4 text-emerald-600" />
          <span>Official Documentation & Indian Tax Accounting Manual</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight mt-2">
          SKYadav Portfolio & FIFO Tax Engine Manual
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 mt-2 leading-relaxed">
          The definitive reference guide for multi-demat family wealth tracking, First-In First-Out (FIFO) tax lot allocation, Weighted Average Cost (WAC) inventory accounting, corporate actions cost rebasing, Dalal Street catalyst scheduling, and Gemini 3.8 Flash AI portfolio intelligence.
        </p>

        {/* Section Quick Jump Filter */}
        <div className="mt-6 pt-5 border-t border-zinc-100 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs font-semibold text-zinc-500 shrink-0">Filter Chapter:</span>
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                activeSection === item.id
                  ? 'bg-zinc-900 text-white font-semibold shadow-2xs'
                  : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Critical Data Safety & Local Storage Notice */}
      <div className="p-5 sm:p-6 rounded-2xl border border-amber-200 bg-amber-50/70 shadow-2xs">
        <div className="flex items-start gap-3.5">
          <ShieldAlert className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h2 className="text-sm sm:text-base font-bold text-amber-900">
              Data Sovereignty Mandate: 100% Local-First & Zero Cloud Telemetry
            </h2>
            <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
              This application has <strong>ZERO structural dependency on any external database or private remote server</strong>. All trade ledgers, family PAN records, demat numbers, cash balances, and custom market prices reside exclusively inside your device's browser <code className="bg-amber-100/90 px-1.5 py-0.5 rounded font-mono font-bold text-amber-950">localStorage</code>.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-amber-900">
              <div className="p-3 bg-amber-100/50 rounded-xl border border-amber-200/80">
                <span className="font-bold block mb-1">⚠️ Cache Clearing</span>
                <span>Clearing your browser cache or site data will wipe stored ledgers. Always keep a downloaded JSON backup.</span>
              </div>
              <div className="p-3 bg-amber-100/50 rounded-xl border border-amber-200/80">
                <span className="font-bold block mb-1">🔒 Private / Incognito</span>
                <span>Incognito sessions discard all state upon window closing. Use standard browsing mode for persistence.</span>
              </div>
              <div className="p-3 bg-amber-100/50 rounded-xl border border-amber-200/80">
                <span className="font-bold block mb-1">💾 Periodic Backups</span>
                <span>Click "Backup / Sync" to save an encrypted snapshot to your Google Drive, iCloud, or local hard disk.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CHAPTER 1: Core Architecture & Synchronization */}
      {(activeSection === 'all' || activeSection === 'architecture') && (
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-zinc-200 shadow-2xs space-y-5">
          <div className="flex items-center gap-2.5 text-zinc-900">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h2 className="text-lg font-bold tracking-tight">
              System Architecture, Multi-Tab Broadcast & Cross-Device Sync
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
            The platform provides bank-grade privacy by eliminating central storage vectors. Financial calculations (XIRR, FIFO lot peeling, statutory STT/stamp duty computations) are executed directly on client CPU threads.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
              <div className="font-bold text-zinc-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>HTML5 Local Persistence</span>
              </div>
              <p className="text-zinc-600 leading-relaxed text-[11px]">
                Transactions and market quotes are atomically serialized into <code className="bg-zinc-200/80 px-1 py-0.5 rounded font-mono text-zinc-800">localStorage</code> with key prefixes <code className="font-mono text-zinc-800">portfolio_transactions_v2</code> and <code className="font-mono text-zinc-800">portfolio_prices_v2</code>.
              </p>
            </div>

            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
              <div className="font-bold text-zinc-900 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-indigo-600" />
                <span>Multi-Tab Broadcast Channel</span>
              </div>
              <p className="text-zinc-600 leading-relaxed text-[11px]">
                Opening the application in multiple browser tabs triggers real-time <code className="bg-zinc-200/80 px-1 py-0.5 rounded font-mono text-zinc-800">window.storage</code> events. Logging a trade in Tab 1 updates charts and totals in Tab 2 instantly with zero page reloads.
              </p>
            </div>

            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
              <div className="font-bold text-zinc-900 flex items-center gap-2">
                <Download className="w-4 h-4 text-amber-600" />
                <span>Portable JSON Snapshots</span>
              </div>
              <p className="text-zinc-600 leading-relaxed text-[11px]">
                Transferring portfolios across devices (e.g. desktop to smartphone) is handled via atomic JSON export files. Uploading the JSON file on the target device restores all family accounts and trade histories in &lt;1 second.
              </p>
            </div>
          </div>

          {/* Storage Access API & Auto-Backup Deep Dive */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-3">
            <div className="flex items-center gap-2 font-bold text-emerald-950 text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Native Storage Access API & Automated Weekly Local Backups</span>
            </div>
            <p className="text-xs text-emerald-900 leading-relaxed">
              To guarantee bulletproof data security without relying on insecure cloud telemetry or external third-party sync servers, the application leverages standard modern browser web platform APIs:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
              <div className="p-3 bg-white rounded-lg border border-emerald-200 space-y-1">
                <span className="font-bold text-zinc-900 block">1. File System Access API</span>
                <p className="text-zinc-600 text-[11px] leading-relaxed">
                  Allows you to authorize a dedicated backup directory on your local disk (such as <code>Documents/SKYadav_Backups</code>). Once authorized, the app writes timestamped <code>.json</code> backups directly to disk without manual browser download prompts.
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-emerald-200 space-y-1">
                <span className="font-bold text-zinc-900 block">2. Persistent Storage Flag</span>
                <p className="text-zinc-600 text-[11px] leading-relaxed">
                  Requests the browser's <code>navigator.storage.persist()</code> quota lease. This upgrades browser storage from 'best-effort' to 'persistent', preventing automated operating system disk cleanup or browser eviction from wiping your portfolio.
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-emerald-200 space-y-1">
                <span className="font-bold text-zinc-900 block">3. Weekly Auto-Scheduler</span>
                <p className="text-zinc-600 text-[11px] leading-relaxed">
                  Whenever you use or open the application, an autonomous internal background daemon calculates whether 7 days have elapsed since your previous snapshot. If due, it takes a clean local snapshot automatically.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CHAPTER 2: Executive Dashboard Tab */}
      {(activeSection === 'all' || activeSection === 'dashboard') && (
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-zinc-200 shadow-2xs space-y-5">
          <div className="flex items-center gap-2.5 text-zinc-900">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-sm">
              <LayoutDashboard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">
                Tab 1: Executive Wealth Dashboard
              </h2>
              <span className="text-xs text-zinc-500">Holistic household valuation, benchmark alpha, and asset distribution</span>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-zinc-600 leading-relaxed">
            <p>
              The <strong>Executive Dashboard</strong> serves as the central command center for your entire family wealth ledger. Key functional sections include:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs text-zinc-700">
              <li>
                <strong>Household Net Worth Header:</strong> Displays aggregate net worth (Equities + Mutual Funds + Liquid Cash reserves) with PAN indicator and quick-action toolbars (Live Price Sync, Export Reports, Offline Price Manager, Backup/Sync).
              </li>
              <li>
                <strong>Primary 4-Metric Grid:</strong>
                <ul className="list-circle pl-5 mt-1 space-y-1 text-zinc-600">
                  <li><strong>Total Invested Capital:</strong> Dynamically calculated under your active costing lens (WAC or FIFO).</li>
                  <li><strong>Current Market Value:</strong> Total holdings value computed against latest Current Market Prices (CMP).</li>
                  <li><strong>Total Unrealized P&L:</strong> Absolute gains/losses in INR along with total percentage return.</li>
                  <li><strong>1-Day Market Movement:</strong> Real-time daily gain or loss calculated against previous day's market close.</li>
                </ul>
              </li>
              <li>
                <strong>Alpha vs Benchmark Comparison:</strong> Compares your portfolio return percentage against premier Indian indices (<strong>NIFTY 50</strong>, <strong>NIFTY NEXT 50</strong>, <strong>NIFTY SMALLCAP 250</strong>) with live alpha calculations (+/-%).
              </li>
              <li>
                <strong>Interactive Distribution Charts:</strong> Dynamic visual breakdown by <strong>Sector</strong> (Financials, IT, Auto, Oil & Gas, Capital Goods, Pharma, FMCG, Chemicals) and <strong>AMFI Market Cap</strong> (Large Cap, Mid Cap, Small Cap, Cash Reserve) with Donut and Bar chart renderers.
              </li>
              <li>
                <strong>Family Demat Breakdown:</strong> Visual cards detailing individual equity values, liquid cash balances, and percentage shares for each registered family member (Self, Spouse, Parent, HUF).
              </li>
              <li>
                <strong>Top Gainers, Allocations & Corporate Actions Feed:</strong> Instant lists highlighting your biggest winning scrips, top concentrated positions, and recent dividend/bonus/split ledger events.
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* CHAPTER 3: Holdings & FIFO/WAC Analytics Tab */}
      {(activeSection === 'all' || activeSection === 'holdings') && (
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-zinc-200 shadow-2xs space-y-5">
          <div className="flex items-center gap-2.5 text-zinc-900">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">
                Tab 2: Holdings Inventory & FIFO Lot Inspector
              </h2>
              <span className="text-xs text-zinc-500">Dual inventory costing, multi-parameter filtering, and lot peeling inspector</span>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-zinc-600 leading-relaxed">
            <p>
              The <strong>Holdings Analytics</strong> tab presents a granular view of every open position held in your demat accounts.
            </p>

            {/* Comparison Table */}
            <div className="overflow-x-auto border border-zinc-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-700 font-bold">
                  <tr>
                    <th className="p-3">Costing Lens</th>
                    <th className="p-3">Accounting Formula</th>
                    <th className="p-3">Primary Use Case</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 text-zinc-600">
                  <tr>
                    <td className="p-3 font-bold text-zinc-900">Weighted Average Cost (WAC)</td>
                    <td className="p-3 font-mono text-[11px]">(Old_Qty × Old_Avg + Buy_Cost) / Total_Qty</td>
                    <td className="p-3">Default broker view (Zerodha/Groww) for true blended portfolio performance.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-zinc-900">First-In First-Out (FIFO)</td>
                    <td className="p-3 font-mono text-[11px]">Σ (Open_Lot_Qty × Lot_Net_Cost) / Total_Qty</td>
                    <td className="p-3">Mandated by Indian Income Tax Department for capital gains computation.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="space-y-2 text-xs text-zinc-700">
              <span className="font-bold text-zinc-900 block">Interactive Controls on this Tab:</span>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Live Search Bar:</strong> Instant fuzzy search across stock symbols, full company names, or sectors.</li>
                <li><strong>Multi-Dimensional Filters:</strong> Filter by Asset Class (All / Equities / Mutual Funds), Sector (IT, Financials, Auto, etc.), or Market Cap (Large, Mid, Small).</li>
                <li><strong>View Switcher (Card vs Table):</strong> Toggle between full Desktop Grid and Mobile-Optimized Card view.</li>
                <li><strong>FIFO Lots Inspector Modal:</strong> Click the "FIFO Lots" button on any scrip to inspect every open buy tranche, original acquisition date, holding duration in days, net purchase cost, and short/long-term tax eligibility.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* CHAPTER 4: Transaction Ledger & Statutory Friction Engine */}
      {(activeSection === 'all' || activeSection === 'ledger') && (
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-zinc-200 shadow-2xs space-y-5">
          <div className="flex items-center gap-2.5 text-zinc-900">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm">
              <ReceiptText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">
                Tab 3: Transaction Ledger & Statutory Friction Engine
              </h2>
              <span className="text-xs text-zinc-500">Immutable trade history, statutory charge estimation, and cash balance routing</span>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-zinc-600 leading-relaxed">
            <p>
              Every corporate action, buy, sell, or dividend is permanently recorded with full audit trail capabilities.
            </p>

            {/* Friction breakdown */}
            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
              <span className="font-bold text-zinc-900 text-xs block">
                Indian Statutory Charges Calculated Automatically on Orders:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 bg-white rounded-lg border border-zinc-200">
                  <span className="font-bold text-zinc-900 block">STT / CTT</span>
                  <span className="text-zinc-500 text-[11px]">0.1% on Equity Delivery (Buy & Sell); 0.001% on MF redemption</span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-zinc-200">
                  <span className="font-bold text-zinc-900 block">Stamp Duty</span>
                  <span className="text-zinc-500 text-[11px]">0.015% on Equity Buy; 0.005% on Mutual Fund purchase</span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-zinc-200">
                  <span className="font-bold text-zinc-900 block">Exchange Charges</span>
                  <span className="text-zinc-500 text-[11px]">NSE 0.00345% / BSE 0.00375% on total turnover</span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-zinc-200">
                  <span className="font-bold text-zinc-900 block">SEBI Fee + GST</span>
                  <span className="text-zinc-500 text-[11px]">₹10/crore SEBI turnover fee + 18% GST on exchange and broker charges</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-zinc-600">
              When logging a trade, checking <strong>"Route from / to Cash Balance"</strong> automatically debits or credits the cash ledger of the assigned family profile, ensuring cash reserves reflect real bank demat movements.
            </p>
          </div>
        </div>
      )}

      {/* CHAPTER 5: Capital Gains Tax Engine (Finance Act 2024) */}
      {(activeSection === 'all' || activeSection === 'tax_engine') && (
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-zinc-200 shadow-2xs space-y-5">
          <div className="flex items-center gap-2.5 text-zinc-900">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-sm">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">
                Tab 4: Indian Capital Gains Tax Engine (Finance Act 2024)
              </h2>
              <span className="text-xs text-zinc-500">Union Budget 2024 compliance: 20% STCG, 12.5% LTCG & ₹1.25L annual exemption</span>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-zinc-600 leading-relaxed">
            <p>
              Capital gains calculations strictly reflect the amendments introduced in the <strong>Finance (No. 2) Act 2024</strong>:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-950 text-xs">Section 111A — Short-Term Capital Gains (STCG)</span>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900">20% Flat</span>
                </div>
                <p className="text-xs text-amber-900 leading-relaxed">
                  Applies to listed equity shares and equity mutual funds sold within a holding duration of <strong>less than 365 days</strong>. Increased from 15% to 20% under the revised tax code.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-950 text-xs">Section 112A — Long-Term Capital Gains (LTCG)</span>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-200 text-indigo-900">12.5% &gt; ₹1.25L</span>
                </div>
                <p className="text-xs text-indigo-900 leading-relaxed">
                  Applies to listed equity assets held for <strong>365 days or more</strong>. The annual tax-free exemption limit is set at <strong>₹1,25,000 per financial year</strong>. Gains exceeding ₹1.25 Lakh are taxed at 12.5% (previously 10%).
                </p>
              </div>
            </div>

            {/* Visual Tax Impact Engine Section */}
            <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-3">
              <span className="font-bold text-emerald-950 text-sm flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-700" />
                <span>Interactive Visual Tax Impact Dashboard: 3 Analytical Perspectives</span>
              </span>
              <p className="text-xs text-emerald-900 leading-relaxed">
                The visualizer translates complex tax lot algebra into three intuitive, interactive graphic models to guide your execution:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                <div className="p-3 bg-white rounded-lg border border-emerald-200/80 space-y-1">
                  <span className="font-bold text-zinc-900 text-xs block">1. Realized Tax Waterfall</span>
                  <p className="text-[11px] text-zinc-600">
                    A visual breakdown contrasting gross capital profits against the statutory ₹1.25L Section 112A exemption, isolating exact taxable amounts for 20% STCG and 12.5% LTCG, and projecting total net post-tax capital retained.
                  </p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-emerald-200/80 space-y-1">
                  <span className="font-bold text-zinc-900 text-xs block">2. Projected Liquidation Tax</span>
                  <p className="text-[11px] text-zinc-600">
                    Interactive liquidation simulation slider (25%, 50%, 75%, 100%). It walks through every open FIFO lot and models the exact advance tax liability if you sold positions today, calculating the effective blended portfolio tax rate.
                  </p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-emerald-200/80 space-y-1">
                  <span className="font-bold text-zinc-900 text-xs block">3. Exemption & Loss Harvesting</span>
                  <p className="text-[11px] text-zinc-600">
                    Visual tracking of the ₹1,25,000 annual exemption limit. Displays how much tax-free LTCG headroom remains before March 31st, alongside an audit of unrealized loss positions available to harvest and offset taxable gains.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
              <span className="font-bold text-zinc-900 text-xs block">Realized Tax Lots Audit Table:</span>
              <p className="text-xs text-zinc-600">
                Every completed sale is mapped to its exact purchase tranche date, displaying holding days, STCG/LTCG classification, net proceeds, net cost, realized gain/loss, and precise tax liability.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CHAPTER 6: Dalal Street Catalyst & Earnings Calendar */}
      {(activeSection === 'all' || activeSection === 'calendar') && (
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-zinc-200 shadow-2xs space-y-5">
          <div className="flex items-center gap-2.5 text-zinc-900">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-sm">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">
                Tab 5: Dalal Street Catalyst & Earnings Calendar
              </h2>
              <span className="text-xs text-zinc-500">Quarterly results, RBI MPC policy, monthly F&O expiry, and AMFI rebalances</span>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-zinc-600 leading-relaxed">
            <p>
              The <strong>Catalyst Calendar</strong> keeps you ahead of major market-moving dates in Indian equity markets:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <span className="font-bold text-zinc-900 block">Quarterly Results</span>
                <span className="text-zinc-500 text-[11px]">Board concalls, interim dividends, and guidance releases for held scrips (TCS, Infosys, HDFC Bank, Reliance).</span>
              </div>
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <span className="font-bold text-zinc-900 block">RBI MPC Policy</span>
                <span className="text-zinc-500 text-[11px]">Bi-monthly monetary policy announcements, repo rate verdicts, and CPI inflation projections.</span>
              </div>
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <span className="font-bold text-zinc-900 block">F&O Expiries</span>
                <span className="text-zinc-500 text-[11px]">Last Thursday monthly settlement dates for NSE/BSE Nifty and single-stock derivative contracts.</span>
              </div>
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <span className="font-bold text-zinc-900 block">BSE/NSE Holidays</span>
                <span className="text-zinc-500 text-[11px]">Official exchange closure dates including Diwali Muhurat trading, Holi, Eid, and Independence Day.</span>
              </div>
            </div>

            <p className="text-xs text-zinc-600">
              Features include <strong>"My Holdings Only"</strong> filter, interactive reminder alert toggles, countdown badges (Today, Tomorrow, In X days/weeks), and custom event creation.
            </p>
          </div>
        </div>
      )}

      {/* CHAPTER 7: Gemini 3.8 Flash AI Co-Pilot Suite */}
      {(activeSection === 'all' || activeSection === 'ai_copilot') && (
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-zinc-200 shadow-2xs space-y-5">
          <div className="flex items-center gap-2.5 text-zinc-900">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-2xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">
                Tab 6: Gemini 3.8 Flash AI Co-Pilot Suite
              </h2>
              <span className="text-xs text-zinc-500">Zero-regex CAS statement ingestion, mutual fund overlap audit, and tax harvester</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            {/* 1. CAS & Trade Ingest */}
            <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/60 space-y-2">
              <div className="flex items-center gap-2 font-bold text-zinc-900">
                <span className="w-5 h-5 rounded bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">1</span>
                <span>CAS & Broker Statement Parser</span>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Paste raw unstructured text from your NSDL/CDSL monthly CAS statements or Zerodha/Groww/Upstox tradebooks. Gemini extracts symbols, quantities, and buy prices with zero brittle regex patterns, and imports them directly into your active profile.
              </p>
            </div>

            {/* 2. Overlap Audit */}
            <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/60 space-y-2">
              <div className="flex items-center gap-2 font-bold text-zinc-900">
                <span className="w-5 h-5 rounded bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">2</span>
                <span>Mutual Fund & Equity Overlap Audit</span>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Performs look-through analysis across your direct stock holdings and top mutual funds (Parag Parikh Flexi Cap, Mirae Asset Large Cap, Quant Small Cap) to detect hidden concentration risks and duplicate stock weights.
              </p>
            </div>

            {/* 3. Earnings Synthesizer */}
            <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/60 space-y-2">
              <div className="flex items-center gap-2 font-bold text-zinc-900">
                <span className="w-5 h-5 rounded bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">3</span>
                <span>Earnings & Concall Synthesizer</span>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Generates instant executive summaries of quarterly results, margin expansions, management guidance, and deal wins for held companies.
              </p>
            </div>

            {/* 4. Tax-Loss Harvester */}
            <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/60 space-y-2">
              <div className="flex items-center gap-2 font-bold text-zinc-900">
                <span className="w-5 h-5 rounded bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">4</span>
                <span>Tax-Loss Harvesting Optimizer</span>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Scans open positions with unrealized losses to calculate exact tax-harvesting sale orders, helping you offset realized STCG/LTCG liabilities before the March 31st fiscal year close.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CHAPTER 8: Corporate Actions & Rebasing */}
      {(activeSection === 'all' || activeSection === 'corporate_actions') && (
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-zinc-200 shadow-2xs space-y-5">
          <div className="flex items-center gap-2.5 text-zinc-900">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">
                Chapter 8: Corporate Actions Workflows & Cost Rebasing
              </h2>
              <span className="text-xs text-zinc-500">Section 55 bonus issue rules, stock split ratio adjustments, and demergers</span>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-zinc-600 leading-relaxed">
            {/* Bonus */}
            <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-2">
              <span className="font-bold text-zinc-900 text-sm flex items-center gap-2">
                <span>Bonus Issue (e.g. 1:1, 4:1)</span>
                <span className="text-[10px] font-mono bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-bold">
                  Section 55 Income Tax Act
                </span>
              </span>
              <p className="text-xs text-zinc-600">
                Bonus shares allotted have an statutory <strong>acquisition cost of ₹0</strong>. The system records bonus shares as a distinct zero-cost lot while reducing the blended WAC across your holding, preserving tax neutrality until redemption.
              </p>
            </div>

            {/* Split */}
            <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-2">
              <span className="font-bold text-zinc-900 text-sm flex items-center gap-2">
                <span>Stock Split (e.g. 1:2, 1:5, 1:10)</span>
                <span className="text-[10px] font-mono bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-bold">
                  Face Value Division
                </span>
              </span>
              <p className="text-xs text-zinc-600">
                In a 1:2 split, the quantity of every existing buy lot doubles while the net purchase price per share is halved. Original purchase dates and LTCG/STCG holding periods are strictly preserved.
              </p>
            </div>

            {/* Demerger */}
            <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-2">
              <span className="font-bold text-zinc-900 text-sm flex items-center gap-2">
                <span>Demerger Cost Apportionment</span>
                <span className="text-[10px] font-mono bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold">
                  Section 49(2C)
                </span>
              </span>
              <p className="text-xs text-zinc-600">
                When a business demerges (e.g., Jio Financial Services from Reliance), original purchase costs are apportioned between parent and resulting entity based on net book asset ratios.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CHAPTER 9: Data Backups, Multi-Format Exports & Audit Reports */}
      {(activeSection === 'all' || activeSection === 'exports_sync') && (
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-zinc-200 shadow-2xs space-y-5">
          <div className="flex items-center gap-2.5 text-zinc-900">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">
                Chapter 9: Backups, Multi-Format Exports & Printable Valuation Audit
              </h2>
              <span className="text-xs text-zinc-500">CSV data exports, JSON database backups, and standalone HTML print reports</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1">
              <span className="font-bold text-zinc-900 block">Holdings CSV</span>
              <p className="text-zinc-500 text-[11px]">Symbol, company name, asset type, sector, market cap, quantity, WAC price, FIFO price, CMP, and unrealized P&L.</p>
            </div>
            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1">
              <span className="font-bold text-zinc-900 block">Ledger CSV</span>
              <p className="text-zinc-500 text-[11px]">Full trade audit trail including trade type, execution date, quantity, price, statutory charges, and notes.</p>
            </div>
            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1">
              <span className="font-bold text-zinc-900 block">Tax Statement CSV</span>
              <p className="text-zinc-500 text-[11px]">Realized capital gains lots with purchase date, sale date, holding days, STCG/LTCG tag, and tax liability.</p>
            </div>
            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1">
              <span className="font-bold text-zinc-900 block">Printable HTML Report</span>
              <p className="text-zinc-500 text-[11px]">Self-contained, formal Chartered Accountant audit printout complete with charts, demat summaries, and signature block.</p>
            </div>
          </div>

          {/* Storage Access API & Weekly Auto-Backup User Workflow */}
          <div className="p-5 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-4">
            <div className="flex items-center gap-2 font-bold text-indigo-950 text-sm">
              <ShieldCheck className="w-4 h-4 text-indigo-700" />
              <span>User Guide: Configuring Storage Access API & Weekly Auto-Backups</span>
            </div>
            <p className="text-xs text-indigo-900 leading-relaxed">
              Follow these three simple steps to establish an indestructible offline backup system on your computer or phone:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 bg-white rounded-lg border border-indigo-200/80 space-y-1.5">
                <span className="font-bold text-zinc-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">1</span>
                  <span>Authorize Local Folder</span>
                </span>
                <p className="text-[11px] text-zinc-600 leading-relaxed">
                  Open <strong>Backup & Sync</strong>, switch to the <em>Storage Access API & Auto-Backup</em> tab, and click <strong>"Connect Backup Storage Folder"</strong>. Choose any local directory (e.g. <code>Documents/Backups</code> or a synced Google Drive / OneDrive folder).
                </p>
              </div>

              <div className="p-3.5 bg-white rounded-lg border border-indigo-200/80 space-y-1.5">
                <span className="font-bold text-zinc-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">2</span>
                  <span>Enable Weekly Cadence</span>
                </span>
                <p className="text-[11px] text-zinc-600 leading-relaxed">
                  Ensure the <strong>Weekly Auto-Backup</strong> switch is toggled <em>Active</em>. The internal scheduler checks your previous backup date on every session and automatically generates an encrypted, complete snapshot if 7 days have passed.
                </p>
              </div>

              <div className="p-3.5 bg-white rounded-lg border border-indigo-200/80 space-y-1.5">
                <span className="font-bold text-zinc-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">3</span>
                  <span>Rolling Snapshot Rollbacks</span>
                </span>
                <p className="text-[11px] text-zinc-600 leading-relaxed">
                  The system maintains the last 8 snapshots in isolated browser storage. If you accidentally enter wrong trades or want to compare historical dates, click <strong>"Restore"</strong> next to any historical snapshot to rollback instantly.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CHAPTER 10: Display Modes, Mobile Layout & PWA Offline Installation */}
      {(activeSection === 'all' || activeSection === 'view_modes') && (
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-zinc-200 shadow-2xs space-y-5">
          <div className="flex items-center gap-2.5 text-zinc-900">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-800 flex items-center justify-center font-bold text-sm">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">
                Chapter 10: Display View Modes & Progressive Web App (PWA) Offline Use
              </h2>
              <span className="text-xs text-zinc-500">Auto-responsive, mobile phone view, desktop grid, and offline installation</span>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-zinc-600 leading-relaxed">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1">
                <span className="font-bold text-zinc-900 block">Auto (Responsive)</span>
                <p className="text-zinc-500 text-[11px]">Dynamically adapts layout based on screen width (desktop monitors, tablets, and smartphones).</p>
              </div>
              <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1">
                <span className="font-bold text-zinc-900 block">Phone View (Mobile)</span>
                <p className="text-zinc-500 text-[11px]">Forces mobile-friendly card stacks, bottom thumb-nav bar, and enlarged touch targets even on large screens.</p>
              </div>
              <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1">
                <span className="font-bold text-zinc-900 block">Desktop (Full Grid)</span>
                <p className="text-zinc-500 text-[11px]">Expands maximum columns and full data table grids for wide multi-monitor setups.</p>
              </div>
            </div>

            <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>How to Install as a Native App (PWA):</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-emerald-800 text-[11px]">
                <li><strong>Chrome / Edge (Desktop):</strong> Click "Install App" in the top banner or the browser address bar icon.</li>
                <li><strong>Apple iPhone / iPad (Safari):</strong> Tap the <em>Share</em> button at the bottom of Safari &rarr; select <strong>"Add to Home Screen"</strong>.</li>
                <li><strong>Android (Chrome):</strong> Tap the <em>Menu (3 dots)</em> &rarr; <strong>"Install app"</strong> or <strong>"Add to Home Screen"</strong>.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
