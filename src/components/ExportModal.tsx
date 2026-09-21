import React, { useState } from 'react';
import {
  X,
  Download,
  FileSpreadsheet,
  FileJson,
  Printer,
  ShieldCheck,
  CheckCircle2,
  PieChart,
  Receipt,
  Scale,
  Sparkles,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const {
    activeProfile,
    profiles,
    holdings,
    transactions,
    realizedLots,
    summary,
    exportBackupJSON,
    exportHoldingsCSV,
    exportTransactionsCSV,
    exportTaxCSV,
    exportFullPortfolioHTMLReport,
  } = usePortfolio();

  const [downloadedFormat, setDownloadedFormat] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = (action: () => void, formatKey: string) => {
    action();
    setDownloadedFormat(formatKey);
    setTimeout(() => {
      setDownloadedFormat(null);
    }, 2500);
  };

  const activeProfileName =
    activeProfile === 'consolidated'
      ? 'Consolidated Household (All Demats)'
      : profiles.find((p) => p.id === activeProfile)?.name || activeProfile;

  return (
    <div
      id="export-portfolio-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-zinc-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold shadow-xs">
              <Download className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 tracking-tight">
                Export Portfolio Data & Reports
              </h2>
              <p className="text-xs text-zinc-500">
                Scope: <span className="font-semibold text-zinc-700">{activeProfileName}</span> • Zero third-party telemetry
              </p>
            </div>
          </div>
          <button
            id="close-export-modal-btn"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Quick Snapshot Banner */}
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs text-zinc-500 font-medium">Ready for Export</div>
              <div className="text-sm font-semibold text-zinc-900">
                {holdings.length} Holdings • {transactions.length} Transactions • {realizedLots.length} Realized Tax Lots
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-zinc-500 font-medium">Portfolio Valuation</div>
              <div className="text-sm font-bold text-emerald-600">
                ₹{summary.totalNetWorth.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>

          {/* Export Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
            {/* Option 1: Holdings CSV */}
            <div className="p-4 rounded-xl border border-zinc-200 hover:border-zinc-300 hover:shadow-xs transition-all bg-white flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <PieChart className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 border border-zinc-200">
                    .CSV
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-zinc-900">Holdings Inventory Report</h3>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                  Full list of open positions with WAC & FIFO cost basis, latest CMP, and unrealized profit/loss.
                </p>
              </div>
              <button
                id="export-holdings-csv-btn"
                onClick={() => handleExport(exportHoldingsCSV, 'holdings')}
                className="mt-4 w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-2xs"
              >
                {downloadedFormat === 'holdings' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    <span>Downloaded!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Holdings (.CSV)</span>
                  </>
                )}
              </button>
            </div>

            {/* Option 2: Transactions Ledger CSV */}
            <div className="p-4 rounded-xl border border-zinc-200 hover:border-zinc-300 hover:shadow-xs transition-all bg-white flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 border border-zinc-200">
                    .CSV
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-zinc-900">Transactions Ledger</h3>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                  Complete trade history with individual STT, Stamp Duty, GST, and exchange charge breakdowns.
                </p>
              </div>
              <button
                id="export-transactions-csv-btn"
                onClick={() => handleExport(exportTransactionsCSV, 'txs')}
                className="mt-4 w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-2xs"
              >
                {downloadedFormat === 'txs' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    <span>Downloaded!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Ledger (.CSV)</span>
                  </>
                )}
              </button>
            </div>

            {/* Option 3: Capital Gains Tax CSV */}
            <div className="p-4 rounded-xl border border-zinc-200 hover:border-zinc-300 hover:shadow-xs transition-all bg-white flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                    <Scale className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 border border-zinc-200">
                    .CSV
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-zinc-900">Tax Statement (ITR-2 / ITR-3)</h3>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                  Realized lots categorized into STCG (20%) and LTCG (12.5%) compliant with Indian Finance Act 2024.
                </p>
              </div>
              <button
                id="export-tax-csv-btn"
                onClick={() => handleExport(exportTaxCSV, 'tax')}
                className="mt-4 w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white transition-colors shadow-2xs"
              >
                {downloadedFormat === 'tax' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    <span>Downloaded!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Tax Lots (.CSV)</span>
                  </>
                )}
              </button>
            </div>

            {/* Option 4: Full JSON Device Backup */}
            <div className="p-4 rounded-xl border border-zinc-200 hover:border-zinc-300 hover:shadow-xs transition-all bg-white flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                    <FileJson className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 border border-zinc-200">
                    .JSON
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-zinc-900">Full Archive Backup</h3>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                  Portable database snapshot containing all family profiles, custom scrips, and historical trades.
                </p>
              </div>
              <button
                id="export-full-json-btn"
                onClick={() => handleExport(exportBackupJSON, 'json')}
                className="mt-4 w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white transition-colors shadow-2xs"
              >
                {downloadedFormat === 'json' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Exported Successfully!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Backup (.JSON)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Option 5: Executive Printable Report */}
          <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/70 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-zinc-200 text-zinc-800 flex items-center justify-center shrink-0">
                <Printer className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-900">Executive Printable Valuation Statement</div>
                <div className="text-[11px] text-zinc-500">
                  Formatted for formal PDF printouts, accounting audits, and offline archiving.
                </div>
              </div>
            </div>
            <button
              id="export-print-pdf-btn"
              onClick={exportFullPortfolioHTMLReport}
              className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg text-xs font-semibold bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-300 transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-zinc-600" />
              <span>Print / Save as PDF</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Encrypted in memory • Data remains on your local hardware</span>
          </div>
          <button
            id="export-modal-done-btn"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg font-medium text-zinc-700 hover:bg-zinc-200/80 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
