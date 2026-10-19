import { Check, Download, Info, Maximize2, Minimize2, Share, Smartphone, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    // Check if running in standalone PWA mode
    const checkStandalone = () => {
      const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
      const isNavigatorStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsStandalone(isStandaloneMedia || isNavigatorStandalone);
    };

    checkStandalone();

    // Check iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIOS(isIOSDevice);

    // Track fullscreen change
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    // Capture beforeinstallprompt for Android / Chromium
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsStandalone(true);
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      // If neither, trigger browser fullscreen toggle
      toggleFullscreen();
    }
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        const elem = document.documentElement as unknown as {
          requestFullscreen?: () => Promise<void>;
          webkitRequestFullscreen?: () => Promise<void>;
        };
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
          await elem.webkitRequestFullscreen();
        }
      } else {
        const doc = document as unknown as {
          exitFullscreen?: () => Promise<void>;
          webkitExitFullscreen?: () => Promise<void>;
        };
        if (doc.exitFullscreen) {
          await doc.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
        }
      }
    } catch {
      // Ignore fullscreen denial/error
    }
  };

  return (
    <>
      {/* Top Bar Floating Controls */}
      <div className="flex items-center gap-2">
        {/* Fullscreen Toggle Button */}
        <button
          onClick={toggleFullscreen}
          type="button"
          title={isFullscreen ? 'ออกจากโหมดเต็มจอ' : 'เปิดโหมดเต็มจอ'}
          className="min-h-[40px] px-2.5 py-1.5 rounded-xl bg-[#1a1d24] hover:bg-[#222630] border-2 border-zinc-700/80 text-zinc-300 hover:text-white cartoon-btn-shadow flex items-center gap-1.5 text-xs font-bold transition-transform active:scale-95"
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">ย่อจอ</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">เต็มจอ</span>
            </>
          )}
        </button>

        {/* Install / Add to Home Screen Button (Only if not already running standalone) */}
        {!isStandalone && (
          <button
            onClick={handleInstallClick}
            type="button"
            className="min-h-[40px] px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 cartoon-btn-shadow flex items-center gap-1.5 text-xs font-black transition-transform active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-zinc-950 stroke-[2.5]" />
            <span>ติดตั้งเต็มจอ</span>
          </button>
        )}
      </div>

      {/* Persistent Bottom Hint Banner for Mobile Web Users (Dismissible) */}
      {!isStandalone && !bannerDismissed && (
        <div className="fixed bottom-3 left-3 right-3 z-40 max-w-lg mx-auto">
          <div className="rounded-2xl bg-[#16181f] border-2 border-zinc-700/90 p-3 cartoon-card-shadow flex items-center justify-between gap-3 shadow-2xl">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5 text-amber-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-zinc-100 truncate">
                  เล่นแบบเต็มจอ ไร้แถบค้นหา
                </p>
                <p className="text-[11px] text-zinc-400 truncate">
                  {isIOS ? 'เพิ่มไปที่หน้าจอโฮมเพื่อซ่อน Safari URL' : 'ติดตั้งลงเครื่องเพื่อเปิดแบบแอปเต็มจอ'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleInstallClick}
                type="button"
                className="px-3 py-1.5 rounded-lg bg-amber-500 text-zinc-950 font-black text-xs cartoon-btn-shadow hover:bg-amber-400 active:scale-95 transition-transform whitespace-nowrap"
              >
                {isIOS ? 'วิธีซ่อนแถบ' : 'ติดตั้ง'}
              </button>
              <button
                onClick={() => setBannerDismissed(true)}
                type="button"
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200"
                aria-label="ปิดการแจ้งเตือน"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Safari Home Screen Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#14161d] border-2 border-zinc-700 cartoon-card-shadow p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                  <Smartphone className="w-4 h-4 text-amber-400" />
                </div>
                <h3 className="text-sm font-bold text-zinc-100">วิธีเล่นเต็มจอใน iPhone / iPad</h3>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                type="button"
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              เพื่อให้แถบ URL และแถบค้นหาของ Safari หายไปอย่างสมบูรณ์แบบ ให้ทำตาม 2 ขั้นตอนนี้:
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-[#1c202a] border border-zinc-700/80">
                <div className="w-6 h-6 rounded-full bg-amber-500 text-zinc-950 font-black flex items-center justify-center shrink-0 text-xs">
                  1
                </div>
                <div>
                  <p className="font-bold text-zinc-200">แตะปุ่มแชร์ (Share)</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    ไอคอนสี่เหลี่ยมลูกศรชี้ขึ้น <Share className="w-3.5 h-3.5 inline mx-1 text-amber-400" /> ที่แถบเครื่องมือด้านล่างของ Safari
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-[#1c202a] border border-zinc-700/80">
                <div className="w-6 h-6 rounded-full bg-amber-500 text-zinc-950 font-black flex items-center justify-center shrink-0 text-xs">
                  2
                </div>
                <div>
                  <p className="font-bold text-zinc-200">เลือก &ldquo;เพิ่มไปยังหน้าจอโฮม&rdquo;</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    (Add to Home Screen) จากนั้นแตะปุ่ม &ldquo;เพิ่ม&rdquo; มุมขวาบน
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-600/60 flex items-center gap-2 text-emerald-300 text-[11px] font-medium">
                <Check className="w-4 h-4 shrink-0" />
                <span>เมื่อเปิดจากไอคอน Moonwolf บนหน้าจอโฮม แถบ Safari จะหายไปทันที 100%!</span>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              type="button"
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs cartoon-btn-shadow transition-transform active:scale-95"
            >
              เข้าใจแล้ว
            </button>
          </div>
        </div>
      )}
    </>
  );
};
