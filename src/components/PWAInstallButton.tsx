import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, CheckCircle, X, HelpCircle, Laptop } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'header' | 'banner' | 'card';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header', className = '' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  if (isInstalled) {
    if (variant === 'banner' || variant === 'card') {
      return (
        <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-medium">App Installed (Offline Ready)</span>
        </div>
      );
    }
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const res = await install();
      if (!res) {
        setShowGuideModal(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      {variant === 'header' && (
        <button
          id="pwa-install-header-btn"
          onClick={handleClick}
          title="Install SKYadav Portfolio as native app"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-all active:scale-95 ${className}`}
        >
          <Download className="w-3.5 h-3.5 text-white animate-bounce" />
          <span className="hidden sm:inline">Add to Screen</span>
          <span className="sm:hidden">Install</span>
        </button>
      )}

      {variant === 'banner' && (
        <button
          id="pwa-install-banner-btn"
          onClick={handleClick}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white text-zinc-900 hover:bg-zinc-100 border border-zinc-200 shadow-xs transition-all active:scale-95 ${className}`}
        >
          <Download className="w-3.5 h-3.5 text-emerald-600" />
          <span>Add to Home Screen / Install</span>
        </button>
      )}

      {variant === 'card' && (
        <button
          id="pwa-install-card-btn"
          onClick={handleClick}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm transition-all ${className}`}
        >
          <Smartphone className="w-4 h-4 text-emerald-400" />
          <span>Install Offline Web App</span>
        </button>
      )}

      {/* Guide Modal for iOS & Browsers where beforeinstallprompt isn't direct */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-zinc-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Install SKYadav Portfolio App</h3>
                  <p className="text-[11px] text-zinc-500">True offline standalone mobile & desktop experience</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-zinc-600">
              {isIOS ? (
                <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
                  <span className="font-semibold text-zinc-900 block flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-indigo-600" /> On iPhone or iPad (Safari):
                  </span>
                  <ol className="list-decimal pl-4 space-y-1.5 text-zinc-700 leading-relaxed">
                    <li>Tap the <strong>Share</strong> button (box with upward arrow) in the Safari toolbar.</li>
                    <li>Scroll down the menu and select <strong>"Add to Home Screen"</strong>.</li>
                    <li>Tap <strong>"Add"</strong> on top right. SKYadav Portfolio will now launch directly like a native app without browser bars!</li>
                  </ol>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
                  <span className="font-semibold text-zinc-900 block flex items-center gap-1.5">
                    <Laptop className="w-4 h-4 text-emerald-600" /> On Chrome, Edge & Android:
                  </span>
                  <p className="text-zinc-700 leading-relaxed">
                    Click the <strong>Install</strong> icon in your browser's address bar (URL bar on the right side) or tap the <strong>three dots menu (&vellip;) &rarr; "Install SKYadav portfolio App" / "Add to Home screen"</strong>.
                  </p>
                  <p className="text-[11px] text-zinc-500 pt-1">
                    Once installed, the app caches all assets and works 100% offline with zero internet required.
                  </p>
                </div>
              )}

              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Pure Offline Privacy:</span> Your financial data never leaves your device. Local SQLite/localStorage state persists across launches.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
