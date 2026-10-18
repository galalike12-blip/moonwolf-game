import { Html5Qrcode } from 'html5-qrcode';
import { Camera, Check, Copy, QrCode, X } from 'lucide-react';
import QRCode from 'qrcode';
import React, { useEffect, useRef, useState } from 'react';

interface InlineRoomQrCodeProps {
  roomCode: string;
}

export const InlineRoomQrCode: React.FC<InlineRoomQrCodeProps> = ({ roomCode }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const joinUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/?room=${encodeURIComponent(roomCode)}`
      : `https://moonwolf.app/?room=${roomCode}`;

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(joinUrl, {
      width: 220,
      margin: 2,
      color: {
        dark: '#070a12',
        light: '#f8fafc',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [joinUrl]);

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyUrl = () => {
    navigator.clipboard?.writeText(joinUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="rounded-2xl bg-[#0e1424] border border-slate-800 p-4 flex flex-col items-center gap-3">
      <div className="w-full flex items-center justify-between border-b border-slate-800/80 pb-2.5">
        <div className="text-left">
          <p className="text-xs text-slate-400">รหัสห้องหมู่บ้าน (6 หลัก)</p>
          <p className="text-2xl font-mono-num font-bold tracking-widest text-purple-300">
            {roomCode}
          </p>
        </div>
        <button
          type="button"
          onClick={handleCopyCode}
          className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
        >
          {copiedCode ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>คัดลอกรหัสแล้ว</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-slate-400" />
              <span>คัดลอกรหัส</span>
            </>
          )}
        </button>
      </div>

      {/* Crisp Inline QR Code */}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full pt-1">
        <div className="p-2.5 bg-slate-50 rounded-xl shadow-inner shrink-0">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`QR Code สำหรับเข้าร่วมห้อง ${roomCode}`}
              referrerPolicy="no-referrer"
              className="w-36 h-36 object-contain rounded-lg"
            />
          ) : (
            <div className="w-36 h-36 flex items-center justify-center bg-slate-100 rounded-lg text-slate-500">
              <QrCode className="w-8 h-8" />
            </div>
          )}
        </div>

        <div className="flex-1 text-center sm:text-left space-y-2.5">
          <p className="text-xs text-slate-300 leading-relaxed">
            ให้เพื่อนผู้เล่นคนที่ 2–5 ใช้กล้องมือถือสแกน QR Code นี้ หรือกดคัดลอกลิงก์ด้านล่างส่งให้เพื่อนเพื่อเข้าห้องทันที
          </p>
          <button
            type="button"
            onClick={handleCopyUrl}
            className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/30 text-xs font-medium text-purple-200 flex items-center justify-center sm:justify-start gap-2 transition-colors whitespace-nowrap"
          >
            {copiedUrl ? (
              <>
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">คัดลอกลิงก์ชวนเพื่อนแล้ว!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-purple-300 shrink-0" />
                <span className="truncate">คัดลอกลิงก์ชวนเข้าห้อง</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanRoomCode: (code: string) => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  onScanRoomCode,
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = 'moonwolf-qr-reader';

  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg(null);

    let isMounted = true;
    const html5QrCode = new Html5Qrcode(containerId);
    scannerRef.current = html5QrCode;

    html5QrCode
      .start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
        },
        (decodedText) => {
          if (!isMounted) return;
          let extractedCode = decodedText.trim();
          try {
            const url = new URL(decodedText);
            const paramRoom = url.searchParams.get('room');
            if (paramRoom) {
              extractedCode = paramRoom.toUpperCase();
            }
          } catch {
            // If raw text is 6 chars
            extractedCode = decodedText.trim().toUpperCase();
          }

          if (extractedCode.length >= 4 && extractedCode.length <= 8) {
            html5QrCode
              .stop()
              .catch(() => {})
              .finally(() => {
                onScanRoomCode(extractedCode);
              });
          }
        },
        () => {
          // Ignore frame scan misses
        }
      )
      .catch(() => {
        if (isMounted) {
          setErrorMsg(
            'ไม่สามารถเปิดกล้องได้ กรุณาอนุญาตการเข้าถึงกล้องในเบราว์เซอร์ หรือพิมพ์รหัสห้อง 6 หลักด้วยตนเอง'
          );
        }
      });

    return () => {
      isMounted = false;
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [isOpen, onScanRoomCode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl bg-[#0d1323] border border-slate-700 p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-semibold text-slate-100">
              สแกน QR Code เข้าห้อง
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="ปิดหน้าต่างสแกน"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="rounded-xl overflow-hidden bg-black border border-slate-800 min-h-[250px] flex items-center justify-center relative">
          <div id={containerId} className="w-full" />
          {errorMsg && (
            <div className="p-5 text-center space-y-2">
              <p className="text-xs text-rose-300 leading-relaxed">{errorMsg}</p>
            </div>
          )}
        </div>

        <p className="text-xs text-center text-slate-400">
          ส่องกล้องไปยัง QR Code บนหน้าจอมือถือของผู้สร้างห้อง
        </p>

        <button
          type="button"
          onClick={onClose}
          className="w-full min-h-[48px] rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-medium text-slate-200 transition-colors"
        >
          ยกเลิกและพิมพ์รหัสด้วยตนเอง
        </button>
      </div>
    </div>
  );
};
