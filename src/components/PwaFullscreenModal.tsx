import { Check, Download, Smartphone, X } from 'lucide-react';
import React from 'react';

interface PwaFullscreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any | null;
  onInstallSuccess?: () => void;
}

export const PwaFullscreenModal: React.FC<PwaFullscreenModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onInstallSuccess,
}) => {
  if (!isOpen) return null;

  const isIOS =
    typeof navigator !== 'undefined' &&
    /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());

  const handlePromptInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        onInstallSuccess?.();
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl bg-[#14161c] border-2 border-zinc-700 p-5 space-y-4 cartoon-card-shadow">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Smartphone className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-zinc-100">
              วิธีเปิดเล่นเต็มจอ (ซ่อนแถบค้นหา)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center"
            aria-label="ปิด"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Visual comparison illustration */}
        <div className="rounded-xl bg-[#0f1115] border border-zinc-800 p-3 space-y-2 text-center">
          <div className="flex items-center justify-around text-[11px] font-bold text-zinc-400">
            <div className="space-y-1">
              <span className="text-rose-400">❌ ในเบราว์เซอร์ปกติ</span>
              <div className="w-20 h-28 mx-auto rounded-lg bg-zinc-800 border border-zinc-700 flex flex-col justify-between p-1">
                <div className="w-full h-3 bg-zinc-700 rounded text-[7px] text-zinc-400 flex items-center justify-center">
                  แถบ URL
                </div>
                <div className="text-[8px] text-zinc-500">จอแคบลง</div>
                <div className="w-full h-2 bg-zinc-700 rounded" />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-emerald-400">✓ หลังติดตั้งลงโฮม</span>
              <div className="w-20 h-28 mx-auto rounded-lg bg-zinc-900 border-2 border-amber-500 flex flex-col items-center justify-center p-1 cartoon-btn-shadow">
                <div className="w-6 h-6 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] mb-1 font-black">
                  🐺
                </div>
                <div className="text-[8px] text-amber-300 font-bold">เต็มหน้าจอ!</div>
                <div className="text-[7px] text-zinc-400">ไม่มีแถบกวนใจ</div>
              </div>
            </div>
          </div>
        </div>

        {/* Step by step for iOS vs Android */}
        {isIOS ? (
          <div className="rounded-xl bg-[#181a20] border border-zinc-800 p-3.5 space-y-2 text-xs text-zinc-300">
            <p className="font-bold text-amber-400">สำหรับ iPhone / iPad (Safari):</p>
            <ol className="list-decimal list-inside space-y-1.5 text-zinc-300 leading-relaxed">
              <li>
                แตะปุ่ม <strong>แชร์ (Share)</strong> รูปสี่เหลี่ยมลูกศรชี้ขึ้น ที่แถบล่างของ Safari
              </li>
              <li>
                เลื่อนลงมาแล้วแตะที่ <strong>“เพิ่มไปยังหน้าจอโฮม” (Add to Home Screen)</strong>
              </li>
              <li>
                แตะ <strong>“เพิ่ม” (Add)</strong> มุมขวาบน
              </li>
              <li>
                เปิดเข้าเกมผ่านไอคอน <strong>Moonwolf</strong> บนหน้าจอโฮม จะแสดงผลเต็มจอทันที!
              </li>
            </ol>
          </div>
        ) : deferredPrompt ? (
          <div className="space-y-2">
            <p className="text-xs text-zinc-300 text-center">
              กดปุ่มด้านล่างเพื่อติดตั้งลงหน้าจอโทรศัพท์ได้ใน 1 วินาที:
            </p>
            <button
              type="button"
              onClick={handlePromptInstall}
              className="w-full min-h-[46px] rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-sm flex items-center justify-center gap-2 cartoon-btn-shadow"
            >
              <Download className="w-4 h-4" />
              <span>ติดตั้งแอปเต็มจอทันที</span>
            </button>
          </div>
        ) : (
          <div className="rounded-xl bg-[#181a20] border border-zinc-800 p-3.5 space-y-2 text-xs text-zinc-300">
            <p className="font-bold text-amber-400">สำหรับ Android (Chrome):</p>
            <ol className="list-decimal list-inside space-y-1.5 text-zinc-300 leading-relaxed">
              <li>
                แตะปุ่ม <strong>จุด 3 จุด (⋮)</strong> ที่มุมขวาบนของ Chrome
              </li>
              <li>
                เลือก <strong>“ติดตั้งแอป” (Install app)</strong> หรือ <strong>“เพิ่มลงหน้าจอหลัก”</strong>
              </li>
              <li>
                เปิดเล่นผ่านไอคอนเกมบนหน้าจอมือถือ จะได้หน้าจอเต็ม 100% ไม่มีแถบเบราว์เซอร์
              </li>
            </ol>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-full min-h-[42px] rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 transition-colors"
        >
          เข้าใจแล้ว
        </button>
      </div>
    </div>
  );
};
