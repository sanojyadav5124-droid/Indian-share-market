/**
 * SKYadav Portfolio Storage Access & Auto-Backup Engine
 * 
 * Provides native browser integration for:
 * 1. File System Access API (window.showDirectoryPicker) - direct local folder access
 * 2. Persistent Storage API (navigator.storage.persist) - prevents browser eviction
 * 3. Storage Access API (document.hasStorageAccess / requestStorageAccess) - iframe sandboxing
 * 4. Automated Weekly Auto-Backup Scheduler - keeps rolling local & on-disk snapshots
 */

export interface AutoBackupConfig {
  enabled: boolean;
  frequency: 'weekly' | 'daily' | 'biweekly';
  lastBackupTimestamp: number;
  lastBackupDateStr: string;
  directoryConnected: boolean;
  directoryName: string | null;
  isPersisted: boolean;
  autoSaveToDirectory: boolean;
  maxStoredSnapshots: number;
}

export interface LocalBackupSnapshot {
  id: string;
  timestamp: number;
  dateStr: string;
  recordCount: number;
  profileCount: number;
  totalNetWorth: number;
  jsonData: string;
  origin: 'auto_weekly' | 'auto_daily' | 'manual_snapshot' | 'filesystem_directory';
}

export interface StorageHealthInfo {
  supportsFileSystemAccess: boolean;
  supportsPersistentStorage: boolean;
  supportsStorageAccessAPI: boolean;
  isPersisted: boolean;
  hasStorageAccess: boolean;
  usageBytes: number;
  quotaBytes: number;
  percentUsed: number;
  directoryName: string | null;
}

const CONFIG_KEY = 'skyadav_autobackup_config_v1';
const SNAPSHOTS_KEY = 'skyadav_local_snapshots_v1';
const DB_NAME = 'SKYadav_StorageAccess_DB_v1';
const STORE_NAME = 'DirectoryHandles';
const HANDLE_KEY = 'active_backup_folder_handle';

const DEFAULT_CONFIG: AutoBackupConfig = {
  enabled: true,
  frequency: 'weekly',
  lastBackupTimestamp: 0,
  lastBackupDateStr: 'Never',
  directoryConnected: false,
  directoryName: null,
  isPersisted: false,
  autoSaveToDirectory: true,
  maxStoredSnapshots: 8,
};

// ==========================================
// 1. IndexedDB Helper for FileSystemDirectoryHandle
// ==========================================

function openHandleDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveDirectoryHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  try {
    const db = await openHandleDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(handle, HANDLE_KEY);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Failed to save FileSystemDirectoryHandle to IndexedDB:', err);
  }
}

export async function getSavedDirectoryHandle(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const db = await openHandleDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(HANDLE_KEY);
    return new Promise((resolve) => {
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    return null;
  }
}

export async function removeSavedDirectoryHandle(): Promise<void> {
  try {
    const db = await openHandleDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(HANDLE_KEY);
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch (err) {
    console.warn('Failed to clear directory handle:', err);
  }
}

// ==========================================
// 2. Browser Storage & API Capabilities
// ==========================================

export function checkAPICapabilities() {
  const supportsFileSystem = typeof window !== 'undefined' && 'showDirectoryPicker' in window;
  const supportsPersistence =
    typeof navigator !== 'undefined' &&
    'storage' in navigator &&
    typeof navigator.storage?.persist === 'function';
  const supportsStorageAccess =
    typeof document !== 'undefined' &&
    typeof (document as any).hasStorageAccess === 'function';

  return {
    supportsFileSystem,
    supportsPersistence,
    supportsStorageAccess,
  };
}

export async function getStorageHealthInfo(): Promise<StorageHealthInfo> {
  const caps = checkAPICapabilities();
  let isPersisted = false;
  let hasStorageAccess = true;
  let usageBytes = 0;
  let quotaBytes = 0;
  let percentUsed = 0;

  if (caps.supportsPersistence && navigator.storage?.persisted) {
    try {
      isPersisted = await navigator.storage.persisted();
    } catch (e) {
      isPersisted = false;
    }
  }

  if (caps.supportsPersistence && navigator.storage?.estimate) {
    try {
      const est = await navigator.storage.estimate();
      usageBytes = est.usage || 0;
      quotaBytes = est.quota || 0;
      if (quotaBytes > 0) {
        percentUsed = (usageBytes / quotaBytes) * 100;
      }
    } catch (e) {
      // estimation error fallback
    }
  }

  if (caps.supportsStorageAccess) {
    try {
      hasStorageAccess = await (document as any).hasStorageAccess();
    } catch (e) {
      hasStorageAccess = true;
    }
  }

  const config = getAutoBackupConfig();

  return {
    supportsFileSystemAccess: caps.supportsFileSystem,
    supportsPersistentStorage: caps.supportsPersistence,
    supportsStorageAccessAPI: caps.supportsStorageAccess,
    isPersisted,
    hasStorageAccess,
    usageBytes,
    quotaBytes,
    percentUsed,
    directoryName: config.directoryName,
  };
}

export async function requestPersistentStorage(): Promise<boolean> {
  if (
    typeof navigator === 'undefined' ||
    !('storage' in navigator) ||
    typeof navigator.storage?.persist !== 'function'
  ) {
    return false;
  }
  try {
    const granted = await navigator.storage.persist();
    const config = getAutoBackupConfig();
    config.isPersisted = granted;
    saveAutoBackupConfig(config);
    return granted;
  } catch (err) {
    console.warn('Error requesting persistent storage:', err);
    return false;
  }
}

export async function requestStorageAccessPermission(): Promise<boolean> {
  if (
    typeof document === 'undefined' ||
    typeof (document as any).requestStorageAccess !== 'function'
  ) {
    return true; // Not in sandboxed iframe or API not required
  }
  try {
    await (document as any).requestStorageAccess();
    return true;
  } catch (err) {
    console.warn('Storage Access request rejected:', err);
    return false;
  }
}

// ==========================================
// 3. File System Access Operations
// ==========================================

export async function verifyHandlePermission(
  fileHandle: FileSystemHandle,
  readWrite = true
): Promise<boolean> {
  const options = { mode: readWrite ? ('readwrite' as const) : ('read' as const) };
  try {
    if ((await (fileHandle as any).queryPermission(options)) === 'granted') {
      return true;
    }
    if ((await (fileHandle as any).requestPermission(options)) === 'granted') {
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
}

/**
 * Prompts user to pick a folder on their computer for automatic backups
 */
export async function connectBackupDirectory(): Promise<{
  success: boolean;
  directoryName: string | null;
  message: string;
}> {
  if (typeof window === 'undefined' || !('showDirectoryPicker' in window)) {
    return {
      success: false,
      directoryName: null,
      message: 'File System Access API is not supported in this browser. Please use Chrome, Edge, or Brave.',
    };
  }

  try {
    const dirHandle = await (window as any).showDirectoryPicker({
      id: 'skyadav_portfolio_backups',
      mode: 'readwrite',
      startIn: 'documents',
    });

    const hasPermission = await verifyHandlePermission(dirHandle, true);
    if (!hasPermission) {
      return {
        success: false,
        directoryName: null,
        message: 'Permission to write to the chosen directory was not granted.',
      };
    }

    await saveDirectoryHandle(dirHandle);

    const config = getAutoBackupConfig();
    config.directoryConnected = true;
    config.directoryName = dirHandle.name || 'Selected Folder';
    saveAutoBackupConfig(config);

    return {
      success: true,
      directoryName: dirHandle.name,
      message: `Successfully connected folder: "${dirHandle.name}". Weekly backups will be saved here automatically.`,
    };
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return {
        success: false,
        directoryName: null,
        message: 'Folder selection was canceled.',
      };
    }
    return {
      success: false,
      directoryName: null,
      message: err?.message || 'Could not connect backup directory.',
    };
  }
}

export async function disconnectBackupDirectory(): Promise<void> {
  await removeSavedDirectoryHandle();
  const config = getAutoBackupConfig();
  config.directoryConnected = false;
  config.directoryName = null;
  saveAutoBackupConfig(config);
}

/**
 * Writes a backup JSON file directly to the connected directory handle
 */
export async function writeBackupToDirectoryHandle(
  payload: any,
  customFilename?: string
): Promise<{ success: boolean; filename: string; message: string }> {
  const dirHandle = await getSavedDirectoryHandle();
  if (!dirHandle) {
    return {
      success: false,
      filename: '',
      message: 'No storage backup folder connected. Please connect a folder first.',
    };
  }

  const hasPerm = await verifyHandlePermission(dirHandle, true);
  if (!hasPerm) {
    return {
      success: false,
      filename: '',
      message: 'Storage folder write permission expired or revoked. Please re-grant access.',
    };
  }

  const dateStr = new Date().toISOString().slice(0, 10);
  const timeStr = new Date().toTimeString().slice(0, 8).replace(/:/g, '-');
  const filename = customFilename || `SKYadav_Portfolio_Backup_${dateStr}_${timeStr}.json`;

  try {
    const fileHandle = await (dirHandle as any).getFileHandle(filename, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(payload, null, 2));
    await writable.close();

    return {
      success: true,
      filename,
      message: `Direct disk backup successfully written to "${dirHandle.name}/${filename}".`,
    };
  } catch (err: any) {
    return {
      success: false,
      filename,
      message: err?.message || 'Failed writing backup file to connected directory.',
    };
  }
}

// ==========================================
// 4. Auto-Backup Configuration & Snapshots Store
// ==========================================

export function getAutoBackupConfig(): AutoBackupConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  try {
    const saved = localStorage.getItem(CONFIG_KEY);
    if (saved) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
    }
  } catch (e) {}
  return DEFAULT_CONFIG;
}

export function saveAutoBackupConfig(config: AutoBackupConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch (e) {}
}

export function getLocalBackupSnapshots(): LocalBackupSnapshot[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(SNAPSHOTS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.sort((a, b) => b.timestamp - a.timestamp);
      }
    }
  } catch (e) {}
  return [];
}

export function saveLocalBackupSnapshot(snapshot: LocalBackupSnapshot): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getLocalBackupSnapshots();
    const config = getAutoBackupConfig();
    const limit = config.maxStoredSnapshots || 8;
    const updated = [snapshot, ...existing.filter((s) => s.id !== snapshot.id)].slice(0, limit);
    localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(updated));
  } catch (e) {}
}

export function deleteLocalBackupSnapshot(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getLocalBackupSnapshots();
    const filtered = existing.filter((s) => s.id !== id);
    localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(filtered));
  } catch (e) {}
}

// ==========================================
// 5. Automated Weekly Auto-Backup Engine
// ==========================================

export function getFrequencyIntervalMs(freq: 'weekly' | 'daily' | 'biweekly'): number {
  switch (freq) {
    case 'daily':
      return 24 * 60 * 60 * 1000;
    case 'biweekly':
      return 14 * 24 * 60 * 60 * 1000;
    case 'weekly':
    default:
      return 7 * 24 * 60 * 60 * 1000; // 7 days in ms
  }
}

/**
 * Checks if auto-backup is due and executes it automatically
 */
export async function checkAndRunScheduledAutoBackup(payload: {
  transactions: any[];
  marketPrices: any[];
  profiles: any[];
  customStocks: any[];
  theme: string;
  totalNetWorth?: number;
}): Promise<{
  triggered: boolean;
  reason?: string;
  savedToFileSystem: boolean;
  filename?: string;
  snapshotId?: string;
}> {
  const config = getAutoBackupConfig();
  if (!config.enabled) {
    return { triggered: false, reason: 'Auto-backup disabled in settings', savedToFileSystem: false };
  }

  const now = Date.now();
  const intervalMs = getFrequencyIntervalMs(config.frequency);
  const timeSinceLast = now - (config.lastBackupTimestamp || 0);

  // If not enough time has elapsed
  if (timeSinceLast < intervalMs && config.lastBackupTimestamp > 0) {
    const daysRemaining = Math.ceil((intervalMs - timeSinceLast) / (1000 * 60 * 60 * 24));
    return {
      triggered: false,
      reason: `Next ${config.frequency} backup due in ~${daysRemaining} day(s)`,
      savedToFileSystem: false,
    };
  }

  // Time has elapsed! Create Auto-Backup
  const dateFormatted = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const fullPayload = {
    appName: 'SKYadav Portfolio App',
    version: '1.2',
    backupOrigin: 'weekly_auto_backup',
    exportedAt: new Date().toISOString(),
    ...payload,
  };

  const jsonString = JSON.stringify(fullPayload, null, 2);
  const snapshotId = `auto-snap-${now}`;

  // 1. Save to local snapshots history (always accessible in browser)
  const snapshot: LocalBackupSnapshot = {
    id: snapshotId,
    timestamp: now,
    dateStr: dateFormatted,
    recordCount: payload.transactions?.length || 0,
    profileCount: payload.profiles?.length || 0,
    totalNetWorth: payload.totalNetWorth || 0,
    jsonData: jsonString,
    origin: config.frequency === 'daily' ? 'auto_daily' : 'auto_weekly',
  };
  saveLocalBackupSnapshot(snapshot);

  // 2. Try writing directly to File System directory handle if connected
  let savedToFileSystem = false;
  let filename = '';

  if (config.directoryConnected && config.autoSaveToDirectory) {
    const diskRes = await writeBackupToDirectoryHandle(
      fullPayload,
      `SKYadav_AutoBackup_${config.frequency}_${new Date().toISOString().slice(0, 10)}.json`
    );
    if (diskRes.success) {
      savedToFileSystem = true;
      filename = diskRes.filename;
    }
  }

  // 3. Update configuration
  config.lastBackupTimestamp = now;
  config.lastBackupDateStr = dateFormatted;
  saveAutoBackupConfig(config);

  return {
    triggered: true,
    savedToFileSystem,
    filename,
    snapshotId,
  };
}

/**
 * Trigger immediate manual snapshot
 */
export async function executeManualSnapshotNow(payload: {
  transactions: any[];
  marketPrices: any[];
  profiles: any[];
  customStocks: any[];
  theme: string;
  totalNetWorth?: number;
}): Promise<{
  success: boolean;
  savedToFileSystem: boolean;
  filename?: string;
  snapshotId: string;
  message: string;
}> {
  const now = Date.now();
  const dateFormatted = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const fullPayload = {
    appName: 'SKYadav Portfolio App',
    version: '1.2',
    backupOrigin: 'manual_snapshot',
    exportedAt: new Date().toISOString(),
    ...payload,
  };

  const jsonString = JSON.stringify(fullPayload, null, 2);
  const snapshotId = `manual-snap-${now}`;

  const snapshot: LocalBackupSnapshot = {
    id: snapshotId,
    timestamp: now,
    dateStr: dateFormatted,
    recordCount: payload.transactions?.length || 0,
    profileCount: payload.profiles?.length || 0,
    totalNetWorth: payload.totalNetWorth || 0,
    jsonData: jsonString,
    origin: 'manual_snapshot',
  };
  saveLocalBackupSnapshot(snapshot);

  let savedToFileSystem = false;
  let filename = '';
  const config = getAutoBackupConfig();

  if (config.directoryConnected) {
    const diskRes = await writeBackupToDirectoryHandle(fullPayload);
    if (diskRes.success) {
      savedToFileSystem = true;
      filename = diskRes.filename;
    }
  }

  config.lastBackupTimestamp = now;
  config.lastBackupDateStr = dateFormatted;
  saveAutoBackupConfig(config);

  return {
    success: true,
    savedToFileSystem,
    filename,
    snapshotId,
    message: savedToFileSystem
      ? `Backup saved to internal storage & written to connected folder (${filename}).`
      : 'Backup snapshot saved to browser persistent storage.',
  };
}
