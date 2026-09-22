import React, { useRef } from 'react';
import {
  Calculator,
  ShieldCheck,
  FileSpreadsheet,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  FolderCheck,
  TrendingUp,
  PieChart,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { formatINR, formatPercent } from '../utils/formatters';
import { TaxImpactVisualizer } from './TaxImpactVisualizer';

export const TaxEngineView: React.FC = () => {
  const {
    summary,
    realizedLots,
    holdings,
    activeProfile,
    profiles,
    exportBackupJSON,
    importBackupJSON,
    exportTaxCSV,
    exportHoldingsCSV,
    resetToDefaults,
    setIsBackupModalOpen,
  } = usePortfolio();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentProfileObj = profiles.find((p) => p.id === activeProfile);
  const exemptionProgressPct = Math.min(100, (summary.exemptLTCGUsed / 125000) * 100);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        const success = importBackupJSON(content);
        if (success) {
          alert('Portfolio data successfully restored from JSON backup!');
        } else {
          alert('Failed to parse backup JSON. Please verify the file format.');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
              Indian Capital Gains Tax Engine
            </h1>
            <span className="text-xs font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-medium">
              Finance Act 2024 Rules
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Compliant FIFO tax computations for STCG (20%) and LTCG (12.5% with ₹1.25L exemption).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="tax-open-backup-btn"
            onClick={() => setIsBackupModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors"
            title="Configure Storage Access API & Weekly Auto-Backup"
          >
            <FolderCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Storage & Auto-Backup</span>
          </button>
          <button
            id="export-tax-csv-btn"
            onClick={exportTaxCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Tax Statement (CSV)</span>
          </button>
        </div>
      </div>

      {/* Interactive Tax Impact Visualizer */}
      <TaxImpactVisualizer
        summary={summary}
        holdings={holdings}
        realizedLots={realizedLots}
        activeProfile={activeProfile}
      />

      {/* Tax Liability Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* STCG Card (< 1 Year) */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-700 tracking-tight">
              Short-Term Capital Gains (STCG)
            </span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
              Sec 111A • 20%
            </span>
          </div>

          <div className="mt-4">
            <span className="text-xs text-zinc-400">Total STCG Realized</span>
            <div className="text-2xl font-bold text-zinc-900 tracking-tight mt-0.5">
              {formatINR(summary.totalRealizedSTCG)}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Holding duration &lt; 365 days from date of purchase
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
            <span className="text-zinc-500">Tax Liability @ 20%:</span>
            <span className="font-mono font-bold text-rose-600">
              {formatINR(summary.stcgTaxLiability)}
            </span>
          </div>
        </div>

        {/* LTCG Card (>= 1 Year) */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-700 tracking-tight">
              Long-Term Capital Gains (LTCG)
            </span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
              Sec 112A • 12.5%
            </span>
          </div>

          <div className="mt-4">
            <span className="text-xs text-zinc-400">Total LTCG Realized</span>
            <div className="text-2xl font-bold text-zinc-900 tracking-tight mt-0.5">
              {formatINR(summary.totalRealizedLTCG)}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Holding duration &ge; 365 days from date of purchase
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
            <span className="text-zinc-500">Taxable above ₹1.25L:</span>
            <span className="font-mono font-semibold text-zinc-800">
              {formatINR(summary.taxableLTCG)}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-zinc-500">Tax Liability @ 12.5%:</span>
            <span className="font-mono font-bold text-rose-600">
              {formatINR(summary.ltcgTaxLiability)}
            </span>
          </div>
        </div>

        {/* Aggregate Household Exemption & Total Tax */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-700 tracking-tight">
                ₹1.25 Lakh Statutory Exemption
              </span>
              <span className="text-[10px] font-mono bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded">
                Annual Limit
              </span>
            </div>

            {/* Exemption Progress */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-zinc-500">Exemption Utilized:</span>
                <span className="font-mono font-semibold text-emerald-700">
                  {formatINR(summary.exemptLTCGUsed)} / ₹1,25,000
                </span>
              </div>
              <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  style={{ width: `${exemptionProgressPct}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-1 font-mono">
                <span>Remaining: {formatINR(summary.remainingLTCGExemption)}</span>
                <span>{exemptionProgressPct.toFixed(0)}% used</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-zinc-500 block">Total Est. Tax Liability</span>
              <span className="text-[10px] text-zinc-400">STCG (20%) + LTCG (12.5%)</span>
            </div>
            <div className="text-xl font-bold font-mono text-zinc-950">
              {formatINR(summary.totalTaxLiability)}
            </div>
          </div>
        </div>
      </div>

      {/* Itemized Realized Lots Audit Trail */}
      <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 tracking-tight">
              Realized Trades & FIFO Lot Peeling Statement
            </h2>
            <p className="text-xs text-zinc-500">
              Every sold lot mapped back to original buy tranche with statutory holding days
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            {realizedLots.length} Realized Lots
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-500 font-medium bg-zinc-50/60">
                <th className="py-3 px-3">Profile</th>
                <th className="py-3 px-3">Scrip</th>
                <th className="py-3 px-3">Buy Date</th>
                <th className="py-3 px-3">Sell Date</th>
                <th className="py-3 px-3 text-right">Holding Days</th>
                <th className="py-3 px-3">Tax Bucket</th>
                <th className="py-3 px-3 text-right">Quantity</th>
                <th className="py-3 px-3 text-right">Net Buy Cost</th>
                <th className="py-3 px-3 text-right">Net Sell Proceed</th>
                <th className="py-3 px-3 text-right">Realized Gain</th>
                <th className="py-3 px-3 text-right">Tax Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-800 font-mono">
              {realizedLots.length > 0 ? (
                realizedLots.map((r) => {
                  const profileObj = profiles.find((p) => p.id === r.profileId);
                  return (
                    <tr key={r.id} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="py-3 px-3 font-sans">
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-zinc-100 text-zinc-700">
                          {profileObj?.name.split(' ')[0]}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-zinc-900">{r.symbol}</span>
                      </td>
                      <td className="py-3 px-3 text-zinc-500">{r.buyDate}</td>
                      <td className="py-3 px-3 text-zinc-500">{r.sellDate}</td>
                      <td className="py-3 px-3 text-right font-medium">{r.holdingDays} d</td>
                      <td className="py-3 px-3 font-sans">
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                            r.isLTCG
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {r.isLTCG ? 'LTCG (>= 1 Yr)' : 'STCG (< 1 Yr)'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">{r.quantity}</td>
                      <td className="py-3 px-3 text-right">{formatINR(r.netBuyCost)}</td>
                      <td className="py-3 px-3 text-right">{formatINR(r.netSellProceed)}</td>
                      <td className="py-3 px-3 text-right font-semibold">
                        <span className={r.realizedPnL >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                          {formatINR(r.realizedPnL)}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-zinc-600">
                        {(r.taxRate * 100).toFixed(1)}%
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-zinc-400 font-sans">
                    No realized sales logged yet. When you sell shares, FIFO lot peels will appear here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data Backup & Restore Center */}
      <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Data Sovereignty & Local Backup Utility</span>
            </h2>
            <p className="text-xs text-zinc-500">
              Your entire portfolio resides exclusively in browser storage. Export JSON regularly to prevent accidental cache loss.
            </p>
          </div>
        </div>

        {/* Storage Access API & Auto-Backup Banner */}
        <div className="mb-4 p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <FolderCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-950 flex items-center gap-2">
                <span>Storage Access API & Weekly Auto-Backup</span>
                <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded font-mono font-bold">Recommended</span>
              </div>
              <p className="text-[11px] text-emerald-800">
                Grant native browser directory access to keep weekly auto-backups saved directly to your local PC/Mac folder with rolling snapshot rollbacks.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsBackupModalOpen(true)}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shrink-0 shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <span>Configure Storage & Auto-Backup</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Export JSON */}
          <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-800">
                <Download className="w-4 h-4 text-zinc-600" />
                <span>Export JSON Backup</span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">
                Full snapshot containing all transactions, cost allocations, and market prices.
              </p>
            </div>
            <button
              id="tax-backup-json-btn"
              onClick={exportBackupJSON}
              className="mt-4 w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold transition-all shadow-2xs"
            >
              Download Backup.json
            </button>
          </div>

          {/* Import JSON */}
          <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-800">
                <Upload className="w-4 h-4 text-zinc-600" />
                <span>Restore from JSON</span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">
                Restore previously saved portfolio files onto this browser instance.
              </p>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                id="tax-restore-json-btn"
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 w-full py-2 bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-200 rounded-lg text-xs font-medium transition-all shadow-2xs"
              >
                Select File & Restore
              </button>
            </div>
          </div>

          {/* Reset to Sample */}
          <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-rose-900">
                <RefreshCw className="w-4 h-4 text-rose-600" />
                <span>Reset to Seed Data</span>
              </div>
              <p className="text-[11px] text-rose-700/80 mt-1">
                Clears custom edits and reloads the multi-profile sample Indian portfolio with 3 family profiles.
              </p>
            </div>
            <button
              id="tax-reset-sample-btn"
              onClick={() => {
                if (window.confirm('Reset all data to default Indian demo portfolio? Any custom entries will be replaced.')) {
                  resetToDefaults();
                }
              }}
              className="mt-4 w-full py-2 bg-white hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-medium transition-all"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
