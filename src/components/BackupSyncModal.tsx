import React, { useRef, useState, useEffect } from 'react';
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
  FolderOpen,
  FolderCheck,
  Clock,
  Trash2,
  Calendar,
  Sparkles,
  Sliders,
  Settings,
  Layers,
  Lock,
} from 'lucide-react';
import {
  AutoBackupConfig,
  LocalBackupSnapshot,
  StorageHealthInfo,
  getAutoBackupConfig,
  saveAutoBackupConfig,
  getLocalBackupSnapshots,
  deleteLocalBackupSnapshot,
  getStorageHealthInfo,
  requestPersistentStorage,
  connectBackupDirectory,
  disconnectBackupDirectory,
  writeBackupToDirectoryHandle,
  executeManualSnapshotNow,
} from '../utils/storageAccessEngine';
import { formatINR } from '../utils/formatters';

interface BackupSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackupSyncModal: React.FC<BackupSyncModalProps> = ({ isOpen, onClose }) => {
  const {
    exportBackupJSON,
    importBackupFromFile,
    importBackupJSON,
    exportHoldingsCSV,
    exportTaxCSV,
    transactions,
    profiles,
    marketPrices,
    customStocks,
    theme,
    summary,
    resetToDefaults,
  } = usePortfolio();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'storage_api' | 'manual_sync'>('storage_api');
  const [dragActive, setDragActive] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });

  const [isImporting, setIsImporting] = useState(false);
  const [isConnectingDir, setIsConnectingDir] = useState(false);
  const [isWritingDir, setIsWritingDir] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Storage & Auto-backup state
  const [storageInfo, setStorageInfo] = useState<StorageHealthInfo | null>(null);
  const [backupConfig, setBackupConfig] = useState<AutoBackupConfig>(getAutoBackupConfig);
  const [snapshots, setSnapshots] = useState<LocalBackupSnapshot[]>([]);

  // Refresh storage metrics & snapshot history
  const refreshStorageData = async () => {
    const info = await getStorageHealthInfo();
    setStorageInfo(info);
    setBackupConfig(getAutoBackupConfig());
    setSnapshots(getLocalBackupSnapshots());
  };

  useEffect(() => {
    if (isOpen) {
      refreshStorageData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Connecting Folder via File System Access API
  const handleConnectFolder = async () => {
    setIsConnectingDir(true);
    setStatusMsg({ type: null, message: '' });
    try {
      const res = await connectBackupDirectory();
      if (res.success) {
        setStatusMsg({ type: 'success', message: res.message });
        await refreshStorageData();
      } else {
        setStatusMsg({ type: 'error', message: res.message });
      }
    } catch (e: any) {
      setStatusMsg({ type: 'error', message: e?.message || 'Folder connection failed.' });
    } finally {
      setIsConnectingDir(false);
    }
  };

  const handleDisconnectFolder = async () => {
    await disconnectBackupDirectory();
    setStatusMsg({ type: 'info', message: 'Backup storage folder disconnected.' });
    await refreshStorageData();
  };

  // Write immediate backup to the connected folder
  const handleWriteBackupToFolder = async () => {
    setIsWritingDir(true);
    setStatusMsg({ type: null, message: '' });
    try {
      const payload = {
        appName: 'SKYadav Portfolio App',
        version: '1.2',
        exportedAt: new Date().toISOString(),
        profiles,
        theme,
        transactions,
        marketPrices,
        customStocks,
        totalNetWorth: summary.totalNetWorth,
      };
      const res = await writeBackupToDirectoryHandle(payload);
      if (res.success) {
        setStatusMsg({ type: 'success', message: res.message });
        // Also save snapshot
        await executeManualSnapshotNow({
          transactions,
          marketPrices,
          profiles,
          customStocks,
          theme,
          totalNetWorth: summary.totalNetWorth,
        });
        await refreshStorageData();
      } else {
        setStatusMsg({ type: 'error', message: res.message });
      }
    } catch (e: any) {
      setStatusMsg({ type: 'error', message: e?.message || 'Failed writing file to folder.' });
    } finally {
      setIsWritingDir(false);
    }
  };

  // Request Persistent Storage API
  const handleRequestPersistence = async () => {
    const granted = await requestPersistentStorage();
    if (granted) {
      setStatusMsg({
        type: 'success',
        message: 'Persistent Storage Granted! Browser will never evict your portfolio data.',
      });
    } else {
      setStatusMsg({
        type: 'info',
        message: 'Persistent storage request was declined or is managed automatically by browser.',
      });
    }
    await refreshStorageData();
  };

  // Take immediate snapshot
  const handleCreateSnapshot = async () => {
    const res = await executeManualSnapshotNow({
      transactions,
      marketPrices,
      profiles,
      customStocks,
      theme,
      totalNetWorth: summary.totalNetWorth,
    });
    setStatusMsg({ type: 'success', message: res.message });
    await refreshStorageData();
  };

  // Restore snapshot
  const handleRestoreSnapshot = (snap: LocalBackupSnapshot) => {
    if (window.confirm(`Restore portfolio from snapshot taken on ${snap.dateStr}? Current changes will be overwritten.`)) {
      const success = importBackupJSON(snap.jsonData);
      if (success) {
        setStatusMsg({
          type: 'success',
          message: `Portfolio successfully restored from snapshot (${snap.dateStr})!`,
        });
      } else {
        setStatusMsg({
          type: 'error',
          message: 'Failed to restore snapshot data format.',
        });
      }
    }
  };

  // Download snapshot as JSON
  const handleDownloadSnapshot = (snap: LocalBackupSnapshot) => {
    const blob = new Blob([snap.jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SKYadav_Snapshot_${snap.dateStr.replace(/ /g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Delete snapshot
  const handleDeleteSnapshot = (id: string) => {
    deleteLocalBackupSnapshot(id);
    setSnapshots(getLocalBackupSnapshots());
  };

  // Toggle Auto-Backup Settings
  const handleConfigChange = (updates: Partial<AutoBackupConfig>) => {
    const newConfig = { ...backupConfig, ...updates };
    setBackupConfig(newConfig);
    saveAutoBackupConfig(newConfig);
  };

  // Standard File Upload
  const handleFileProcess = async (file: File) => {
    if (!file.name.endsWith('.json')) {
      setStatusMsg({
        type: 'error',
        message: 'Please select a valid JSON backup file (.json).',
      });
      return;
    }

    setIsImporting(true);
    setStatusMsg({ type: null, message: '' });

    try {
      const res = await importBackupFromFile(file);
      if (res.success) {
        setStatusMsg({
          type: 'success',
          message: res.message || 'Backup file successfully imported and verified!',
        });
        await refreshStorageData();
      } else {
        setStatusMsg({
          type: 'error',
          message: res.message || 'Failed to restore backup.',
        });
      }
    } catch (e: any) {
      setStatusMsg({
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
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-xs">
              <Database className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-zinc-900">
                  Storage Access API & Automated Backup Hub
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                  Zero Cloud Telemetry
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Native browser file access, persistent storage, and scheduled weekly auto-backups
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              onClose();
              setStatusMsg({ type: null, message: '' });
              setShowResetConfirm(false);
            }}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-zinc-200 px-6 pt-2 bg-zinc-50/40 gap-4 text-xs font-semibold">
          <button
            id="tab-storage-api-btn"
            onClick={() => setActiveTab('storage_api')}
            className={`pb-2.5 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'storage_api'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <FolderCheck className="w-4 h-4 text-emerald-600" />
            <span>Storage Access API & Auto-Backup</span>
          </button>
          <button
            id="tab-manual-sync-btn"
            onClick={() => setActiveTab('manual_sync')}
            className={`pb-2.5 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'manual_sync'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Download className="w-4 h-4 text-indigo-600" />
            <span>Manual JSON & CSV Portability</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Status Message */}
          {statusMsg.type && (
            <div
              className={`p-3.5 rounded-xl border flex items-center gap-2.5 ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : statusMsg.type === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : statusMsg.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              ) : (
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              )}
              <span className="font-medium">{statusMsg.message}</span>
            </div>
          )}

          {/* TAB 1: STORAGE ACCESS API & AUTO BACKUP */}
          {activeTab === 'storage_api' && (
            <div className="space-y-6">
              {/* API Capabilities & Storage Health Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Persistent Storage */}
                <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-zinc-600">Persistent Storage</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                        storageInfo?.isPersisted
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-zinc-200 text-zinc-700'
                      }`}
                    >
                      {storageInfo?.isPersisted ? 'Granted' : 'Standard'}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    {storageInfo?.isPersisted
                      ? 'Protected by browser. Data will never be automatically evicted during disk cleanup.'
                      : 'Best-effort storage. Request persistent flag to prevent automated browser cache clearance.'}
                  </p>
                  {!storageInfo?.isPersisted && (
                    <button
                      type="button"
                      onClick={handleRequestPersistence}
                      className="w-full mt-1 py-1.5 px-2 bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-200 rounded-lg text-[11px] font-medium transition-colors"
                    >
                      Request Persistent Storage
                    </button>
                  )}
                </div>

                {/* 2. File System Access API */}
                <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-zinc-600">File System Access</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                        storageInfo?.supportsFileSystemAccess
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {storageInfo?.supportsFileSystemAccess ? 'Supported' : 'Limited'}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    Allows reading and saving automated backups directly into your chosen local computer folder.
                  </p>
                  <div className="text-[10px] text-zinc-400 font-mono">
                    Quota used: {((storageInfo?.usageBytes || 0) / (1024 * 1024)).toFixed(2)} MB
                  </div>
                </div>

                {/* 3. Weekly Auto-Backup Scheduler */}
                <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-zinc-600">Auto-Backup Status</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                        backupConfig.enabled
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-zinc-200 text-zinc-600'
                      }`}
                    >
                      {backupConfig.enabled ? `${backupConfig.frequency.toUpperCase()}` : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    Last Backup: <strong>{backupConfig.lastBackupDateStr}</strong>
                  </p>
                  <div className="text-[10px] text-zinc-400 font-mono">
                    Snapshots stored: {snapshots.length} / {backupConfig.maxStoredSnapshots}
                  </div>
                </div>
              </div>

              {/* Connected Local Storage Directory Box */}
              <div className="p-4 rounded-xl border border-zinc-200 bg-white space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <FolderOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-zinc-900 block text-xs">
                        Direct Storage Directory Link (File System Access)
                      </span>
                      <span className="text-[11px] text-zinc-500">
                        Designate a folder on your computer (e.g. Documents, iCloud, or Google Drive)
                      </span>
                    </div>
                  </div>

                  {backupConfig.directoryConnected ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>Linked: {backupConfig.directoryName}</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleDisconnectFolder}
                        className="text-[11px] text-zinc-500 hover:text-rose-600 px-2 py-1 rounded"
                      >
                        Unlink
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-zinc-400 font-mono">No directory linked</span>
                  )}
                </div>

                <p className="text-zinc-600 text-[11px] leading-relaxed">
                  When a folder is linked, the weekly auto-backup writes complete timestamped JSON files directly into your folder on disk (e.g.{' '}
                  <code className="text-zinc-800 font-mono bg-zinc-100 px-1 py-0.5 rounded">
                    SKYadav_AutoBackup_weekly_YYYY-MM-DD.json
                  </code>
                  ) without needing download dialogs!
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {!backupConfig.directoryConnected ? (
                    <button
                      id="connect-directory-btn"
                      type="button"
                      onClick={handleConnectFolder}
                      disabled={isConnectingDir}
                      className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-2xs text-xs"
                    >
                      <FolderOpen className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isConnectingDir ? 'Connecting...' : 'Connect Backup Storage Folder'}</span>
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleWriteBackupToFolder}
                        disabled={isWritingDir}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors shadow-2xs text-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{isWritingDir ? 'Writing to Disk...' : 'Save Backup to Folder Now'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleConnectFolder}
                        className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg font-medium transition-colors text-xs"
                      >
                        Change Folder
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={handleCreateSnapshot}
                    className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg font-medium flex items-center gap-1.5 transition-colors text-xs"
                  >
                    <Clock className="w-3.5 h-3.5 text-zinc-600" />
                    <span>Create Snapshot Now</span>
                  </button>
                </div>
              </div>

              {/* Auto-Backup Engine Configuration */}
              <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-zinc-900 text-xs">
                    <Sliders className="w-4 h-4 text-indigo-600" />
                    <span>Weekly Auto-Backup Engine Settings</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-zinc-700">
                    <input
                      type="checkbox"
                      checked={backupConfig.enabled}
                      onChange={(e) => handleConfigChange({ enabled: e.target.checked })}
                      className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Active</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-[11px] font-medium text-zinc-600 block mb-1">
                      Backup Cadence
                    </label>
                    <select
                      value={backupConfig.frequency}
                      onChange={(e) =>
                        handleConfigChange({
                          frequency: e.target.value as 'weekly' | 'daily' | 'biweekly',
                        })
                      }
                      className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-zinc-800 text-xs"
                    >
                      <option value="weekly">Weekly (Every 7 Days - Recommended)</option>
                      <option value="daily">Daily (Every 24 Hours)</option>
                      <option value="biweekly">Bi-Weekly (Every 14 Days)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-zinc-600 block mb-1">
                      Retention Depth
                    </label>
                    <select
                      value={backupConfig.maxStoredSnapshots}
                      onChange={(e) =>
                        handleConfigChange({ maxStoredSnapshots: parseInt(e.target.value, 10) })
                      }
                      className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-zinc-800 text-xs"
                    >
                      <option value="6">Keep last 6 snapshots</option>
                      <option value="8">Keep last 8 snapshots</option>
                      <option value="12">Keep last 12 snapshots</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Local Snapshots Roll (History) */}
              <div className="p-4 rounded-xl border border-zinc-200 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <span className="font-bold text-zinc-900 text-xs">
                      Local Auto-Backup Snapshots Roll ({snapshots.length})
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    Stored in Isolated IndexedDB/Storage
                  </span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {snapshots.length > 0 ? (
                    snapshots.map((snap) => (
                      <div
                        key={snap.id}
                        className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-zinc-900">{snap.dateStr}</span>
                            <span
                              className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                                snap.origin === 'auto_weekly'
                                  ? 'bg-indigo-100 text-indigo-800'
                                  : 'bg-zinc-200 text-zinc-700'
                              }`}
                            >
                              {snap.origin === 'auto_weekly' ? 'WEEKLY AUTO' : 'MANUAL SNAPSHOT'}
                            </span>
                          </div>
                          <span className="text-[11px] text-zinc-500 block">
                            {snap.recordCount} trades • {snap.profileCount} profiles • Net Worth:{' '}
                            {formatINR(snap.totalNetWorth)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleRestoreSnapshot(snap)}
                            className="px-2.5 py-1 bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-200 rounded font-medium text-[11px] transition-colors"
                          >
                            Restore
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownloadSnapshot(snap)}
                            title="Download JSON"
                            className="p-1 text-zinc-500 hover:text-zinc-800 rounded hover:bg-zinc-100"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSnapshot(snap.id)}
                            title="Delete Snapshot"
                            className="p-1 text-zinc-400 hover:text-rose-600 rounded hover:bg-zinc-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-zinc-400 text-xs">
                      No automated snapshots stored yet. Click "Create Snapshot Now" or wait for the weekly auto-backup schedule.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MANUAL JSON & CSV PORTABILITY */}
          {activeTab === 'manual_sync' && (
            <div className="space-y-6">
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
                        setStatusMsg({
                          type: 'success',
                          message: 'Portfolio reset to default seed data successfully.',
                        });
                        refreshStorageData();
                      }}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded"
                    >
                      Confirm Reset
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 bg-zinc-50/50 flex justify-end">
          <button
            onClick={() => {
              onClose();
              setStatusMsg({ type: null, message: '' });
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
