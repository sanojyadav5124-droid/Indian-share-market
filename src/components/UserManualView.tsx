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
                  <strong>Mandatory practice:</strong> Regularly use the <strong>"Export Backup (JSON)"</strong> button on the top right or within the Tax Engine tab to save a physical copy to your local machine.
                </li>
              </ul>
            </div>
          </div>
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
