import React from 'react';
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
} from 'lucide-react';

export const UserManualView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Page Title */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-2xs">
        <div className="flex items-center gap-2.5 text-xs font-mono text-zinc-500 uppercase">
          <BookOpen className="w-4 h-4 text-emerald-600" />
          <span>Documentation & Indian Tax Accounting Manual</span>
        </div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight mt-1">
          Indian Wealth & FIFO Tax Engine Reference Guide
        </h1>
        <p className="text-sm text-zinc-600 mt-1">
          A definitive handbook for First-In, First-Out (FIFO) tax computations, inventory Weighted Average Cost (WAC) methodology, corporate actions rebasing, and client-side data sovereignty.
        </p>
      </div>

      {/* Critical Data Safety Warning */}
      <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/70 shadow-2xs">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-amber-900">
              Data Sovereignty Warning (100% Local-First & Zero Cloud Runtime)
            </h2>
            <p className="text-xs text-amber-800 leading-relaxed">
              This application has <strong>ZERO structural runtime dependency</strong> on any remote database or external cloud servers. All transactions, family member profiles, cash ledgers, and market pricing live exclusively within your browser's <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-amber-900">localStorage</code>.
            </p>
            <div className="text-xs text-amber-800 leading-relaxed font-medium">
              Important precautions:
              <ul className="list-disc pl-5 mt-1 space-y-1 font-normal">
                <li>Clearing your browser's cookies, site data, or cache will permanently delete your stored records.</li>
                <li>Using browser Private / Incognito browsing mode prevents data from persisting across sessions.</li>
                <li>
                  <strong>Mandatory practice:</strong> Regularly use the <strong>"Backup / Sync"</strong> button to download a JSON snapshot to your local computer, phone, or private cloud storage.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* NEW CHAPTER: Foundation Architecture & How Sync Works */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-2xs space-y-5">
        <div className="flex items-center gap-2 text-zinc-900">
          <HelpCircle className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base font-bold tracking-tight">
            Foundation Operations: Local Storage, PWA Offline & How Sync Works
          </h2>
        </div>

        <p className="text-xs text-zinc-600 leading-relaxed">
          SKYadav portfolio App is engineered as a <strong>100% sovereign, local-first progressive web application</strong>. Unlike traditional fintech portals that store your sensitive trade logs and PAN records on third-party remote databases, here all financial computation, tax audits, and data persistence remain exclusively on your local hardware.
        </p>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
            <div className="font-bold text-zinc-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs">1</span>
              <span>Local-First Persistence</span>
            </div>
            <p className="text-zinc-600 leading-relaxed text-[11px]">
              Every trade logged, price updated, or family member registered is immediately written synchronously to your browser's HTML5 <code className="bg-zinc-200/80 px-1 py-0.2 rounded font-mono">localStorage</code>. Closing the browser tab, shutting down your device, or restarting your computer preserves your data completely.
            </p>
          </div>

          <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
            <div className="font-bold text-zinc-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center text-xs">2</span>
              <span>Multi-Tab Real-Time Sync</span>
            </div>
            <p className="text-zinc-600 leading-relaxed text-[11px]">
              If you open this portfolio across multiple browser tabs or windows simultaneously, the app uses background <code className="bg-zinc-200/80 px-1 py-0.2 rounded font-mono">storage</code> events. Logging a new order or adjusting a price in Tab 1 broadcasts instantly to Tab 2 and Tab 3 without requiring a page refresh.
            </p>
          </div>

          <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
            <div className="font-bold text-zinc-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs">3</span>
              <span>Device-to-Device Sync</span>
            </div>
            <p className="text-zinc-600 leading-relaxed text-[11px]">
              Because no remote servers hold your unencrypted financial data, moving your portfolio between your laptop, office PC, and mobile phone is executed via <strong>Portable JSON Backups</strong>. Export from Device A, store in your private Google Drive or USB, and click "Import Backup" on Device B.
            </p>
          </div>
        </div>

        {/* Step-by-Step Sync Guide */}
        <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3 text-xs">
          <span className="font-bold text-zinc-900 block">How to Sync Across Multiple Devices:</span>
          <div className="space-y-2 text-zinc-600">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded bg-zinc-200 text-zinc-800 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">A</span>
              <p>On your primary device, click <strong>"Backup / Sync" &rarr; "Download Backup (.json)"</strong>. This downloads an atomic snapshot containing all trades, family members, custom tickers, and market prices.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded bg-zinc-200 text-zinc-800 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">B</span>
              <p>Save or send this file to your personal cloud storage (Google Drive, iCloud, OneDrive) or email.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded bg-zinc-200 text-zinc-800 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">C</span>
              <p>Open the app on your phone, tablet, or secondary PC. Click <strong>"Backup / Sync" &rarr; "Choose or Drop JSON File"</strong> and select your saved backup. All records restore in 1 second.</p>
            </div>
          </div>
        </div>

        {/* PWA / Add to Screen Section */}
        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Progressive Web App (PWA): True Offline Installation</span>
          </div>
          <p className="text-emerald-800 leading-relaxed text-[11px]">
            This app is equipped with a Service Worker and Web App Manifest. You can install it natively on your computer or smartphone:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-emerald-800 text-[11px]">
            <li><strong>Desktop (Chrome/Edge):</strong> Click the <strong>"Install App"</strong> button in the banner or the install icon in the browser address bar.</li>
            <li><strong>iOS (Safari):</strong> Tap the <strong>Share</strong> button at the bottom of Safari &rarr; select <strong>"Add to Home Screen"</strong>.</li>
            <li><strong>Android (Chrome):</strong> Tap the <strong>"Add to Screen"</strong> button or Chrome menu &rarr; <strong>"Install app"</strong>.</li>
          </ul>
          <p className="text-emerald-700 text-[11px] font-medium pt-1">
            Once installed, the app works 100% offline without any internet connection. You can open it on flights, train journeys, or remote locations with zero network bars.
          </p>
        </div>

        {/* Family Member Operations Section */}
        <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-indigo-900">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Adding, Managing & Deleting Family Members</span>
          </div>
          <p className="text-indigo-800 leading-relaxed text-[11px]">
            Indian wealth is frequently managed at the family or Hindu Undivided Family (HUF) level while maintaining individual PAN separation for tax return filings:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-indigo-800 text-[11px]">
            <li>Click <strong>"Family"</strong> in the top header or banner to open the Family Profile Manager.</li>
            <li>Click <strong>"Add Family Member"</strong> to register a spouse, child, parent, sibling, or HUF account with their dedicated PAN, broker, and demat account number.</li>
            <li>To delete a member, click the trash icon next to their profile. A confirmation modal will warn you if transactions are assigned to that profile before removing.</li>
            <li>Switch between individual family members via the header selector to view their isolated tax reports, or click <strong>"Consolidated View"</strong> to inspect combined net worth.</li>
          </ul>
        </div>
      </div>

      {/* Chapter 1: The Indian FIFO Peeling Algorithm */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 text-zinc-900">
          <Calculator className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-bold tracking-tight">
            1. First-In, First-Out (FIFO) Tax Engine & Holding Boundary
          </h2>
        </div>

        <p className="text-xs text-zinc-600 leading-relaxed">
          Under the Indian Income Tax Act, capital gains on equity shares and equity-oriented mutual funds must be calculated using the First-In, First-Out (FIFO) methodology. When shares are sold from a demat account holding multiple purchase tranches, the shares acquired first are deemed to be sold first.
        </p>

        {/* Visual Walkthrough Box */}
        <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 space-y-3">
          <span className="text-xs font-semibold text-zinc-900 block">
            Example: Partial Sale Lot Peeling
          </span>
          <div className="space-y-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-white border border-zinc-200 flex items-center justify-between">
              <div>
                <span className="text-zinc-400">Tranche 1 (10 Jan 2023):</span> Buy 50 shares @ ₹2,000 + ₹140 charges
              </div>
              <span className="text-emerald-700 font-semibold">Net: ₹2,002.80/sh</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-zinc-200 flex items-center justify-between">
              <div>
                <span className="text-zinc-400">Tranche 2 (15 Nov 2024):</span> Buy 50 shares @ ₹2,400 + ₹170 charges
              </div>
              <span className="text-emerald-700 font-semibold">Net: ₹2,403.40/sh</span>
            </div>
            <div className="p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-200 flex items-center justify-between text-indigo-950">
              <div>
                <span className="text-indigo-600 font-bold">Action (10 Mar 2026):</span> Sell 70 shares @ ₹2,800
              </div>
              <span className="font-bold">Peels across 2 lots</span>
            </div>
          </div>

          <div className="text-xs text-zinc-600 space-y-1 pt-1">
            <p className="font-medium text-zinc-800">How the Engine Peels Tranches:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>
                <strong>Lot 1 Peeling (50 shares):</strong> All 50 shares from Tranche 1 (acquired 10 Jan 2023) are liquidated. Holding duration = 1,155 days (&ge; 365 days) &rarr; <strong className="text-indigo-700 font-mono">LTCG Flagged (Sec 112A)</strong>.
              </li>
              <li>
                <strong>Lot 2 Partial Peeling (20 shares):</strong> The remaining 20 shares are peeled from Tranche 2 (acquired 15 Nov 2024). Holding duration = 480 days (&ge; 365 days) &rarr; <strong className="text-indigo-700 font-mono">LTCG Flagged</strong>. Tranche 2 now retains 30 open shares.
              </li>
            </ol>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-3 rounded-xl border border-zinc-200 bg-zinc-50/50">
            <span className="text-xs font-bold text-zinc-900 block">Short-Term Capital Gains (STCG)</span>
            <span className="text-[10px] font-mono text-amber-700 font-bold">Held &lt; 365 Days • 20% Tax</span>
            <p className="text-xs text-zinc-500 mt-1">
              Taxed at a flat rate of 20% under Section 111A (updated per Union Budget / Finance Act 2024).
            </p>
          </div>
          <div className="p-3 rounded-xl border border-zinc-200 bg-zinc-50/50">
            <span className="text-xs font-bold text-zinc-900 block">Long-Term Capital Gains (LTCG)</span>
            <span className="text-[10px] font-mono text-indigo-700 font-bold">Held &ge; 365 Days • 12.5% Tax</span>
            <p className="text-xs text-zinc-500 mt-1">
              Taxed at 12.5% under Section 112A for aggregate gains exceeding the ₹1.25 Lakh annual household exemption.
            </p>
          </div>
        </div>
      </div>

      {/* Chapter 2: WAC (Weighted Average Cost) vs FIFO */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 text-zinc-900">
          <Layers className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base font-bold tracking-tight">
            2. Weighted Average Cost (WAC) vs FIFO Costing Methodology
          </h2>
        </div>

        <p className="text-xs text-zinc-600 leading-relaxed">
          While the Indian Tax Department mandates FIFO for computing taxable capital gains upon sale, modern portfolio management platforms (Zerodha Kite, Navexa, Sharesight) utilize <strong>Weighted Average Cost (WAC)</strong> to track ongoing unrealized portfolio returns and inventory pricing.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-zinc-200 rounded-lg">
            <thead className="bg-zinc-50 text-zinc-700 font-semibold border-b border-zinc-200">
              <tr>
                <th className="p-3">Attribute</th>
                <th className="p-3">Weighted Average Cost (WAC)</th>
                <th className="p-3">FIFO Cost Basis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 font-sans">
              <tr>
                <td className="p-3 font-medium text-zinc-900">Primary Purpose</td>
                <td className="p-3 text-zinc-600">Inventory valuation & true blended investment return</td>
                <td className="p-3 text-zinc-600">Tax audit compliance & capital gains calculation</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-zinc-900">Formula upon Buy</td>
                <td className="p-3 font-mono text-zinc-600">
                  (Old Qty &times; Old WAC + New Cost) / (Old Qty + New Qty)
                </td>
                <td className="p-3 font-mono text-zinc-600">Creates a new distinct buy lot tranche</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-zinc-900">Formula upon Sell</td>
                <td className="p-3 text-zinc-600">Unit cost stays constant; quantity reduces</td>
                <td className="p-3 text-zinc-600">Earliest tranches are peeled first</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-zinc-900">Switching Lenses</td>
                <td colSpan={2} className="p-3 text-emerald-700 font-medium">
                  Use the global toggle in the top header or Holdings tab to switch between both views instantly.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Chapter 3: Corporate Actions Workflows */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 text-zinc-900">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h2 className="text-base font-bold tracking-tight">
            3. Corporate Action Workflows & Cost Rebasing
          </h2>
        </div>

        <div className="space-y-4 text-xs">
          {/* Bonus */}
          <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-2">
            <span className="font-bold text-zinc-900 text-sm flex items-center gap-1.5">
              <span>Bonus Issue (e.g. 1:1, 4:1)</span>
              <span className="font-mono text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded font-semibold">
                Section 55
              </span>
            </span>
            <p className="text-zinc-600">
              Per Section 55 of the Indian Income Tax Act, bonus shares allotted on or after 1 April 2001 have a <strong>cost of acquisition of ₹0</strong>.
            </p>
            <div className="p-2.5 bg-white border border-zinc-200 rounded-lg font-mono text-zinc-700">
              Example 1:1 Bonus on 50 CDSL shares @ ₹1,120:
              <br />
              &bull; 50 new bonus shares are allotted at ₹0 cost on record date.
              <br />
              &bull; Holding count increases to 100 shares. Total invested cost remains ₹56,000.
              <br />
              &bull; Blended WAC drops from ₹1,120 to ₹560 per share, preserving tax neutrality until sale.
            </div>
          </div>

          {/* Stock Split */}
          <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-2">
            <span className="font-bold text-zinc-900 text-sm flex items-center gap-1.5">
              <span>Stock Split (e.g. 1:2, 1:10)</span>
              <span className="font-mono text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.2 rounded font-semibold">
                Face Value Reduction
              </span>
            </span>
            <p className="text-zinc-600">
              When a company splits its face value (e.g., from ₹10 to ₹2 in a 1:5 split), every existing share splits into 5 shares. The unit cost of every prior buy tranche divides by 5, and the quantity multiplies by 5. The original acquisition date is preserved.
            </p>
          </div>

          {/* Dividends */}
          <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-2">
            <span className="font-bold text-zinc-900 text-sm">Cash Dividends</span>
            <p className="text-zinc-600">
              Dividends paid by Indian corporates are credited directly to your cash ledger. Logging a dividend records income without altering the cost basis or share count of your open holdings.
            </p>
          </div>
        </div>
      </div>

      {/* Chapter 4: Offline Price Engine & Bulk Text Format */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 text-zinc-900">
          <FileCode className="w-5 h-5 text-zinc-700" />
          <h2 className="text-base font-bold tracking-tight">
            4. Offline Pricing Engine (CSV / Bulk Text Format)
          </h2>
        </div>

        <p className="text-xs text-zinc-600 leading-relaxed">
          Because this application never communicates with external live stock quote servers, you can update valuations across your entire portfolio in one second using the "Price Manager". Simply paste a comma- or tab-separated list:
        </p>

        <div className="p-3 bg-zinc-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto">
          RELIANCE,3050.00
          <br />
          TCS,4320.50
          <br />
          HDFCBANK,1720.00
          <br />
          CDSL,1650.00
          <br />
          PPFAS_FLEXI,82.10
        </div>

        <p className="text-xs text-zinc-500">
          Clicking "Apply Bulk Price Updates" updates Current Market Prices (CMP) immediately and recalculates unrealized returns, day changes, and net worth across all family member portfolios.
        </p>
      </div>
    </div>
  );
};
