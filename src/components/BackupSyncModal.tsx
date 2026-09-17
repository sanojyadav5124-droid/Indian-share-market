import React, { useRef, useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import {
  Download,
  Upload,
  Database,
  FileSpreadsheet,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  HardDrive,
  Laptop,
  Smartphone,
  ShieldCheck,
  FileJson,
  ArrowRight,
} from 'lucide-react';

interface BackupSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackupSyncModal: React.FC<BackupSyncModalProps> = ({ isOpen, onClose }) => {
  const {
    exportBackupJSON,
    importBackupFromFile,
    exportHoldingsCSV,
    exportTaxCSV,
    transactions,
    profiles,
    marketPrices,
    resetToDefaults,
  } = usePortfolio();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [isImporting, setIsImporting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  const handleFileProcess = async (file: File) => {
    if (!file.name.endsWith('.json')) {
      setImportStatus({
        type: 'error',
        message: 'Please select a valid JSON backup file (.json).',
      });
      return;
    }

    setIsImporting(true);
    setImportStatus({ type: null, message: '' });

    try {
      const res = await importBackupFromFile(file);
      if (res.success) {
        setImportStatus({
          type: 'success',
          message: res.message || 'Backup file successfully imported and verified!',
        });
      } else {
        setImportStatus({
          type: 'error',
          message: res.message || 'Failed to restore backup.',
        });
      }
    } catch (e: any) {
      setImportStatus({
        type: 'error',
        message: e?.message || 'Error parsing backup file.',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
    // reset input so the same file can be re-selected if needed
    e.target.value = '';
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center">
              <Database className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900">Backup, Sync & Data Portability</h2>
              <p className="text-xs text-zinc-500">
                100% Local-first data architecture. Securely export, import, or transfer between devices.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              onClose();
              setImportStatus({ type: null, message: '' });
              setShowResetConfirm(false);
            }}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Status Message */}
          {importStatus.type && (
            <div
              className={`p-3.5 rounded-xl border flex items-center gap-2.5 ${
                importStatus.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {importStatus.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span className="font-medium">{importStatus.message}</span>
            </div>
          )}

          {/* Quick Stats Banner */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-200">
            <div>
              <span className="text-[11px] text-zinc-500 block">Family Profiles</span>
              <span className="text-sm font-bold text-zinc-900">{profiles.length} Active</span>
            </div>
            <div>
              <span className="text-[11px] text-zinc-500 block">Logged Trades</span>
              <span className="text-sm font-bold text-zinc-900">{transactions.length} Records</span>
            </div>
            <div>
              <span className="text-[11px] text-zinc-500 block">Tracked CMPs</span>
              <span className="text-sm font-bold text-zinc-900">{marketPrices.length} Tickers</span>
            </div>
          </div>

          {/* Primary Operations: Import & Export */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Export Backup Card */}
            <div className="p-4 rounded-xl border border-zinc-200 bg-white hover:border-zinc-300 transition-all flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-zinc-900 text-xs">
                  <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Download className="w-3.5 h-3.5" />
                  </div>
                  <span>Export Backup File</span>
                </div>
                <p className="text-zinc-500 leading-relaxed text-[11px]">
                  Download an unencrypted, complete JSON backup containing all family profiles, trade histories, custom stocks, and current prices.
                </p>
              </div>
              <button
                id="export-backup-json-btn"
                type="button"
                onClick={exportBackupJSON}
                className="w-full py-2 px-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors shadow-2xs"
              >
                <FileJson className="w-3.5 h-3.5 text-emerald-400" />
                <span>Download Backup (.json)</span>
              </button>
            </div>

            {/* Import Backup Card */}
            <div className="p-4 rounded-xl border border-zinc-200 bg-white hover:border-zinc-300 transition-all flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-zinc-900 text-xs">
                  <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                    <Upload className="w-3.5 h-3.5" />
                  </div>
                  <span>Import / Restore Backup</span>
                </div>
                <p className="text-zinc-500 leading-relaxed text-[11px]">
                  Select or drop a previous `.json` file from your computer or phone to restore all data instantly.
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={handleFileInputChange}
              />

              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`py-2.5 px-3 border border-dashed rounded-lg text-center cursor-pointer transition-all flex items-center justify-center gap-2 ${
                  dragActive
                    ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700 font-semibold'
                    : 'border-zinc-300 bg-zinc-50 hover:bg-zinc-100/70 text-zinc-700'
                }`}
              >
                <Upload className="w-3.5 h-3.5 text-zinc-500" />
                <span>{isImporting ? 'Restoring records...' : 'Choose or Drop JSON File'}</span>
              </div>
            </div>
          </div>

          {/* Export Spreadsheets */}
          <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/60 space-y-3">
            <span className="font-bold text-zinc-900 block text-xs">Spreadsheet Reports (CSV)</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={exportHoldingsCSV}
                className="p-2.5 bg-white border border-zinc-200 hover:border-zinc-300 rounded-lg flex items-center justify-between text-zinc-800 font-medium hover:bg-zinc-50 transition-all text-xs"
              >
                <span className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Holdings Report CSV</span>
                </span>
                <Download className="w-3 h-3 text-zinc-400" />
              </button>

              <button
                type="button"
                onClick={exportTaxCSV}
                className="p-2.5 bg-white border border-zinc-200 hover:border-zinc-300 rounded-lg flex items-center justify-between text-zinc-800 font-medium hover:bg-zinc-50 transition-all text-xs"
              >
                <span className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                  <span>Capital Gains Tax CSV</span>
                </span>
                <Download className="w-3 h-3 text-zinc-400" />
              </button>
            </div>
          </div>

          {/* Architectural Explanation: How Sync & Storage Actually Works */}
          <div className="p-4 rounded-xl border border-zinc-200 bg-white space-y-3">
            <div className="flex items-center gap-2 font-bold text-zinc-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Foundation Architecture: How Persistence & Sync Operate</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-zinc-600 pt-1">
              <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-100 space-y-1">
                <div className="font-semibold text-zinc-900 flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-zinc-700" /> 1. Browser Local-First
                </div>
                <p className="leading-relaxed">
                  Every trade, stock, and family profile is stored immediately in your browser’s isolated local database (HTML5 LocalStorage & Cache). Nothing ever leaves your machine or gets uploaded to external third-party servers.
                </p>
              </div>

              <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-100 space-y-1">
                <div className="font-semibold text-zinc-900 flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-zinc-700" /> 2. Live Cross-Tab Sync
                </div>
                <p className="leading-relaxed">
                  If you open this portfolio across multiple browser tabs or windows, state updates broadcast automatically across tabs via background browser storage events without page refreshes.
                </p>
              </div>

              <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-100 space-y-1">
                <div className="font-semibold text-zinc-900 flex items-center gap-1.5">
                  <Laptop className="w-3.5 h-3.5 text-zinc-700" /> 3. Device-to-Device Sync
                </div>
                <p className="leading-relaxed">
                  To sync across phone, laptop, or work PC: click <strong>Download Backup</strong> on Device A, save to your personal Google Drive or email, and click <strong>Choose JSON</strong> on Device B. Everything restores in one second.
                </p>
              </div>
            </div>
          </div>

          {/* Reset State Option */}
          <div className="pt-2 border-t border-zinc-200 flex items-center justify-between">
            {!showResetConfirm ? (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="text-xs text-zinc-400 hover:text-rose-600 transition-colors"
              >
                Reset to default sample portfolio...
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-rose-600 font-medium">Clear all custom data & reload defaults?</span>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-2 py-1 bg-zinc-100 hover:bg-zinc-200 rounded text-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetToDefaults();
                    setShowResetConfirm(false);
                    setImportStatus({
                      type: 'success',
                      message: 'Portfolio reset to default seed data successfully.',
                    });
                  }}
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded"
                >
                  Confirm Reset
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 bg-zinc-50/50 flex justify-end">
          <button
            onClick={() => {
              onClose();
              setImportStatus({ type: null, message: '' });
              setShowResetConfirm(false);
            }}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
